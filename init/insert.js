// Database connection
const mongoose=require("mongoose");
main()
.then(()=>{console.log("Connection To DB");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/hms');
}

const { Record } = require("../models/record.js");
const { initData } = require("./data.js");

// const initDB=async() => {
//     await Record.insertMany(initData);
//     console.log("Database was initialized");
// }
// initDB();

// const initDB=async () => {
//   await Record.deleteMany({});
//   console.log("Database was initialized");
// }
// initDB();

// Add the owner to each record without reassigning `initData`
const updatedData = initData.map((obj) => ({
  ...obj,
  owner: "672d0200249a68b2855ede2b",
}));

console.log("Updated Data:", updatedData);

// Initialize the database with the updated data
const initDB = async () => {
  try {
    await Record.insertMany(updatedData); // Use `updatedData` instead of `initData`
    console.log("Database was initialized");
  } catch (error) {
    console.error("Error during database initialization:", error);
  }
};

initDB();