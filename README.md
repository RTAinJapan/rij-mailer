# RTA in Japan Invitation Mail

入場メールを送る

## 下準備

- .env を作成し、以下を記入

```
AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

- 日付のとこを直す
- 日付ごとのデータを準備
  - `data/8_11.json`

```json
[
  { "timestamp": "2022-07-10T13:00:50.830Z", "mail": "mail@example.com", "name": "なまえ", "code": "111111111111111111111111111111111" },
  ...
]
```

## 実行

```shell
node src/createqr.js
node src/sendmail.js
```
