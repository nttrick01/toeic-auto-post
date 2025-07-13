require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const postLog = JSON.parse(fs.readFileSync('./post-log.json', 'utf8'));
const questions = JSON.parse(fs.readFileSync('./data/questions.json', 'utf8'));
const question = questions.find(q => q.id === postLog.last_question_id);
const postId = postLog.last_post_id;

if (!question || !postId) {
  console.error('❌ Không tìm thấy câu hỏi hoặc post ID.');
  process.exit(1);
}

const comment = `✅ Đáp án đúng là (${question.correct}) ${question.choices[question.correct]}

**Giải thích:** ${question.explanation}
**Dịch nghĩa:** ${question.translation}
`;

(async () => {
  const res = await axios.post(
    `https://graph.facebook.com/${postId}/comments`,
    {
      message: comment,
      access_token: process.env.FB_ACCESS_TOKEN
    }
  );
  console.log('💬 Đã comment đáp án thành công:', res.data);
})();
