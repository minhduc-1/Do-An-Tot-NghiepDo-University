import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../utils/format';
import { PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Globe, Activity } from 'lucide-react';

export default function Reports({ transactions, currency }) {
  const expenseTransactions = transactions.filter(t => t.amount < 0);
  const incomeTransactions = transactions.filter(t => t.amount > 0);

  const totalExpense = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Nhóm theo danh mục
  const categories = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    return acc;
  }, {});

  const barData = Object.entries(categories)
    .map(([name, value]) => ({ name, 'Đã chi': value, 'Nguyên bản': value }))
    .sort((a, b) => b['Đã chi'] - a['Đã chi']);

  // Dữ liệu cho PieChart
  const pieData = barData.map(item => ({ name: item.name, value: item['Đã chi'] }));
  const COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];

  const CustomTooltipInner = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="friendly-card" style={{ padding: '12px 16px', border: '1px solid var(--border-glass)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{label || payload[0].name}</p>
          <p style={{ margin: '4px 0 0 0', color: 'var(--danger)', fontWeight: 700, fontSize: '15px' }}>
            {formatCurrency(payload[0].value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Tính điểm sức khỏe tài chính
  let financialHealthScore = 100;
  let healthMessage = "Tuyệt Vời";
  let healthColor = "var(--success)";
  if (totalExpense > totalIncome) {
     financialHealthScore = 30;
     healthMessage = "Báo Động Đỏ";
     healthColor = "var(--danger)";
  } else if (totalExpense > totalIncome * 0.8) {
     financialHealthScore = 65;
     healthMessage = "Cần Thận Trọng";
     healthColor = "var(--warning)";
  } else if (totalIncome === 0 && totalExpense === 0) {
     financialHealthScore = 0;
     healthMessage = "Chưa Có Dữ Liệu";
     healthColor = "var(--text-muted)";
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Insight & Social Rank */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
         <div className="friendly-card" style={{ padding: '24px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
            {/* Background design */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
            
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
               <Activity size={24} /> Điểm Sức Khỏe Tài Chính (AI)
            </h3>
            <p style={{ opacity: 0.9, fontSize: '14px', position: 'relative', zIndex: 1 }}>Đánh giá dựa trên tỷ lệ dòng tiền thu/chi của bạn:</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '12px' }}>
               <span style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-2px', textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  {financialHealthScore}
               </span>
               <span style={{ fontSize: '18px', fontWeight: 'bold', padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px' }}>
                  {healthMessage}
               </span>
            </div>
         </div>

         <div className="friendly-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Chỉ Số Lưu Chuyển Tiền Tệ</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--success-bg)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ color: 'var(--success)', fontWeight: '600', fontSize: '15px' }}>Tổng Thu Nhập</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontWeight: 'bold', fontSize: '16px' }}>
                     <ArrowUpRight size={18}/> {formatCurrency(totalIncome, currency)}
                  </div>
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--danger-bg)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ color: 'var(--danger)', fontWeight: '600', fontSize: '15px' }}>Tổng Tốc Độ Chi</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontWeight: 'bold', fontSize: '16px' }}>
                     <ArrowDownRight size={18}/> {formatCurrency(totalExpense, currency)}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Biểu Đồ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
         {/* Bar Chart Danh mục */}
         <div className="friendly-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Globe size={20} color="var(--primary)" /> Mật Độ Chi Tiêu Từng Nhóm
            </h3>
            {barData.length === 0 ? (
               <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Chưa đủ dữ liệu để vẽ biểu đồ</div>
            ) : (
               <div style={{ height: '300px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                     <defs>
                       <linearGradient id="barColor" x1="0" y1="0" x2="1" y2="0">
                         <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="var(--accent)" stopOpacity={1}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" horizontal={false} />
                     <XAxis type="number" stroke="var(--text-muted)" tickFormatter={(val) => `${val/1000}k`} axisLine={false} tickLine={false} />
                     <YAxis dataKey="name" type="category" stroke="var(--text-muted)" tick={{fontSize: 13, fontWeight: 500}} axisLine={false} tickLine={false} />
                     <RechartsTooltip cursor={{ fill: 'var(--surface-opaque)' }} content={<CustomTooltipInner />} />
                     <Bar dataKey="Đã chi" fill="url(#barColor)" radius={[0, 8, 8, 0]} barSize={20} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            )}
         </div>

         {/* Pie Chart Tỷ Trọng */}
         <div className="friendly-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <PieChartIcon size={20} color="var(--accent)" /> Tỷ Trọng Danh Mục (%)
            </h3>
            {pieData.length === 0 ? (
               <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Chưa đủ dữ liệu để vẽ biểu đồ</div>
            ) : (
               <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <ResponsiveContainer width="100%" height="100%">
                   <RechartsPieChart>
                     <Pie
                       data={pieData}
                       cx="50%"
                       cy="50%"
                       innerRadius={80}
                       outerRadius={110}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                     >
                       {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <RechartsTooltip content={<CustomTooltipInner />} />
                   </RechartsPieChart>
                 </ResponsiveContainer>
               </div>
            )}
         </div>
      </div>
      
      {/* Table Lịch sử */}
      <div className="friendly-card" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Sổ Cái Giao Dịch Gốc</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-opaque)' }}>
              <th style={{ padding: '16px', borderRadius: '12px 0 0 12px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px' }}>Ngày</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px' }}>Danh Mục</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px' }}>Ghi Chú</th>
              <th style={{ padding: '16px', borderRadius: '0 12px 12px 0', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>Số Tiền</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
               <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Không có giao dịch nào gần đây.</td>
               </tr>
            ) : (
               transactions.map((t, idx) => (
                 <tr key={idx} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s' }}>
                   <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>{t.date}</td>
                   <td style={{ padding: '16px' }}>
                     <span className="badge" style={{ background: 'var(--surface-opaque)', border: '1px solid var(--border-glass)' }}>{t.category}</span>
                   </td>
                   <td style={{ padding: '16px', color: 'var(--text-primary)', fontSize: '14px' }}>{t.note}</td>
                   <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', fontSize: '15px', color: t.amount > 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                     {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount, currency)}
                   </td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>

    </motion.div>
  );
}
