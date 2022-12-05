const fs = require('fs-extra');
const path = require("path");
const QRCode = require('qrcode');

/** QRの画像を生成 */
const createVisitorQr = async () => {
  // ファイル読込
  const list = [];
  for (const date of ["12月26日", "12月27日", "12月28日", "12月29日", "12月30日", "12月31日"]) {
    const filename = `mail_${date}`
    const json = JSON.parse(fs.readFileSync("data/" + filename + ".json").toString());
    console.log(`${filename} は ${json.length} 件のデータ`);

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
