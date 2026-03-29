import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateAIResponse = async (prompt, _apiKey, context, _previousMessages = []) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { totalIncome, totalExpense, currentBalance, currency } = context;
      const fmt = (num) => new Intl.NumberFormat('vi-VN').format(Math.abs(num)) + 'đ';
      const msg = prompt.toLowerCase();
      
      // Chào hỏi chung
      if(msg.includes('chào') || msg.includes('hello') || msg.includes('hi ')) {
         return resolve(`Chào cậu! Số dư của cậu đang là ${fmt(currentBalance)}. Cậu muốn kiểm tra sổ cái hay là tâm sự chút chuyện đời thường không? 😊`);
      }
      
      // Tâm sự tình cảm / Buồn chán
      if(msg.includes('buồn') || msg.includes('chán') || msg.includes('buồn vãi') || msg.includes('chán nản') || msg.includes('khóc')) {
          return resolve(`Cậu đang có tâm sự à? Đôi khi áp lực cuộc sống cũng khiến mình mệt mỏi. Cậu có thể mua một ly cafe hoặc món ăn yêu thích để giải tỏa, nhưng nhớ để ý nhé, tài khoản quỹ cá nhân hiện tại của cậu trị giá ${fmt(currentBalance)} đấy! 💙 Chi ra một xíu cho niềm vui cũng đáng mà.`);
      }
      
      if(msg.includes('vui') || msg.includes('hạnh phúc') || msg.includes('tuyệt')) {
          return resolve(`Thấy cậu vui mình cũng vui lây! Cuộc sống là những niềm vui nhỏ nhặt. Giữ vững tinh thần nha, và đừng quên trích một khoản tiết kiệm dự tính để niềm vui này kéo dài bền lâu! 🎉`);
      }

      if(msg.includes('thất tình') || msg.includes('chia tay') || msg.includes('cô đơn') || msg.includes('một mình')) {
         return resolve(`Trời ạ, trái tim cậu đang đau phải không? 💔 Tình yêu thì có thể đến rồi đi, nhưng tiền trong ví thì nhât định phải ở lại! Cậu đang có ${fmt(currentBalance)}, đủ để tự bao bản thân một bữa lẩu hoàng tráng để giã từ những thứ không xứng đáng đấy. Mạnh mẽ lên anh bạn!`);
      }

      if(msg.includes('mệt') || msg.includes('stress') || msg.includes('áp lực')) {
         return resolve(`Nghỉ ngơi một chút đi cậu. Công việc lúc nào cũng bận rộn, nhưng sức khỏe não bộ là quan trọng nhất. Cứ xách balo lên và đi resort ngắn ngày xem, quỹ của cậu đang có ${fmt(currentBalance)} mà! Đừng đày đọa mình. 💆🏻‍♀️💆🏻‍♂️`);
      }

      if(msg.includes('thời tiết') || msg.includes('mưa') || msg.includes('nắng')) {
         return resolve(`Thời tiết ngoài kia thế nào cũng không quan trọng bằng "thời tiết tài chính" của cậu đâu. Hiện tại túi tiền của cậu khá "quang đãng" với số dư ${fmt(currentBalance)}. 🌤 Mưa gió thì nhớ book xe ngoài kẻo cảm nhé.`);
      }

      if(msg.includes('tương lai') || msg.includes('giàu') || msg.includes('tỷ phú') || msg.includes('kinh doanh')) {
         return resolve(`Chà, tầm nhìn lớn quá! Nhưng hành trình ngàn dặm trên thương trường bắt đầu từ việc tối ưu sổ sách. Hiện tại cậu đã tiết kiệm được ${fmt(currentBalance)} ở vốn lưu động rồi, hãy duy trì đà này. Tỉ phú tương lai có mặt cậu đó! 🚀`);
      }

      // Tư vấn tài chính chuyên biệt
      if(msg.includes('tiêu') || msg.includes('chi ') || msg.includes('xài')) {
         if (totalExpense < 0) return resolve(`Cậu đã chỉ tiêu tổng cộng ${fmt(totalExpense)} trong tháng này. Khá là ổn đấy! Hãy tiếp tục duy trì nhé! 💪`);
         return resolve(`Cậu chưa có khoản chi tiêu nào đáng kể. Thật tuyệt vời vì biết cách quản lý hầu bao! 🌟`);
      }

      if(msg.includes('thu') || msg.includes('tiền vào') || msg.includes('nhận')) {
         return resolve(`Tuyệt! Tổng thu nhập của cậu đang ở mức ${fmt(totalIncome)}. Tích tiểu thành đại, đừng vội bung lụa ngay nhé! Hãy đầu tư vào kĩ năng bản thân. 💰`);
      }

      if(msg.includes('còn lại') || msg.includes('tổng số') || msg.includes('số dư')) {
         return resolve(`Dựa trên sổ cái tài sản mình nội suy được, số dư khả dụng thực tế của cậu là ${fmt(currentBalance)}. 💸 Thuật toán của mình luôn túc trực ở đây nếu cậu cần đối soát nà.`);
      }
      
      // Fallback
      resolve(`Hihi, mình là AI quản lý dòng tiền kiêm "bác sĩ tâm lý" của cậu đây! Tín hiệu quét sóng cho thấy tài khoản cậu vừa chạm múc ${fmt(currentBalance)}. Cậu muốn trò chuyện về đầu tư tài chính hay chuyện buồn vui đời sống gì thì cứ nhắn mình nha. 🤖 Khả năng vô hạn mà.`);
    }, 1500); // Thêm độ trễ 1.5s giả vờ như đang load dữ liệu Neural Network thật
  });
};
