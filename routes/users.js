var express = require("express");
const bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
var authenticate = require("../authenticate");
const cors = require("./cors");

var router = express.Router();
router.use(bodyParser.json());

/** Now, in the users.js file we need to add in another router.options field here, because sometimes
 * a post request as you saw with the login will send the options first to check, especially with CORS,
 *  whether the post request will be allowed. */
router.options("*", cors.cors, (req, res) => {
  res.sendStatus(200);
});
/**GET users listing */
router.get(
  "/",
  cors.cors,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  function(req, res, next) {
    User.find({})
      .then(
        users => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(users);
        },
        err => next(err)
      )
      .catch(err => next(err));
  }
);

router.post("/signup", cors.cors, function(req, res, next) {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      // console.log("/signup, req: ", req.body);
      // console.log("/signup, req.user: ", req.user);
      if (err) {
        // username already exists
        res.stateCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }

          passport.authenticate("local")(req, res, () => {
            // I Added for make favorite method works
            var token = authenticate.getToken({ _id: req.user._id }); // works?? YES it works

            res.stateCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({
              success: true,
              status: "Registration Successful!",
              token: token
            });
          });
        });
      }
    }
  );
});
// To return meaningful message when unauthenicated
router.post("/login", cors.cors, (req, res, next) => {
  // if authenicate err returned, the passport.authenticate can be made to return the error value
  // or if there is no error then it will return the user
  /**So, this is the structure when you need to call passport.authenticate and expect it to pass you back information like this as a callback method here
   * , so you also need to supply this req, res, next right there too. */
  passport.authenticate("local", (err, user, info) => {
    // move to here because passport needs to return more information here
    if (err) return next(err);
    if (!user) {
      // if user not found
      res.stateCode = 401;
      res.setHeader("Content-Type", "application/json");
      // no token passed back. The third parameter is for err
      res.json({ success: false, status: "Login Unsuccessful!", err: info });
    }
    // user is not null
    // just simply pass in the user object that we've obtained.
    req.logIn(user, err => {
      // console.log("/logIn, req: ", req.body);
      // console.log("/logIn, user: ", user);
      if (err) {
        res.stateCode = 401;
        res.setHeader("Content-Type", "application/json");
        res.json({
          success: false,
          status: "Login Unsuccessful!",
          err: "Could not log in user!"
        });
      }
      // console.log("Login req.user._id: ", req.user._id);
      // console.log("Login req.user: ", req.user);
      // console.log("Login req.body: ", req.body);
      // user exists and no error, can give token
      var token = authenticate.getToken({ _id: req.user._id });
      res.stateCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: true, status: "Login Successful!", token: token });
    });
  })(req, res, next); // So, this is the structure when you need to call passport.authenticate and expect it to pass you back information like this as a callback method here, so you also need to supply this req, res, next right there too.
});

router.get("/logout", cors.cors, (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    var err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
});

// Now, we're going to be using Facebook for logging in the user.
router.get(
  "/facebook/token",
  passport.authenticate("facebook-token"),
  (req, res) => {
    /** So, at this point, we would say, if (req.user), now notice that when we call passport.authenticate with
     * the facebook-token strategy. This, if passport.authenticate() is successful, it would have loaded in the user into the request object. */
    if (req.user) {
      /** So essentially, the user is sending the access token to the express server, the express server uses the accessToken to go to Facebook
       * and then fetch the profile of the user. And if the user doesn't exist, we'll create a new user with that Facebook ID.*/
      var token = authenticate.getToken({ _id: req.user._id });
      res.stateCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        token: token,
        status: "You are Successfully logged in by Facebook account!"
      });
    }
  }
);

// for integrating client side and server side
/** It is quite possible that while the client has logged in and obtain the JSON Web Token, sometime later,
 * the JSON Web Token may expire. It is quite possible that while the client has logged in and obtain the JSON Web Token, sometime later,
 * the JSON Web Token may expire. So, at periodic intervals, we may wish to cross-check to make sure that the JSON Web Token is still valid.
 *If it is not valid, then the client-side can initiate another login for the user to obtain a new JSON Web Token if required.*/
router.get("/checkJWTTOken", cors.cors, (req, res) => {
  // return true or false for valid JWT or not valid
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT invalid!", success: false, err: info });
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT valid!!!", success: true, user: user });
    }
  })(
    req,
    res
  ); /**So, notice that whenever you call passport authenticate and expect this callback function in here
  , you need to append to this point req and res to the passport authenticate at the back here. */
});
module.exports = router;
