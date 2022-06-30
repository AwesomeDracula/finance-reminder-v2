const targetPriceService = require("../services/targetPrice.service");

async function notification(req, res, next) {
  try {
    const { to, type, symbol, tp, sl } = req.body;
    if (!symbol || !tp || !sl || !to || !type) {
      res.status(400).send("Missing required fields");
    }
    if (isNaN(tp) || isNaN(sl)) {
      res.status(400).send("Take profit and stop loss must be numbers");
    }
    const socket = req.app.get("socketIo");
    if (type === "email") {
      socket.emit("service", "email");
    } else {
      socket.emit("service", "telegram");
    }
    const data = await targetPriceService.create(
      to,
      type,
      symbol,
      tp,
      sl,
      socket
    );
    if (data) {
      res
        .status(200)
        .send(
          JSON.stringify({ message: "Your email has been sent successfully" })
        );
    } else {
      res.status(400).send("Failed");
    }
  } catch (err) {
    console.error(`Error while creating target price`, err.message);
    next(err);
  }
}

module.exports = {
  notification,
};
