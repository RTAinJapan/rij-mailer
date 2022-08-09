const fs = require('fs');
const QRCode = require('qrcode');

/** QRの画像を生成 */
const createQr = async() => {
  // ファイル読込
  const list = [];
  for(const filename of ["8_11", "8_12","8_13","8_14","8_15"]) {
    const json = JSON.parse(fs.readFileSync("data/"+filename+".json").toString());
    json.map((value)=> value.day = filename);

    list.push(...json);
  }
  console.log(list[0]);

  // QR作成
  for(const item of list) {
    const qrpath = `data/image/${item.day}/${item.mail.replace("@", "").replace(/\./g, "")}.png`;
    const text = item.code;
    const option = {
      type: "png",
      errorCorrectionLevel: "H"
    };

    QRCode.toFile(qrpath, text, option, function (err) {
      if(err){
        console.log(`${item.mail} でエラー`);
        console.log(err);  
      }
    });
  }
}

// QR画像を出力
createQr();
