import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadData, saveData } from '../services/StorageService';
import { ShieldCheck, Trash2, XCircle } from 'lucide-react';

export default function AdminDashboard({ onLogout }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setLogs(loadData('audit_logs', []));
  }, []);

  const handleClearLogs = () => {
    if(window.confirm('Bạn có chắc xoá toàn bộ dấu vết hệ thống? Hành động này không thể hoàn tác trong CSDL AES.')) {
       saveData('audit_logs', []);
       setLogs([]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '40px' }}>
       <div className="bg-blobs"></div>
       
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <header className="glass-card" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
             <div>
                <h1 style={{ fontSize: '1.5rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                  <ShieldCheck size={28} /> Hệ Thống Root Control Phân Quyền
                </h1>
                <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0', fontSize: '14px' }}>Giám sát tuyệt mật mọi hoạt động truy xuất thông tin (Audit Logs) trên toàn CSDL.</p>
             </div>
             
             <div style={{ display: 'flex', gap: '16px' }}>
               <button onClick={handleClearLogs} className="btn-primary" style={{ background: 'var(--surface-opaque)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                 <Trash2 size={18} /> Phá Huỷ Log
               </button>
               <button onClick={onLogout} className="btn-primary">
                 <XCircle size={18} /> Đóng Phiên Quyền Cao
               </button>
             </div>
          </header>

          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
             <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
               <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                 <tr>
                   <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Thời Gian (Server)</th>
                   <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Mã Định Danh (User)</th>
                   <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Sự Kiện Lõi</th>
                   <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Mô Tả Mã Hoá</th>
                 </tr>
               </thead>
               <tbody>
                 {logs.map((log, idx) => (
                   <tr key={idx} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s' }}>
                     <td style={{ padding: '20px 24px', fontSize: '14px', fontFamily: 'monospace' }}>{log.timestamp}</td>
                     <td style={{ padding: '20px 24px', fontWeight: 'bold', color: 'var(--primary)' }}>{log.user}</td>
                     <td>
                        <span className="badge" style={{ background: 'var(--surface-opaque)', border: '1px solid var(--border-glass)' }}>
                           {log.action}
                        </span>
                     </td>
                     <td style={{ padding: '20px 24px', color: 'var(--text-secondary)' }}>{log.details}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {logs.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Không có truy vết dữ liệu nào được tìm thấy.</div>
             )}
          </div>
       </motion.div>
    </div>
  );
}
