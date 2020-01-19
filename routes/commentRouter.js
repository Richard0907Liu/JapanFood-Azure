const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");

const Comments = require("../models/comments");

const commentRouter = express.Router();

commentRouter.use(bodyParser.json());

commentRouter
  .route("/")
  .options(cors.cors, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    //console.log('Commentssssssssssss');
    //console.log('req.user: ', req.user);
    Comments.find(req.qurey) // send to the mongodb server using a mongoose methed
      /** Not populating the dishes here because I don't explicitly need the dishes the way I use this information in my react client. */
      .populate("author")
      .then(
        comments => {
          //// not neet if else, when connect to a client side, because catch error is there anywhere
          //if(dish != null){
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(comments); // return the comments
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  /** Only logged-in person can see, first, we'll check the body to make sure that the comment is included in the body here. */
  .post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    // update comments
    if (req.body != null) {
      // body exists
      /** The author part is left unfilled there, which we will explicitly insert at this point into the body here. */
      req.body.author = req.user._id;
      //create a comment here
      Comments.create(req.body)
        .then(
          comment => {
            // Now, the reason we need to findById is because we need to populate the author information here.
            Comments.findById(comment._id)
              .populate("author")
              // Now, obviously, here, you would find that the comment will exist because we just inserted that comment into place there.
              .then(comment => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(comment);
              });
          },
          err => next(err)
        )
        .catch(err => next(err));
    } else {
      err = new Error("Comment not found in request body");
      err.status = 404;
      return next(err);
    }
  })
  .put(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // 403 means their  operation not supported
    res.end("PUT operation not supported on /comments/");
  })
  .delete(
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      // Later on, we will learn how to use authentication
      Comments.remove({}) // remove all comments
        .then(
          resp => {
            // resp, get Server response
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

// For route of /:dishId/comments/:commentId
commentRouter
  .route("/:commentId")
  .options(cors.cors, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Comments.findById(req.params.commentId)
      .populate("author")
      .then(
        comment => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(comment); // return the comments
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST operation not supported on /comments/" + req.params.commentId
    );
  })
  .put(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Commnets.findById(req.params.commentId)
      .then(
        comment => {
          if (comment != null) {
            if (!comment.author.equals(req.user._id)) {
              var err = new Error(
                "You are not authorized to update this comment!"
              );
              err.status = 403;
              return next(err);
            }
            req.body.author = req.user._id;
            Comments.findByIdAndUpdate(
              req.params.commnetId,
              {
                $set: req.body // second parameter is what we want to change, update the entire commnet itself
              },
              { new: true }
            ) //So, {new: true} will ensure that the updated comment will be returned in the den of this call to the Comments.FindByIdAndUpdate.
              .then(
                comment => {
                  Comments.findById(comment._id)
                    .populate("author")
                    .then(comment => {
                      res.statusCode = 200; // res for sending back the reply
                      res.setHeader("Content-Type", "application/json");
                      res.json(comment); // returning the updated dish back to the user here.
                    });
                },
                err => next(err)
              );
          } else {
            // commentID doesn't exist, cannot update comments
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
    //console.log("Show reqest id: ", req.user._id);  // for test
    //console.log("Show comment id: ", req.params.commentId); // for test

    Comments.findById(req.params.commentId)
      .then(
        comment => {
          // resp, Server response

          //var authorId = dish.comments.id(req.params.commentId).author; //._id;
          //console.log("Author ID: ", authorId); // for test

          if (comment != null) {
            if (!comment.author.equals(req.user._id)) {
              var err = new Error(
                "You are not authorized to update this comment!"
              );
              err.status = 403;
              return next(err);
            }
            Comments.findByIdAndRemove(req.params.commentId)
              .then(
                resp => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(resp); // returning the updated dish back to the user here.
                },
                err => next(err)
              )
              .catch(err => next(err));
          } else {
            err = new Error("Comment " + req.params.commnetId + " not found!!");
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = commentRouter;
