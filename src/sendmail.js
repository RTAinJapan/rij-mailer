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
const sendMail = async (mail, date, filepath, code) => {
  const subject = `RTA in Japan Summer 2022 入場コード(${date})`;

  const text = `RTA in Japan Summer 2022 ${date}の入場に必要なコードを送付いたします。新型コロナウイルスのワクチン接種証明書と併せて会場の受付に提示してください。

添付画像が表示できない場合は以下のURLにアクセスしてください。
https://rtain.jp/code/?data=${code}


また、事前に以下をご確認の上、ご来場頂ますようお願い致します。

- 入場用リンクの譲渡は厳禁です。
- 入場には新型コロナウイルスワクチンの接種完了が証明できるものが必要です。PCR検査陰性などは代わりになりません。
- 入場時に無料でN95マスクを配布します。特別な理由がない限り着用をお願いします。
- 入場登録に記載した通り、同時に入れる人数は決まっており、必ず会場に入れるとは限りません。
- 会場で荷物は預かれません。持ち物は全て自己責任で管理してください。盗難などの責任も取れません。
- 会場で食事をできるところはありません。
- 会場に入った時点で、配信や撮影のカメラにうつる可能性が常にありますのでご承知ください。
- 会場にゴミ箱はありません。
- 酒類の持ち込みおよび酒気帯びで入場はできません。
- 車椅子スペースなど会場内で特別な対応を希望される方は、できるだけ事前に info@rtain.jp までご連絡ください。
- 会場内や会場周辺での徹夜待機などは近所の迷惑になりますので絶対にやめてください。
- その他の注意事項は https://rtain.jp/audience/ をご確認ください。

------------------
RTA in Japan
`;
  // console.log(text);

  const result = await transporter.sendMail({
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
  });

  console.log(`${mail} ${result.messageId}`);
}

const main = async () => {
  for(const date of ["8月00日"]) {
    const dateId = date.replace("月", "_").replace("日", "");
    const list = JSON.parse(fs.readFileSync(`data/${dateId}.json`).toString());
  
    for(const item of list) {
      console.log(`----------------------- ${item.mail} -----------------------`);

      const qrpath = `data/image/${dateId}/${item.mail.replace("@", "").replace(/\./g, "")}.png`;
      if(!fs.existsSync(qrpath)) {
        console.log(`${qrpath}がありません`);
      } else {
        try {
          await sendMail(item.mail, date, qrpath, item.code);
        } catch(e) {
          console.log(`${mail} でエラーが起きた`);
        }

        // 1秒間あたりの送信リミットに引っかからないようにsleep入れる
        await sleep(100);
      }
    }
  }  
}

// メール送信
main();
