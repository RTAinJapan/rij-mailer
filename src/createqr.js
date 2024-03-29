const fs = require('fs-extra');
const path = require("path");
const QRCode = require('qrcode');

/** QRの画像を生成 */
const createVisitorQr = async () => {
  // ファイル読込
  const list = [];
  for (const date of ["8月10日", "8月11日", "8月12日", "8月13日", "8月14日", "8月15日"]) {
    const jsonname = `data/mail_${date}.json`;
    if (!fs.existsSync(jsonname)) {
      console.error(`JSON file is not found. filename=${jsonname}`);
      continue;
    }

    const json = JSON.parse(fs.readFileSync(jsonname).toString());
    console.log(`${jsonname} は ${json.length} 件のデータ`);

    // データチェック
    for (const item of json) {
      if (!item.day) {
        console.warn(item);
        return;
      }
      if (!item.mail) {
        console.warn(item);
        return;
      }
      if (!item.name) {
        console.warn(item);
        return;
      }
      if (!item.code) {
        console.warn(item);
        return;
      }
    }

    list.push(...json);
  }
  console.log(`計 ${list.length} 件のQRを出力`);
  console.log(list[0]);

  // QR作成
  for (const item of list) {
    const qrpath = `data/image/${item.day}/${item.code}.png`;
    if (!fs.existsSync(path.dirname(qrpath))) {
      fs.mkdirpSync(path.dirname(qrpath));
    }
    if (fs.existsSync(qrpath)) {
      console.warn(`生成済み: ${qrpath}`);
      continue;
    }

    createQr(qrpath, item.code, item.mail);
  }
}

const createQr = (qrpath, code, mail) => {
  const option = {
    type: "png",
    errorCorrectionLevel: "H"
  };

  QRCode.toFile(qrpath, code, option, function (err) {
    if (err) {
      console.log(`${mail} でエラー`);
      console.error(err);
    }
  });
}

const createGuestQr = () => {
  const filename = `data/guest.json`;
  let list = JSON.parse(fs.readFileSync(filename).toString());

  list = list.filter(item => item.mail);

  for (const item of list) {
    console.log(`${item.name} ${item.mail} ${item.code}`);
    const qrpath = `data/image/guest/${item.code}.png`;
    if (!fs.existsSync(path.dirname(qrpath))) {
      fs.mkdirpSync(path.dirname(qrpath));
    }
    if (fs.existsSync(qrpath)) {
      console.warn(`生成済み: ${qrpath}`);
      continue;
    }
    createQr(qrpath, item.code, item.mail);
  }

}

// QR画像を出力
createVisitorQr();
createGuestQr();
