import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Wallet, Target, PieChart, Receipt, Settings as SettingsIcon, LogOut, Moon, Sun, ShieldCheck } from 'lucide-react';

import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import GoalForm from './components/GoalForm';
import AIChatbot from './components/AIChatbot';
import Reports from './components/Reports';
import Settings from './components/Settings';
import DebtManager from './components/DebtManager';
import AdminDashboard from './components/AdminDashboard';

import { saveData, loadData } from './services/StorageService';
import { logAction } from './services/AuditService';

export default function App() {
  const [user, setUser] = useState(null); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);

  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currency, setCurrency] = useState('VND'); 
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  
  const defaultTx = [
    { id: '1', date: '24/04/2026', category: 'Siêu Thị', amount: -500000, note: 'Mua sắm đồ ăn' },
    { id: '2', date: '22/04/2026', category: 'Tiền Điện', amount: -1200000, note: 'Thanh toán hóa đơn' },
    { id: '3', date: '20/04/2026', category: 'Lương', amount: 15000000, note: 'Lương tháng 4' }
  ];
  const [transactions, setTransactions] = useState(() => loadData('tx_data', defaultTx));

  const defaultGoals = [
    { id: '1', name: 'Du Lịch Châu Âu', target: 50000000, current: 15000000, percent: 30 },
    { id: '2', name: 'Quỹ Mua Xe', target: 110000000, current: 45000000, percent: 40 }
  ];
  const [goals, setGoals] = useState(() => loadData('goals_data', defaultGoals));

  // Sync Data
  useEffect(() => { saveData('tx_data', transactions); }, [transactions]);
  useEffect(() => { saveData('goals_data', goals); }, [goals]);

  // Sync Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Idle Logout Mechanism
  const timeoutRef = useRef(null);
  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (user || isAdmin) {
      timeoutRef.current = setTimeout(() => {
        logAction(user?.email || 'admin@gmail.com', 'Cảnh báo/Hệ thống', 'Tự động đăng xuất do hệ thống đóng băng 5 phút');
        handleLogout();
        alert('Phiên làm việc đã hết hạn do không hoạt động để bảo mật.');
      }, 5 * 60 * 1000); // 5 phút
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keypress', resetTimeout);
    return () => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
    };
  }, [user, isAdmin]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (lockedUntil && Date.now() < lockedUntil) {
      alert(`Thiết bị đang bị khoá bảo mật. Vui lòng thử lại sau vài giây.`);
      return;
    }

    const email = e.target.email.value;
    const pwd = e.target.password.value;
    
    if (pwd !== '123456' && pwd !== 'admin') {
       const fails = failedAttempts + 1;
       setFailedAttempts(fails);
       logAction(email, 'Đăng nhập sai', `Sai mật khẩu lần ${fails}`);
       
       if (fails >= 3) {
          setLockedUntil(Date.now() + 30000);
          logAction(email, 'Cảnh báo/Hệ thống', 'Tạm khóa thiết bị 30s do đăng nhập sai 3 lần');
          alert('Nhập sai 3 lần! Tạm khoá đăng nhập 30 giây để bảo vệ tài khoản.');
       } else {
          alert('Sai mật khẩu! (Gợi ý: 123456 hoặc "admin")');
       }
       return;
    }
    
    setFailedAttempts(0);
    setPendingEmail(email);
    setShowOTP(true);
    logAction(email, 'Hệ thống Auth', 'Yêu cầu mã 2FA OTP qua giả lập điện thoại');
  };

  const handleOTPVerify = (e) => {
    e.preventDefault();
    const otp = e.target.otp.value;
    if (otp !== '888888') {
       alert('Sai mã OTP! (Gợi ý: 888888)');
       return;
    }
    
    setShowOTP(false);
    if (pendingEmail === 'admin@gmail.com') {
      setIsAdmin(true);
      logAction('admin@gmail.com', 'Đăng nhập Cấp cao', 'Đăng nhập thành công vào Màn hình Admin Giám đốc');
    } else {
      setUser({
        email: pendingEmail,
        name: pendingEmail.split('@')[0],
        avatar: `https://ui-avatars.com/api/?name=${pendingEmail.split('@')[0]}&background=3b82f6&color=fff&size=128&rounded=true`
      });
      logAction(pendingEmail, 'Đăng nhập', 'Đăng nhập thành công vào Hệ thống cá nhân');
    }
    resetTimeout();
  };

  const handleLogout = () => {
    if(user || isAdmin) logAction(user?.email || 'admin@gmail.com', 'Đăng xuất', 'Chủ động Đăng xuất khỏi hệ thống');
    setUser(null);
    setIsAdmin(false);
    setPendingEmail('');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleAddTransaction = (newTx) => {
    const mappedTx = {
      id: newTx.id,
      date: new Date(newTx.date).toLocaleDateString('vi-VN'),
      category: newTx.category,
      amount: newTx.amount,
      note: newTx.note
    };
    setTransactions(prev => [mappedTx, ...prev]);
    logAction(user?.email, 'Giao dịch mới', `Ghi nhận giao dịch ${mappedTx.amount} đ vào nhóm ${mappedTx.category}`);
  };

  const handleAddGoal = (newGoal) => {
    setGoals(prev => [...prev, newGoal]);
    logAction(user?.email, 'Thêm thẻ Mục tiêu', `Mục tiêu mới: ${newGoal.name}`);
  };

  // --- RENDERING ROUTER ---

  if (!user && !isAdmin) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div className="bg-blobs"></div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} 
          className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '40px 32px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          
          <div style={{ background: 'var(--primary)', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: 'white' }}>
            <ShieldCheck size={36} />
          </div>
          
          <h2 style={{ marginBottom: '8px', fontSize: '1.75rem' }}>SmartExpense</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>Bảo mật dữ liệu của bạn bằng công nghệ mã hoá chuẩn AES hiện đại nhất.</p>
          
          <AnimatePresence mode="wait">
            {!showOTP ? (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input name="email" type="email" required placeholder="Địa chỉ Email (VD: admin@gmail.com)" className="input-glass" />
                <input name="password" type="password" required placeholder="Mật khẩu (Gợi ý: 123456)" className="input-glass" />
                <button type="submit" className="btn-primary" style={{ marginTop: '8px', width: '100%' }}>
                  Xác Minh Danh Tính
                </button>
              </motion.form>
            ) : (
              <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleOTPVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid var(--border-glass)' }}>
                   Mã OTP 6 số đã được giả lập gửi tới thiết bị liên kết của <strong>{pendingEmail}</strong>.
                </div>
                <input name="otp" type="text" maxLength="6" required placeholder="Nhập OTP 888888" className="input-glass" style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 'bold' }} />
                <button type="submit" className="btn-primary" style={{ width: '100%', background: 'var(--success)' }}>
                  Hoàn Tất Đăng Nhập Đa Tầng
                </button>
                <button type="button" onClick={() => setShowOTP(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', marginTop: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  ← Quay lại nhập email
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard transactions={transactions} goals={goals} currency={currency} />;
      case 'reports': return <Reports transactions={transactions} currency={currency} />;
      case 'debts': return <DebtManager currency={currency} />;
      case 'settings': return <Settings user={user} onLogout={handleLogout} currency={currency} setCurrency={setCurrency} />;
      default: return <Dashboard transactions={transactions} goals={goals} currency={currency} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: <LayoutDashboard size={20} /> },
    { id: 'reports', label: 'Báo Cáo & AI', icon: <PieChart size={20} /> },
    { id: 'debts', label: 'Sổ Nợ (Social)', icon: <Receipt size={20} /> },
    { id: 'settings', label: 'Cài Đặt Hệ Thống', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="app-container">
      <div className="bg-blobs"></div>

      {/* Tái cấu trúc Siêu Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
          <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px', color: 'white' }}>
            <Wallet size={24} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>SmartExpense</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px',
                background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                color: activeTab === item.id ? 'white' : 'var(--text-secondary)',
                border: 'none', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s',
                textAlign: 'left', width: '100%'
              }}
            >
              <span style={{ opacity: activeTab === item.id ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="glass-card-transparent" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
          <img src={user.avatar} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '12px' }} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Member</div>
          </div>
          <button onClick={handleLogout} className="btn-icon" style={{ borderColor: 'transparent', color: 'var(--danger)' }} title="Đăng xuất">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Khu vực Nội dung Chính */}
      <main className="main-content">
        {/* Header Cao Cấp */}
        <header style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '24px 40px', background: 'var(--surface-glass)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-glass)', position: 'sticky', top: 0, zIndex: 40
        }}>
          <div>
             <h1 style={{ fontSize: '1.5rem' }}>
                {activeTab === 'dashboard' && 'Bảng Điều Khiển Tổng Quan'}
                {activeTab === 'reports' && 'Khám Phá Phân Tích Dữ Liệu'}
                {activeTab === 'debts' && 'Trung Tâm Xử Lý Sổ Nợ'}
                {activeTab === 'settings' && 'Bảo Mật & Tuỳ Chọn Giao Diện'}
             </h1>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                Theo dõi và lập kế hoạch tài chính tối ưu cùng AI.
             </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
             <button onClick={toggleTheme} className="btn-icon" title="Đổi Phông Màu (Dark/Light)">
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             {activeTab === 'dashboard' && (
               <>
                 <button onClick={() => setShowGoalForm(true)} className="btn-icon" style={{ padding: '8px 16px', borderRadius: '12px', fontWeight: '500' }}>
                   <Target size={18} style={{ marginRight: '8px' }}/> Săn Mục Tiêu
                 </button>
                 <button onClick={() => setShowTransactionForm(true)} className="btn-primary">
                   + Giao Dịch Nhanh
                 </button>
               </>
             )}
          </div>
        </header>

        {/* Nội Dung Biến Đổi */}
        <div style={{ padding: '32px 40px', flex: 1 }}>
           <AnimatePresence mode="wait">
             <motion.div 
               key={activeTab}
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -15 }}
               transition={{ duration: 0.3 }}
               style={{ height: '100%' }}
             >
               {renderContent()}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showTransactionForm && (
          <TransactionForm onClose={() => setShowTransactionForm(false)} onAdd={handleAddTransaction}/>
        )}
        {showGoalForm && (
          <GoalForm onClose={() => setShowGoalForm(false)} onAdd={handleAddGoal}/>
        )}
      </AnimatePresence>

      <AIChatbot transactions={transactions} />
    </div>
  );
}
