const symbolsService = require("./symbols.service");
// const mailer = require("./mailer.service");
// const telegram = require("./telegram.service");
const _ = require("lodash");
const superagent = require("superagent");

const body = "Hello world";
const TP = "Take Profit Now!";
const SL = "Stop Loss Now!";

async function create(to, type, symbol, tp, sl, socket) {
  try {
    const symbolIntradayData = await symbolsService.getSymbolIntraday(symbol);
    const metaData = symbolIntradayData["Meta Data"];
    const latestDay = metaData["3. Last Refreshed"].substring(0, 10);
    const series = symbolIntradayData["Time Series (1min)"];
    const latestData = _.flow([
      Object.entries,
      (arr) => arr.filter(([key, value]) => key.includes(latestDay)),
      Object.fromEntries,
    ])(series);
    const timer = setInterval(async function () {
      const currentDate = new Date();
      let curHour =
        currentDate.getHours() < 10
          ? `0${currentDate.getHours()}`
          : currentDate.getHours();
      let curMin =
        currentDate.getMinutes() < 10
          ? `0${currentDate.getMinutes()}`
          : currentDate.getMinutes();
      const key = latestDay + " " + curHour + ":" + curMin + ":00";
      const data = latestData[key];
      if (!data) {
        return false;
      }
      if (tp <= parseFloat(data["4. close"])) {
        if (type === "telegram") {
          await superagent
            .post("https://localhost:8083/telegram")
            .send({
              chatId: to,
              message: `Let's sell now at price ${parseFloat(
                data["4. close"]
              )} to get profit!`,
            });
          // telegram.sendMessage(
          //   to,
          //   `Let's sell now at price ${parseFloat(
          //     data["4. close"]
          //   )} to get profit!`
          // );
        } else {
          await superagent
            .post("http://localhost:8083/email")
            .send({
              to,
              subject: TP,
              htmlContent: `Let's sell now at price ${parseFloat(
                data["4. close"]
              )} to get profit!`,
            });
          // mailer.sendMail(
          //   to,
          //   TP,
          //   `Let's sell now at price ${parseFloat(
          //     data["4. close"]
          //   )} to get profit!`
          // );
        }
        console.log("TP");
        socket.emit("service", undefined);
        clearInterval(timer);
      } else if (sl >= parseFloat(data["4. close"])) {
        if (type === "telegram") {
          await superagent
            .post("https://localhost:8083/telegram")
            .send({
              chatId: to,
              message: `Let's sell now at price ${parseFloat(
                data["4. close"]
              )} to save your money!`,
            });
          // telegram.sendMessage(
          //   to,
          //   `Let's sell now at price ${parseFloat(
          //     data["4. close"]
          //   )} to save your money!`
          // );
        } else {
          await superagent
            .post("http://localhost:8083/email")
            .send({
              to,
              subject: SL,
              htmlContent: `Let's sell now at price ${parseFloat(
                data["4. close"]
              )} to save your money!`,
            });
          // mailer.sendMail(
          //   to,
          //   SL,
          //   `Let's sell now at price ${parseFloat(
          //     data["4. close"]
          //   )} to save your money!`
          // );
        }

        console.log("SL");
        socket.emit("service", undefined);
        clearInterval(timer);
      } else {
        console.log("Nothing");
      }
    }, 60000);
    return latestData;
  } catch (err) {
    return false;
  }
}

module.exports = {
  create,
};
