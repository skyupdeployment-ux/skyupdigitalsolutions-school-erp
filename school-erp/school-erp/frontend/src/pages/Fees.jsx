// @ts-nocheck
import { useState, useRef } from 'react';
import api from '../services/api';
import {
  Plus, Search, X, Loader, ChevronDown,
  CreditCard, FileText, Download, Share2,
  CheckCircle, Clock, AlertCircle, Printer,
  Trash2, Edit, MessageCircle, FileDown
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────────────────────
const FEE_TYPES     = ['Tuition Fee','Transport Fee','Library Fee','Exam Fee','Sports Fee','Lab Fee','Hostel Fee','Miscellaneous'];
const PAYMENT_MODES = ['Cash','UPI','Cheque','DD','Net Banking','Card'];
const CLASSES       = ['Nursery','LKG','UKG','1','2','3','4','5','6','7','8','9','10','11','12'];
const TERMS         = ['Term 1','Term 2','Term 3','Annual'];
const MONTHS        = ['April','May','June','July','August','September','October','November','December','January','February','March'];

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_STRUCTURES = [
  { _id:'fs1', class:'10', feeType:'Tuition Fee',  term:'Annual', amount:12000, dueDate:'2026-04-30', academicYear:'2025-26', description:'Annual tuition fee for Class 10' },
  { _id:'fs2', class:'10', feeType:'Exam Fee',     term:'Term 1', amount:500,   dueDate:'2026-06-30', academicYear:'2025-26', description:'Mid term examination fee' },
  { _id:'fs3', class:'9',  feeType:'Tuition Fee',  term:'Annual', amount:11000, dueDate:'2026-04-30', academicYear:'2025-26', description:'Annual tuition fee for Class 9' },
  { _id:'fs4', class:'10', feeType:'Transport Fee',term:'Annual', amount:6000,  dueDate:'2026-04-30', academicYear:'2025-26', description:'Annual transport fee' },
  { _id:'fs5', class:'9',  feeType:'Library Fee',  term:'Annual', amount:800,   dueDate:'2026-04-30', academicYear:'2025-26', description:'Annual library fee' },
];

const DEMO_RECEIPTS = [
  { _id:'r1', receiptNo:'RCP001', studentName:'Arjun Sharma',    admNo:'ADM001', class:'10', feeType:'Tuition Fee',   amount:12000, paymentMode:'UPI',  paymentDate:'2026-09-18', status:'Paid',    parentPhone:'9876543210' },
  { _id:'r2', receiptNo:'RCP002', studentName:'Priya Patel',     admNo:'ADM002', class:'10', feeType:'Transport Fee', amount:6000,  paymentMode:'Cash', paymentDate:'2026-09-17', status:'Paid',    parentPhone:'9876543211' },
  { _id:'r3', receiptNo:'RCP003', studentName:'Rahul Kumar',     admNo:'ADM003', class:'9',  feeType:'Tuition Fee',   amount:11000, paymentMode:'Card', paymentDate:'2026-09-15', status:'Paid',    parentPhone:'9876543212' },
  { _id:'r4', receiptNo:'RCP004', studentName:'Sneha Reddy',     admNo:'ADM004', class:'9',  feeType:'Library Fee',   amount:800,   paymentMode:'UPI',  paymentDate:'2026-09-14', status:'Paid',    parentPhone:'9876543213' },
  { _id:'r5', receiptNo:'RCP005', studentName:'Sidda Madabhavi', admNo:'123',    class:'10', feeType:'Exam Fee',      amount:500,   paymentMode:'Cash', paymentDate:'2026-09-12', status:'Paid',    parentPhone:'9008303681' },
];

const DEMO_PENDING = [
  { _id:'p1', studentName:'Arjun Sharma',    admNo:'ADM001', class:'10', feeType:'Exam Fee',      amount:500,  dueDate:'2026-10-01', parentPhone:'9876543210', status:'Pending' },
  { _id:'p2', studentName:'Priya Patel',     admNo:'ADM002', class:'10', feeType:'Sports Fee',    amount:1000, dueDate:'2026-09-30', parentPhone:'9876543211', status:'Overdue' },
  { _id:'p3', studentName:'Sidda Madabhavi', admNo:'123',    class:'10', feeType:'Library Fee',   amount:800,  dueDate:'2026-09-25', parentPhone:'9008303681', status:'Overdue' },
];

const SCHOOL = { name:'Greenfield Public School', address:'123 School Road, Bengaluru, Karnataka – 560001', phone:'080-12345678', email:'info@greenfieldschool.edu' };

// ── Helpers ───────────────────────────────────────────────────────────────────
const Sel = ({ label, required, children, ...p }) => (
  <div>
    {label && <label className="label">{label}{required && ' *'}</label>}
    <div style={{ position:'relative' }}>
      <select required={required} className="input-field"
        style={{ appearance:'none', paddingRight:28, cursor:'pointer' }} {...p}>
        {children}
      </select>
      <ChevronDown size={13} style={{ position:'absolute', right:8, top:'50%',
        transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }} />
    </div>
  </div>
);

const Sec = ({ title }) => (
  <div style={{ fontSize:11, fontWeight:700, color:'#3b82f6', textTransform:'uppercase',
    letterSpacing:.8, borderBottom:'2px solid #eff6ff', paddingBottom:7,
    marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
    <div style={{ width:3, height:14, background:'#3b82f6', borderRadius:2 }} />{title}
  </div>
);

function StatusBadge({ status }) {
  const map = {
    Paid:    { bg:'#dcfce7', color:'#16a34a' },
    Pending: { bg:'#dbeafe', color:'#1d4ed8' },
    Overdue: { bg:'#fee2e2', color:'#dc2626' },
    Partial: { bg:'#fef9c3', color:'#d97706' },
  };
  const s = map[status] || { bg:'#f1f5f9', color:'#64748b' };
  return <span style={{ ...s, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>{status}</span>;
}

// ── Generate receipt HTML string ──────────────────────────────────────────────
function receiptHTML(r) {
  return `
    <html><head><title>Fee Receipt – ${r.receiptNo}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Times New Roman',serif;padding:32px;color:#0f172a;background:#fff;width:794px}
      .header{text-align:center;border-bottom:3px solid #1e3a8a;padding-bottom:14px;margin-bottom:18px}
      .logo{font-size:28px;margin-bottom:4px}
      .school-name{font-size:20px;font-weight:bold;color:#1e3a8a;letter-spacing:.5px}
      .school-info{font-size:11px;color:#475569;margin-top:3px}
      .badge{display:inline-block;background:#1e3a8a;color:#fff;font-size:13px;font-weight:bold;
        padding:6px 20px;border-radius:20px;margin:12px auto;letter-spacing:1px}
      .receipt-no{text-align:right;font-size:12px;color:#64748b;margin-bottom:10px}
      table{width:100%;border-collapse:collapse;margin:10px 0}
      tr{border-bottom:1px solid #f1f5f9}
      td{padding:9px 12px;font-size:13px}
      td:first-child{color:#64748b;font-weight:600;width:170px}
      td:last-child{font-weight:700;color:#0f172a}
      .amount-box{background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #16a34a;
        border-radius:10px;padding:16px;text-align:center;margin:18px 0}
      .amount-label{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.6px}
      .amount-value{font-size:32px;font-weight:900;color:#16a34a;margin:4px 0}
      .amount-words{font-size:11px;color:#475569;font-style:italic}
      .footer{margin-top:40px;display:flex;justify-content:space-between}
      .sign{text-align:center;min-width:160px}
      .sign-line{border-top:1px solid #0f172a;padding-top:5px;font-size:11px;color:#475569;margin-top:40px}
      .watermark{position:fixed;top:38%;left:22%;font-size:72px;color:rgba(16,185,129,.06);
        font-weight:900;transform:rotate(-35deg);pointer-events:none;z-index:0}
      .paid-stamp{position:fixed;top:35%;right:60px;border:4px solid rgba(22,163,74,.3);
        color:rgba(22,163,74,.3);font-size:40px;font-weight:900;padding:8px 16px;
        border-radius:8px;transform:rotate(-15deg);letter-spacing:4px}
      .notice{text-align:center;font-size:10px;color:#94a3b8;margin-top:28px;border-top:1px dashed #e2e8f0;padding-top:10px}
    </style></head>
    <body>
      <div class="watermark">PAID</div>
      <div class="paid-stamp">✓ PAID</div>
      <div class="header">
        <div class="logo">🏫</div>
        <div class="school-name">${SCHOOL.name}</div>
        <div class="school-info">${SCHOOL.address}</div>
        <div class="school-info">Ph: ${SCHOOL.phone} &nbsp;|&nbsp; ${SCHOOL.email}</div>
      </div>
      <div style="text-align:center"><span class="badge">FEE RECEIPT</span></div>
      <div class="receipt-no">Receipt No: <strong>${r.receiptNo}</strong> &nbsp;&nbsp; Date: <strong>${new Date(r.paymentDate).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</strong></div>
      <table>
        <tr><td>Student Name</td><td>${r.studentName}</td></tr>
        <tr><td>Admission No.</td><td>${r.admNo}</td></tr>
        <tr><td>Class</td><td>Class ${r.class}</td></tr>
        <tr><td>Fee Type</td><td>${r.feeType}</td></tr>
        <tr><td>Term / Period</td><td>${r.term || 'Annual'} &nbsp;|&nbsp; Academic Year: ${r.academicYear || '2025-26'}</td></tr>
        <tr><td>Payment Mode</td><td>${r.paymentMode}</td></tr>
        <tr><td>Payment Status</td><td style="color:#16a34a">✓ ${r.status}</td></tr>
        ${r.remarks ? `<tr><td>Remarks</td><td>${r.remarks}</td></tr>` : ''}
      </table>
      <div class="amount-box">
        <div class="amount-label">Amount Paid</div>
        <div class="amount-value">₹${Number(r.amount).toLocaleString('en-IN')}</div>
      </div>
      <div class="footer">
        <div class="sign"><div class="sign-line">Parent / Student Signature</div></div>
        <div class="sign"><div class="sign-line">Cashier Signature</div></div>
        <div class="sign"><div class="sign-line">Principal Signature</div></div>
      </div>
      <div class="notice">This is a computer-generated receipt. Valid without physical signature. &nbsp;|&nbsp; ${SCHOOL.name} &nbsp;|&nbsp; ${SCHOOL.phone}</div>
    </body></html>`;
}

// ── Print receipt ─────────────────────────────────────────────────────────────
function printReceipt(r) {
  const w = window.open('', '_blank');
  w.document.write(receiptHTML(r));
  w.document.close();
  setTimeout(() => { w.print(); }, 500);
}

// ── Download as PDF ───────────────────────────────────────────────────────────
async function downloadReceiptPDF(r) {
  toast.loading('Generating PDF...', { id:'pdf' });
  try {
    // Open in hidden iframe, use print-to-PDF
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;height:1123px;border:none';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(receiptHTML(r));
    iframe.contentDocument.close();

    await new Promise(res => setTimeout(res, 600));

    // Use html2canvas on iframe content
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(iframe.contentDocument.body, {
      scale: 2, backgroundColor:'#ffffff', useCORS:true, logging:false,
      width:794, windowWidth:794,
    });
    document.body.removeChild(iframe);

    // Convert canvas to image and trigger download
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Create PDF using basic approach — canvas as full-page image
    const pdf = document.createElement('canvas');
    pdf.width = canvas.width; pdf.height = canvas.height;
    const ctx = pdf.getContext('2d');
    ctx.drawImage(canvas, 0, 0);

    // Download as PNG (receipt image — works like PDF visually)
    const link = document.createElement('a');
    link.download = `Receipt_${r.receiptNo}_${r.studentName.replace(/\s+/g,'_')}.png`;
    link.href = imgData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.dismiss('pdf');
    toast.success(`Receipt downloaded as image!`);
  } catch(err) {
    toast.dismiss('pdf');
    // Fallback: open print dialog
    printReceipt(r);
    toast.success('Use Ctrl+P → Save as PDF');
    console.error(err);
  }
}

// ── WhatsApp — opens parent's chat directly, no text pre-filled ───────────────
function shareReceiptWA(r) {
  const raw = (r.parentPhone || '').replace(/\D/g, '');
  if (!raw || raw.length < 10) {
    toast.error(`No parent phone saved for ${r.studentName}. Update the student record.`);
    return;
  }
  const phone = raw.startsWith('91') ? raw : `91${raw}`;
  // Opens WhatsApp directly to that parent's number — no text, no dialog
  window.open(`https://wa.me/${phone}`, '_blank');
  toast.success(`Opening WhatsApp for ${r.studentName}'s parent (${r.parentPhone})`);
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Fee Structure
// ══════════════════════════════════════════════════════════════════════════════
function FeeStructureTab() {
  const [structures, setStructures] = useState(DEMO_STRUCTURES);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState({ class:'', feeType:'Tuition Fee', term:'Annual', amount:'', dueDate:'', academicYear:'2025-26', description:'' });
  const [saving, setSaving]         = useState(false);
  const [classFilter, setClassFilter] = useState('');

  const inp = f => ({ value:form[f]||'', onChange:e=>setForm(p=>({...p,[f]:e.target.value})) });

  const openAdd  = () => { setEditing(null); setForm({ class:'', feeType:'Tuition Fee', term:'Annual', amount:'', dueDate:'', academicYear:'2025-26', description:'' }); setShowModal(true); };
  const openEdit = s  => { setEditing(s); setForm(s); setShowModal(true); };

  const handleSave = (e) => {
    e.preventDefault(); setSaving(true);
    setTimeout(() => {
      if (editing) {
        setStructures(prev => prev.map(s => s._id===editing._id ? { ...form, _id:editing._id } : s));
        toast.success('Fee structure updated');
      } else {
        setStructures(prev => [...prev, { ...form, _id:Date.now().toString() }]);
        toast.success('Fee structure added');
      }
      setShowModal(false); setSaving(false);
    }, 500);
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this fee structure?')) return;
    setStructures(prev => prev.filter(s => s._id !== id));
    toast.success('Deleted');
  };

  const filtered = structures.filter(s => !classFilter || s.class === classFilter);
  const totalFees = filtered.reduce((sum,s) => sum + Number(s.amount||0), 0);

  return (
    <div className="space-y-4">
      <div style={{ display:'flex', gap:8, justifyContent:'space-between', alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ position:'relative', minWidth:150 }}>
            <select className="input-field" style={{ appearance:'none', paddingRight:24 }}
              value={classFilter} onChange={e=>setClassFilter(e.target.value)}>
              <option value="">All Classes</option>
              {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
            </select>
            <ChevronDown size={12} style={{ position:'absolute', right:7, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }} />
          </div>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={14}/> Add Fee Structure</button>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
        {[
          { label:'Total Fee Types', value:filtered.length, color:'#3b82f6' },
          { label:'Total Amount',    value:`₹${totalFees.toLocaleString()}`, color:'#16a34a' },
          { label:'Classes Covered', value:[...new Set(filtered.map(s=>s.class))].length, color:'#8b5cf6' },
        ].map(k=>(
          <div key={k.label} className="card" style={{ padding:'14px 16px', borderTop:`3px solid ${k.color}` }}>
            <div style={{ fontSize:10, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:.4 }}>{k.label}</div>
            <div style={{ fontSize:20, fontWeight:800, color:'#0f172a', marginTop:4 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Structure table */}
      <div className="card">
        <div style={{ overflowX:'auto' }}>
          <table>
            <thead>
              <tr><th>#</th><th>Class</th><th>Fee Type</th><th>Term</th><th>Amount</th><th>Due Date</th><th>Academic Year</th><th>Description</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((s,i)=>(
                <tr key={s._id}>
                  <td style={{ color:'#94a3b8' }}>{i+1}</td>
                  <td><span style={{ fontWeight:700, background:'#eff6ff', color:'#1d4ed8', padding:'2px 8px', borderRadius:12, fontSize:12 }}>Class {s.class}</span></td>
                  <td style={{ fontWeight:600, color:'#0f172a' }}>{s.feeType}</td>
                  <td><span style={{ fontSize:11, background:'#f1f5f9', color:'#475569', padding:'2px 8px', borderRadius:12 }}>{s.term}</span></td>
                  <td><span style={{ fontWeight:800, color:'#16a34a', fontSize:15 }}>₹{Number(s.amount).toLocaleString()}</span></td>
                  <td style={{ fontSize:12, color:'#64748b' }}>{s.dueDate ? new Date(s.dueDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}</td>
                  <td style={{ fontSize:12, color:'#64748b' }}>{s.academicYear}</td>
                  <td style={{ fontSize:12, color:'#64748b', maxWidth:200 }}>{s.description || '—'}</td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button onClick={()=>openEdit(s)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Edit size={13}/></button>
                      <button onClick={()=>handleDelete(s._id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No fee structures found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', borderRadius:18, maxWidth:560, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px', borderBottom:'1px solid #f1f5f9', position:'sticky', top:0, background:'#fff', zIndex:5 }}>
              <div style={{ fontWeight:800, fontSize:16, color:'#0f172a' }}>{editing?'Edit Fee Structure':'Add Fee Structure'}</div>
              <button onClick={()=>setShowModal(false)} style={{ padding:8, borderRadius:8, border:'none', background:'#f1f5f9', cursor:'pointer' }}><X size={15} color="#475569"/></button>
            </div>
            <form onSubmit={handleSave} style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <Sel label="Class *" required value={form.class} onChange={e=>setForm(p=>({...p,class:e.target.value}))}>
                  <option value="">Select class</option>
                  {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
                </Sel>
                <Sel label="Fee Type *" required value={form.feeType} onChange={e=>setForm(p=>({...p,feeType:e.target.value}))}>
                  {FEE_TYPES.map(f=><option key={f}>{f}</option>)}
                </Sel>
                <Sel label="Term *" required value={form.term} onChange={e=>setForm(p=>({...p,term:e.target.value}))}>
                  {TERMS.map(t=><option key={t}>{t}</option>)}
                </Sel>
                <div><label className="label">Amount (₹) *</label><input required type="number" min={0} className="input-field" placeholder="12000" {...inp('amount')} /></div>
                <div><label className="label">Due Date</label><input type="date" className="input-field" {...inp('dueDate')} /></div>
                <div><label className="label">Academic Year</label><input className="input-field" {...inp('academicYear')} /></div>
                <div style={{ gridColumn:'1/-1' }}><label className="label">Description</label><input className="input-field" placeholder="Optional notes" {...inp('description')} /></div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8, borderTop:'1px solid #f1f5f9' }}>
                <button type="button" onClick={()=>setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving?<><Loader size={13} className="animate-spin"/> Saving...</>:editing?'Update':'Add Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Collect Fee
// ══════════════════════════════════════════════════════════════════════════════
function CollectFeeTab({ onCollected }) {
  const [form, setForm] = useState({
    studentName:'', admNo:'', class:'', feeType:'Tuition Fee',
    amount:'', paymentMode:'Cash', paymentDate: new Date().toISOString().split('T')[0],
    parentPhone:'', remarks:'', academicYear:'2025-26', term:'Annual',
  });
  const [saving, setSaving]       = useState(false);
  const [fetching, setFetching]   = useState(false);
  const [studentFound, setStudentFound] = useState(false);
  const fetchTimer = useRef(null);

  const inp = f => ({ value:form[f]||'', onChange:e=>setForm(p=>({...p,[f]:e.target.value})) });

  // Auto-fetch student from API when admission number is typed
  const handleAdmNoChange = (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, admNo: val }));
    setStudentFound(false);

    // Clear previous timer
    if (fetchTimer.current) clearTimeout(fetchTimer.current);

    if (!val || val.length < 2) return;

    // Debounce 600ms then fetch
    fetchTimer.current = setTimeout(async () => {
      setFetching(true);
      try {
        const res = await api.get('/students', { params: { search: val, limit: 5 } });
        const students = res.data.data || [];
        // Find exact match by admissionNumber
        const match = students.find(s =>
          (s.admissionNumber || '').toLowerCase() === val.toLowerCase()
        ) || students[0];

        if (match) {
          const fullName = `${match.firstName || ''} ${match.lastName || ''}`.trim();
          setForm(p => ({
            ...p,
            studentName:  fullName,
            class:        match.class || match.className || p.class,
            parentPhone:  match.parentPhone || match.phone || '',
          }));
          setStudentFound(true);
          toast.success(`Found: ${fullName}`);
        } else {
          toast.error('No student found with this admission number');
        }
      } catch {
        // API not available — keep manual entry
      }
      setFetching(false);
    }, 600);
  };

  const handleCollect = (e) => {
    e.preventDefault();
    if (!form.studentName || !form.amount) { toast.error('Fill all required fields'); return; }
    setSaving(true);
    setTimeout(() => {
      const newReceipt = {
        ...form,
        _id: Date.now().toString(),
        receiptNo: `RCP${String(Date.now()).slice(-4)}`,
        status: 'Paid',
        amount: Number(form.amount),
      };
      onCollected(newReceipt);
      toast.success(`Fee collected! Receipt ${newReceipt.receiptNo} generated`);
      setForm(p => ({ ...p, studentName:'', admNo:'', amount:'', remarks:'', parentPhone:'', class:'' }));
      setStudentFound(false);
      setSaving(false);
    }, 600);
  };

  return (
    <div>
      <div className="card" style={{ padding:24 }}>
        <Sec title="Collect Fee Payment" />
        <form onSubmit={handleCollect} style={{ display:'flex', flexDirection:'column', gap:18 }}>

          {/* Student info */}
          <div>
            <Sec title="Student Information" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

              {/* Admission No — triggers auto-fetch */}
              <div>
                <label className="label">Admission Number *</label>
                <div style={{ position:'relative' }}>
                  <input required className="input-field" placeholder="Type ADM001 to auto-fill..."
                    value={form.admNo}
                    onChange={handleAdmNoChange}
                    style={{ paddingRight: fetching ? 36 : 12 }}
                  />
                  {fetching && (
                    <Loader size={14} className="animate-spin" style={{
                      position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'#3b82f6'
                    }} />
                  )}
                  {studentFound && !fetching && (
                    <CheckCircle size={14} style={{
                      position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'#16a34a'
                    }} />
                  )}
                </div>
                {studentFound && (
                  <div style={{ fontSize:11, color:'#16a34a', marginTop:4, fontWeight:600 }}>
                    ✓ Student details auto-filled from database
                  </div>
                )}
              </div>

              {/* Student Name — auto-filled */}
              <div>
                <label className="label">Student Name *</label>
                <input required className="input-field"
                  placeholder="Auto-filled from database"
                  value={form.studentName}
                  onChange={e => setForm(p=>({...p,studentName:e.target.value}))}
                  style={{ background: studentFound ? '#f0fdf4' : '#fff',
                    borderColor: studentFound ? '#86efac' : '#e5e7eb' }}
                />
              </div>

              {/* Class — auto-filled */}
              <Sel label="Class *" required value={form.class}
                onChange={e=>setForm(p=>({...p,class:e.target.value}))}>
                <option value="">Select class</option>
                {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
              </Sel>

              {/* Parent Phone — auto-filled from student record, READ ONLY */}
              <div>
                <label className="label">Parent WhatsApp Number</label>
                <div style={{ position:'relative' }}>
                  <input
                    className="input-field"
                    placeholder="Auto-filled from student record"
                    value={form.parentPhone}
                    readOnly={studentFound}
                    onChange={e => !studentFound && setForm(p=>({...p,parentPhone:e.target.value}))}
                    style={{
                      background:   studentFound ? '#f0fdf4' : '#fff',
                      borderColor:  studentFound ? '#86efac' : '#e5e7eb',
                      color:        form.parentPhone ? '#0f172a' : '#94a3b8',
                      paddingRight: form.parentPhone ? 80 : 12,
                      cursor:       studentFound ? 'default' : 'text',
                    }}
                  />
                  {/* WhatsApp quick-open button inline */}
                  {form.parentPhone && (
                    <button type="button"
                      onClick={() => {
                        const raw = form.parentPhone.replace(/\D/g,'');
                        const ph  = raw.startsWith('91') ? raw : `91${raw}`;
                        window.open(`https://wa.me/${ph}`, '_blank');
                      }}
                      style={{ position:'absolute', right:6, top:'50%', transform:'translateY(-50%)',
                        background:'#25D366', border:'none', borderRadius:6, padding:'3px 8px',
                        cursor:'pointer', display:'flex', alignItems:'center', gap:4,
                        color:'#fff', fontSize:10, fontWeight:700 }}>
                      <MessageCircle size={10}/> WA
                    </button>
                  )}
                </div>
                {studentFound && form.parentPhone && (
                  <div style={{ fontSize:11, color:'#16a34a', marginTop:4, fontWeight:600 }}>
                    ✓ {form.parentPhone} — saved from student record
                  </div>
                )}
                {studentFound && !form.parentPhone && (
                  <div style={{ fontSize:11, color:'#f59e0b', marginTop:4, fontWeight:600 }}>
                    ⚠ No phone saved — update the student record
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fee details */}
          <div>
            <Sec title="Fee Details" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Sel label="Fee Type *" required value={form.feeType} onChange={e=>setForm(p=>({...p,feeType:e.target.value}))}>
                {FEE_TYPES.map(f=><option key={f}>{f}</option>)}
              </Sel>
              <Sel label="Term" value={form.term} onChange={e=>setForm(p=>({...p,term:e.target.value}))}>
                {TERMS.map(t=><option key={t}>{t}</option>)}
              </Sel>
              <div>
                <label className="label">Amount (₹) *</label>
                <input required type="number" min={1} className="input-field" placeholder="12000" {...inp('amount')} />
              </div>
              <Sel label="Payment Mode *" required value={form.paymentMode} onChange={e=>setForm(p=>({...p,paymentMode:e.target.value}))}>
                {PAYMENT_MODES.map(m=><option key={m}>{m}</option>)}
              </Sel>
              <div><label className="label">Payment Date *</label><input required type="date" className="input-field" {...inp('paymentDate')} /></div>
              <div><label className="label">Academic Year</label><input className="input-field" {...inp('academicYear')} /></div>
              <div style={{ gridColumn:'1/-1' }}><label className="label">Remarks</label><input className="input-field" placeholder="Optional notes" {...inp('remarks')} /></div>
            </div>
          </div>

          {/* Preview */}
          {form.studentName && form.amount && (
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#15803d', textTransform:'uppercase', marginBottom:10 }}>Receipt Preview</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  ['Student',  form.studentName],
                  ['Class',    `Class ${form.class}`],
                  ['Fee Type', form.feeType],
                  ['Amount',   `₹${Number(form.amount).toLocaleString()}`],
                  ['Mode',     form.paymentMode],
                  ['Date',     form.paymentDate],
                ].map(([k,v]) => (
                  <div key={k}>
                    <span style={{ fontSize:11, color:'#64748b' }}>{k}: </span>
                    <span style={{ fontSize:12, fontWeight:700, color:'#0f172a' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8, borderTop:'1px solid #f1f5f9' }}>
            <button type="reset" className="btn-secondary" onClick={()=>{ setStudentFound(false); setForm({ studentName:'', admNo:'', class:'', feeType:'Tuition Fee', amount:'', paymentMode:'Cash', paymentDate:new Date().toISOString().split('T')[0], parentPhone:'', remarks:'', academicYear:'2025-26', term:'Annual' }); }}>Clear</button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ minWidth:180 }}>
              {saving
                ? <><Loader size={13} className="animate-spin"/> Processing...</>
                : <><CreditCard size={14}/> Collect &amp; Generate Receipt</>
              }
            </button>
          </div>
        </form>
      </div>

      {/* Pending fees */}
      <div className="card" style={{ marginTop:16, padding:20 }}>
        <div style={{ fontWeight:700, fontSize:15, color:'#0f172a', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
          <AlertCircle size={16} color="#ef4444" /> Pending &amp; Overdue Fees
        </div>
        <div style={{ overflowX:'auto' }}>
          <table>
            <thead><tr><th>Student</th><th>Class</th><th>Fee Type</th><th>Amount</th><th>Due Date</th><th>Status</th><th>WhatsApp</th></tr></thead>
            <tbody>
              {DEMO_PENDING.map(p => (
                <tr key={p._id} style={{ background: p.status==='Overdue'?'#fff5f5':'transparent' }}>
                  <td>
                    <div style={{ fontWeight:600 }}>{p.studentName}</div>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>{p.admNo}</div>
                  </td>
                  <td>Class {p.class}</td>
                  <td>{p.feeType}</td>
                  <td style={{ fontWeight:700, color:'#dc2626' }}>₹{p.amount.toLocaleString()}</td>
                  <td style={{ fontSize:12, color: p.status==='Overdue'?'#dc2626':'#64748b', fontWeight:p.status==='Overdue'?700:400 }}>
                    {new Date(p.dueDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <button
                      onClick={() => {
                        const raw = (p.parentPhone||'').replace(/\D/g,'');
                        if (!raw) { toast.error('No phone saved'); return; }
                        const ph = raw.startsWith('91') ? raw : `91${raw}`;
                        window.open(`https://wa.me/${ph}`, '_blank');
                        toast.success(`Opening WhatsApp for ${p.studentName}'s parent`);
                      }}
                      title={p.parentPhone || 'No phone saved'}
                      style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7,
                        border:'1px solid #25D366', background:'#f0fdf4',
                        color: p.parentPhone ? '#16a34a' : '#94a3b8',
                        cursor: p.parentPhone ? 'pointer' : 'not-allowed', fontSize:11, fontWeight:600 }}>
                      <MessageCircle size={11}/> {p.parentPhone || 'No phone'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Receipts
// ══════════════════════════════════════════════════════════════════════════════
function ReceiptsTab({ receipts }) {
  const [search, setSearch]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]   = useState('');
  const [classFilter, setClassFilter] = useState('');

  const filtered = receipts.filter(r => {
    const q = search.toLowerCase();
    const d = new Date(r.paymentDate);
    return (!q || r.studentName.toLowerCase().includes(q) || r.receiptNo.toLowerCase().includes(q) || r.admNo.includes(q))
      && (!classFilter || r.class === classFilter)
      && (!dateFrom || d >= new Date(dateFrom))
      && (!dateTo   || d <= new Date(dateTo + 'T23:59:59'));
  });

  const totalCollected = filtered.reduce((s,r) => s + r.amount, 0);

  const exportCSV = () => {
    const csv = 'Receipt No,Student,Adm No,Class,Fee Type,Amount,Payment Mode,Date,Status\n'
      + filtered.map(r => `"${r.receiptNo}","${r.studentName}","${r.admNo}","${r.class}","${r.feeType}",${r.amount},"${r.paymentMode}","${r.paymentDate}","${r.status}"`).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download='fee_receipts.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const bulkPrintReceipts = () => {
    if (!filtered.length) { toast.error('No receipts to print'); return; }

  const makeCard = (r, isLast) => {
    const pb = isLast ? '' : 'page-break-after:always;';
    const dt = new Date(r.paymentDate).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
    const amt = Number(r.amount).toLocaleString('en-IN');
    const cls = 'Class ' + r.class;
    const yr  = r.academicYear || '2025-26';
    const rows = [
      ['Student Name',  r.studentName],
      ['Admission No.', r.admNo],
      ['Class',         cls],
      ['Fee Type',      r.feeType],
      ['Payment Mode',  r.paymentMode],
      ['Payment Date',  dt],
      ['Academic Year', yr],
    ].map(([k,v], i, arr) =>
      '<tr style="border-bottom:' + (i<arr.length-1?'1px solid #f1f5f9':'none') + ';">' +
      '<td style="padding:7px 0;color:#64748b;font-weight:600;width:160px;">' + k + '</td>' +
      '<td style="font-weight:700;color:#0f172a;">' + v + '</td>' +
      '</tr>'
    ).join('');

    return (
      '<div style="' + pb + 'padding:16px 20px;">' +
        '<div style="font-family:Times New Roman,serif;max-width:700px;margin:0 auto;border:2px solid #1e3a8a;border-radius:10px;overflow:hidden;">' +

          '<div style="background:#1e3a8a;color:#fff;padding:16px 22px;display:flex;justify-content:space-between;align-items:center;">' +
            '<div>' +
              '<div style="font-size:18px;font-weight:700;">🏫 ' + SCHOOL.name + '</div>' +
              '<div style="font-size:11px;opacity:.85;margin-top:2px;">' + SCHOOL.address + '</div>' +
              '<div style="font-size:11px;opacity:.85;">Ph: ' + SCHOOL.phone + ' | ' + SCHOOL.email + '</div>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,.15);border-radius:8px;padding:10px 16px;text-align:center;">' +
              '<div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;opacity:.85;">Fee Receipt</div>' +
              '<div style="font-size:16px;font-weight:800;margin-top:3px;">' + r.receiptNo + '</div>' +
            '</div>' +
          '</div>' +

          '<div style="padding:16px 22px;">' +
            '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
              rows +
            '</table>' +
          '</div>' +

          '<div style="background:#f0fdf4;border-top:1px solid #bbf7d0;border-bottom:1px solid #bbf7d0;padding:14px;text-align:center;">' +
            '<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Amount Paid</div>' +
            '<div style="font-size:32px;font-weight:900;color:#16a34a;margin:4px 0;">₹' + amt + '</div>' +
            '<div style="font-size:11px;color:#16a34a;font-weight:700;">✓ ' + r.status + '</div>' +
          '</div>' +

          '<div style="padding:18px 22px;display:flex;justify-content:space-between;">' +
            '<div style="text-align:center;"><div style="border-top:1px solid #000;width:130px;margin:0 auto;padding-top:5px;font-size:10px;color:#475569;">Parent / Student Signature</div></div>' +
            '<div style="text-align:center;"><div style="border-top:1px solid #000;width:130px;margin:0 auto;padding-top:5px;font-size:10px;color:#475569;">Cashier Signature</div></div>' +
          '</div>' +

          '<div style="text-align:center;font-size:10px;color:#94a3b8;padding:6px 0 10px;border-top:1px solid #f1f5f9;">' +
            'Computer-generated receipt · ' + SCHOOL.name + ' · ' + SCHOOL.phone +
          '</div>' +
        '</div>' +
      '</div>'
    );
  };

    // Build ALL cards in ONE page — each on its own A4 page when printed
    const html = `<!DOCTYPE html>
<html><head>
  <title>Fee Receipts — ${SCHOOL.name}</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { background:#f8fafc; font-family:'Times New Roman',serif; }
    .toolbar {
      position:sticky; top:0; z-index:99;
      background:#1e3a8a; color:#fff;
      padding:12px 24px;
      display:flex; align-items:center; justify-content:space-between;
    }
    .toolbar span { font-size:14px; font-weight:700; }
    .toolbar button {
      background:#fff; color:#1e3a8a; border:none;
      padding:8px 22px; border-radius:7px;
      font-weight:700; cursor:pointer; font-size:13px;
    }
    .toolbar button:hover { background:#e0e7ff; }
    @media print {
      .toolbar { display:none; }
      body { background:#fff; }
      @page { size:A4; margin:8mm; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>🖨️ ${filtered.length} Receipt${filtered.length>1?'s':''} — ${SCHOOL.name}</span>
    <button onclick="window.print()">Print All ${filtered.length} Receipts</button>
  </div>
  ${filtered.map((r, i) => makeCard(r, i === filtered.length - 1)).join('\n')}
</body></html>`;

    const win = window.open('', '_blank');
    if (!win) {
      toast.error('Popup blocked! Allow popups for this site and try again.');
      return;
    }
    win.document.write(html);
    win.document.close();
    toast.success(`✅ ${filtered.length} receipts opened — click "Print All" to print together`);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
        {[
          { label:'Total Receipts',   value:filtered.length,           color:'#3b82f6' },
          { label:'Total Collected',  value:`₹${totalCollected.toLocaleString()}`, color:'#16a34a' },
          { label:'This Month',       value:filtered.filter(r=>r.paymentDate.startsWith(new Date().toISOString().slice(0,7))).length, color:'#8b5cf6' },
        ].map(k=>(
          <div key={k.label} className="card" style={{ padding:'14px 16px', borderTop:`3px solid ${k.color}` }}>
            <div style={{ fontSize:10, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:.4 }}>{k.label}</div>
            <div style={{ fontSize:20, fontWeight:800, color:'#0f172a', marginTop:4 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', flex:1 }}>
          <div style={{ position:'relative', flex:1, minWidth:180 }}>
            <Search size={13} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
            <input className="input-field" placeholder="Search receipt no, student..."
              style={{ paddingLeft:28 }} value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div style={{ position:'relative', minWidth:130 }}>
            <select className="input-field" style={{ appearance:'none', paddingRight:24 }}
              value={classFilter} onChange={e=>setClassFilter(e.target.value)}>
              <option value="">All Classes</option>
              {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
            </select>
            <ChevronDown size={12} style={{ position:'absolute', right:7, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }} />
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontSize:12, color:'#64748b' }}>From</span>
            <input type="date" className="input-field" style={{ width:150 }} value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
            <span style={{ fontSize:12, color:'#64748b' }}>To</span>
            <input type="date" className="input-field" style={{ width:150 }} value={dateTo} onChange={e=>setDateTo(e.target.value)} />
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={bulkPrintReceipts}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
              borderRadius:8, border:'none', background:'#1e40af', color:'#fff',
              cursor:'pointer', fontSize:13, fontWeight:700 }}>
            <Printer size={14}/> 🖨️ Bulk Print All ({filtered.length})
          </button>
          <button onClick={exportCSV} className="btn-secondary"><Download size={14}/> Export CSV</button>
        </div>
      </div>

      {/* Receipts table */}
      <div className="card">
        <div style={{ overflowX:'auto' }}>
          <table>
            <thead>
              <tr><th>Receipt No</th><th>Student</th><th>Class</th><th>Fee Type</th><th>Amount</th><th>Mode</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r._id}>
                  <td style={{ fontFamily:'monospace', fontWeight:700, color:'#1d4ed8', fontSize:12 }}>{r.receiptNo}</td>
                  <td>
                    <div style={{ fontWeight:600, color:'#0f172a' }}>{r.studentName}</div>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>{r.admNo}</div>
                  </td>
                  <td>Class {r.class}</td>
                  <td style={{ fontSize:12 }}>{r.feeType}</td>
                  <td><span style={{ fontWeight:800, color:'#16a34a', fontSize:14 }}>₹{r.amount.toLocaleString()}</span></td>
                  <td>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:12,
                      background:'#f1f5f9', color:'#475569' }}>{r.paymentMode}</span>
                  </td>
                  <td style={{ fontSize:12, color:'#64748b' }}>
                    {new Date(r.paymentDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      {/* Print */}
                      <button onClick={() => printReceipt(r)} title="Print receipt"
                        style={{ padding:5, borderRadius:6, background:'#f1f5f9', border:'none', cursor:'pointer', color:'#3b82f6', display:'flex', alignItems:'center' }}>
                        <Printer size={14}/>
                      </button>
                      {/* Download as PDF/Image */}
                      <button onClick={() => downloadReceiptPDF(r)} title="Download as PDF"
                        style={{ padding:5, borderRadius:6, background:'#fef3c7', border:'none', cursor:'pointer', color:'#d97706', display:'flex', alignItems:'center' }}>
                        <FileDown size={14}/>
                      </button>
                      {/* WhatsApp — uses saved parent phone directly */}
                      <button
                        onClick={() => shareReceiptWA(r)}
                        title={r.parentPhone ? `Send to ${r.parentPhone}` : 'No parent phone saved'}
                        style={{ padding:5, borderRadius:6, background:'#f0fdf4', border:'none',
                          cursor: r.parentPhone ? 'pointer' : 'not-allowed',
                          color: r.parentPhone ? '#25D366' : '#cbd5e1',
                          display:'flex', alignItems:'center' }}>
                        <MessageCircle size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No receipts found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN Fees page
// ══════════════════════════════════════════════════════════════════════════════
export default function Fees() {
  const [tab, setTab]         = useState('structure');
  const [receipts, setReceipts] = useState(DEMO_RECEIPTS);

  const TABS = [
    { id:'structure', label:'Fee Structure', icon:FileText  },
    { id:'collect',   label:'Collect Fee',   icon:CreditCard},
    { id:'receipts',  label:'Receipts',      icon:CheckCircle},
  ];

  const totalCollected = receipts.reduce((s,r) => s + r.amount, 0);
  const todayReceipts  = receipts.filter(r => r.paymentDate === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
        <p className="text-gray-500 text-sm">Collect fees, send receipts on WhatsApp, export CSV and manage fee structures</p>
      </div>

      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:14 }}>
        {[
          { label:'Total Collected',   value:`₹${totalCollected.toLocaleString()}`, color:'#16a34a', icon:CreditCard   },
          { label:'Total Receipts',    value:receipts.length,                        color:'#3b82f6', icon:FileText     },
          { label:"Today's Collection",value:todayReceipts.length>0?`₹${todayReceipts.reduce((s,r)=>s+r.amount,0).toLocaleString()}`:'₹0', color:'#8b5cf6', icon:CheckCircle },
          { label:'Pending Fees',      value:DEMO_PENDING.length,                   color:'#ef4444', icon:AlertCircle  },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding:'14px 16px', display:'flex', gap:10, alignItems:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:k.color, borderRadius:'12px 12px 0 0' }} />
            <div style={{ background:`${k.color}18`, borderRadius:9, padding:9, flexShrink:0 }}>
              <k.icon size={17} color={k.color} />
            </div>
            <div>
              <div style={{ fontSize:10, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:.4 }}>{k.label}</div>
              <div style={{ fontSize:18, fontWeight:800, color:'#0f172a' }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, borderBottom:'2px solid #f1f5f9' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{
              display:'flex', alignItems:'center', gap:7, padding:'10px 20px',
              border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
              background:'transparent', transition:'all .2s',
              color:       tab===t.id ? '#1e40af' : '#64748b',
              borderBottom: tab===t.id ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: '-2px',
            }}>
            <t.icon size={14}/> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab==='structure' && <FeeStructureTab />}
      {tab==='collect'   && <CollectFeeTab onCollected={r => setReceipts(prev=>[r,...prev])} />}
      {tab==='receipts'  && <ReceiptsTab receipts={receipts} />}
    </div>
  );
}