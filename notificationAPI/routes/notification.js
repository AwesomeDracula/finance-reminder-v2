var express = require("express");
var router = express.Router();
const notification = require("../controllers/notification.controller");

router.post("/email", notification.sendEmail);
router.post("/telegram", notification.sendTelegram);

module.exports = router;
