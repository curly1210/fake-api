// vnpay-server.js
import express from "express";
import cors from "cors";
import moment from "moment";
import crypto from "crypto";
import qs from "querystring";

const app = express();
app.use(cors());
app.use(express.json());

function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

const tmnCode = "PVTDLWEF";
const secretKey = "OO4KFGH39Q3JW40WX6B66J6WUKTX96FH";
const returnUrl = "http://localhost:5173/payment-result"; // Trang kết quả
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

app.get("/create_payment_url", (req, res) => {
  const { amount } = req.query;
  const ipAddr = req.ip;

  const bankCode = "NCB";
  const orderId = moment().format("YYYYMMDDHHmmss");
  const createDate = moment().format("YYYYMMDDHHmmss");

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: "Thanh_toan_don_hang",
    vnp_OrderType: "billpayment",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  if (bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params);
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  const paymentUrl = vnp_Url + "?" + qs.stringify(vnp_Params);
  res.json({ paymentUrl });
});

app.get("/check_payment", (req, res) => {
  const query = req.query;
  const secretKey = "OO4KFGH39Q3JW40WX6B66J6WUKTX96FH";
  const vnp_SecureHash = query.vnp_SecureHash;

  delete query.vnp_SecureHash;
  const signData = qs.stringify(query);

  const hmac = crypto.createHmac("sha512", secretKey);
  const checkSum = hmac.update(signData).digest("hex");
  console.log(query);

  if (vnp_SecureHash === checkSum) {
    if (query.vnp_ResponseCode === "00") {
      res.json({ message: "Thanh toán thành công", data: query });
    } else {
      res.json({ message: "Thanh toán thất bại", data: query });
    }
  } else {
    res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }
});

app.listen(3001, () => {
  console.log("VNPay mock server (sandbox) đang chạy ở http://localhost:3001");
});
