require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Đọc dữ liệu post gần nhất
const postLog = JSON.parse(fs.readFileSync('./post-log.json', 'utf8'));
const questions = JSON.parse(fs.readFileSync('./data/questions.json', 'utf8'));
const question = questions.find(q => q.id === postLog.last_question_id);

if (!question || !postLog.last_post_id) {
  console.error('❌ Không tìm thấy dữ liệu bài post hoặc câu hỏi.');
  process.exit(1);
}

// Soạn nội dung comment
const comment = `✅ Đáp án đúng là (${question.correct}) ${question.choices[question.correct]}

**Giải thích:** ${question.explanation}
**Dịch nghĩa:** ${question.translation}
`;

async function commentAnswer() {
  const pageId = process.env.PAGE_ID;
  const accessToken = process.env.FB_ACCESS_TOKEN;
  const postId = postLog.last_post_id;

  try {
    const res = await axios.post(
      `https://graph.facebook.com/${postId}/comments`,
      {
        message: comment,
        access_token: accessToken
      }
    );
    console.log('💬 Comment thành công!');
  } catch (err) {
    console.error('❌ Lỗi khi comment:', err.response?.data || err.message);
  }
}

commentAnswer();
