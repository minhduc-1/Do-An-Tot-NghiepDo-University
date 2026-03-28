import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { saveData, loadData } from '../services/StorageService';

export default function BillReminder({ user, moveToTrash }) {
  // Mặc định nhắc nhở
  const defaultBills = [
    { id: '1', name: 'Tiền Điện', dueDate: 15, isPaid: false },
    { id: '2', name: 'Tiền Nước', dueDate: 20, isPaid: false },
    { id: '3', name: 'Internet / Viễn thông', dueDate: 5, isPaid: false }
  ];

  const [bills, setBills] = useState(() => loadData('bills_' + (user?.email || ''), defaultBills));
  const currentDay = new Date().getDate();
  const currentMonth = new Date().getMonth(); 

  useEffect(() => {
    // Reset isPaid state if we enter a new month (simplified logic)
    const storedMonth = loadData('bills_month_' + (user?.email || ''), currentMonth);
    if (storedMonth !== currentMonth) {
      const resetBills = bills.map(b => ({ ...b, isPaid: false }));
      setBills(resetBills);
      saveData('bills_month_' + user?.email, currentMonth);
    }
  }, [currentMonth, user]);

  useEffect(() => {
    if (user) saveData('bills_' + user.email, bills);
  }, [bills, user]);

  const [deletingIds, setDeletingIds] = useState([]);

  useEffect(() => {
    // Listen for global RESTORE_BILL event
    const handleRestore = (e) => {
        const restoredBill = e.detail;
        if (restoredBill && restoredBill.sourceType === 'HÓA_ĐƠN') {
            setBills(prev => [restoredBill, ...prev]);
        }
    };
    window.addEventListener('RESTORE_BILL', handleRestore);
    return () => window.removeEventListener('RESTORE_BILL', handleRestore);
  }, []);

  const togglePaid = (id) => {
    setBills(bills.map(b => b.id === id ? { ...b, isPaid: !b.isPaid } : b));
  };

  const handleTrashBill = (e, bill) => {
    e.stopPropagation();
    if (window.confirm(`Hóa đơn '${bill.name}' sẽ bị xóa và biến mất sau 2 giây. Bạn chắc chứ?`)) {
       setDeletingIds(prev => [...prev, bill.id]);
       setTimeout(() => {
          if (moveToTrash) moveToTrash(bill, 'HÓA_ĐƠN');
          setBills(prev => prev.filter(b => b.id !== bill.id));
          setDeletingIds(prev => prev.filter(id => id !== bill.id));
       }, 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="friendly-card" style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
        <Calendar size={20} color="var(--primary)" /> Nhắc Nhở Hóa Đơn Tháng Này
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence>
          {bills.sort((a,b) => a.dueDate - b.dueDate).map((bill) => {
            const isOverdue = !bill.isPaid && currentDay > bill.dueDate;
            const isSoon = !bill.isPaid && (bill.dueDate - currentDay) >= 0 && (bill.dueDate - currentDay) <= 3;
            const isDeleting = deletingIds.includes(bill.id);

            return (
              <motion.div 
                key={bill.id} 
                initial={{ opacity: 1, x: 0, scale: 1 }}
                animate={isDeleting ? { opacity: 0.2, x: 50, scale: 0.95 } : { opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => !isDeleting && togglePaid(bill.id)}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '16px', background: 'var(--surface-base)', borderRadius: '16px', 
                  border: `1px solid ${isOverdue ? 'var(--danger-bg)' : isSoon ? 'var(--warning-bg)' : 'var(--border-glass)'}`,
                  cursor: isDeleting ? 'not-allowed' : 'pointer', transition: 'border 0.2s',
                  position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div style={{ color: bill.isPaid ? 'var(--success)' : 'var(--text-muted)' }}>
                    {bill.isPaid ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                     <div style={{ fontWeight: '600', color: bill.isPaid ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: bill.isPaid ? 'line-through' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       {bill.name} 
                       {isDeleting && <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 'bold' }}>⏳ Đang đưa vào Thùng rác...</span>}
                     </div>
                     <div style={{ fontSize: '13px', color: isOverdue ? 'var(--danger)' : isSoon ? 'var(--warning)' : 'var(--text-secondary)', marginTop: '4px' }}>
                       Hạn chót: Ngày {bill.dueDate} hàng tháng
                       {isOverdue && ' (Đã quá hạn)'}
                       {isSoon && ' (Sắp tới hạn)'}
                     </div>
                  </div>
                </div>
                {isDeleting && (
                  <motion.div 
                    initial={{ width: '100%' }} 
                    animate={{ width: 0 }} 
                    transition={{ duration: 2, ease: "linear" }}
                    style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', background: 'var(--danger)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}
                  />
                )}
                
                <button 
                   onClick={(e) => handleTrashBill(e, bill)} 
                   disabled={isDeleting}
                   className="btn-icon" 
                   style={{ opacity: isDeleting ? 0 : 0.6, borderColor: 'transparent', transition: 'all 0.2s' }}
                   onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--danger)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.color = 'inherit'; }}
                   title="Xoá và Đưa vào Thùng Rác"
                >
                   <Trash2 size={18} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
