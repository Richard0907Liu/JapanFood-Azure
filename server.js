var createError = require("http-errors");
var express = require("express"); // to connect the Express Server
var path = require("path");
var cookieParser = require("cookie-parser"); // can use cookie
/**Morgan doing this work for you, it is printing out,
 * tracing this information */
var logger = require("morgan");
var session = require("express-session");
// This takes the session as its parameters. This session referring to 'cookie-parser' that we've just imported on here
//var FileStore = require("session-file-store")(session);
var passport = require("passport");

var indexRouter = require("./routes/index"); //
var usersRouter = require("./routes/users");
var dishRouter = require("./routes/dishRouter");
var promoRouter = require("./routes/promoRouter");
var leaderRouter = require("./routes/leaderRouter");
var uploadRouter = require("./routes/uploadRouter");
var favoriteRouter = require("./routes/favoriteRouter");
var commentRouter = require("./routes/commentRouter");
var contactusRouter = require("./routes/contactusRouter");

// connect to mongodb server and the collection Dishes
const mongoose = require("mongoose");

const Dishes = require("./models/dishes");

var app = express();

//const url = config.mongoUrl;  // connect to local mongodb device
////// Connect to mongodb Atlas on localhots
// const url =
//   "mongodb+srv://RenchaoLiu:Mercedes7@cluster0-qawga.mongodb.net/test?retryWrites=true&w=majority";

// on Heroku
const url =
  "mongodb://RenchaoLiu:Mercedes7@cluster0-shard-00-00-qawga.mongodb.net:27017,cluster0-shard-00-01-qawga.mongodb.net:27017,cluster0-shard-00-02-qawga.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";

//console.log('config.mongoUrl: ', url);
const connect = mongoose.connect(url, {
  dbName: "JapaneseFood",
  useNewUrlParser: true,
  useCreateIndex: true, // git rid of this, DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
  useFindAndModify: false
});

connect.then(
  db => {
    console.log("Correctly connected  to mongoDB Cloud server");
    //console.log('db == ', db);
    //console.log('db.models == ', db.models);
  },
  err => {
    console.log(err);
  }
);

// Init middleware
app.use(express.json({ extended: false }));

// app.get("/", (req, res) => {
//   // workable
//   res.send("API Running");
// });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
////
app.use("/users", usersRouter);

///////
//this call here app.use(express.static) is what enables us to serve static data
//from the public folder
// Not use in production mode
app.use(express.static(path.join(__dirname, "public")));
////////

// move app.use('/') and app.use('/users') up before the authentication step
app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);
app.use("/imageUpload", uploadRouter);
app.use("/favorites", favoriteRouter);
app.use("/comments", commentRouter);
app.use("/contactus", contactusRouter);

// Serve static assets in production
///
console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// Those two are additional error handlers
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  console.log("app.use() for err!!!!");
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;
