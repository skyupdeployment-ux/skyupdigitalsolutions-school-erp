import { useState } from 'react';
import {
  Search, ChevronDown, Shield, User,
  Plus, Edit, Trash2, Eye, Download,
  Clock, Filter, RefreshCw, AlertCircle,
  LogIn, LogOut, FileText
} from 'lucide-react';

// ── Action config ─────────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  CREATE:  { color:'#16a34a', bg:'#dcfce7', icon: Plus,     label:'Created' },
  UPDATE:  { color:'#1d4ed8', bg:'#dbeafe', icon: Edit,     label:'Updated' },
  DELETE:  { color:'#dc2626', bg:'#fee2e2', icon: Trash2,   label:'Deleted' },
  VIEW:    { color:'#7c3aed', bg:'#f3e8ff', icon: Eye,      label:'Viewed'  },
  LOGIN:   { color:'#0284c7', bg:'#e0f2fe', icon: LogIn,    label:'Logged in'},
  LOGOUT:  { color:'#64748b', bg:'#f1f5f9', icon: LogOut,   label:'Logged out'},
  EXPORT:  { color:'#d97706', bg:'#fef3c7', icon: Download, label:'Exported'},
};

const MODULE_CONFIG = {
  Students:    { color:'#3b82f6' },
  Fees:        { color:'#16a34a' },
  Attendance:  { color:'#8b5cf6' },
  Examinations:{ color:'#f59e0b' },
  Library:     { color:'#06b6d4' },
  Transport:   { color:'#ef4444' },
  Users:       { color:'#ec4899' },
  Reports:     { color:'#64748b' },
  Settings:    { color:'#94a3b8' },
  Auth:        { color:'#0284c7' },
};

