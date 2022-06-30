const emailService = require("../services/mailer.service");
const telegramService = require("../services/telegram.service");

async function sendEmail(req, res, next) {
  try {
    const {to, subject, htmlContent} = req.body;
    if (!to || !subject || !htmlContent) {
      res.status(400).send("Missing required fields");
    }
    emailService
      .sendMail(to, subject, htmlContent)
      .then(() => {
        res.status(200).send("Email sent");
      })
      .catch((err) => {
        res.status(400).send("Error sending email");
      });
  } catch (err) {
    console.error(`Error while creating target price`, err.message);
    next(err);
  }
}

async function sendTelegram(req, res, next) {
  try {
    const {chatId, message} = req.body;
    if (!chatId || !message) {
      res.status(400).send("Missing required fields");
    }
    telegramService
      .sendMessage(chatId, message)
      .then(() => {
        res.status(200).send("Telegram sent");
      })
      .catch((err) => {
        res.status(400).send("Error sending telegram");
      });
  } catch (error) {
    console.error(`Error while send telegram`, err.message);
    next(err);
  }
}

module.exports = {
  sendEmail,
  sendTelegram,
};
