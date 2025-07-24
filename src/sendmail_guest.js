require('dotenv').config();
const fs = require('fs');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const { parse } = require('csv-parse/sync');

const DRY_RUN = true;

// .envで指定
// process.env.AWS_ACCESS_KEY_ID = "";
// process.env.AWS_SECRET_ACCESS_KEY = "";
const transporter = nodemailer.createTransport({
  SES: new AWS.SES({ apiVersion: '2010-12-01', region: 'ap-northeast-1' }), // SESインスタンスを渡す
});

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

/** メール送る */
const sendMail = async (mail, filepath, code, start_at, end_at, dryrun) => {
  const subject = fs.readFileSync("data/subject.txt").toString();
  const text = fs.readFileSync("data/text.txt").toString().replace("{code}", code).replace("{start_at}", start_at).replace("{end_at}", end_at);

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
    console.log(`${mail} ${result.messageId}`);
  }
}

const main = async (dryrun) => {
  if (dryrun) console.log("★dryrun mode!★")

  const filename = `data/guest.csv`;

  if (!fs.existsSync(filename)) {
    console.error(`file is not found. filename=${filename}`);
    return;
  }

  const data = parse(fs.readFileSync(filename));

  for (const item of data) {
    const mail = item[0];
    const start_at = item[1];
    const end_at = item[2];
    const code = item[3];

    console.log(`${mail} ${start_at} ${end_at} ${code}`);

    const qrpath = `data/image/guest/${code}.png`;
    if (!fs.existsSync(qrpath)) {
      console.log(`${qrpath}がありません`);
    } else {
      try {
        await sendMail(mail, qrpath, code, start_at, end_at, dryrun);
      } catch (e) {
        console.log(`${mail} でエラーが起きた`);
        console.error(e);
      }

      // 1秒間あたりの送信リミットに引っかからないようにsleep入れる
      await sleep(100);
    }
  }
}

// メール送信
main(DRY_RUN);
