import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DailyJournal({ user, currency, allJournals, setAllJournals, handleAddTx }) {
  const [content, setContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [parsedResults, setParsedResults] = useState([]);

  // Mock journals for UI
  const myJournals = allJournals.filter(j => j.owner === user.email).sort((a,b) => new Date(b.date) - new Date(a.date));

  const analyzeContent = () => {
    if(!content.trim()) return;
    setAnalyzing(true);
    
    // Giả lập AI bóc tách nghiệp vụ (Dùng Regex cơ bản hoặc logic if/else)
    // Tách theo dấu phẩy hoặc dòng
    setTimeout(() => {
       const phrases = content.split(/,|\n/).map(s => s.trim()).filter(Boolean);
       const results = [];
       phrases.forEach((p, idx) => {
         // Logic nghèo nàn giả lập AI:
         // Nhận diện 'mua abc 50k', 'bán xyz 100k'
         const amountMatch = p.match(/(\d+)(k|tr|đ)/i);
         const typeMatch = p.match(/(mua|bán|thu|chi|nhận|trả|tiêu)/i);
         
         if (amountMatch && typeMatch) {
            let num = parseInt(amountMatch[1], 10);
            if(amountMatch[2].toLowerCase() === 'k') num *= 1000;
            if(amountMatch[2].toLowerCase() === 'tr') num *= 1000000;
            
            const isSpening = ['mua', 'chi', 'trả', 'tiêu'].includes(typeMatch[1].toLowerCase());
            results.push({
               id: 'p_' + Date.now() + '_' + idx,
               amount: isSpening ? -num : num,
               note: p,
               category: isSpening ? 'Sinh hoạt' : 'Thu nhập'
            });
         }
       });
       
       setParsedResults(results);
       setAnalyzing(false);
    }, 1500);
  };

  const saveToLedger = () => {
     // 1. Lưu lại Text Nhật ký
     const newJournal = {
        id: Date.now().toString(),
        owner: user.email,
        content,
        date: new Date().toISOString()
     };
     setAllJournals([newJournal, ...allJournals]);

     // 2. Đẩy qua sổ quỹ
     parsedResults.forEach(r => {
        handleAddTx({
           id: r.id,
           amount: r.amount,
           category: r.category,
           date: new Date().toLocaleDateString('vi-VN'),
           note: r.note
        });
     });

     // Reset
     setContent('');
     setParsedResults([]);
     alert(`Thành công! Đã đưa ${parsedResults.length} giao dịch vào Sổ Quỹ chính!`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <section className="friendly-card" style={{ padding: '24px' }}>
         <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <BookOpen size={20} color="var(--primary)" /> Viết Nhật ký Hàng ngày
         </h2>
         <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            Bạn cứ viết tự do như nói chuyện (VD: *Hôm nay mua mắm 50k, đổ xăng 50k, bán chè được 300k, ăn trưa hết 30k*). Trợ lý AI sẽ tự hiểu và bóc tách thành giao dịch.
         </p>
         <textarea 
            className="input-friendly"
            placeholder="Kể lại chi tiêu hôm nay của bạn vào đây..."
            style={{ width: '100%', height: '120px', resize: 'none', marginBottom: '16px' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
         ></textarea>
         
         {!parsedResults.length && (
           <button onClick={analyzeContent} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={analyzing}>
             <Search size={18} /> {analyzing ? 'AI Đang đọc hiểu...' : 'Phân tích tự động'}
           </button>
         )}

         <AnimatePresence>
            {parsedResults.length > 0 && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '24px', background: 'var(--bg-app)', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>Dữ liệu bóc tách được:</h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     {parsedResults.map(r => (
                        <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--surface-base)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                           <span style={{ fontWeight: '500' }}>{r.note}</span>
                           <span style={{ color: r.amount < 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>
                              {r.amount < 0 ? '-' : '+'}{Math.abs(r.amount).toLocaleString()}đ
                           </span>
                        </li>
                     ))}
                  </ul>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                     <button onClick={saveToLedger} className="btn-primary" style={{ background: 'var(--success)', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={18} /> Xác nhận Đưa vào Sổ Quỹ
                     </button>
                     <button onClick={() => setParsedResults([])} className="btn-secondary">Viết lại</button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </section>

      <section className="friendly-card" style={{ padding: '24px' }}>
         <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-primary)' }}>Lịch sử Nhật ký của bạn</h3>
         {myJournals.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Chưa có trang nhật ký nào.</div>
         ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {myJournals.map(j => (
                  <div key={j.id} style={{ padding: '16px', background: 'var(--surface-base)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                     <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>
                        {new Date(j.date).toLocaleString('vi-VN')}
                     </div>
                     <div style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>"{j.content}"</div>
                  </div>
               ))}
            </div>
         )}
      </section>

    </motion.div>
  );
}
