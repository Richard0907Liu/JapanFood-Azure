// connect to Express Server
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");

const Favorites = require("../models/favorites");

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.cors, (req, res) => {
    res.sendStatus(200);
  })
  // not need 'authenticate.verifyadmin' to see admin's favorites
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    //console.log('SSSSSSSSSSSssuccessfully go to get()');
    //console.log('req.user: ', req.user);
    Favorites.findOne({ user: req.user._id }) // wrong ande get error 500
      .populate("user") //
      .populate("dishes") //
      .then(
        (favorites, err) => {
          if (err) return next(err);
          //console.log('req.user._id: ', req.user._id);
          //console.log('favorites: ', favorites);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        err => next(err)
      );
  })
  .post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);

      if (!favorite) {
        // never add any favorite
        Favorites.create({ uers: req.user._id })
          .then(favorite => {
            for (i = 0; i < req.body.length; i++)
              if (favorite.dishes.indexOf(req.body[i]._id) < 0)
                favorite.dishes.push(req.body[i]);
            favorite
              .save()
              .then(favorite => {
                Favorites.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then(favorite => {
                    console.log("Favorite created!");
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
              })
              .catch(err => {
                return next(err);
              });
          })
          .catch(err => {
            return next(err);
          });
      } else {
        // had added favorite
        for (var i = 0; i < req.body.length; i++)
          if (favorite.dishes.indexOf(req.body[i]._id) === -1)
            // when added favorite is different
            favorite.dishes.push(req.body[i]);
        favorite.save().then(favorite => {
          Favorites.findById(favorite._id)
            .populate("user")
            .populate("dishes")
            .then(favorite => {
              console.log("Favorite created!");
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            });
        });
      }
    });
  })
  .put(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // 403 means their  operation not supported
    res.statusCode("Content-Type", "text/plain");
    res.end("PUT operation not supported on /favorite");
  })
  /** 
.post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // 403 means their  operation not supported
    res.end('POST operation not supported on /favorite');
}) 
*/
  .delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
    console.log("Beginning Delete.");
    Favorites.findOneAndDelete({ user: req.user._id }) // => show all favorite,  findOneAndDelete(req.user._id) is not useful.
      //Favorite.findByIdAndDelete(req.user._id) => null
      .then(
        favorite => {
          console.log("Successfully delete favorite dishes:", favorite);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

//// '/favorites/:dishId'
favoriteRouter
  .route("/:dishId")
  .options(cors.cors, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }) // connect to a client side
      .then(
        favorites => {
          console.log("DishID get");
          if (!favorites) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            // set exists flag to false
            return res.json({ exists: false, favorites: favorites });
          } else {
            if (favorite.dishes.indexOf(req.params.dishId) < 0) {
              // favorites exists but no specific favorites
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              // set exists flag to false
              return res.json({ exists: false, favorites: favorites });
            } else {
              // really exists a certain favorites
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: true, favorites: favorites });
            }
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
    //res.statusCode = 403; // 403 means their  operation not supported
    //res.setHeader('Content-Type', 'text/plain')
    //res.end('GET operation not supported on /favorite/:disheId');
  })
  .post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      // different with Professor's coding
      .then((favorite, err) => {
        //console.log("Favorite POST processed");
        //console.log('user in POST /favorites: ', req.user._id);
        if (err) return next(err);

        if (!favorite) {
          Favorites.create({ user: req.user._id })
            .then(favorite => {
              favorite.dishes.push({ _id: req.params.dishId });
              favorite
                .save()
                .then(favorite => {
                  Favorites.findById(favorite._id)
                    .populate("user")
                    .populate("dishes")
                    .then(favorite => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    });
                })
                .catch(err => {
                  return next(err);
                });
            })
            .catch(err => {
              return next(err);
            });
        } else {
          if (favorite.dishes.indexOf(req.params.dishId) < 0) {
            // the dishes want to save is already in the favorite list
            favorite.dishes.push({ _id: req.params.dishId });
            favorite
              .save()
              .then(favorite => {
                Favorites.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
              })
              .catch(err => {
                return next(err);
              });
          } else {
            res.statusCode = 403;
            res.setHeader("Content-Type", "text/plain");
            res.end("Dish" + req.params.dishId + " already exist");
          }
        }
      });
  })
  .put(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // 403 means their  operation not supported
    res.setHeader("Content-Type", "text/plain");
    res.end("PUT operation not supported on /favorites/" + req.params.dishId);
  })
  .delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      console.log("Favorite DELETE processed");
      if (err) return next(err);

      console.log(favorite);
      var index = favorite.dishes.indexOf(req.params.dishId);
      if (index >= 0) {
        //
        favorite.dishes.splice(index, 1);
        favorite
          .save()
          .then(favorite => {
            Favorites.findById(favorite._id)
              .populate("user")
              .populate("dishes")
              .then(favorite => {
                console.log("Favorite Dish Deleted", favorite);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
          })
          .catch(err => {
            return next(err);
          });
      } else {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("Dish " + req.params._id + " not in your favorite list!!");
      }
    });
  });

module.exports = favoriteRouter;
