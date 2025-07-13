require('dotenv').config();
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');
const FormData = require('form-data');

// 1. Chọn ngẫu nhiên 1 câu chưa đăng
const questions = JSON.parse(fs.readFileSync('./data/questions.json', 'utf8'));
const used = JSON.parse(fs.existsSync('./used.json') ? fs.readFileSync('./used.json', 'utf8') : '[]');
const unused = questions.filter(q => !used.includes(q.id));
if (unused.length === 0) {
  console.log('✅ Đã đăng hết câu hỏi!');
  process.exit(0);
}
const question = unused[Math.floor(Math.random() * unused.length)];

// 2. Tạo ảnh
async function generateImage() {
  const logoBase64 = fs.readFileSync('./logo.png', 'base64');
  const html = fs.readFileSync('./templates/question.html', 'utf8')
    .replace('LOGO_PATH', `data:image/png;base64,${logoBase64}`)
    .replace('QUESTION_TEXT', question.question)
    .replace('CHOICE_A', question.choices.A)
    .replace('CHOICE_B', question.choices.B)
    .replace('CHOICE_C', question.choices.C)
    .replace('CHOICE_D', question.choices.D);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html);
  await new Promise(r => setTimeout(r, 500));
  const outputPath = `./output/${question.id}.png`;
  await page.screenshot({ path: outputPath });
  await browser.close();
  return outputPath;
}

// 3. Đăng lên Facebook
async function postToFacebook(imagePath) {
  const form = new FormData();
  const caption = `${question.question}

(A) ${question.choices.A}
(B) ${question.choices.B}
(C) ${question.choices.C}
(D) ${question.choices.D}

✏️ Trả lời đúng bạn nhé! Đáp án sẽ có sau vài giờ.`;

  form.append('message', caption);
  form.append('access_token', process.env.FB_ACCESS_TOKEN);
  form.append('source', fs.createReadStream(imagePath));

  const res = await axios.post(`https://graph.facebook.com/v18.0/${process.env.PAGE_ID}/photos`, form, {
    headers: form.getHeaders(),
  });

  // Ghi lại ID bài post
  fs.writeFileSync('./post-log.json', JSON.stringify({
    last_post_id: res.data.post_id || res.data.id,
    last_question_id: question.id
  }, null, 2));

  // Ghi vào used
  used.push(question.id);
  fs.writeFileSync('./used.json', JSON.stringify(used));

  console.log('✅ Đăng thành công!', res.data.post_id || res.data.id);
}

(async () => {
  const imgPath = await generateImage();
  await postToFacebook(imgPath);
})();
