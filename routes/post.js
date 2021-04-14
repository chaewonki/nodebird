const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { Post, Hashtag, User } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();

// create folder
fs.readdir("uploads", (error) => {
  if (error) {
    console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
    fs.mkdirSync("uploads");
  }
});

// put options in Multer moudle
// upload is an Object which creates middleware
// single, array, fields, none in upload
// single uses for uploading one image and creates req.file Object
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// router uploading image.
// "img" in single("img") is property used through AJAX
// this upload.single middleware handle image and save result in req.file Object.
/* 
    req.file 
    {   fieldname:'img',
        originalname:'nodejs.png',
        encoding: '7bit',
        mimetype: 'image/png',
        destination: 'uploads/',
        filename: 'nodejs1514187844339.png',
        path: 'uploads\\nodejs1514187844339.png
        size: 53357
    }
*/
router.post("/img", isLoggedIn, upload.single("img"), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

// router uploading post. If with image, then imgage address would be sent to req.body.url.
const upload2 = multer();
router.post("/", isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      userId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) =>
          Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          })
        )
      );
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/hashtag", async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect("/");
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    return res.render("main", {
      title: `${query} | NodeBird`,
      user: req.user,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
