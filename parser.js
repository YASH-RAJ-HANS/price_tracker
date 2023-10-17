const nightmare = require("nightmare");
require("dotenv").config();
const cron = require("node-cron");
const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
let price;

async function checkPrice() {
  let nightmareInstance = null;

  try {
    nightmareInstance = nightmare();
    const priceString = await nightmareInstance
      .goto("https://www.amazon.in/realme-Feather-Segment-Charging-Slimmest/dp/B0C45N5VPT/")
      .wait("#corePriceDisplay_desktop_feature_div")
      .evaluate(() => document.getElementById("corePriceDisplay_desktop_feature_div").innerText)
      .end();

    console.log("after end");
    console.log("priceString->", priceString);

    const pattern = /₹(\d{1,3}(?:,\d{3})*)(?![\d,])/;
    const matches = priceString.match(pattern);

    if (matches && matches.length > 1) {
      const mrp = matches[1];
      var numberWithoutCommas = parseFloat(mrp.replace(/,/g, ""));
      price = numberWithoutCommas;
      console.log(numberWithoutCommas);
    } else {
      console.log("MRP not found in the input string.");
    }

    mail();
  } catch (e) {
    console.log(e.message);
  } finally {
    if (nightmareInstance) {
      nightmareInstance.end(); 
    }
  }
}

async function mail() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: "yashhans479@gmail.com",
      to: "yashrajhans4567@gmail.com",
      subject: "price per minute",
      text: `${price}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error:", error.message);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  } catch (e) {
    console.log(e.message);
  }
}

cron.schedule(
  "* * * * *",
  () => {
    checkPrice();
  },
  {
    timezone: "Asia/Kolkata",
  }
);
