import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Key, ArrowRightLeft, UploadCloud, DownloadCloud, Wallet, Copy, RefreshCw } from 'lucide-react';

export default function GroupWallet({ user, currency, allGroups, setAllGroups, allGroupTx, setAllGroupTx }) {
  const [activeGroup, setActiveGroup] = useState(null); // The group being viewed
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  
  // Transaction State for Group
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');

  // Filter groups the user belongs to
  const myGroups = allGroups.filter(g => g.members.includes(user.email));

  const handleCreateGroup = (e) => {
    e.preventDefault();
    const name = e.target.gname.value;
    const newG = {
       id: 'g_' + Date.now(),
       name,
       members: [user.email],
       code: Math.random().toString(36).substring(2, 8).toUpperCase(),
       createdAt: new Date().toISOString()
    };
    setAllGroups([newG, ...allGroups]);
    setShowCreate(false);
    setActiveGroup(newG.id);
  };

  const handleJoinGroup = (e) => {
    e.preventDefault();
    const code = e.target.gcode.value.trim().toUpperCase();
    const checkG = allGroups.find(g => g.code === code);
    if (!checkG) return alert('Mã tham gia không tồn tại!');
    if (checkG.members.includes(user.email)) return alert('Bạn đã ở trong quỹ này rồi!');
    
    // Add user.email to members
    const updated = allGroups.map(g => g.id === checkG.id ? { ...g, members: [...g.members, user.email] } : g);
    setAllGroups(updated);
    setShowJoin(false);
    setActiveGroup(checkG.id);
  };

  const handleGroupTx = (type) => {
    if (!activeGroup || !txAmount) return;
    const val = Number(txAmount);
    if (val <= 0) return alert('Số tiền không nhỏ hơn hoặc bằng 0');
    
    const newTx = {
       id: 'gtx_' + Date.now(),
       groupId: activeGroup,
       type, // 'DEPOSIT' hoặc 'WITHDRAW'
       amount: val,
       note: txNote,
       owner: user.email,
       date: new Date().toISOString()
    };
    
    setAllGroupTx([newTx, ...allGroupTx]);
    setTxAmount('');
    setTxNote('');
  };

  const currentGroupObj = allGroups.find(g => g.id === activeGroup);
  const currentGroupTxs = allGroupTx.filter(t => t.groupId === activeGroup).sort((a,b) => new Date(b.date) - new Date(a.date));
  
  // Tính tổng số quỹ
  const calculateTotalFund = () => {
     let total = 0;
     currentGroupTxs.forEach(t => {
        if (t.type === 'DEPOSIT') total += t.amount;
        if (t.type === 'WITHDRAW') total -= t.amount;
     });
     return total;
  };
  
  const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {!activeGroup ? (
          <section>
             <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Users size={24} color="var(--primary)" /> Danh Sách Quỹ Chung Của Bạn
             </h2>

             {myGroups.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface-base)', borderRadius: '24px', border: '1px dashed var(--border-light)' }}>
                   <Wallet size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                   <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-primary)' }}>Bạn chưa tham gia quỹ nhóm nào</h3>
                   <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Tạo hoặc Tham gia để chia sẻ chi tiêu cùng gia đình, bạn bè.</p>
                   
                   <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                      <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18}/> Tạo Mới</button>
                      <button onClick={() => setShowJoin(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Key size={18}/> Xin Tham Gia</button>
                   </div>
                </div>
             ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                   {myGroups.map(g => (
                      <div key={g.id} onClick={() => setActiveGroup(g.id)} className="friendly-card" style={{ padding: '24px', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                         <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                             <Wallet size={20} color="var(--warning)"/> {g.name}
                         </h3>
                         <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <Users size={14}/> {g.members.length} Thành Viên Tham Gia
                         </div>
                      </div>
                   ))}
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                      <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Plus size={18}/> Lập Quỹ Nhóm Mới</button>
                      <button onClick={() => setShowJoin(true)} className="btn-secondary" style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Key size={18}/> Nhập Mã Tham Gia</button>
                   </div>
                </div>
             )}
          </section>
      ) : (
          <section>
             <button onClick={() => setActiveGroup(null)} className="btn-secondary" style={{ marginBottom: '20px', border: 'none', background: 'transparent' }}>
                 ← Quay lại danh sách
             </button>
             
             {/* Chi tiết Nhóm Quỹ */}
             <div className="friendly-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'linear-gradient(135deg, var(--primary-bg) 0%, var(--surface-base) 100%)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                       <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--primary)', fontWeight: '800' }}>Ngân Hàng Trung Ương: {currentGroupObj.name}</h2>
                       <div className="badge primary" style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(currentGroupObj.code); alert('Đã sao chép Mã Mời: ' + currentGroupObj.code) }}>
                          Mã Mời Bạn Bè: {currentGroupObj.code} <Copy size={12} style={{ marginLeft: '4px' }}/>
                       </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                       <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-muted)' }}>MẬT ĐỘ TÀI SẢN TẬP THỂ</p>
                       <h1 style={{ margin: 0, fontSize: '32px', color: calculateTotalFund() >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '900' }}>
                          {formatter.format(calculateTotalFund())}
                       </h1>
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex', gap: '16px', background: 'var(--surface-opaque)', padding: '16px', borderRadius: '16px' }}>
                     <Users size={20} color="var(--text-muted)" />
                     <div style={{ flex: 1, fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <strong>Thành Viên:</strong> {currentGroupObj.members.join(', ')}
                     </div>
                 </div>
             </div>

             {/* Khu vực Giao dịch */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
                 <div className="friendly-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <ArrowRightLeft size={18}/> Lệnh Giao Dịch Vào Quỹ
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>SỐ TIỀN BƠM/RÚT</label>
                          <input type="number" className="input-friendly" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} placeholder="0" style={{ margin: 0, marginTop: '8px' }}/>
                       </div>
                       <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>MỤC ĐÍCH / GHI CHÚ LỆNH</label>
                          <input type="text" className="input-friendly" value={txNote} onChange={(e) => setTxNote(e.target.value)} placeholder="Góp quỹ sắm tết..." style={{ margin: 0, marginTop: '8px' }}/>
                       </div>
                       <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                          <button onClick={() => handleGroupTx('DEPOSIT')} className="btn-primary" style={{ flex: 1, background: 'var(--success)', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                             <UploadCloud size={16}/> Đóng Góp Tiền
                          </button>
                          <button onClick={() => handleGroupTx('WITHDRAW')} className="btn-primary" style={{ flex: 1, background: 'var(--danger)', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                             <DownloadCloud size={16}/> Xin Rút Tiền
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="friendly-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <RefreshCw size={18}/> Sao Kê Tổng Quỹ
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                       {currentGroupTxs.length === 0 ? (
                          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>Chưa có lệnh chuyển tiền nào phát sinh do thành viên.</div>
                       ) : (
                          currentGroupTxs.map(t => (
                             <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface-base)', borderRadius: '12px', borderLeft: `4px solid ${t.type === 'DEPOSIT' ? 'var(--success)' : 'var(--danger)'}` }}>
                                <div>
                                   <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{t.note || 'Không ghi chú'}</div>
                                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Người khởi tạo: {t.owner === user.email ? 'Bạn' : t.owner}</div>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '800', color: t.type === 'DEPOSIT' ? 'var(--success)' : 'var(--danger)' }}>
                                   {t.type === 'DEPOSIT' ? '+' : '-'}{formatter.format(t.amount)}
                                </div>
                             </div>
                          ))
                       )}
                    </div>
                 </div>
             </div>
          </section>
      )}

      {/* Modal View for Create/Join (Simple implement) */}
      <AnimatePresence>
         {showCreate && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
                <div className="friendly-card" style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
                   <h3 style={{ marginBottom: '24px' }}>Phong Ấn Lập Quỹ</h3>
                   <form onSubmit={handleCreateGroup}>
                      <input name="gname" required placeholder="Tên Chuyến Đi / Quỹ (Vd: Du lịch Nha Trang)" className="input-friendly" autoFocus />
                      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                         <button type="submit" className="btn-primary" style={{ flex: 1 }}>Cấp Phép Lập</button>
                         <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Thoát</button>
                      </div>
                   </form>
                </div>
             </motion.div>
         )}

         {showJoin && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
                <div className="friendly-card" style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
                   <h3 style={{ marginBottom: '24px' }}>Nhập Cảnh Nhóm Chung</h3>
                   <form onSubmit={handleJoinGroup}>
                      <input name="gcode" required placeholder="Gõ chính xác 6 ký tự Mật mã" className="input-friendly" autoFocus style={{ textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }} maxLength={6}/>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                         <button type="submit" className="btn-primary" style={{ flex: 1, background: 'var(--warning)' }}>Chi Vận</button>
                         <button type="button" onClick={() => setShowJoin(false)} className="btn-secondary">Thoát</button>
                      </div>
                   </form>
                </div>
             </motion.div>
         )}
      </AnimatePresence>

    </motion.div>
  );
}
