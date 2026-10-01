const { LibraryBook, LibraryTransaction } = require('../models/Library');
const AuditLog = require('../models/AuditLog');

// ---------- Books ----------

exports.getBooks = async (req, res) => {
  const { page = 1, limit = 20, search, category, isActive = true } = req.query;
  const query = { isActive };
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const total = await LibraryBook.countDocuments(query);
  const books = await LibraryBook.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, data: books, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
};

exports.getBook = async (req, res) => {
  const book = await LibraryBook.findById(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: 'Book not found', errorCode: 'BOOK_NOT_FOUND' });
  res.json({ success: true, data: book });
};

exports.createBook = async (req, res) => {
  const count = await LibraryBook.countDocuments();
  req.body.bookId = `BK${String(count + 1).padStart(5, '0')}`;
  req.body.availableQuantity = req.body.quantity;

  const book = await LibraryBook.create(req.body);
  await AuditLog.create({ user: req.user._id, action: 'CREATE', module: 'Library', recordId: book._id, description: `Book "${book.title}" added` });
  res.status(201).json({ success: true, data: book });
};

exports.updateBook = async (req, res) => {
  const existing = await LibraryBook.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Book not found' });

  // Keep availableQuantity in sync if total quantity changes
  if (req.body.quantity !== undefined) {
    const issuedOut = existing.quantity - existing.availableQuantity;
    req.body.availableQuantity = Math.max(0, req.body.quantity - issuedOut);
  }

  const book = await LibraryBook.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  await AuditLog.create({ user: req.user._id, action: 'UPDATE', module: 'Library', recordId: book._id, description: `Book "${book.title}" updated` });
  res.json({ success: true, data: book });
};

exports.deleteBook = async (req, res) => {
  const book = await LibraryBook.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
  await AuditLog.create({ user: req.user._id, action: 'DELETE', module: 'Library', recordId: book._id, description: `Book "${book.title}" removed` });
  res.json({ success: true, message: 'Book removed successfully' });
};

// ---------- Transactions (Issue / Return) ----------

exports.getTransactions = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const query = {};
  if (status) query.status = status;

  const total = await LibraryTransaction.countDocuments(query);
  let txQuery = LibraryTransaction.find(query)
    .populate('book', 'title author bookId')
    .populate('borrower', 'firstName lastName name')
    .populate('issuedBy', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const transactions = await txQuery;

  res.json({ success: true, data: transactions, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
};

exports.issueBook = async (req, res) => {
  const { bookId, borrower, borrowerModel, dueDate } = req.body;

  const book = await LibraryBook.findById(bookId);
  if (!book) return res.status(404).json({ success: false, message: 'Book not found', errorCode: 'BOOK_NOT_FOUND' });
  if (book.availableQuantity < 1) {
    return res.status(400).json({ success: false, message: 'No copies available to issue', errorCode: 'BOOK_UNAVAILABLE' });
  }

  const transaction = await LibraryTransaction.create({
    book: bookId,
    borrower,
    borrowerModel,
    dueDate,
    issuedBy: req.user._id,
    status: 'Issued'
  });

  book.availableQuantity -= 1;
  await book.save();

  await AuditLog.create({ user: req.user._id, action: 'CREATE', module: 'Library', recordId: transaction._id, description: `Book "${book.title}" issued` });

  const populated = await transaction.populate([{ path: 'book', select: 'title author bookId' }, { path: 'borrower', select: 'firstName lastName name' }]);
  res.status(201).json({ success: true, data: populated });
};

exports.returnBook = async (req, res) => {
  const transaction = await LibraryTransaction.findById(req.params.id).populate('book');
  if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found', errorCode: 'TRANSACTION_NOT_FOUND' });
  if (transaction.status === 'Returned') {
    return res.status(400).json({ success: false, message: 'Book already returned' });
  }

  const returnDate = new Date();
  const lateDays = Math.max(0, Math.ceil((returnDate - transaction.dueDate) / (1000 * 60 * 60 * 24)));
  const finePerDay = 2;

  transaction.returnDate = returnDate;
  transaction.lateDays = lateDays;
  transaction.fine = lateDays * finePerDay;
  transaction.status = 'Returned';
  transaction.returnedBy = req.user._id;
  await transaction.save();

  const book = await LibraryBook.findById(transaction.book._id);
  book.availableQuantity = Math.min(book.quantity, book.availableQuantity + 1);
  await book.save();

  await AuditLog.create({ user: req.user._id, action: 'UPDATE', module: 'Library', recordId: transaction._id, description: `Book "${book.title}" returned` });

  res.json({ success: true, data: transaction });
};

exports.getStats = async (req, res) => {
  const totalBooks = await LibraryBook.countDocuments({ isActive: true });
  const totalCopies = await LibraryBook.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]);
  const issued = await LibraryTransaction.countDocuments({ status: 'Issued' });
  const overdue = await LibraryTransaction.countDocuments({ status: 'Issued', dueDate: { $lt: new Date() } });

  res.json({
    success: true,
    data: {
      totalBooks,
      totalCopies: totalCopies[0]?.total || 0,
      issued,
      overdue
    }
  });
};