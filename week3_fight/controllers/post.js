const User = require("../models/user");
const Post = require("../models/post");

const axios = require("axios");

const aggressiveEmotion = ["혐오", "분노"];
const positiveEmotion = ["기쁨", "신뢰"];

const AWS = require('aws-sdk');
const fs = require('fs');
const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
const region = 'kr-standard';
const access_key = 'OxzLSiVMnc7XeLWIaPNl'; //본인의 api 액세스 키
const secret_key = '0PjANFs41zpT4NPASu6O75JxhF95i2FXiJCQqq8J'; //본인의 api 시크릿 키

const S3 = new AWS.S3({
  endpoint: endpoint,
  region: region,
  credentials: {
      accessKeyId : access_key,
      secretAccessKey: secret_key
  }
});

exports.getPosts = async (req, res, next) => {
  try {
    let page = req.query.page || 0;
    const number_of_posts = 10;
    const { count, rows } = await Post.findAndCountAll({
      include: [{ model: User, attributes: [] }],
      attributes: ["id", "title", "user.name"],
      limit: number_of_posts,
      offset: page * number_of_posts,
      order: [["id", "DESC"]],
      raw: true
    });

    res.render("post/posts", {
      user: req.user,
      pageNumber: page,
      isLogin: req.user,
      posts: rows,
      count,
      topUsers: req.topUsers,
      topSchools: req.topSchools
    });
  } catch (err) {
    console.log(err);
    res.render("404", { isLogin: res.user });
  }
};

exports.getAddPost = (req, res, next) => {
  res.render("post/add-post", {
    user: req.user,
    isLogin: req.user,
    topUsers: req.topUsers,
    topSchools: req.topSchools
  });
};

exports.postAddPost = async (req, res, next) => {
  const { title, content } = req.body;
  const user = req.user;

  try {
    await user.createPost({ title, content });
    const options = {
      method: "get",
      url: "http://api.adams.ai/datamixiApi/omAnalysis",
      params: { key: "6711351156271231323", query: title, type: "1" }
    };
    const {
      data: {
        return_object: { Result: result }
      }
    } = await axios(options);

    for (const [reliable, emotion] of result) {
      if (aggressiveEmotion.includes(emotion) && reliable > 0.5) {
        await user.update({ score: user.score - 3 });
        break;
      }
      if (positiveEmotion.includes(emotion) && reliable > 0.5) {
        await user.update({ score: user.score + 2 });
        break;
      }
    }
    res.redirect("/posts");
  } catch (err) {
    console.log(err);
    res.redirect("/posts");
  }
};

exports.updateThumbnail = async (req, res) => {
  const { userId, newThumbnail } = req.body;
  userId;
  return res.json({ thumbnail: thumbnail });
};
// edit Thumbnail

exports.editThumbnail = async (req, res, next) => {
  const { userId, newThumbnail } = req.body;
  const user = req.user;

  try {
    await user.createPost({ title, content });
    const options = {
      method: "post",
      url: "http://api.adams.ai/updateThumbnail",
      params: { userid: "", thumbnail: "1" }
    };
    const {
      data: {
        return_object: { Result: result }
      }
    } = await axios(options);
    res.redirect("/posts");
  } catch (err) {
    console.log(err);
    res.redirect("/posts");
  }
};

// end edit Thumnnail

exports.getPost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findByPk(postId);
    const creator = await User.findByPk(post.userId);

    res.render("post/post", {
      post,
      creator,
      user: req.user,
      isLogin: req.user,
      topUsers: req.topUsers,
      topSchools: req.topSchools
    });
  } catch (err) {
    console.log(err);
    res.redirect("/posts");
  }
};

exports.postDeletePost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByPk(postId);

    await post.destroy();

    res.redirect("/posts");
  } catch (err) {
    console.log(err);
    res.redirect("/posts");
  }
};


//그림 추가
exports.addImage = async (req, res, next) => {
  let url = './uploads/'+req.file.filename;

  const bucket_name = 'relayest';
  const local_file_path = url;


  let object_name = Date.now()  + '.png';
  let saveurl = 'http://heovyegsmorj4951114.cdn.ntruss.com/'+object_name+'?type=f&w=100&h=200&autorotate=false&faceopt=true&ttype=png&anilimit=1';
  console.log(saveurl);
  (async () => {

  // create folder
  await S3.putObject({
      Bucket: bucket_name,
      Key: object_name
  }).promise();

  // upload file
  await S3.putObject({
      Bucket: bucket_name,
      Key: object_name,
      ACL: 'public-read',
      // ACL을 지우면 전체공개가 되지 않습니다.
      Body: fs.createReadStream(local_file_path)
  }).promise();

  })();
};