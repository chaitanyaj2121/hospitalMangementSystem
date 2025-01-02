const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


// Doctor schema definition
const doctorSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensures no duplicate emails are saved
    },
    phone: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true,
        enum: ["Doctor"] // Restricts the value of userType to "Doctor"
    },
    education: {
        type: String,
        required: true
    },
    hospitalName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
     image: {
        filename: { type: String, default: "Doctorimage" },
        url: {
            type: String,
            default:
                "https://cdn.pixabay.com/photo/2017/01/31/22/32/doctor-2027768_1280.png",
        },
    }
});
doctorSchema.plugin(passportLocalMongoose);

// Exporting the Doctor model
module.exports = mongoose.model("Doctor", doctorSchema);
