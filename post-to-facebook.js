require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Load câu hỏi
const questions = JSON.parse(fs.readFileSync('./data/questions.json', 'utf8'));
const question = questions[0]; // Tạm thời dùng câu đầu tiên

// Tạo caption hiển thị trên Facebook
const caption = `${question.question}

(A) ${question.choices.A}
(B) ${question.choices.B}
(C) ${question.choices.C}
(D) ${question.choices.D}

✏️ Trả lời đúng bạn nhé! Đáp án sẽ được cập nhật sau vài giờ.`;

async function postToFacebook() {
  const pageId = process.env.PAGE_ID;
  const accessToken = process.env.FB_ACCESS_TOKEN;
  const imagePath = path.resolve(`./output/${question.id}.png`);

  const form = new FormData();
  form.append('message', caption);
  form.append('access_token', accessToken);
  form.append('source', fs.createReadStream(imagePath)); // file ảnh

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/photos`,
      form,
      { headers: form.getHeaders() }
    );
    console.log('✅ Đăng thành công! ID bài viết:', res.data.post_id || res.data.id);
// Ghi lại post ID và question ID
fs.writeFileSync('./post-log.json', JSON.stringify({
  last_post_id: res.data.post_id || res.data.id,
  last_question_id: question.id
}, null, 2));

  } catch (err) {
    console.error('❌ Lỗi khi đăng bài:', err.response?.data || err.message);
  }
}

postToFacebook();