// ── Demo audit logs ───────────────────────────────────────────────────────────
const DEMO_LOGS = [
  { _id:'l01', user:'School Admin',    role:'school_admin', action:'LOGIN',  module:'Auth',        description:'Logged in successfully',                      ipAddress:'192.168.1.10', createdAt:'2026-09-21T08:30:00' },
  { _id:'l02', user:'School Admin',    role:'school_admin', action:'CREATE', module:'Students',    description:'Added new student: Arjun Sharma (ADM001)',     ipAddress:'192.168.1.10', createdAt:'2026-09-21T08:45:00' },
  { _id:'l03', user:'Ravi Kumar',      role:'teacher',      action:'LOGIN',  module:'Auth',        description:'Logged in successfully',                      ipAddress:'192.168.1.15', createdAt:'2026-09-21T07:45:00' },
  { _id:'l04', user:'Ravi Kumar',      role:'teacher',      action:'UPDATE', module:'Attendance',  description:'Marked attendance for Class 10-A (42 students)',ipAddress:'192.168.1.15', createdAt:'2026-09-21T09:10:00' },
  { _id:'l05', user:'Priya Accounts',  role:'accountant',   action:'CREATE', module:'Fees',        description:'Collected fee ₹12,000 from Rahul Kumar',      ipAddress:'192.168.1.20', createdAt:'2026-09-21T10:15:00' },
  { _id:'l06', user:'School Admin',    role:'school_admin', action:'DELETE', module:'Students',    description:'Deleted student record: Sidda Mada (023)',     ipAddress:'192.168.1.10', createdAt:'2026-09-21T11:00:00' },
  { _id:'l07', user:'Suresh Librarian',role:'librarian',    action:'UPDATE', module:'Library',     description:'Issued book "Wings of Fire" to Arjun Sharma',  ipAddress:'192.168.1.25', createdAt:'2026-09-21T11:30:00' },
  { _id:'l08', user:'School Admin',    role:'school_admin', action:'EXPORT', module:'Reports',     description:'Exported Fee Collection Report (Sep 2026)',    ipAddress:'192.168.1.10', createdAt:'2026-09-21T12:00:00' },
  { _id:'l09', user:'Ravi Kumar',      role:'teacher',      action:'CREATE', module:'Examinations',description:'Created exam group: Mid Term 2025 – Class 10A',ipAddress:'192.168.1.15', createdAt:'2026-09-21T12:30:00' },
  { _id:'l10', user:'Priya Accounts',  role:'accountant',   action:'UPDATE', module:'Fees',        description:'Updated fee structure for Class 10 (2025-26)', ipAddress:'192.168.1.20', createdAt:'2026-09-21T13:00:00' },
  { _id:'l11', user:'Mahesh Transport',role:'transport_manager',action:'UPDATE',module:'Transport', description:'Updated route 02 – Bengaluru South schedule',  ipAddress:'192.168.1.30', createdAt:'2026-09-20T09:00:00' },
  { _id:'l12', user:'School Admin',    role:'school_admin', action:'CREATE', module:'Users',       description:'Created new user account: Anjali Singh (Teacher)',ipAddress:'192.168.1.10', createdAt:'2026-09-20T10:00:00' },
  { _id:'l13', user:'Ravi Kumar',      role:'teacher',      action:'VIEW',   module:'Students',    description:'Viewed student profile: Priya Patel (ADM002)', ipAddress:'192.168.1.15', createdAt:'2026-09-20T11:15:00' },
  { _id:'l14', user:'School Admin',    role:'school_admin', action:'UPDATE', module:'Settings',    description:'Updated school information and contact details', ipAddress:'192.168.1.10', createdAt:'2026-09-20T14:00:00' },
  { _id:'l15', user:'Suresh Librarian',role:'librarian',    action:'UPDATE', module:'Library',     description:'Marked "Wings of Fire" returned by Rahul Kumar', ipAddress:'192.168.1.25', createdAt:'2026-09-19T10:00:00' },
  { _id:'l16', user:'School Admin',    role:'school_admin', action:'DELETE', module:'Transport',   description:'Deleted vehicle record: KA-03-J-3456',         ipAddress:'192.168.1.10', createdAt:'2026-09-19T15:00:00' },
  { _id:'l17', user:'Priya Accounts',  role:'accountant',   action:'EXPORT', module:'Reports',     description:'Exported Student Fee Defaulters Report',       ipAddress:'192.168.1.20', createdAt:'2026-09-18T11:00:00' },
  { _id:'l18', user:'Anjali Singh',    role:'teacher',      action:'LOGIN',  module:'Auth',        description:'First login after account creation',           ipAddress:'192.168.1.40', createdAt:'2026-09-18T09:30:00' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function ActionBadge({ action }) {
  const cfg = ACTION_CONFIG[action] || ACTION_CONFIG.VIEW;
  const Icon = cfg.icon;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4,
      fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20,
      background:cfg.bg, color:cfg.color }}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

function ModuleBadge({ module: mod }) {
  const cfg = MODULE_CONFIG[mod] || { color:'#64748b' };
  return (
    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:12,
      background:`${cfg.color}15`, color:cfg.color }}>
      {mod}
    </span>
  );
}

function RolePill({ role }) {
  const map = {
    school_admin:'#1d4ed8', super_admin:'#7c3aed', teacher:'#0284c7',
    accountant:'#16a34a', librarian:'#06b6d4', transport_manager:'#d97706', parent:'#64748b',
  };
  const c = map[role] || '#64748b';
  const label = role.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase());
  return (
    <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:10,
      background:`${c}15`, color:c }}>{label}</span>
  );
}

