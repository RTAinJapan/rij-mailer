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
const sendMail = async (mail, date, filepath, code, dryrun) => {
  const subject = `RTA in Japan Winter 2022 入場コード(${date})`;

  const text = `RTA in Japan Winter 2022 ${date}の入場が当選しました。

  入場に必要なQRコードを送付いたします。
  新型コロナウイルスのワクチン接種証明書と併せて、会場の受付に提示してください。
  
  添付画像が表示できない場合は以下のURLにアクセスしてください。
  https://rtain.jp/code/?data=${code}


また、事前に以下をご確認の上、ご来場頂きますようお願い致します。
- 入場用リンクの譲渡は厳禁です。
- 入場には新型コロナウイルスワクチンの接種完了が証明できるものが必要です。PCR検査陰性などは代わりになりません。
- 入場時に無料でN95マスクを配布します。特別な理由がない限り着用をお願いします。
- 会場に滞在可能な時間は当選日の00:00～23:59となります。日を跨いで滞在する場合は、翌日のコードによる再認証が必要です。
- 入場登録フォームに記載した通り、同時に入れる人数は決まっており、必ず会場に入れるとは限りません。
- 会場で荷物は預かれません。持ち物は全て自己責任で管理してください。盗難などの責任も取れません。
- 会場で食事をできるところはありません。
- 会場に入った時点で、配信や撮影のカメラに映る可能性が常にありますのでご承知ください。
- ゴミは各自で持ち帰って下さい。
- 酒類の持ち込みおよび酒気帯びで入場はできません。
- 車椅子スペースなど会場内で特別な対応を希望される方は、できるだけ事前に info@rtain.jp までご連絡ください。
- 会場周辺での徹夜待機などは近所の迷惑になりますので絶対にやめてください。
- その他の注意事項は https://rtain.jp/audience/ をご確認ください。

------------------
RTA in Japan
`;

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

  for (const date of ["12月26日", "12月27日", "12月28日", "12月29日", "12月30日", "12月31日"]) {
    const list = JSON.parse(fs.readFileSync(`data/mail_${date}.json`).toString());
    console.log(`================= ${date} ==========================`);

    for (const item of list) {
      console.log(`${item.mail} ${date} ${item.code}`);

      const qrpath = `data/image/${date}/${item.code}.png`;
      if (!fs.existsSync(qrpath)) {
        console.log(`${qrpath}がありません`);
      } else {
        try {
          await sendMail(item.mail, date, qrpath, item.code, dryrun);
        } catch (e) {
          console.log(`${mail} でエラーが起きた`);
        }

        // 1秒間あたりの送信リミットに引っかからないようにsleep入れる
        await sleep(100);
      }
    }
  }
}

// メール送信
main(false);
