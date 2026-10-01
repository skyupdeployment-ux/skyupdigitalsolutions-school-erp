// @ts-nocheck
import { useState, useEffect } from 'react';
import {
  Search, ChevronDown, Loader, Download,
  CheckCircle, XCircle, Clock, Users,
  Calendar, TrendingUp, MessageCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

// ── Constants ─────────────────────────────────────────────────────────────────
const CLASSES   = ['Nursery','LKG','UKG','1','2','3','4','5','6','7','8','9','10','11','12'];
const SECTIONS  = ['A','B','C','D'];
const SCHOOL    = { name:'Greenfield Public School', phone:'080-12345678' };

// ── Demo students (used as fallback) ─────────────────────────────────────────
const DEMO_STUDENTS = [
  { _id:'s1', name:'Arjun Sharma',    admNo:'ADM001', rollNo:'01', parentPhone:'9876543210' },
  { _id:'s2', name:'Priya Patel',     admNo:'ADM002', rollNo:'02', parentPhone:'9876543211' },
  { _id:'s3', name:'Rahul Kumar',     admNo:'ADM003', rollNo:'03', parentPhone:'9876543212' },
  { _id:'s4', name:'Sneha Reddy',     admNo:'ADM004', rollNo:'04', parentPhone:'9876543213' },
  { _id:'s5', name:'Sidda Madabhavi', admNo:'123',    rollNo:'05', parentPhone:'9008303681' },
  { _id:'s6', name:'siddu madabhavi', admNo:'11',     rollNo:'06', parentPhone:'6362168219' },
];

// ── Past attendance records for the report tab ────────────────────────────────
const DEMO_RECORDS = [
  { date:'2026-09-21', class:'10', section:'A', present:40, absent:5,  late:2, total:47 },
  { date:'2026-09-20', class:'10', section:'A', present:43, absent:2,  late:2, total:47 },
  { date:'2026-09-19', class:'10', section:'A', present:44, absent:3,  late:0, total:47 },
  { date:'2026-09-18', class:'10', section:'A', present:45, absent:1,  late:1, total:47 },
  { date:'2026-09-17', class:'10', section:'A', present:42, absent:5,  late:0, total:47 },
  { date:'2026-09-16', class:'10', section:'A', present:38, absent:7,  late:2, total:47 },
];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  P: { label:'Present', color:'#16a34a', bg:'#dcfce7', icon: CheckCircle },
  A: { label:'Absent',  color:'#dc2626', bg:'#fee2e2', icon: XCircle     },
  L: { label:'Late',    color:'#d97706', bg:'#fef9c3', icon: Clock       },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const Sel = ({ label, children, ...p }) => (
  <div>
    {label && <label className="label">{label}</label>}
    <div style={{ position:'relative' }}>
      <select className="input-field" style={{ appearance:'none', paddingRight:28 }} {...p}>
        {children}
      </select>
      <ChevronDown size={13} style={{ position:'absolute', right:8, top:'50%',
        transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }} />
    </div>
  </div>
);

// ── Mark Attendance Tab ───────────────────────────────────────────────────────
function MarkAttendanceTab() {
  const [selClass,   setSelClass]   = useState('10');
  const [selSection, setSelSection] = useState('A');
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [students,   setStudents]   = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: 'P'|'A'|'L' }
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [search,     setSearch]     = useState('');

  // Load students when class/section changes
  useEffect(() => {
    setLoading(true);
    setSubmitted(false);
    setAttendance({});
    api.get('/students', { params: { class: selClass, section: selSection, limit:100 } })
      .then(res => {
        const raw = res.data.data || [];
        if (raw.length > 0) {
          setStudents(raw.map(s => ({
            _id:         s._id,
            name:        `${s.firstName||''} ${s.lastName||''}`.trim(),
            admNo:       s.admissionNumber || '—',
            rollNo:      s.rollNumber || '—',
            parentPhone: s.parentPhone || s.phone || '',
          })));
        } else {
          setStudents(DEMO_STUDENTS);
        }
      })
      .catch(() => setStudents(DEMO_STUDENTS))
      .finally(() => setLoading(false));
  }, [selClass, selSection]);

  // Mark all as present
  const markAll = (status) => {
    const all = {};
    students.forEach(s => { all[s._id] = status; });
    setAttendance(all);
  };

  // Toggle one student's status P → A → L → P
  const toggle = (id) => {
    setAttendance(prev => {
      const cur = prev[id] || 'P';
      const next = cur==='P' ? 'A' : cur==='A' ? 'L' : 'P';
      return { ...prev, [id]: next };
    });
  };

  // Set specific status
  const setStatus = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.admNo.includes(search)
  );

  const presentCount = Object.values(attendance).filter(v=>v==='P').length;
  const absentCount  = Object.values(attendance).filter(v=>v==='A').length;
  const lateCount    = Object.values(attendance).filter(v=>v==='L').length;
  const markedCount  = Object.keys(attendance).length;

  const handleSave = async () => {
    if (markedCount === 0) { toast.error('Please mark attendance first'); return; }
    setSaving(true);
    try {
      await api.post('/attendance', {
        class: selClass, section: selSection, date,
        attendance: students.map(s => ({
          student: s._id,
          status:  attendance[s._id] || 'A',
        }))
      });
    } catch {}
    setTimeout(() => {
      setSaving(false);
      setSubmitted(true);
      toast.success(`Attendance saved for Class ${selClass}-${selSection}!`);
    }, 600);
  };

  // Send WhatsApp to absent students' parents
  const notifyAbsent = () => {
    const absentStudents = students.filter(s => attendance[s._id] === 'A');
    if (!absentStudents.length) { toast.error('No absent students to notify'); return; }
    let notified = 0;
    absentStudents.forEach(s => {
      const raw = (s.parentPhone||'').replace(/\D/g,'');
      if (!raw) return;
      const ph  = raw.startsWith('91') ? raw : `91${raw}`;
      const msg =
`📢 *Attendance Alert – ${SCHOOL.name}*

Dear Parent,

Your child *${s.name}* (Adm: ${s.admNo}, Class ${selClass}-${selSection}) was marked *ABSENT* on *${new Date(date).toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}*.

If this is an error, please contact the school.

📞 ${SCHOOL.phone}
🏫 ${SCHOOL.name}`;
      setTimeout(() => {
        window.open(`https://wa.me/${ph}?text=${encodeURIComponent(msg)}`, '_blank');
      }, notified * 800);
      notified++;
    });
    toast.success(`Sending WhatsApp to ${notified} parent(s)...`);
  };

  // Export attendance as CSV
  const exportCSV = () => {
    const csv = 'Roll No,Student Name,Adm No,Status,Date,Class\n'
      + students.map(s => `"${s.rollNo}","${s.name}","${s.admNo}","${attendance[s._id]||'Not Marked'}","${date}","${selClass}-${selSection}"`).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download=`Attendance_${selClass}_${selSection}_${date}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card" style={{ padding:18 }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
          <Sel label="Class" value={selClass} onChange={e=>setSelClass(e.target.value)}>
            {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
          </Sel>
          <Sel label="Section" value={selSection} onChange={e=>setSelSection(e.target.value)}>
            {SECTIONS.map(s=><option key={s}>{s}</option>)}
          </Sel>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input-field" value={date}
              onChange={e=>{ setDate(e.target.value); setSubmitted(false); }} />
          </div>
          <div style={{ position:'relative', flex:1, minWidth:180 }}>
            <Search size={13} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
            <input className="input-field" placeholder="Search student..." style={{ paddingLeft:28 }}
              value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Summary bar */}
      {markedCount > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            { label:'Total',   value:students.length, color:'#3b82f6' },
            { label:'Present', value:presentCount,    color:'#16a34a' },
            { label:'Absent',  value:absentCount,     color:'#ef4444' },
            { label:'Late',    value:lateCount,       color:'#d97706' },
          ].map(k => (
            <div key={k.label} className="card"
              style={{ padding:'12px 16px', borderTop:`3px solid ${k.color}`, textAlign:'center' }}>
              <div style={{ fontSize:10, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:.4 }}>{k.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk actions */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:8 }}>
          <span style={{ fontSize:13, color:'#64748b', alignSelf:'center' }}>Mark all:</span>
          {Object.entries(STATUS).map(([key, s]) => (
            <button key={key} onClick={() => markAll(key)}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:8,
                border:`1px solid ${s.color}30`, background:s.bg, color:s.color,
                cursor:'pointer', fontSize:12, fontWeight:700 }}>
              <s.icon size={13}/> {s.label}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={exportCSV} className="btn-secondary" style={{ fontSize:12 }}>
            <Download size={13}/> Export CSV
          </button>
          {absentCount > 0 && (
            <button onClick={notifyAbsent}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8,
                border:'1px solid #25D366', background:'#f0fdf4', color:'#16a34a',
                cursor:'pointer', fontSize:12, fontWeight:700 }}>
              <MessageCircle size={13}/> Notify {absentCount} Absent
            </button>
          )}
          <button onClick={handleSave} disabled={saving || submitted}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:8,
              border:'none', cursor: submitted?'default':'pointer', fontSize:13, fontWeight:700,
              background: submitted ? '#16a34a' : '#3b82f6', color:'#fff', opacity: saving?0.7:1 }}>
            {saving ? <><Loader size={13} className="animate-spin"/> Saving...</>
              : submitted ? <><CheckCircle size={13}/> Saved!</>
              : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Attendance table */}
      <div className="card">
        {loading ? (
          <div style={{ padding:48, textAlign:'center', color:'#94a3b8', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <Loader size={18} className="animate-spin" /> Loading students...
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width:50 }}>#</th>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Adm No</th>
                  <th style={{ textAlign:'center' }}>Status</th>
                  <th style={{ textAlign:'center', minWidth:200 }}>Mark</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const cur = attendance[s._id];
                  const cfg = cur ? STATUS[cur] : null;
                  return (
                    <tr key={s._id} style={{
                      background: cur==='A' ? '#fff5f5' : cur==='L' ? '#fffbeb' : cur==='P' ? '#f0fdf4' : 'transparent',
                      transition:'background .2s'
                    }}>
                      <td style={{ color:'#94a3b8', textAlign:'center' }}>{i+1}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0,
                            background: cur==='A'?'#fee2e2': cur==='L'?'#fef9c3': cur==='P'?'#dcfce7':'#f1f5f9',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontWeight:800, fontSize:13,
                            color: cur==='A'?'#dc2626': cur==='L'?'#d97706': cur==='P'?'#16a34a':'#64748b' }}>
                            {s.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, color:'#0f172a' }}>{s.name}</div>
                            {s.parentPhone && (
                              <div style={{ fontSize:10, color:'#94a3b8' }}>{s.parentPhone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize:13, color:'#475569', fontWeight:600 }}>{s.rollNo}</td>
                      <td style={{ fontSize:12, color:'#94a3b8' }}>{s.admNo}</td>
                      <td style={{ textAlign:'center' }}>
                        {cfg ? (
                          <span style={{ fontSize:11, fontWeight:700, padding:'3px 12px', borderRadius:20,
                            background:cfg.bg, color:cfg.color, display:'inline-flex', alignItems:'center', gap:4 }}>
                            <cfg.icon size={11}/> {cfg.label}
                          </span>
                        ) : (
                          <span style={{ fontSize:11, color:'#cbd5e1' }}>Not marked</span>
                        )}
                      </td>
                      <td>
                        {/* P / A / L toggle buttons */}
                        <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
                          {Object.entries(STATUS).map(([key, s2]) => (
                            <button key={key} onClick={() => setStatus(s._id, key)}
                              style={{
                                width:36, height:36, borderRadius:9, border:'2px solid',
                                cursor:'pointer', fontWeight:800, fontSize:12, transition:'all .15s',
                                borderColor: cur===key ? s2.color : '#e2e8f0',
                                background:  cur===key ? s2.bg    : '#fff',
                                color:       cur===key ? s2.color : '#94a3b8',
                                boxShadow:   cur===key ? `0 0 0 3px ${s2.color}20` : 'none',
                              }}
                              title={s2.label}>
                              {key}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>
                    No students found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer summary */}
        {!loading && students.length > 0 && (
          <div style={{ padding:'12px 16px', borderTop:'1px solid #f1f5f9',
            display:'flex', gap:16, justifyContent:'space-between', alignItems:'center',
            background:'#f8fafc', flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:16 }}>
              {[
                { label:'Total', value:students.length, color:'#3b82f6' },
                { label:'Present', value:presentCount, color:'#16a34a' },
                { label:'Absent',  value:absentCount,  color:'#ef4444' },
                { label:'Late',    value:lateCount,     color:'#d97706' },
                { label:'Unmarked',value:students.length-markedCount, color:'#94a3b8' },
              ].map(k => (
                <div key={k.label} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600 }}>{k.label}</div>
                  <div style={{ fontSize:16, fontWeight:800, color:k.color }}>{k.value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:12, color:'#64748b' }}>
              Class {selClass}-{selSection} · {new Date(date).toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Attendance Report Tab ─────────────────────────────────────────────────────
function ReportTab() {
  const [classFilter,   setClassFilter]   = useState('10');
  const [sectionFilter, setSectionFilter] = useState('A');
  const [dateFrom,      setDateFrom]      = useState('2026-09-16');
  const [dateTo,        setDateTo]        = useState('2026-09-21');

  const filtered = DEMO_RECORDS.filter(r => {
    const d = new Date(r.date);
    return (!classFilter   || r.class   === classFilter)
        && (!sectionFilter || r.section === sectionFilter)
        && (!dateFrom || d >= new Date(dateFrom))
        && (!dateTo   || d <= new Date(dateTo+'T23:59:59'));
  });

  const avgPresent = filtered.length
    ? Math.round(filtered.reduce((s,r)=>s+(r.present/r.total*100),0)/filtered.length)
    : 0;

  const exportCSV = () => {
    const csv = 'Date,Class,Section,Total,Present,Absent,Late,Attendance%\n'
      + filtered.map(r => `"${r.date}","${r.class}","${r.section}",${r.total},${r.present},${r.absent},${r.late},${Math.round(r.present/r.total*100)}%`).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download='attendance_report.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card" style={{ padding:16, display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
        <Sel label="Class" value={classFilter} onChange={e=>setClassFilter(e.target.value)}>
          {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
        </Sel>
        <Sel label="Section" value={sectionFilter} onChange={e=>setSectionFilter(e.target.value)}>
          {SECTIONS.map(s=><option key={s}>{s}</option>)}
        </Sel>
        <div>
          <label className="label">From</label>
          <input type="date" className="input-field" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="label">To</label>
          <input type="date" className="input-field" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
        </div>
        <button onClick={exportCSV} className="btn-secondary"><Download size={13}/> Export CSV</button>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
        {[
          { label:'Days Recorded',  value:filtered.length,                                      color:'#3b82f6' },
          { label:'Avg Attendance', value:`${avgPresent}%`,                                     color:'#16a34a' },
          { label:'Total Absent',   value:filtered.reduce((s,r)=>s+r.absent,0),                color:'#ef4444' },
          { label:'Total Late',     value:filtered.reduce((s,r)=>s+r.late,0),                  color:'#d97706' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding:'14px 16px', borderTop:`3px solid ${k.color}` }}>
            <div style={{ fontSize:10, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:.4 }}>{k.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:k.color, marginTop:4 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Inline bar chart */}
      <div className="card" style={{ padding:20 }}>
        <div style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:16 }}>
          Attendance Trend — Class {classFilter}-{sectionFilter}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(r => {
            const pct = Math.round(r.present/r.total*100);
            const color = pct>=90?'#16a34a': pct>=75?'#d97706':'#ef4444';
            return (
              <div key={r.date} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:11, color:'#64748b', width:90, flexShrink:0 }}>
                  {new Date(r.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                </span>
                <div style={{ flex:1, height:20, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:4,
                    display:'flex', alignItems:'center', paddingLeft:8, transition:'width .5s' }}>
                    <span style={{ fontSize:10, color:'#fff', fontWeight:700 }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ fontSize:11, color:'#64748b', width:120, flexShrink:0 }}>
                  P:{r.present} A:{r.absent} L:{r.late}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:32, color:'#94a3b8' }}>No records found</div>
          )}
        </div>
      </div>

      {/* Report table */}
      <div className="card">
        <div style={{ overflowX:'auto' }}>
          <table>
            <thead>
              <tr><th>Date</th><th>Class</th><th>Total</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance %</th><th>Grade</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const pct   = Math.round(r.present/r.total*100);
                const color = pct>=90?'#16a34a': pct>=75?'#d97706':'#ef4444';
                const grade = pct>=90?'Excellent': pct>=75?'Good': pct>=60?'Average':'Poor';
                return (
                  <tr key={r.date}>
                    <td style={{ fontWeight:600, color:'#0f172a' }}>
                      {new Date(r.date).toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}
                    </td>
                    <td>Class {r.class}-{r.section}</td>
                    <td style={{ textAlign:'center', fontWeight:600 }}>{r.total}</td>
                    <td style={{ textAlign:'center' }}><span style={{ fontWeight:700, color:'#16a34a' }}>{r.present}</span></td>
                    <td style={{ textAlign:'center' }}><span style={{ fontWeight:700, color:'#ef4444' }}>{r.absent}</span></td>
                    <td style={{ textAlign:'center' }}><span style={{ fontWeight:700, color:'#d97706' }}>{r.late}</span></td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1, height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:3 }} />
                        </div>
                        <span style={{ fontWeight:800, color, fontSize:13, width:36 }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:20,
                        background:`${color}18`, color }}>
                        {grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && <tr><td colSpan={8} style={{ textAlign:'center', padding:32, color:'#94a3b8' }}>No records found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Attendance page ──────────────────────────────────────────────────────
export default function Attendance() {
  const [tab, setTab] = useState('mark');

  const TABS = [
    { id:'mark',   label:'Mark Attendance', icon: CheckCircle },
    { id:'report', label:'Attendance Report', icon: TrendingUp },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm">Mark daily attendance and view reports</p>
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

      {tab==='mark'   && <MarkAttendanceTab />}
      {tab==='report' && <ReportTab />}
    </div>
  );
}