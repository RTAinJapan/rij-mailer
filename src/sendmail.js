require('dotenv').config();
const fs = require('fs');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const { parse } = require('csv-parse/sync');


// .envで指定
// process.env.AWS_ACCESS_KEY_ID = "";
// process.env.AWS_SECRET_ACCESS_KEY = "";
const transporter = nodemailer.createTransport({
  SES: new AWS.SES({ apiVersion: '2010-12-01', region: 'ap-northeast-1' }), // SESインスタンスを渡す
});

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

/** メール送る */
const sendMail = async (mail, date, filepath, code, dryrun) => {
  const subject = fs.readFileSync("data/subject.txt").toString().replace("{date}", date);
  const text = fs.readFileSync("data/text.txt").toString().replace("{date}", date).replace("{code}", code);

  const sendObj = {
    from: 'info@rtain.jp',
    to: mail,
    subject: subject,
    text: text,
    // 添付ファイル
    attachments: [
      {
        filename: 'code.png',
        path: filepath,
      },
    ],
  };

  fs.appendFileSync("data/senddump.log", JSON.stringify(sendObj, null, "  ") + ",\n");
  if (!dryrun) {
    const result = await transporter.sendMail(sendObj);
    const msg = `${mail} ${result.messageId}`;
    console.log(msg);
    fs.appendFileSync("data/senddump.log", msg + "\n");
  }
}

const main = async (dryrun) => {
  if (dryrun) console.log("★dryrun mode!★")

  for (const date of ["0月0日"]) {
    // for (const date of ["8月9日", "8月10日", "8月11日", "8月12日", "8月13日", "8月14日", "8月15日"]) {
    const filename = `data/${date}.csv`;
    if (!fs.existsSync(filename)) {
      console.error(`file is not found. filename=${filename}`);
      continue;
    }

    const data = parse(fs.readFileSync(filename));
    console.log(`================= ${date} ==========================`);

    for (const item of data) {
      const mail = item[0];
      const code = item[1];
      console.log(`${mail} ${date} ${code}`);

      const qrpath = `data/image/${date}/${code}.png`;
      if (!fs.existsSync(qrpath)) {
        console.log(`${qrpath}がありません`);
      } else {
        try {
          await sendMail(mail, date, qrpath, code, dryrun);
        } catch (e) {
          console.log(`${mail} でエラーが起きた`);
          console.error(e);
        }

        // 1秒間あたりの送信リミットに引っかからないようにsleep入れる
        if (!dryrun) await sleep(100);
      }
    }
  }
}

// メール送信
const dryrun = true;
main(dryrun);
