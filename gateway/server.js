const express = require("express");
const {createServer} = require("http");
var bodyParser = require("body-parser"); // thư viện để đọc body khi user gửi lên
const cors = require("cors");

var createError = require("http-errors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var helmet = require("helmet");
var proxy = require("express-http-proxy");
var path = require("path");
var fs = require("fs");
var yaml = require("js-yaml");

var pathFile = path.resolve(process.cwd(), "./config.yml");
var readConfig = fs.readFileSync(pathFile, {encoding: "utf-8"});
var {services} = yaml.load(readConfig, {json: true});
const PORT = 8080;
const app = express();

//khởi tạo Server
// const httpServer = createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

services.forEach(({name, url}) => {
  app.use(`/${name}`, proxy(url, {timeout: 20000}));
});

// app.use("/symbols", proxy("http://localhost:8081", {timeout: 3000}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// httpServer.listen(PORT, () => {
//   console.log("Hello");
// });

app.listen(PORT, () => {
  console.log("Hello");
});
