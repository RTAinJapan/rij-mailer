require('dotenv').config();
const fs = require('fs');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');


// .envで指定
// process.env.AWS_ACCESS_KEY_ID = "";
// process.env.AWS_SECRET_ACCESS_KEY = "";
const transporter = nodemailer.createTransport({
  SES: new AWS.SES({ apiVersion: '2010-12-01', region: 'ap-northeast-1' }), // SESインスタンスを渡す
});

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

/** メール送る */
const sendMail = async (mail, dryrun) => {
  const subject = `RTA in Japan Winter 2023 入場案内`;

  const text = `RTA in Japan Winter 2023 は本日開催となります。

観客の入場は 本日12月26日 11時～ となります。
どうぞふるってお越しください。
    
また、マスクの案内について一部変更がございます。
来場者数に対し十分な数のマスクを用意するのが難しいため、マスク装着のポリシーを変更します。
  
会場ではマスクの用意があり無料でお渡しできますが、必ず不織布で口と鼻を覆える、できればN95/KF94に相当するマスクのご用意をそれぞれでお願いします。
入場時、上記に相当しない方にマスクをお渡しするので必ず装着をお願いします。
  
また、来場前にご自身の体調は必ず確認してください。咳やくしゃみが出る、喉や頭が痛いなどひとつでも該当する方は来場しないでください。
  
冬の乾燥した時期に長時間大人数が接する場ですので、感染症予防のためご協力をお願いします。
  
------------------
RTA in Japan
`;

  const sendObj = {
    from: 'info@rtain.jp',
    to: mail,
    subject: subject,
    text: text
  };

  fs.appendFileSync("data/senddump.log", JSON.stringify(sendObj, null, "  ") + ",\n");
  if (!dryrun) {
    const result = await transporter.sendMail(sendObj);
    console.log(`${mail} ${result.messageId}`);
  }
}

const main = async (dryrun) => {
  if (dryrun) console.log("★dryrun mode!★")

  const jsonname = `data/list.txt`;
  if (!fs.existsSync(jsonname)) {
    console.error(`file is not found. filename=${jsonname}`);
    return;
  }
  const list = fs.readFileSync(jsonname).toString().split("\n");

  for (const mail of list) {
    if (!mail) continue;
    console.log(`${mail}`);

    try {
      await sendMail(mail, dryrun);
    } catch (e) {
      console.log(`${mail} でエラーが起きた`);
      console.error(e);
    }
    // 1秒間あたりの送信リミットに引っかからないようにsleep入れる
    if (!dryrun) await sleep(100);
  }
}

// メール送信
const dryrun = false;
main(dryrun);
