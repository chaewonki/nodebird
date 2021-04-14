const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
require("dotenv").config();

const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const passportConfig = require("./passport");
const { sequelize } = require("./models");

const app = express();
sequelize.sync();
passportConfig(passport);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("port", process.env.PORT || 8001);

app.use(morgan("dev"));
/* 
  To serve static files such as images, CSS files, and JavaScript files, use the express.static built in middleware function in Express.
  To create a virtual path prepix(where the path does not actually exist in the file system) 
  for the files that are served by the expess.ststic function specify a mount path for the static directroy
*/
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));

/*
  body-parser is middleware that interpretes request body.
  usually, used with formdata or AJAX request.
  formdata is transffred by URL-encoded method
  {extended:ture} --> use qs module which is npm pacakge
  {extended:false} --> use querystring module which is built-in module
*/
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/*
  If cookie is signed, when client amend cookie, then error happens
*/
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
