const path = require("path");

const express = require("express");
const {sequelize,DB_INFO} = require("./util/database");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const app = express();

// const DB_INFO = {
//   host: "localhost",
//   port: 3306,
//   user: "relay7",
//   password: "q1w2e3r4t5",
//   database: "relay7",
//   clearExpired: true,
// }

const store = new MySQLStore(DB_INFO);

// model
const User = require("./models/user");
const Post = require("./models/post");
const School = require("./models/school");

// template engine setting ~ ejs
app.set("view engine", "ejs");
// view base directory setting ~ views
app.set("views", "views");

// file loader
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "dplandplan",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// locals
app.use(async (req, res, next) => {
  res.locals.pageTitle = "Relay 07 I Love School";

  if (!req.session.user) return next();

  const user = await User.findByPk(req.session.user.id);

  const school = await School.findByPk(user.schoolId);
  user.school = school;
  req.user = user;
  next();
});

// router
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");

// db relation
// user:school = M:1
User.belongsTo(School);
School.hasMany(User);
// user:post = 1:M
Post.belongsTo(User);
User.hasMany(Post);

// routing
app.use(authRoutes);
app.use(postRoutes);
app.use(userRoutes);

// error 404 controller
const errorController = require("./controllers/error");

// error 404 route
app.use(errorController.get404);

sequelize
  .sync()
  .then(() => {
    app.listen(3000);
  })
  .then((err) => console.log(err));
