const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { Post, User } = require("../models");

const router = express.Router();

router.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { title: "내 정보 - NodeBird", user: req.user });
});

router.get("/join", isNotLoggedIn, (req, res) => {
  res.render("join", {
    title: "회원가입 - NodeBird",
    user: req.user,
    joinError: req.flash("joinError"),
  });
});

router.get("/", (req, res, next) => {
  Post.findAll({
    // when need data associated with a particular model which isn't in the model's table directly.
    // include means 'inner join'
    // specify all posts from user in DB.
    include: {
      model: User,
      attributes: ["id", "nick"],
    },
    order: [["createdAt", "DESC"]],
  })
    .then((posts) => {
      res.render("main", {
        title: "NodeBird",
        twits: posts,
        user: req.user,
        loginError: req.flash("loginError"),
      });
    })
    .catch((error) => {
      console.error(error);
      next(error);
    });
});

module.exports = router;
