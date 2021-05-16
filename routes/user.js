const express = require("express");
const bcrypt = require("bcrypt");

const { isLoggedIn } = require("./middlewares");
const { User } = require("../models");

const router = express.Router();

router.post("/:id/follow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    await user.addFollowing(parseInt(req.params.id, 10));
    res.send("success");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/:id/unfollow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    // console.log("Follwer ID: ", req.user.id);
    // console.log("Following ID : ", req.params.id);
    await user.removeFollowing(parseInt(req.params.id, 10));
    res.send("success");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Edit Profile , ChangePassword

router.get("/editProfile", isLoggedIn, (req, res) => {
  res.render("editProfile", { title: "프로필 수정", user: req.user });
});

router.post("/editProfile", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    const {
      body: { nick, email },
    } = req;
    user.update({ email: email, nick: nick });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/changePassword", isLoggedIn, (req, res) => {
  res.render("changePassword", {
    title: "비밀번호 변경 - NodeBird",
    user: req.user,
    passwordError: req.flash("passwordError"),
  });
});

router.post("/changePassword", isLoggedIn, async (req, res, next) => {
  try {
    const {
      body: { oldPassword, newPassword1, newPassword2 },
    } = req;
    const user = await User.findOne({ where: { id: req.user.id } });
    const result = await bcrypt.compare(oldPassword, user.password);
    if (result) {
      if (newPassword1 === newPassword2) {
        const hash = await bcrypt.hash(newPassword1, 12);
        user.update({ password: hash });
        res.redirect("/");
      } else {
        req.flash("passwordError", "새 패스워드는 동일해야 합니다.");
        return res.redirect("/user/changePassword");
      }
    } else {
      req.flash("passwordError", "기존 패스워드와 동일한 값이 아닙니다.");
      return res.redirect("/user/changePassword");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
