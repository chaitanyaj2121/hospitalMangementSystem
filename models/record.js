const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const { required } = require("joi");
const recordSchema=new Schema({
    title:{
        type:String,
          required:true,
    },description: {
        type: String,
        required: true,
    },
    image: {
        filename: { type: String, default: "Recordimage" },
        url: {
            type: String,
            default:
                "https://ayushmandiagnostics.com/blog/wp-content/uploads/2023/11/CBC-Blood-test.jpg",
        },
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

module.exports.Record= mongoose.model("Record", recordSchema);
