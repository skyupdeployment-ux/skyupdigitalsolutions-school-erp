// @ts-nocheck
import { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, X, Loader,
  ChevronDown, Users, BookOpen, UserCheck,
  GraduationCap, Clock, Download, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────
const SECTIONS = ['A','B','C','D','E'];
const STREAMS  = ['None','Science','Commerce','Arts'];
const DAYS     = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const PERIODS  = [
  { no:1, label:'Period 1', time:'8:00–8:45'   },
  { no:2, label:'Period 2', time:'8:45–9:30'   },
  { no:3, label:'Break',    time:'9:30–9:45',   isBreak:true },
  { no:4, label:'Period 3', time:'9:45–10:30'  },
  { no:5, label:'Period 4', time:'10:30–11:15' },
  { no:6, label:'Lunch',    time:'11:15–12:00', isBreak:true },
  { no:7, label:'Period 5', time:'12:00–12:45' },
  { no:8, label:'Period 6', time:'12:45–1:30'  },
  { no:9, label:'Period 7', time:'1:30–2:15'   },
];
const SUBJECTS = [
  'Mathematics','Science','English','Social Studies','Hindi','Kannada',
  'Physics','Chemistry','Biology','Computer Science','Physical Education',
  'Art & Craft','Music','Moral Science',
];
const SUB_COLORS = {
  'Mathematics':       ['#dbeafe','#1d4ed8'],
  'Science':           ['#dcfce7','#16a34a'],
  'English':           ['#fce7f3','#be185d'],
  'Social Studies':    ['#fef9c3','#d97706'],
  'Hindi':             ['#f3e8ff','#7c3aed'],
  'Kannada':           ['#fff7ed','#c2410c'],
  'Physics':           ['#dbeafe','#1d4ed8'],
  'Chemistry':         ['#dcfce7','#16a34a'],
  'Biology':           ['#fce7f3','#be185d'],
  'Computer Science':  ['#f0fdf4','#15803d'],
  'Physical Education':['#fff1f2','#be123c'],
  'Art & Craft':       ['#fef3c7','#92400e'],
  'Music':             ['#ede9fe','#6d28d9'],
  'Moral Science':     ['#f1f5f9','#475569'],
};
const getSubColor = (s) => SUB_COLORS[s] || ['#f1f5f9','#475569'];

const STREAM_COLOR = {
  Science:  ['#dbeafe','#1d4ed8'],
  Commerce: ['#dcfce7','#16a34a'],
  Arts:     ['#fce7f3','#be185d'],
  None:     ['#f1f5f9','#64748b'],
};

// ── Demo Data ─────────────────────────────────────────────
const DEMO_TEACHERS = [
  { _id:'t1', name:'Mrs. Kavitha Nair',  subject:'Mathematics' },
  { _id:'t2', name:'Mr. Rajan Pillai',   subject:'Science'     },
  { _id:'t3', name:'Ms. Priya Sharma',   subject:'English'     },
  { _id:'t4', name:'Mr. Suresh Kumar',   subject:'Social'      },
  { _id:'t5', name:'Mrs. Lakshmi Devi',  subject:'Hindi'       },
  { _id:'t6', name:'Mr. Kiran Rao',      subject:'Physics'     },
];

const DEMO_CLASSES = [
  { _id:'c1',  grade:'1',  section:'A', stream:'None',     classTeacherId:'t3', capacity:40, studentCount:38, room:'101', feeAmount:12000 },
  { _id:'c2',  grade:'2',  section:'A', stream:'None',     classTeacherId:'t5', capacity:40, studentCount:35, room:'102', feeAmount:12000 },
  { _id:'c3',  grade:'3',  section:'A', stream:'None',     classTeacherId:'t4', capacity:40, studentCount:40, room:'103', feeAmount:13000 },
  { _id:'c4',  grade:'4',  section:'A', stream:'None',     classTeacherId:'t3', capacity:40, studentCount:37, room:'104', feeAmount:13000 },
  { _id:'c5',  grade:'5',  section:'A', stream:'None',     classTeacherId:'t2', capacity:40, studentCount:39, room:'105', feeAmount:14000 },
  { _id:'c6',  grade:'6',  section:'A', stream:'None',     classTeacherId:'t1', capacity:45, studentCount:42, room:'201', feeAmount:15000 },
  { _id:'c7',  grade:'6',  section:'B', stream:'None',     classTeacherId:'t4', capacity:45, studentCount:40, room:'202', feeAmount:15000 },
  { _id:'c8',  grade:'7',  section:'A', stream:'None',     classTeacherId:'t2', capacity:45, studentCount:44, room:'203', feeAmount:16000 },
  { _id:'c9',  grade:'8',  section:'A', stream:'None',     classTeacherId:'t5', capacity:45, studentCount:43, room:'204', feeAmount:17000 },
  { _id:'c10', grade:'9',  section:'A', stream:'None',     classTeacherId:'t1', capacity:50, studentCount:48, room:'301', feeAmount:18000 },
  { _id:'c11', grade:'9',  section:'B', stream:'None',     classTeacherId:'t6', capacity:50, studentCount:45, room:'302', feeAmount:18000 },
  { _id:'c12', grade:'10', section:'A', stream:'None',     classTeacherId:'t3', capacity:50, studentCount:50, room:'303', feeAmount:20000 },
  { _id:'c13', grade:'10', section:'B', stream:'None',     classTeacherId:'t2', capacity:50, studentCount:47, room:'304', feeAmount:20000 },
  { _id:'c14', grade:'11', section:'A', stream:'Science',  classTeacherId:'t6', capacity:50, studentCount:45, room:'401', feeAmount:22000 },
  { _id:'c15', grade:'11', section:'B', stream:'Commerce', classTeacherId:'t1', capacity:50, studentCount:38, room:'402', feeAmount:22000 },
  { _id:'c16', grade:'12', section:'A', stream:'Science',  classTeacherId:'t6', capacity:50, studentCount:48, room:'403', feeAmount:24000 },
  { _id:'c17', grade:'12', section:'B', stream:'Commerce', classTeacherId:'t4', capacity:50, studentCount:36, room:'404', feeAmount:24000 },
];

// Generate demo timetable for each class
const makeTT = (classId) => {
  const subs = ['Mathematics','English','Science','Social Studies','Hindi','Computer Science','Physical Education','Kannada','Art & Craft'];
  const tchs = ['t1','t2','t3','t4','t5','t6'];
  const tt = {};
  DAYS.forEach((day, di) => {
    tt[day] = {};
    let pi = 0;
    PERIODS.forEach(p => {
      if (p.isBreak) { tt[day][p.no] = null; return; }
      tt[day][p.no] = { subject: subs[(di*3+pi) % subs.length], teacherId: tchs[(di+pi) % tchs.length] };
      pi++;
    });
  });
  return tt;
};
const INIT_TT = {};
DEMO_CLASSES.forEach(c => { INIT_TT[c._id] = makeTT(c._id); });

const INIT_CLASS = { grade:'1', section:'A', stream:'None', classTeacherId:'', capacity:40, room:'', feeAmount:12000 };
const INIT_CELL  = { subject:'', teacherId:'' };

// ── Small helpers ─────────────────────────────────────────
const Sel = ({ label, required, children, style={}, ...p }) => (
  <div>
    {label && <label className="label">{label}{required && ' *'}</label>}
    <div style={{ position:'relative' }}>
      <select required={required} className="input-field"
        style={{ appearance:'none', paddingRight:28, ...style }} {...p}>
        {children}
      </select>
      <ChevronDown size={13} style={{ position:'absolute', right:8, top:'50%',
        transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }} />
    </div>
  </div>
);

const SmSel = ({ label, children, ...p }) => (
  <div>
    {label && <label style={{ fontSize:11, fontWeight:700, color:'#64748b', display:'block', marginBottom:4 }}>{label}</label>}
    <div style={{ position:'relative' }}>
      <select style={{ width:'100%', padding:'8px 28px 8px 10px', borderRadius:8,
        border:'1px solid #e2e8f0', fontSize:13, appearance:'none', background:'#fff' }} {...p}>
        {children}
      </select>
      <ChevronDown size={12} style={{ position:'absolute', right:8, top:'50%',
        transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }} />
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════
// CLASSES TAB
// ══════════════════════════════════════════════════════════
function ClassesTab({ classes, setClasses, teachers }) {
  const [search,      setSearch]      = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [view,        setView]        = useState('grid');
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(INIT_CLASS);
  const [saving,      setSaving]      = useState(false);

  const inp = f => ({ value: form[f] || '', onChange: e => setForm(p => ({ ...p, [f]: e.target.value })) });

  const openAdd  = () => { setEditing(null); setForm(INIT_CLASS); setShowModal(true); };
  const openEdit = c  => { setEditing(c); setForm({ ...c }); setShowModal(true); };

  const handleDelete = (id) => {
    if (!confirm('Delete this class?')) return;
    setClasses(prev => prev.filter(c => c._id !== id));
    toast.success('Class deleted');
  };

  const handleSave = e => {
    e.preventDefault(); setSaving(true);
    setTimeout(() => {
      if (editing) {
        setClasses(prev => prev.map(c => c._id === editing._id ? { ...c, ...form } : c));
        toast.success('Class updated!');
      } else {
        setClasses(prev => [...prev, { ...form, _id:'c'+Date.now(), studentCount:0 }]);
        toast.success('Class added!');
      }
      setShowModal(false); setSaving(false);
    }, 400);
  };

  const grades   = [...new Set(classes.map(c => c.grade))].sort((a,b) => Number(a)-Number(b));
  const filtered = classes.filter(c =>
    (!search      || ('Class '+c.grade+' '+c.section).toLowerCase().includes(search.toLowerCase())
      || (teachers.find(t=>t._id===c.classTeacherId)?.name||'').toLowerCase().includes(search.toLowerCase()))
    && (!gradeFilter || c.grade === gradeFilter)
  );

  const totalStudents = classes.reduce((s,c)=>s+c.studentCount,0);
  const totalCapacity = classes.reduce((s,c)=>s+c.capacity,0);
  const fullClasses   = classes.filter(c=>c.studentCount>=c.capacity).length;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12 }}>
        {[
          { label:'Total Classes',  value:classes.length, color:'#3b82f6', icon:GraduationCap },
          { label:'Total Students', value:totalStudents,  color:'#16a34a', icon:Users         },
          { label:'Total Capacity', value:totalCapacity,  color:'#8b5cf6', icon:Users         },
          { label:'Full Classes',   value:fullClasses,    color:'#dc2626', icon:UserCheck     },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding:'12px 14px', display:'flex', gap:10, alignItems:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:k.color }} />
            <div style={{ background:k.color+'18', borderRadius:9, padding:9 }}><k.icon size={16} color={k.color}/></div>
            <div>
              <div style={{ fontSize:9, color:'#94a3b8', fontWeight:700, textTransform:'uppercase' }}>{k.label}</div>
              <div style={{ fontSize:18, fontWeight:800, color:k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:180 }}>
          <Search size={13} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
          <input className="input-field" placeholder="Search class or teacher..." style={{ paddingLeft:28 }}
            value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <Sel value={gradeFilter} onChange={e=>setGradeFilter(e.target.value)}>
          <option value="">All Grades</option>
          {grades.map(g=><option key={g} value={g}>Class {g}</option>)}
        </Sel>
        <div style={{ display:'flex', borderRadius:8, border:'1px solid #e2e8f0', overflow:'hidden' }}>
          {['grid','table'].map(v=>(
            <button key={v} onClick={()=>setView(v)}
              style={{ padding:'7px 14px', border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
                background:view===v?'#3b82f6':'#f8fafc', color:view===v?'#fff':'#64748b' }}>
              {v==='grid'?'⊞ Grid':'☰ Table'}
            </button>
          ))}
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={14}/> Add Class</button>
      </div>

      {/* Grid */}
      {view==='grid' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:14 }}>
          {filtered.map(cls => {
            const teacher = teachers.find(t=>t._id===cls.classTeacherId);
            const pct     = Math.round(cls.studentCount/cls.capacity*100);
            const barC    = pct>=100?'#dc2626':pct>=80?'#d97706':'#16a34a';
            const [bg,color] = STREAM_COLOR[cls.stream]||STREAM_COLOR['None'];
            return (
              <div key={cls._id} className="card" style={{ padding:0, overflow:'hidden' }}>
                <div style={{ height:4, background:pct>=100?'#dc2626':pct>=80?'#d97706':'#3b82f6' }}/>
                <div style={{ padding:'14px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div>
                      <div style={{ fontWeight:900, fontSize:18, color:'#0f172a' }}>
                        Class {cls.grade}<span style={{ color:'#3b82f6' }}> – {cls.section}</span>
                      </div>
                      {cls.stream!=='None' && (
                        <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:12, background:bg, color }}>{cls.stream}</span>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:5 }}>
                      <button onClick={()=>openEdit(cls)} style={{ padding:6, borderRadius:7, border:'1px solid #bfdbfe', background:'#eff6ff', cursor:'pointer', color:'#3b82f6', display:'flex' }}><Edit size={13}/></button>
                      <button onClick={()=>handleDelete(cls._id)} style={{ padding:6, borderRadius:7, border:'1px solid #fecaca', background:'#fff5f5', cursor:'pointer', color:'#ef4444', display:'flex' }}><Trash2 size={13}/></button>
                    </div>
                  </div>
                  {teacher ? (
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, padding:'8px 10px', background:'#f8fafc', borderRadius:8 }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12, color:'#1d4ed8', flexShrink:0 }}>
                        {teacher.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:12 }}>{teacher.name}</div>
                        <div style={{ fontSize:11, color:'#64748b' }}>{teacher.subject} · Class Teacher</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding:'8px 10px', background:'#fff7ed', borderRadius:8, fontSize:12, color:'#d97706', fontWeight:600, marginBottom:10 }}>⚠️ No class teacher assigned</div>
                  )}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:10 }}>
                    {[['Students',cls.studentCount,'#3b82f6'],['Capacity',cls.capacity,'#8b5cf6'],['Room',cls.room||'—','#16a34a']].map(([l,v,c])=>(
                      <div key={l} style={{ textAlign:'center', padding:'6px 4px', background:'#f8fafc', borderRadius:7 }}>
                        <div style={{ fontSize:15, fontWeight:800, color:c }}>{v}</div>
                        <div style={{ fontSize:9, color:'#94a3b8', fontWeight:700, textTransform:'uppercase' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#64748b', marginBottom:3 }}>
                    <span>Occupancy</span>
                    <span style={{ fontWeight:700, color:barC }}>{pct}%{pct>=100?' FULL':''}</span>
                  </div>
                  <div style={{ height:5, background:'#f1f5f9', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:Math.min(pct,100)+'%', height:'100%', background:barC, borderRadius:3 }}/>
                  </div>
                  <div style={{ marginTop:8, fontSize:11, color:'#64748b' }}>Fee: <strong style={{ color:'#0f172a' }}>₹{(cls.feeAmount||0).toLocaleString()}/year</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      {view==='table' && (
        <div className="card">
          <div style={{ overflowX:'auto' }}>
            <table>
              <thead><tr><th>#</th><th>Class</th><th>Sec</th><th>Stream</th><th>Class Teacher</th><th>Room</th><th>Students</th><th>Capacity</th><th>Occupancy</th><th>Fee/Year</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((cls,i)=>{
                  const teacher = teachers.find(t=>t._id===cls.classTeacherId);
                  const pct     = Math.round(cls.studentCount/cls.capacity*100);
                  const barC    = pct>=100?'#dc2626':pct>=80?'#d97706':'#16a34a';
                  const [bg,color] = STREAM_COLOR[cls.stream]||STREAM_COLOR['None'];
                  return (
                    <tr key={cls._id}>
                      <td style={{ color:'#94a3b8',fontSize:12 }}>{i+1}</td>
                      <td style={{ fontWeight:800 }}>Class {cls.grade}</td>
                      <td><span style={{ fontWeight:700,fontSize:13,background:'#dbeafe',color:'#1d4ed8',padding:'2px 10px',borderRadius:12 }}>{cls.section}</span></td>
                      <td>{cls.stream!=='None'&&<span style={{ fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:12,background:bg,color }}>{cls.stream}</span>}</td>
                      <td>{teacher?<div><div style={{ fontWeight:600,fontSize:13 }}>{teacher.name}</div><div style={{ fontSize:11,color:'#94a3b8' }}>{teacher.subject}</div></div>:<span style={{ fontSize:11,color:'#d97706' }}>Not assigned</span>}</td>
                      <td>{cls.room||'—'}</td>
                      <td style={{ fontWeight:700,color:'#3b82f6',textAlign:'center' }}>{cls.studentCount}</td>
                      <td style={{ textAlign:'center' }}>{cls.capacity}</td>
                      <td style={{ minWidth:110 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                          <div style={{ flex:1,height:6,background:'#f1f5f9',borderRadius:3,overflow:'hidden' }}>
                            <div style={{ width:Math.min(pct,100)+'%',height:'100%',background:barC,borderRadius:3 }}/>
                          </div>
                          <span style={{ fontSize:11,fontWeight:700,color:barC,width:34 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ fontWeight:600 }}>₹{(cls.feeAmount||0).toLocaleString()}</td>
                      <td>
                        <div style={{ display:'flex',gap:5 }}>
                          <button onClick={()=>openEdit(cls)} style={{ padding:5,borderRadius:6,border:'1px solid #bfdbfe',background:'#eff6ff',cursor:'pointer',color:'#3b82f6',display:'flex' }}><Edit size={12}/></button>
                          <button onClick={()=>handleDelete(cls._id)} style={{ padding:5,borderRadius:6,border:'1px solid #fecaca',background:'#fff5f5',cursor:'pointer',color:'#ef4444',display:'flex' }}><Trash2 size={12}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
          <div style={{ background:'#fff',borderRadius:18,maxWidth:500,width:'100%',maxHeight:'90vh',overflowY:'auto' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderBottom:'1px solid #f1f5f9',position:'sticky',top:0,background:'#fff',zIndex:5 }}>
              <div style={{ fontWeight:800,fontSize:15 }}>{editing?'Edit Class':'Add New Class'}</div>
              <button onClick={()=>setShowModal(false)} style={{ padding:7,borderRadius:8,border:'none',background:'#f1f5f9',cursor:'pointer' }}><X size={14}/></button>
            </div>
            <form onSubmit={handleSave} style={{ padding:20,display:'flex',flexDirection:'column',gap:14 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12 }}>
                <div><label className="label">Grade *</label><input required className="input-field" placeholder="e.g. 10" {...inp('grade')}/></div>
                <Sel label="Section *" required value={form.section} onChange={e=>setForm(p=>({...p,section:e.target.value}))}>
                  {SECTIONS.map(s=><option key={s}>{s}</option>)}
                </Sel>
                <Sel label="Stream" value={form.stream} onChange={e=>setForm(p=>({...p,stream:e.target.value}))}>
                  {STREAMS.map(s=><option key={s}>{s}</option>)}
                </Sel>
              </div>
              <Sel label="Class Teacher" value={form.classTeacherId} onChange={e=>setForm(p=>({...p,classTeacherId:e.target.value}))}>
                <option value="">Select Teacher</option>
                {teachers.map(t=><option key={t._id} value={t._id}>{t.name} — {t.subject}</option>)}
              </Sel>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12 }}>
                <div><label className="label">Room No.</label><input className="input-field" placeholder="101" {...inp('room')}/></div>
                <div><label className="label">Capacity</label><input type="number" className="input-field" placeholder="40" {...inp('capacity')}/></div>
                <div><label className="label">Fee/Year (₹)</label><input type="number" className="input-field" placeholder="15000" {...inp('feeAmount')}/></div>
              </div>
              <div style={{ display:'flex',justifyContent:'flex-end',gap:10,paddingTop:8,borderTop:'1px solid #f1f5f9' }}>
                <button type="button" onClick={()=>setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving?<><Loader size={13} className="animate-spin"/> Saving...</>:editing?'Update Class':'Add Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// TIMETABLE TAB
// ══════════════════════════════════════════════════════════
function TimetableTab({ classes, teachers }) {
  const [timetables, setTimetables] = useState(INIT_TT);
  const [selClass,   setSelClass]   = useState('c1');
  const [showModal,  setShowModal]  = useState(false);
  const [editCell,   setEditCell]   = useState(null);
  const [cellForm,   setCellForm]   = useState(INIT_CELL);
  const [saving,     setSaving]     = useState(false);

  const tt  = timetables[selClass] || {};
  const cls = classes.find(c => c._id === selClass);

  const openEdit = (day, period) => {
    if (period.isBreak) return;
    const ex = tt[day]?.[period.no];
    setEditCell({ day, periodNo:period.no, periodLabel:period.label, time:period.time });
    setCellForm({ subject: ex?.subject||'', teacherId: ex?.teacherId||'' });
    setShowModal(true);
  };

  const handleSave = e => {
    e.preventDefault(); setSaving(true);
    setTimeout(() => {
      setTimetables(prev => ({
        ...prev,
        [selClass]: {
          ...prev[selClass],
          [editCell.day]: {
            ...prev[selClass]?.[editCell.day],
            [editCell.periodNo]: cellForm.subject ? { subject:cellForm.subject, teacherId:cellForm.teacherId } : null,
          }
        }
      }));
      toast.success('Period updated!');
      setShowModal(false); setSaving(false);
    }, 300);
  };

  const clearCell = (day, periodNo, e) => {
    e.stopPropagation();
    setTimetables(prev => ({
      ...prev,
      [selClass]: { ...prev[selClass], [day]: { ...prev[selClass]?.[day], [periodNo]: null } }
    }));
    toast.success('Period cleared');
  };

  const handleExport = () => {
    let csv = 'Period,Time,' + DAYS.join(',') + '\n';
    PERIODS.forEach(p => {
      if (p.isBreak) { csv += p.label + ',' + p.time + ',' + DAYS.map(()=>p.label).join(',') + '\n'; return; }
      const row = DAYS.map(day => tt[day]?.[p.no]?.subject || '');
      csv += p.label + ',' + p.time + ',' + row.join(',') + '\n';
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download = 'timetable.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success('Exported!');
  };

  const subjectHours = {};
  DAYS.forEach(day => {
    PERIODS.forEach(p => {
      if (!p.isBreak) {
        const cell = tt[day]?.[p.no];
        if (cell?.subject) subjectHours[cell.subject] = (subjectHours[cell.subject]||0)+1;
      }
    });
  });

  return (
    <div className="space-y-4">
      {/* Class selector */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontWeight:700, fontSize:13, color:'#475569' }}>Class:</span>
          {classes.map(c => (
            <button key={c._id} onClick={()=>setSelClass(c._id)}
              style={{ padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer',
                border:    selClass===c._id?'none':'1px solid #e2e8f0',
                background:selClass===c._id?'#3b82f6':'#f8fafc',
                color:     selClass===c._id?'#fff':'#475569' }}>
              {c.grade}-{c.section}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={handleExport} className="btn-secondary"><Download size={13}/> Export</button>
          <button onClick={()=>window.print()} className="btn-secondary"><Printer size={13}/> Print</button>
        </div>
      </div>

      {/* Timetable grid */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontWeight:800, fontSize:14 }}>
            📅 Class {cls?.grade} – {cls?.section} &nbsp;·&nbsp; Weekly Timetable
          </div>
          <span style={{ fontSize:11, color:'#94a3b8' }}>Click any cell to edit</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:780 }}>
            <thead>
              <tr>
                <th style={{ padding:'10px 12px', background:'#f8fafc', fontWeight:700, fontSize:11, color:'#64748b', textAlign:'left', width:110, borderBottom:'2px solid #e2e8f0' }}>Period / Time</th>
                {DAYS.map(day => (
                  <th key={day} style={{ padding:'10px 8px', background:'#f8fafc', fontWeight:700, fontSize:11, color:'#64748b', textAlign:'center', borderBottom:'2px solid #e2e8f0', borderLeft:'1px solid #f1f5f9' }}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period.no} style={{ background:period.isBreak?'#fafafa':'transparent' }}>
                  <td style={{ padding:'8px 12px', borderBottom:'1px solid #f1f5f9', verticalAlign:'middle' }}>
                    <div style={{ fontWeight:700, fontSize:12, color:period.isBreak?'#94a3b8':'#0f172a' }}>{period.label}</div>
                    <div style={{ fontSize:10, color:'#94a3b8' }}>{period.time}</div>
                  </td>
                  {DAYS.map(day => {
                    if (period.isBreak) return (
                      <td key={day} style={{ padding:8, borderBottom:'1px solid #f1f5f9', borderLeft:'1px solid #f1f5f9', textAlign:'center' }}>
                        <span style={{ fontSize:11, color:'#94a3b8', fontStyle:'italic' }}>{period.label==='Break'?'☕ Break':'🍱 Lunch'}</span>
                      </td>
                    );
                    const cell    = tt[day]?.[period.no];
                    const teacher = cell ? teachers.find(t=>t._id===cell.teacherId) : null;
                    const [bg,color] = cell ? getSubColor(cell.subject) : ['transparent','#e2e8f0'];
                    return (
                      <td key={day}
                        onClick={()=>openEdit(day,period)}
                        style={{ padding:5, borderBottom:'1px solid #f1f5f9', borderLeft:'1px solid #f1f5f9', cursor:'pointer', verticalAlign:'middle' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#f0f9ff'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        {cell ? (
                          <div style={{ background:bg, borderRadius:8, padding:'5px 7px', position:'relative' }}>
                            <div style={{ fontWeight:700, fontSize:11, color, marginBottom:1 }}>{cell.subject}</div>
                            {teacher && <div style={{ fontSize:10, color, opacity:.75 }}>👤 {teacher.name.split(' ').slice(-1)[0]}</div>}
                            <button onClick={e=>clearCell(day,period.no,e)}
                              style={{ position:'absolute', top:2, right:2, border:'none', background:'transparent', cursor:'pointer', color, opacity:.5, fontSize:12, lineHeight:1, padding:0 }}>×</button>
                          </div>
                        ) : (
                          <div style={{ textAlign:'center', fontSize:18, color:'#e2e8f0' }}>+</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject hours summary */}
      <div className="card" style={{ padding:14 }}>
        <div style={{ fontWeight:800, fontSize:13, marginBottom:10 }}>📊 Periods Per Week</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
          {Object.entries(subjectHours).sort((a,b)=>b[1]-a[1]).map(([sub,hrs])=>{
            const [bg,color] = getSubColor(sub);
            return (
              <div key={sub} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:20, background:bg }}>
                <span style={{ fontWeight:700, fontSize:11, color }}>{sub}</span>
                <span style={{ fontSize:11, color, opacity:.8 }}>{hrs}p</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit modal */}
      {showModal && editCell && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
          <div style={{ background:'#fff',borderRadius:18,maxWidth:400,width:'100%' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderBottom:'1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight:800,fontSize:15 }}>Edit Period</div>
                <div style={{ fontSize:12,color:'#64748b',marginTop:2 }}>{editCell.day} · {editCell.periodLabel} · {editCell.time}</div>
              </div>
              <button onClick={()=>setShowModal(false)} style={{ padding:7,borderRadius:8,border:'none',background:'#f1f5f9',cursor:'pointer' }}><X size={14}/></button>
            </div>
            <form onSubmit={handleSave} style={{ padding:20,display:'flex',flexDirection:'column',gap:14 }}>
              <SmSel label="Subject" value={cellForm.subject} onChange={e=>setCellForm(p=>({...p,subject:e.target.value}))}>
                <option value="">— Free Period —</option>
                {SUBJECTS.map(s=><option key={s}>{s}</option>)}
              </SmSel>
              <SmSel label="Teacher" value={cellForm.teacherId} onChange={e=>setCellForm(p=>({...p,teacherId:e.target.value}))}>
                <option value="">Select Teacher</option>
                {teachers.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}
              </SmSel>
              {cellForm.subject && (
                <div style={{ padding:'8px 12px', borderRadius:8, background:getSubColor(cellForm.subject)[0] }}>
                  <span style={{ fontSize:12, fontWeight:700, color:getSubColor(cellForm.subject)[1] }}>Preview: {cellForm.subject}</span>
                </div>
              )}
              <div style={{ display:'flex',justifyContent:'flex-end',gap:10,paddingTop:8,borderTop:'1px solid #f1f5f9' }}>
                <button type="button" onClick={()=>setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving?<><Loader size={13} className="animate-spin"/> Saving...</>:'Save Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN EXPORT — Classes + Timetable in one page
// ══════════════════════════════════════════════════════════
export default function Classes() {
  const [tab,      setTab]      = useState('classes');
  const [classes,  setClasses]  = useState(DEMO_CLASSES);
  const [teachers]              = useState(DEMO_TEACHERS);

  const TABS = [
    { id:'classes',   label:'Classes',   icon:GraduationCap },
    { id:'timetable', label:'Timetable', icon:Clock         },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Classes & Timetable</h1>
        <p className="text-gray-500 text-sm">Manage classes, assign teachers and set weekly timetable</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'2px solid #f1f5f9' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 24px',
              border:'none', cursor:'pointer', fontSize:13, fontWeight:600, background:'transparent',
              color:        tab===t.id?'#1e40af':'#64748b',
              borderBottom: tab===t.id?'2px solid #3b82f6':'2px solid transparent',
              marginBottom: '-2px' }}>
            <t.icon size={15}/> {t.label}
          </button>
        ))}
      </div>

      {tab === 'classes'   && <ClassesTab   classes={classes} setClasses={setClasses} teachers={teachers} />}
      {tab === 'timetable' && <TimetableTab classes={classes} teachers={teachers} />}
    </div>
  );
}
