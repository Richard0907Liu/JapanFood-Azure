const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    rating:{
        type: Number,
        min: 0,
        max: 5,
        require: true
    },
    comment:{
        type: String,
        require: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // connect to User schema
    },
    dish:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }
},{
    timestamps:true
});

var Comments = mongoose.model('Comment', commentSchema);

module.exports = Comments;