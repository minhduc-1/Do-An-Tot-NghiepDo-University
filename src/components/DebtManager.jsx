import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../utils/format';
import { logAction } from '../services/AuditService';
import { Users, AlertCircle, CheckCircle2, UserPlus, FileSpreadsheet, Plus, TrendingDown, TrendingUp } from 'lucide-react';

export default function DebtManager({ currency, debts, allDebts, setAllDebts, user }) {
  const [showSplit, setShowSplit] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Thống kê nhanh
  const totalLent = debts.filter(d => d.type === 'lent' && d.status === 'pending').reduce((sum, d) => sum + Number(d.amount), 0);
  const totalBorrowed = debts.filter(d => d.type === 'borrowed' && d.status === 'pending').reduce((sum, d) => sum + Number(d.amount), 0);

  const handleMarkPaid = (id) => {
    const updatedAllDebts = allDebts.map(d => d.id === id ? { ...d, status: 'paid' } : d);
    setAllDebts(updatedAllDebts);
    logAction(user?.email, 'Xóa Nợ', `Xác nhận đã thanh toán/đòi thành công khoản nợ ID: ${id}`);
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    const newDebt = {
      id: Date.now(),
      owner: user.email,
      type: e.target.type.value,
      amount: Number(e.target.amount.value),
      person: e.target.person.value,
      note: e.target.note.value,
      date: new Date().toLocaleDateString('vi-VN'),
      status: 'pending'
    };
    setAllDebts([newDebt, ...allDebts]);
    setShowAddForm(false);
    logAction(user?.email, 'Thêm Nợ', `Thêm khoản nợ mới: ${newDebt.type === 'lent' ? 'Cho vay' : 'Đi vay'} ${newDebt.amount}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Cards Thống kê Tổng Nợ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
         <div className="friendly-card" style={{ padding: '24px', background: 'linear-gradient(135deg, var(--success) 0%, #10b981 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
               <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px' }}><TrendingUp size={24} /></div>
               <span style={{ fontSize: '15px', fontWeight: '600' }}>Tiền Người Khác Nợ Mình</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{formatCurrency(totalLent, currency)}</div>
         </div>

         <div className="friendly-card" style={{ padding: '24px', background: 'linear-gradient(135deg, var(--danger) 0%, #ef4444 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
               <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px' }}><TrendingDown size={24} /></div>
               <span style={{ fontSize: '15px', fontWeight: '600' }}>Tiền Mình Nợ Người Khác</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{formatCurrency(totalBorrowed, currency)}</div>
         </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
         <button onClick={() => setShowSplit(!showSplit)} className="btn-secondary">
            {showSplit ? 'Đóng Chia Tiền' : 'Chia Tiền Nhóm'}
         </button>
         <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
            {showAddForm ? 'Hủy' : '+ Thêm Khoản Nợ'}
         </button>
      </div>

      <AnimatePresence>
         {showAddForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
               <form onSubmit={handleAddDebt} className="friendly-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--primary)' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary)' }}>Thêm Khoản Nợ Mới</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                     <select name="type" className="input-glass" required>
                        <option value="lent">Cho Vay (Họ nợ mình)</option>
                        <option value="borrowed">Đi Vay (Mình nợ họ)</option>
                     </select>
                     <input type="number" name="amount" placeholder="Số tiền" className="input-glass" required min="1000" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                     <input type="text" name="person" placeholder="Tên đối tác (VD: Nguyễn Văn A)" className="input-glass" required />
                     <input type="text" name="note" placeholder="Ghi chú (VD: Tiền ăn trưa)" className="input-glass" required />
                  </div>
                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end' }}>Lưu Khoản Nợ</button>
               </form>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Tính năng chia Split Bill */}
      <AnimatePresence>
        {showSplit && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
             <div className="friendly-card" style={{ padding: '24px', border: '1px solid var(--warning)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', color: 'var(--warning)' }}>
                   <Users size={24} /> Chia Tiền Nhóm (Split Bill)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <input type="number" placeholder="Nhập tổng bill (VD: 3000000)" className="input-glass" />
                   <input type="number" placeholder="Số người tham gia (VD: 4)" className="input-glass" />
                </div>
                <input type="text" placeholder="Tên từng người (Cách nhau bởi dấu phẩy)" className="input-glass" style={{ marginTop: '16px', width: '100%' }} />
                <button className="btn-primary" style={{ background: 'var(--warning)', marginTop: '16px', color: '#000' }}>
                   <FileSpreadsheet size={18} /> Tính Toán Nhanh
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Danh sách Sổ Nợ */}
      <div className="friendly-card" style={{ padding: '24px' }}>
         <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
           <AlertCircle size={20} color="var(--primary)" /> Danh Sách Giao Dịch Nợ
         </h3>

         {debts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
               Chưa có khoản nợ nào. Thật tuyệt vời vì bạn không mắc nợ ai! 🎉
            </div>
         ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
               {debts.map(debt => (
                 <motion.div 
                   key={debt.id} 
                   whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
                   style={{ 
                      padding: '20px', background: 'var(--surface-opaque)', borderRadius: '16px', 
                      border: `1px solid ${debt.status === 'paid' ? 'var(--success)' : 'var(--border-glass)'}`,
                      opacity: debt.status === 'paid' ? 0.6 : 1, position: 'relative'
                   }}
                 >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                       <span className={`badge ${debt.type === 'lent' ? 'success' : 'danger'}`}>
                          {debt.type === 'lent' ? 'Cho Vay (Cần đòi)' : 'Đi Vay (Cần trả)'}
                       </span>
                       <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{debt.date}</span>
                    </div>
                    
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                       {formatCurrency(debt.amount, currency)}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>
                       <UserPlus size={14} style={{ display: 'inline', marginRight: '4px' }}/> 
                       Đối tác: <strong>{debt.person}</strong>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', marginBottom: '16px' }}>
                       "{debt.note}"
                    </div>
                    
                    {debt.status === 'pending' ? (
                       <button onClick={() => handleMarkPaid(debt.id)} className="btn-primary" style={{ width: '100%', background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                         Xác Nhận Đã Xong
                       </button>
                    ) : (
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--success)', padding: '12px', background: 'var(--success-bg)', borderRadius: '12px', fontWeight: 'bold' }}>
                          <CheckCircle2 size={18} /> Đã Thanh Toán
                       </div>
                    )}
                 </motion.div>
               ))}
            </div>
         )}
      </div>

    </motion.div>
  );
}
