const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactusSchema = new Schema(
  {
    firstname: {
      type: String,
      require: true
    },
    lastname: {
      type: String,
      require: true
    },
    telnum: {
      type: String,
      require: true,
      minlength: 10,
      maxlength: 10
    },
    email: {
      type: String,
      require: true
    },
    agree: {
      type: Boolean,
      defaut: false
    },
    contactType: {
      type: String,
      require: true
    },
    message: {
      type: String,
      require: true
    }
  },
  {
    timestamps: true
  }
);

var Contactus = mongoose.model("Contactus", contactusSchema);

module.exports = Contactus;
