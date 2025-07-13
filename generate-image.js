const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const questions = JSON.parse(fs.readFileSync('./data/questions.json', 'utf8'));
const question = questions[0];

async function generateImage() {
  const logoPath = path.resolve('./logo.png');
  const logoBase64 = fs.readFileSync(logoPath, 'base64');

  const html = fs.readFileSync('./templates/question.html', 'utf8')
    .replace('LOGO_PATH', `data:image/png;base64,${logoBase64}`)
    .replace('QUESTION_TEXT', question.question)
    .replace('CHOICE_A', question.choices.A)
    .replace('CHOICE_B', question.choices.B)
    .replace('CHOICE_C', question.choices.C)
    .replace('CHOICE_D', question.choices.D);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
await new Promise(resolve => setTimeout(resolve, 500));

  const outputPath = `output/${question.id}.png`;
  await page.screenshot({ path: outputPath });
  await browser.close();

  console.log('✅ Ảnh đã tạo thành công:', outputPath);
}

generateImage();
