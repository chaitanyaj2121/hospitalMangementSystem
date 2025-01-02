const { string, required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// User schema definition with additional required fields
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true // Ensures no duplicate emails are saved
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    userType:{
        type:String,
        required:true,
        enum: ["Patient"] 
    },
    image: {
       filename: { type: String, default: "Userimage" },
       url: {
           type: String,
           default:
               "https://img.freepik.com/free-vector/cute-boy-standing-position-showing-thumb_96037-450.jpg?t=st=1734175724~exp=1734179324~hmac=6db01b1bcb570317473c93e6e871423e6aaa3b945def4a6f5f9bc0b9c5171f86&w=1060",
       },
   }
});

// Add passport-local-mongoose plugin for authentication handling
userSchema.plugin(passportLocalMongoose);

// Exporting the User model
module.exports = mongoose.model('User', userSchema);
