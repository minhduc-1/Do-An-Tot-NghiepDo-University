import { motion } from 'framer-motion';
import { Trash2, ShieldAlert, CheckCircle2, RefreshCcw } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function Trash({ user, currency, trashData, setTrashData, restoreItem, emptyTrash }) {
  
  // Lọc rác của user hiện tại
  const myTrash = trashData.filter(t => t.owner === user.email);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <section className="friendly-card" style={{ padding: '24px', border: '1px solid rgba(239, 68, 68, 0.4)', background: 'var(--danger-bg)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
               <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--danger)' }}>
                  <Trash2 size={24} /> Bãi Tập Kết Rác Thải
               </h2>
               <p style={{ color: 'rgba(239, 68, 68, 0.8)', fontSize: '14px', margin: 0 }}>
                  Nơi tiêu hủy hoặc khôi phục các hóa đơn, giao dịch đã xóa.
               </p>
            </div>
            {myTrash.length > 0 && (
               <button onClick={emptyTrash} className="btn-primary" style={{ background: 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} /> Tiêu Hủy Vĩnh Viễn Toàn Bộ
               </button>
            )}
         </div>
      </section>

      <section>
         {myTrash.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface-base)', borderRadius: '24px', border: '1px dashed var(--border-light)' }}>
               <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
               <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-primary)' }}>Thùng rác đang trống. Thật tuyệt vời!</h3>
            </div>
         ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {myTrash.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--surface-base)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                     <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                           <span className="badge warning" style={{ fontSize: '11px', background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                              Loại: {item.sourceType || 'Khác'}
                           </span>
                           <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Xóa lúc: {new Date(item.deletedAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                           {item.note || item.name || 'Giao dịch trống'}
                        </div>
                        {item.amount && (
                           <div style={{ fontSize: '14px', color: item.amount > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold', marginTop: '4px' }}>
                              {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount, currency)}
                           </div>
                        )}
                        {item.dueDate && (
                           <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Ngày mùng {item.dueDate} hàng tháng</div>
                        )}
                     </div>
                     <button onClick={() => restoreItem(item.id)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}>
                        <RefreshCcw size={16} /> Phục Hồi
                     </button>
                  </div>
               ))}
            </div>
         )}
      </section>

    </motion.div>
  );
}
