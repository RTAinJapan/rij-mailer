/**
 * 全員に同じ内容のメールを送る
 */
require('dotenv').config();
const fs = require('fs');
const AWS = require('aws-sdk');

// .envで指定
// process.env.AWS_ACCESS_KEY_ID = "";
// process.env.AWS_SECRET_ACCESS_KEY = "";
const ses = new AWS.SES({ apiVersion: '2010-12-01', region: 'ap-northeast-1' });

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

/** 
 * メール送る
 * @param {string} mail
 * @param {string} subject
 * @param {string} text
 * @param {boolean} dryrun
 */
const sendMail = async (mail, subject, text, dryrun) => {
  const params = {
    Destination: {
      ToAddresses: [mail],
    },
    Message: {
      Body: {
        Text: {
          Data: text,
          Charset: 'utf-8'
        },
      },
      Subject: {
        Data: subject,
        Charset: 'utf-8',
      },
    },
    // From
    Source: 'info@rtain.jp',
  };

  fs.appendFileSync("data/senddump.log", JSON.stringify(params, null, "  ") + ",\n");
  if (!dryrun) {
    ses.sendEmail(params, (err, res) => {
      if (err) {
        console.log(err);
      }
      console.log(res);
    });
  } else {
    console.log("送ったフリ");
  }
}

/**
 * 
 * @param {boolean} dryrun 
 */
const main = async (dryrun) => {
  if (dryrun) console.log("★dryrun mode!★");

  const subject = `RTA in Japan Winter 2022ご来場の皆様へ`;
  const addressList = fs.readFileSync("./data/sendmail_address.csv").toString().split("\n").map(item => item.trim()).filter(item => !!item);
  const text = fs.readFileSync("./data/sendmail_text.csv").toString();
  if (!addressList || !addressList.length > 0 || !text) {
    console.warn("なんかおかしい");
    return;
  }
  // console.log(addressList);

  for (const address of addressList) {
    try {
      console.log(address);
      await sendMail(address, subject, text, dryrun);
    } catch (e) {
      console.log(`${JSON.stringify(addressList)} でエラーが起きた`);
      console.error(e);
    }
    await sleep(100);
  }
}

// メール送信
const dryrun = true;
main(dryrun);
