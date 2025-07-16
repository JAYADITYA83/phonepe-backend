const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

async function getAccessToken() {
  const res = await axios.post("https://api-preprod.phonepe.com/oauth/token", {
    clientId,
    clientSecret,
  });
  return res.data.accessToken;
}

app.post("/create-payment", async (req, res) => {
  const { amount } = req.body;
  const txnId = "TXN" + Date.now();

  try {
    const token = await getAccessToken();

    const payRes = await axios.post(
      "https://api-preprod.phonepe.com/pg/v3/pay",
      {
        merchantTransactionId: txnId,
        merchantId: clientId,
        amount: amount * 100,
        merchantUserId: "user001",
        redirectUrl: "https://yourwebsite.com/success",
        redirectMode: "POST",
        paymentInstrument: { type: "PAY_PAGE" },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const payUrl = payRes.data.data.instrumentResponse.redirectInfo.url;
    res.json({ url: payUrl });
  } catch (err) {
  console.error("❌ Error creating payment:", err.response?.data || err.message);
  res.status(500).json({ error: err.response?.data || err.message });
}


app.get("/", (req, res) => res.send("✅ PhonePe backend is running"));

app.listen(10000, () => {
  console.log("✅ Server running on port 10000");
});
