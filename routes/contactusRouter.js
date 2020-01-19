const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("./cors");
const nodemailer = require("nodemailer");

const Contactus = require("../models/contactus");

const contactusRouter = express.Router();

contactusRouter.use(bodyParser.json());

contactusRouter
  .route("/")
  .options(cors.cors, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    console.log("GET contact us page");

    // ///// nodemailer
    // var transporter = nodemailer.createTransport({
    //   // use my gmail account to send a email
    //   service: "gmail",
    //   auth: {
    //     user: "richard0907@gmail.com",
    //     pass: "Lamferrasche7"
    //   }
    // });
    // ///////// Send HTML
    // let emailFrom = "richard0907@gmail.com";
    // let feedbackContent =
    //   "<h1>" +
    //   `Dear ${req.body.firstname} ${req.body.lastname}` +
    //   "</h1>" +
    //   "<p>Than you for your feedback</p>" +
    //   "<p>Your message: " +
    //   `${req.body.message}` +
    //   "</p>" +
    //   "<p><strong>conFusion restaurant, HK</strong></p>";

    // var mailOptions = {
    //   from: "richard0907@gmail.com",
    //   to: "rl357@njit.edu",
    //   subject: "Not reply- conFusion restaurant get your feedback",
    //   html: feedbackContent
    //   // html:
    //   //   '<form action="fileupload" method="post" enctype="multipart/form-data"><input type="file" name="filetoupload"><br><input type="submit"></form>'
    // };
    // transporter.sendMail(mailOptions, (err, info) => {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log("Email sent: " + info.response);
    //   }
    // });
    // /////// end nodemailer

    Contactus.find({})
      .then(allcontactus => {
        console.log("All feedback: ", allcontactus);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(allcontactus);
      })
      .catch(err => next(err));
  })
  .post(cors.cors, (req, res, next) => {
    console.log("POST contact us page");
    console.log("req.body: ", req.body);

    ///// nodemailer
    var transporter = nodemailer.createTransport({
      // use my gmail account to send a email
      service: "gmail",
      auth: {
        user: "richard0907@gmail.com",
        pass: "Lamferrasche7"
      }
    });
    ///////// Send HTML
    let emailTo = req.body.email;

    let feedbackContent =
      "<h1>" +
      `Dear ${req.body.firstname} ${req.body.lastname}` +
      "</h1>" +
      "<p>Than you for your feedback</p>" +
      "<p>Your message: " +
      `${req.body.message}` +
      "</p>" +
      "<p><strong>Fancy Japenese Food, 3177 Hamilton Street, Harrison 07029, NJ, US</strong></p>";

    var mailOptions = {
      from: "richard0907@gmail.com",
      to: emailTo,
      subject: "Not reply- Fancy Japenese Food got your feedback",
      html: feedbackContent
      // html:
      //   '<form action="fileupload" method="post" enctype="multipart/form-data"><input type="file" name="filetoupload"><br><input type="submit"></form>'
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    /////// end nodemailer

    Contactus.create(req.body)
      .then(
        contactus => {
          console.log("Contactus Created", contactus);
          contactus.save();
        },
        err => next(err)
      )
      .then(() => {
        Contactus.find({}).then(allcontactus => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(allcontactus);
        });
      })
      .catch(err => next(err));
  });

module.exports = contactusRouter;
