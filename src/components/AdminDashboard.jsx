import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadData, saveData } from '../services/StorageService';
import { 
  ShieldCheck, Trash2, Users, Activity, LogOut, LayoutDashboard, 
  Settings as SettingsIcon, Megaphone, Lock, Unlock, RotateCcw, 
  AlertTriangle, Search, CheckCircle, XCircle, Database, DownloadCloud, UploadCloud 
} from 'lucide-react';
import CryptoJS from 'crypto-js';
import { 
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

export default function AdminDashboard({ usersDB, setUsersDB, onLogout, allTransactions = [] }) {
  // Tabs: 'dashboard', 'users', 'system', 'logs'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // System Data States
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [systemCategories, setSystemCategories] = useState([]);
  const [newCat, setNewCat] = useState('');

  useEffect(() => {
    setLogs(loadData('audit_logs', []));
    setBroadcastMsg(loadData('system_broadcast', ''));
    setSystemCategories(loadData('system_categories', ['Ăn uống', 'Di chuyển', 'Mua sắm', 'Sinh hoạt', 'Lương/Thưởng', 'Đầu tư']));
  }, []);

  const saveBroadcast = () => {
    saveData('system_broadcast', broadcastMsg);
    alert('Khởi tạo thông báo toàn hệ thống thành công!');
  };

  const handleAddCat = () => {
    if(!newCat.trim()) return;
    const newDb = [...systemCategories, newCat.trim()];
    setSystemCategories(newDb);
    saveData('system_categories', newDb);
    setNewCat('');
  };
  
  const handleDelCat = (cat) => {
    const newDb = systemCategories.filter(c => c !== cat);
    setSystemCategories(newDb);
    saveData('system_categories', newDb);
  };

  // ---------------- ACTION HANDLERS ---------------- //

  const handleClearLogs = () => {
    if(window.confirm('Xác nhận: Xóa toàn bộ Nhật ký Kiểm toán (Audit Logs)? Hành động này không thể hoàn tác.')) {
       saveData('audit_logs', []);
       setLogs([]);
    }
  };

  const handleLocalBackup = () => {
    try {
      const backupData = {
        users: usersDB,
        systemCategories,
        auditLogs: logs,
        timestamp: new Date().toISOString()
      };
      const json = JSON.stringify(backupData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SET_Backup_${new Date().getTime()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      const newLogs = [{ timestamp: new Date().toISOString(), user: 'adminwed@gmail.com', action: 'BACKUP_DB', details: 'Xuất dữ liệu toàn hệ thống' }, ...logs].slice(0, 100);
      setLogs(newLogs);
      saveData('audit_logs', newLogs);
      alert('Tải xuống bản sao lưu CSDL thành công!');
    } catch (err) {
      alert('Lỗi xuất dữ liệu: ' + err.message);
    }
  };

  const handleLocalRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.users && data.systemCategories) {
           if(window.confirm('CẢNH BÁO: Dữ liệu hiện tại sẽ bị GHI ĐÈ hoàn toàn bởi file Backup. Tiếp tục?')) {
               saveData('usersDB', data.users);
               saveData('system_categories', data.systemCategories);
               if(data.auditLogs) saveData('audit_logs', data.auditLogs);
               alert('Khôi phục thành công! Hệ thống sẽ tải lại.');
               window.location.reload();
           }
        } else alert('File Backup không hợp lệ!');
      } catch (err) {
        alert('Lỗi đọc file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Toggle IsDeleted (Soft Delete)
  const handleToggleDelete = (email, currentState) => {
    if (email === 'adminwed@gmail.com') return alert('Lỗi truy cập: Không thể vô hiệu hóa tài khoản Quản trị cấp cao.');
    const action = currentState ? 'KHÔI PHỤC HOẠT ĐỘNG' : 'VÔ HIỆU HÓA TÀI KHOẢN';
    if (window.confirm(`XÁC NHẬN: Bắt đầu tiến trình ${action} đối với email: ${email}?`)) {
        const newDB = usersDB.map(u => u.email === email ? { ...u, isDeleted: !currentState } : u);
        setUsersDB(newDB);
    }
  };

  // Toggle IsLocked (Khóa)
  const handleToggleLock = (email, currentState) => {
    if (email === 'adminwed@gmail.com') return alert('Lỗi truy cập: Không thể khóa định danh Quản trị cấp cao.');
    const action = currentState ? 'MỞ KHÓA TRUY CẬP' : 'TẠM KHÓA TRUY CẬP';
    if (window.confirm(`XÁC NHẬN: Bắt đầu tiến trình ${action} đối với email: ${email}?`)) {
        const newDB = usersDB.map(u => u.email === email ? { ...u, isLocked: !currentState } : u);
        setUsersDB(newDB);
    }
  };

  // Toggle Warning (Cảnh báo mờ ám)
  const handleToggleWarn = (email, currentState) => {
    if (email === 'adminwed@gmail.com') return alert('Lỗi hệ thống: Tham số không hợp lệ.');
    const actionName = currentState ? 'GỠ CẢNH CÁO VI PHẠM' : 'ÁP DỤNG CẢNH CÁO TÀI KHOẢN';
    if (window.confirm(`XÁC NHẬN: ${actionName} đối với email: ${email}?`)) {
        const newDB = usersDB.map(u => u.email === email ? { ...u, isWarned: !currentState } : u);
        setUsersDB(newDB);
    }
  };

  // Reset Password khẩn cấp
  const handleResetPassword = (email) => {
    if (email === 'adminwed@gmail.com') return alert('Lỗi thao tác: Không thể đặt lại mật khẩu Quản trị nguyên thủy qua giao diện này.');
    if (window.confirm(`QUYỀN QUẢN TRỊ 1.0: Đặt lại mật khẩu mặc định (123456) cho tài khoản: ${email}?`)) {
        const securePwd = CryptoJS.SHA256("123456").toString();
        const newDB = usersDB.map(u => u.email === email ? { ...u, password: securePwd } : u);
        setUsersDB(newDB);
        alert(`Thành công! Mật khẩu cho tài khoản ${email} đã trở về thiết lập mặc định: 123456`);
    }
  };

  // ---------------- ANALYTICS DATA ---------------- //
  
  const getUserStats = (email) => {
     const txs = allTransactions.filter(t => t.owner === email);
     const totalAmount = txs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
     const hasIrregular = txs.some(t => Math.abs(t.amount) > 100000000); 
     return { txCount: txs.length, totalAmount, hasIrregular };
  };

  const totalUsers = usersDB.length;
  const activeUsers = usersDB.filter(u => (!u.isDeleted && !u.isLocked)).length;
  const lockedUsers = usersDB.filter(u => (u.isLocked || u.isWarned) && !u.isDeleted).length;
  const deletedUsers = usersDB.filter(u => u.isDeleted).length;
  
  const totalMoneyFlow = allTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Growth Line Chart Data
  const usersByDate = usersDB.reduce((acc, u) => {
    const d = u.createdAt ? u.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10);
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const lineChartData = Object.keys(usersByDate).map(date => ({ date, Users: usersByDate[date] })).sort((a,b) => a.date.localeCompare(b.date));

  // Cumulative data for Line Chart
  let cumulativeCount = 0;
  const cumulativeData = lineChartData.map(item => {
    cumulativeCount += item.Users;
    return { date: item.date, 'Tổng Người Dùng': cumulativeCount };
  });

  // Pie Chart Data
  const pieData = [
     { name: 'Hoạt Động Bình Thường', value: activeUsers, color: '#10b981' }, 
     { name: 'Bị Khóa / Cảnh Cáo', value: lockedUsers, color: '#f59e0b' },
     { name: 'Đã Vô Hiệu Hóa', value: deletedUsers, color: '#ef4444' }
  ];

  const filteredUsers = usersDB.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
       
       {/* SIDEBAR */}
       <aside style={{ width: '260px', background: 'var(--surface-base)', borderRight: '1px solid var(--border-light)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
            <div style={{ background: 'var(--primary-bg)', padding: '10px', borderRadius: '12px' }}>
               <ShieldCheck size={28} color="var(--primary)" />
            </div>
            <div>
               <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '900', color: 'var(--primary)' }}>TRUNG TÂM</h2>
               <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>QUẢN LÝ HỆ THỐNG V2</span>
            </div>
          </div>

          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'} style={{ justifyContent: 'flex-start', border: activeTab !== 'dashboard' && 'none' }}>
             <LayoutDashboard size={18} /> Bảng Điều Khiển
          </button>
          <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'} style={{ justifyContent: 'flex-start', border: activeTab !== 'users' && 'none' }}>
             <Users size={18} /> Quản Trị Người Dùng
          </button>
          <button onClick={() => setActiveTab('system')} className={activeTab === 'system' ? 'btn-primary' : 'btn-secondary'} style={{ justifyContent: 'flex-start', border: activeTab !== 'system' && 'none' }}>
             <SettingsIcon size={18} /> Thiết Lập Cơ Sở
          </button>
          <button onClick={() => setActiveTab('logs')} className={activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'} style={{ justifyContent: 'flex-start', border: activeTab !== 'logs' && 'none' }}>
             <Activity size={18} /> Kiểm Toán Sự Kiện
          </button>
          
          <button onClick={onLogout} className="btn-secondary" style={{ marginTop: 'auto', color: 'var(--danger)', background: 'var(--danger-bg)', border: '1px solid var(--danger)' }}>
             <LogOut size={18} /> Đăng Hiện Vị Trí
          </button>
       </aside>

       {/* MAIN CONTENT */}
       <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
          
          <AnimatePresence mode="wait">
             
             {/* DASHBOARD TAB */}
             {activeTab === 'dashboard' && (
               <motion.div key="dashboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: '32px' }}>
                     <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0 }}>Báo Cáo Hoạt Động Cốt Lõi</h1>
                     <span style={{ color: 'var(--text-muted)' }}>Đồng bộ hóa trực tuyến thời gian thực (Real-time Analytics)</span>
                  </div>
                  
                  {/* Premium Stats Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                     <div className="friendly-card" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontWeight: '700', fontSize: '13.5px', letterSpacing: '0.5px' }}>
                           <div style={{ background: 'var(--primary-bg)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                              <Users size={20} />
                           </div>
                           LƯU LƯỢNG NGƯỜI DÙNG
                        </div>
                        <span style={{ fontSize: '3.2rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1' }}>{totalUsers}</span>
                     </div>
                     <div className="friendly-card" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontWeight: '700', fontSize: '13.5px', letterSpacing: '0.5px' }}>
                           <div style={{ background: 'var(--success-bg)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
                              <Activity size={20} />
                           </div>
                           KHỐI LƯỢNG GIAO DỊCH
                        </div>
                        <span style={{ fontSize: '3.2rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1' }}>{allTransactions.length}</span>
                     </div>
                     <div className="friendly-card" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontWeight: '700', fontSize: '13.5px', letterSpacing: '0.5px' }}>
                           <div style={{ background: '#f3e8ff', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
                              <ShieldCheck size={20} />
                           </div>
                           TỔNG VỐN CHU CHUYỂN
                        </div>
                        <span style={{ fontSize: '3.2rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1' }}>{(totalMoneyFlow / 1000000).toFixed(1)}<span style={{fontSize: '1.5rem', marginLeft:'4px', color: 'var(--text-muted)'}}>Tr</span></span>
                     </div>
                  </div>

                  {/* Charts */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                     <div className="friendly-card">
                        <h3 style={{ marginBottom: '16px' }}>Thống Kê Khởi Tạo Thiết Bị Mới</h3>
                        <div style={{ height: '360px' }}>
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={cumulativeData} margin={{ bottom: 20 }}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                                 <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                 <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                 <Tooltip wrapperStyle={{ borderRadius: '12px' }} />
                                 <Line type="monotone" dataKey="Tổng Người Dùng" stroke="var(--primary)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                              </LineChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                     <div className="friendly-card">
                        <h3 style={{ marginBottom: '16px' }}>Phân Biệt Tình Trạng An Ninh</h3>
                        <div style={{ height: '360px' }}>
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart margin={{ bottom: 20 }}>
                                 <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                                   {pieData.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={entry.color} />
                                   ))}
                                 </Pie>
                                 <Tooltip wrapperStyle={{ borderRadius: '12px' }} />
                                 <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: "20px" }} />
                              </PieChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                  </div>
               </motion.div>
             )}

             {/* USERS MANAGEMENT TAB */}
             {activeTab === 'users' && (
               <motion.div key="users" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                     <div>
                       <h1 style={{ margin: 0 }}>Kiểm Soát Quyền Truy Cập</h1>
                       <span style={{ color: 'var(--text-muted)' }}>Công cụ Vô hiệu hóa, Cảnh cáo và Điều phối an ninh liên quan tới dữ liệu định danh.</span>
                     </div>
                     <div style={{ display: 'flex', gap: '12px', width: '320px' }}>
                        <div className="input-friendly" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--surface-opaque)' }}>
                           <Search size={16} color="var(--text-muted)" />
                           <input 
                             type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                             placeholder="Tra cứu Định danh / Tên / Email..."
                             style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '100%' }}
                           />
                        </div>
                     </div>
                  </div>

                  <div className="friendly-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'var(--primary-bg)' }}>
                        <tr>
                          <th style={{ padding: '20px 24px', color: 'var(--primary)', fontWeight: 'bold' }}>Thông Tin Người Dùng</th>
                          <th style={{ padding: '20px 24px', color: 'var(--primary)', fontWeight: 'bold' }}>Mã Trạng Thái Mạng</th>
                          <th style={{ padding: '20px 24px', color: 'var(--primary)', fontWeight: 'bold' }}>Mức Độ Giao Dịch</th>
                          <th style={{ padding: '20px 24px', color: 'var(--primary)', fontWeight: 'bold', textAlign: 'right' }}>Thi hành Lệnh Tác Nghiệp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, idx) => {
                          const stats = getUserStats(u.email);
                          return (
                          <tr key={idx} style={{ 
                             borderBottom: '1px solid var(--border-light)', 
                             background: u.isDeleted ? 'var(--surface-opaque)' : u.isLocked ? 'var(--warning-bg)' : u.isWarned ? 'var(--danger-bg)' : 'transparent',
                             opacity: u.isDeleted ? 0.6 : 1,
                             transition: 'all 0.2s'
                          }}>
                            {/* CỘT 1: AVATAR & INFO */}
                            <td style={{ padding: '20px 24px' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ position: 'relative' }}>
                                    <img src={`https://ui-avatars.com/api/?name=${u.name.replace(' ','+')}&background=${Math.floor(Math.random()*16777215).toString(16)}&color=fff&rounded=true`} alt="Avatar" width="44" height="44" style={{ borderRadius: '50%' }} />
                                    {stats.hasIrregular && !u.isDeleted && <div style={{ position: 'absolute', top: -2, right: -2, width: 14, height: 14, background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }}></div>}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                     <span style={{ fontWeight: '800', fontSize: '15px', color: u.isDeleted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: u.isDeleted ? 'line-through' : 'none' }}>{u.name}</span>
                                     <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.email}</span>
                                  </div>
                               </div>
                            </td>
                            {/* CỘT 2: TRẠNG THÁI */}
                            <td style={{ padding: '20px 24px' }}>
                               {u.role === 'admin' ? <span className="badge" style={{background: 'var(--primary)', color: 'white'}}>Quyền Quản Trị Hệ Thống</span> : 
                                u.isDeleted ? <span className="badge" style={{background: 'var(--text-muted)', color: 'white'}}>Quyền Truất Phế Vĩnh Sự</span> :
                                u.isLocked ? <span className="badge warning">Trong Trạng Thái Gián Đoạn</span> :
                                u.isWarned ? <span className="badge danger">Mức Độ Cảnh Cáo Nghiệp Vụ</span> :
                                <span className="badge success">Bình Thường Tại Trạm</span>}
                               <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Xác lập lúc: <b>{u.createdAt?.substring(0,10)}</b></div>
                               <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Hoạt động cuối: <b>{u.lastActive?.substring(0,10) || 'Dữ liệu không hoàn chỉnh'}</b></div>
                            </td>
                            {/* CỘT 3: STATS */}
                            <td style={{ padding: '20px 24px' }}>
                               <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.txCount} bản ghi phát sinh</span>
                               <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Dung lượng: <b>{stats.totalAmount.toLocaleString('vi-VN')} đ</b></div>
                               {stats.hasIrregular && !u.isDeleted && <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', fontWeight: 'bold' }}>⚠️ Tệp Cảnh Báo: Chứa lượt dao động tài chính trên 100Tr</div>}
                            </td>
                            {/* CỘT 4: ACTIONS */}
                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                               <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                 <button onClick={() => handleResetPassword(u.email)} disabled={u.role === 'admin' || u.isDeleted} className="btn-secondary" style={{ padding: '6px', width: '32px', height: '32px', borderColor: 'var(--border-light)', color: 'var(--primary)' }} title="Ghi Đè Chuỗi Khóa Bảo Mật Về Mặc Định">
                                    <RotateCcw size={14} />
                                 </button>
                                 <button onClick={() => handleToggleWarn(u.email, u.isWarned)} disabled={u.role === 'admin' || u.isDeleted} className="btn-secondary" style={{ padding: '6px', width: '32px', height: '32px', borderColor: 'var(--border-light)', color: u.isWarned ? 'var(--text-muted)' : 'var(--danger)' }} title={u.isWarned ? 'Hủy Bỏ Điều Hành Cảnh Cáo' : 'Đánh Thẻ Áp Đặt Cảnh Cáo Giao Dịch'}>
                                    <AlertTriangle size={14} />
                                 </button>
                                 <button onClick={() => handleToggleLock(u.email, u.isLocked)} disabled={u.role === 'admin' || u.isDeleted} className="btn-error" style={{ padding: '6px', width: '32px', height: '32px', borderColor: 'var(--border-light)', background: u.isLocked ? 'var(--warning-bg)' : 'transparent', color: 'var(--warning)' }} title={u.isLocked ? "Cấp Phép Lại Cổng Truy Cập" : "Đình Chỉ Liên Lạc Vào Trạm"}>
                                    {u.isLocked ? <Unlock size={14}/> : <Lock size={14} />}
                                 </button>
                                 <button onClick={() => handleToggleDelete(u.email, u.isDeleted)} disabled={u.role === 'admin'} className="btn-icon" style={{ padding: '6px', width: '32px', height: '32px', borderColor: 'transparent', background: u.isDeleted ? 'var(--success-bg)' : 'var(--danger-bg)', color: u.isDeleted ? 'var(--success)' : 'var(--danger)' }} title={u.isDeleted ? "Hồi Sinh Đặc Quyền Database" : "Tuyệt Đối Vô Hiệu Hóa Từ Gốc"}>
                                    {u.isDeleted ? <CheckCircle size={14} /> : <Trash2 size={14} />}
                                 </button>
                               </div>
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
               </motion.div>
             )}

             {/* SYSTEM MANAGEMENT TAB */}
             {activeTab === 'system' && (
               <motion.div key="system" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: '32px' }}>
                     <h1 style={{ margin: 0 }}>Thiết Lập Khối Hạ Tầng</h1>
                     <span style={{ color: 'var(--text-muted)' }}>Mã hóa thông số giao tiếp giữa Sever và Client Node.</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
                     {/* BROADCAST */}
                     <div className="friendly-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                           <Megaphone size={22} color="var(--primary)" />
                           <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Phát Lệnh Thông Báo Tập Trung</h3>
                        </div>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                           Dữ liệu này sẽ đè trực tiếp lên Topbar của toàn thể các thiết bị kết nối. Cảnh báo mang mức độ Ưu Tiên Tuyệt Đối. Để khoảng trống nếu muốn kết thúc phiên cảnh báo.
                        </p>
                        <textarea 
                           className="input-friendly" 
                           placeholder="Văn bản đính kèm bắt buộc xác thực..."
                           rows={4}
                           value={broadcastMsg}
                           onChange={e => setBroadcastMsg(e.target.value)}
                           style={{ width: '100%', marginBottom: '16px', resize: 'vertical' }}
                        />
                        <button onClick={saveBroadcast} className="btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
                           <AlertTriangle size={16} /> Triển Khai Kích Hoạt Khối Lệnh
                        </button>
                     </div>

                     {/* CATEGORY MASTER */}
                     <div className="friendly-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                           <SettingsIcon size={22} color="var(--primary)" />
                           <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Bộ Phân Loại Giao Dịch Cố Định</h3>
                        </div>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                           Chỉ mục dành riêng để giới hạn danh sách chi tiêu mà người dùng có quyền chọn. Phân hệ AI cũng dùng cơ sở dữ liệu học sâu này để đối chiếu.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', flex: 1, alignContent: 'flex-start' }}>
                           {systemCategories.map((c, i) => (
                              <div key={i} className="badge" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {c} 
                                <span onClick={() => handleDelCat(c)} style={{ cursor: 'pointer', opacity: 0.5 }}>✕</span>
                              </div>
                           ))}
                           {systemCategories.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Chưa thiết lập định chuẩn.</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                           <input type="text" className="input-friendly" placeholder="Nhập định dạng từ khóa..." value={newCat} onChange={e => setNewCat(e.target.value)} style={{ flex: 1 }} />
                           <button onClick={handleAddCat} className="btn-secondary">Mã Hóa Định Trí</button>
                        </div>
                     </div>

                     {/* DATABASE BACKUP */}
                     <div className="friendly-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                           <Database size={22} color="var(--primary)" />
                           <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Quản Trị Cơ Sở Dữ Liệu</h3>
                        </div>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                           Dễ dàng trích xuất (Backup) hoặc nạp lại (Restore) toàn bộ dữ liệu hệ thống người dùng để phục vụ quá trình bảo trì hay di chuyển máy chủ dữ liệu.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
                           <button onClick={handleLocalBackup} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                              <DownloadCloud size={16} /> Sao Lưu File Hạt Nhân (.json)
                           </button>
                           <label className="btn-secondary" style={{ display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                              <UploadCloud size={16} /> Nạp Dữ Liệu Khôi Phục (Restore)
                              <input type="file" accept=".json" onChange={handleLocalRestore} style={{ display: 'none' }} />
                           </label>
                        </div>
                     </div>
                  </div>
               </motion.div>
             )}

             {/* LOGS TAB */}
             {activeTab === 'logs' && (
               <motion.div key="logs" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: '24px' }}>
                     <h1 style={{ margin: 0 }}>Kho Dữ Liệu Nhật Ký Sự Kiện</h1>
                     <span style={{ color: 'var(--text-muted)' }}>Trung tâm theo dõi toàn trình Logging Events.</span>
                  </div>

                  <div className="friendly-card" style={{ padding: '0', overflow: 'hidden' }}>
                     <div style={{ padding: '16px 24px', background: 'var(--primary-bg)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 'bold' }}>AUDIT LOGS / TRACKING</span>
                         <button onClick={handleClearLogs} className="btn-secondary" style={{ padding: '8px 16px', color: 'var(--danger)', background: 'var(--danger-bg)', border: 'none' }}>
                           <Trash2 size={16} /> Triệt Tiêu Dữ Liệu Máy Chủ
                         </button>
                     </div>
                     <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                       <tbody>
                         {logs.map((log, idx) => (
                           <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                             <td style={{ padding: '18px 24px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>[{log.timestamp}]</td>
                             <td style={{ padding: '18px 24px', fontWeight: 'bold', color: 'var(--primary)', fontSize: '14px' }}>{log.user}</td>
                             <td style={{ padding: '18px 24px' }}>
                                <span className="badge" style={{ background: 'var(--surface-opaque)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                   {log.action}
                                </span>
                             </td>
                             <td style={{ padding: '18px 24px', color: 'var(--text-primary)', fontSize: '13.5px' }}>{log.details}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                     {logs.length === 0 && (
                        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                           <Activity size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
                           Hệ thống Audit Logs ghi nhận trống rỗng.
                        </div>
                     )}
                  </div>
               </motion.div>
             )}
          </AnimatePresence>
       </main>
    </div>
  );
}