// ── Main AuditLogs page ───────────────────────────────────────────────────────
export default function AuditLogs() {
  const [search, setSearch]         = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [userFilter, setUserFilter]   = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [page, setPage]               = useState(1);
  const PER_PAGE = 10;

  const filtered = DEMO_LOGS.filter(l => {
    const q = search.toLowerCase();
    const matchDate = (!dateFrom || new Date(l.createdAt)>=new Date(dateFrom))
                   && (!dateTo   || new Date(l.createdAt)<=new Date(dateTo+'T23:59:59'));
    return (!q || l.user.toLowerCase().includes(q) || l.description.toLowerCase().includes(q))
      && (!actionFilter || l.action===actionFilter)
      && (!moduleFilter || l.module===moduleFilter)
      && (!userFilter   || l.user===userFilter)
      && matchDate;
  });

  const totalPages  = Math.ceil(filtered.length / PER_PAGE);
  const paginated   = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const uniqueUsers = [...new Set(DEMO_LOGS.map(l=>l.user))];
  const modules     = [...new Set(DEMO_LOGS.map(l=>l.module))];

  // Stats
  const today = new Date().toISOString().split('T')[0];
  const todayLogs    = DEMO_LOGS.filter(l=>l.createdAt.startsWith(today));
  const deleteLogs   = DEMO_LOGS.filter(l=>l.action==='DELETE');
  const loginLogs    = DEMO_LOGS.filter(l=>l.action==='LOGIN');

  const handleExport = () => {
    const csv = 'Time,User,Role,Action,Module,Description,IP\n'
      + filtered.map(l=>`"${l.createdAt}","${l.user}","${l.role}","${l.action}","${l.module}","${l.description}","${l.ipAddress}"`).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download='audit_logs.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch(''); setActionFilter(''); setModuleFilter('');
    setUserFilter(''); setDateFrom(''); setDateTo(''); setPage(1);
  };

  const hasFilters = search||actionFilter||moduleFilter||userFilter||dateFrom||dateTo;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 text-sm">Complete history of all actions in the system</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={handleExport} className="btn-secondary"><Download size={14}/> Export CSV</button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14 }}>
        {[
          { label:'Total Logs',    value:DEMO_LOGS.length,   color:'#3b82f6', icon:FileText      },
          { label:"Today's Actions",value:todayLogs.length,  color:'#8b5cf6', icon:Clock         },
          { label:'Deletions',     value:deleteLogs.length,  color:'#ef4444', icon:Trash2        },
          { label:'Logins Today',  value:loginLogs.length,   color:'#16a34a', icon:LogIn         },
        ].map(k => (
          <div key={k.label} className="card"
            style={{ padding:'14px 16px', display:'flex', gap:10, alignItems:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:k.color, borderRadius:'12px 12px 0 0' }} />
            <div style={{ background:`${k.color}18`, borderRadius:9, padding:9, flexShrink:0 }}>
              <k.icon size={17} color={k.color} />
            </div>
            <div>
              <div style={{ fontSize:10, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:.4 }}>{k.label}</div>
              <div style={{ fontSize:20, fontWeight:800, color:'#0f172a' }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete activity warning */}
      {deleteLogs.length > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'#fff7ed',
          border:'1px solid #fed7aa', borderRadius:10, padding:'10px 14px' }}>
          <AlertCircle size={15} color="#d97706" />
          <span style={{ fontSize:13, color:'#92400e', fontWeight:600 }}>
            {deleteLogs.length} deletion{deleteLogs.length>1?'s':''} recorded — review carefully
          </span>
          <button onClick={()=>setActionFilter('DELETE')}
            style={{ marginLeft:'auto', fontSize:11, color:'#d97706', background:'none', border:'1px solid #d97706',
              borderRadius:7, padding:'3px 10px', cursor:'pointer', fontWeight:600 }}>
            Show only deletions
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end' }}>
        <div style={{ position:'relative', flex:1, minWidth:180 }}>
          <Search size={13} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
          <input className="input-field" placeholder="Search user, action, description..."
            style={{ paddingLeft:28 }} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
        </div>
        {[
          { val:actionFilter, set:setActionFilter, placeholder:'All Actions',
            opts: Object.keys(ACTION_CONFIG).map(k=>({ value:k, label:ACTION_CONFIG[k].label })) },
          { val:moduleFilter, set:setModuleFilter, placeholder:'All Modules',
            opts: modules.map(m=>({ value:m, label:m })) },
          { val:userFilter,   set:setUserFilter,   placeholder:'All Users',
            opts: uniqueUsers.map(u=>({ value:u, label:u })) },
        ].map((f,i) => (
          <div key={i} style={{ position:'relative', minWidth:140 }}>
            <select className="input-field" style={{ appearance:'none', paddingRight:24 }}
              value={f.val} onChange={e=>{f.set(e.target.value);setPage(1);}}>
              <option value="">{f.placeholder}</option>
              {f.opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={12} style={{ position:'absolute', right:7, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }} />
          </div>
        ))}
        <div style={{ display:'flex', gap:6 }}>
          <input type="date" className="input-field" style={{ width:140 }} value={dateFrom}
            onChange={e=>{setDateFrom(e.target.value);setPage(1);}} title="From date" />
          <input type="date" className="input-field" style={{ width:140 }} value={dateTo}
            onChange={e=>{setDateTo(e.target.value);setPage(1);}} title="To date" />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="btn-secondary" style={{ fontSize:12 }}>
            <RefreshCw size={12}/> Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, color:'#64748b' }}>
          Showing <strong>{filtered.length}</strong> log{filtered.length!==1?'s':''}{hasFilters?' (filtered)':''}
        </span>
        <span style={{ fontSize:12, color:'#94a3b8' }}>Page {page} of {totalPages||1}</span>
      </div>

      {/* Logs table */}
      <div className="card">
        <div style={{ overflowX:'auto' }}>
          <table>
            <thead>
              <tr><th>Time</th><th>User</th><th>Action</th><th>Module</th><th>Description</th><th>IP Address</th></tr>
            </thead>
            <tbody>
              {paginated.map(l => (
                <tr key={l._id} style={{
                  background: l.action==='DELETE'?'#fff5f5':l.action==='LOGIN'?'#f0fdf4':'transparent'
                }}>
                  <td style={{ whiteSpace:'nowrap' }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#0f172a' }}>
                      {new Date(l.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                    </div>
                    <div style={{ fontSize:10, color:'#94a3b8', display:'flex', alignItems:'center', gap:3 }}>
                      <Clock size={9} />
                      {new Date(l.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight:600, color:'#0f172a', fontSize:13 }}>{l.user}</div>
                    <div style={{ marginTop:3 }}><RolePill role={l.role} /></div>
                  </td>
                  <td><ActionBadge action={l.action} /></td>
                  <td><ModuleBadge module={l.module} /></td>
                  <td style={{ fontSize:12, color:'#475569', maxWidth:280 }}>
                    <span style={{
                      overflow:'hidden', display:'-webkit-box',
                      WebkitLineClamp:2, WebkitBoxOrient:'vertical', lineHeight:1.5
                    }}>{l.description}</span>
                  </td>
                  <td>
                    <span style={{ fontSize:11, fontFamily:'monospace', color:'#64748b',
                      background:'#f8fafc', padding:'2px 6px', borderRadius:5 }}>
                      {l.ipAddress}
                    </span>
                  </td>
                </tr>
              ))}
              {paginated.length===0 && (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:48, color:'#94a3b8' }}>
                  <Shield size={32} style={{ margin:'0 auto 10px', opacity:.3 }} />
                  <div style={{ fontWeight:600 }}>No logs found</div>
                  {hasFilters && <div style={{ fontSize:12, marginTop:4 }}>Try clearing the filters</div>}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'12px 16px', borderTop:'1px solid #f1f5f9' }}>
            <span style={{ fontSize:13, color:'#64748b' }}>
              {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,filtered.length)} of {filtered.length}
            </span>
            <div style={{ display:'flex', gap:4 }}>
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="btn-secondary"
                style={{ padding:'6px 12px', fontSize:12, opacity:page===1?.4:1 }}>← Prev</button>
              {Array.from({length:totalPages},(_, i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  style={{ padding:'6px 10px', borderRadius:7, border:'none', cursor:'pointer', fontSize:12,
                    fontWeight: p===page?700:400,
                    background: p===page?'#3b82f6':'#f1f5f9',
                    color:       p===page?'#fff':'#475569' }}>
                  {p}
                </button>
              ))}
              <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="btn-secondary"
                style={{ padding:'6px 12px', fontSize:12, opacity:page===totalPages?.4:1 }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Read-only notice */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px',
        background:'#f8fafc', borderRadius:9, border:'1px solid #e2e8f0' }}>
        <Shield size={14} color="#94a3b8" />
        <span style={{ fontSize:12, color:'#94a3b8' }}>
          Audit logs are read-only and cannot be edited or deleted. They are permanently stored for accountability.
        </span>
      </div>
    </div>
  );
}