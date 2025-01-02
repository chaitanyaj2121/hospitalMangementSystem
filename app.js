//Setting the express
const express = require("express");
const app = express();
// setting ejs
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Requiring method override
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

//EJS mate used for templating
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);


// Basic setup for the authentication
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;

const User = require("./models/user.js");
const Doctor = require("./models/doctor.js");

// To parse the data or params comes in req or es
app.use(express.urlencoded({ extended: true }));

//Static files from public folder
app.use(express.static(path.join(__dirname, "/public")))

//require flash 
const flash = require("connect-flash");
app.use(flash());

// -------------------------------------SESSIONS----------------------------------------

const session = require("express-session");
const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {    // ek hafte me woh bhul jayega of puchega fir se login karo 
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));

//-----------------------Authentication code here because it uses Sessions------------------

app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
// Use LocalStrategy for User
passport.use('user-local', new LocalStrategy(User.authenticate()));

// Use LocalStrategy for Doctor
passport.use('doctor-local', new LocalStrategy(Doctor.authenticate()));

// use static serialize and deserialize of model for passport session support
// Serialize and deserialize for both User and Doctor
passport.serializeUser((entity, done) => {
  done(null, { id: entity.id, type: entity.userType });
});

passport.deserializeUser((obj, done) => {
  const Model = obj.type === 'Doctor' ? Doctor : User;
  Model.findById(obj.id)
      .then(user => done(null, user))
      .catch(err => done(err, null));
});


// --------------------------------------flash msg-----------------------------------------------
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
                     
    // Set the currently authenticated user for views
    res.locals.currUser = req.user;

    // Set the redirect URL if it exists in query parameters
    if (req.query.redirectUrl) {
      res.locals.redirectUrl = req.query.redirectUrl;
    }

    next();
  });



const mongoose = require("mongoose");
const { Record } = require("./models/record.js");
const { isLoggedIn } = require("./middlewares.js");
const { log } = require("console");

main()
  .then(() => {
    console.log("Connection To DB");
  })
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/hms');
}


app.listen(8080, () => {
  console.log("Server is listening to the port 8080!");
})

const wrapAsync = require("./utils/wrapAsync.js");

// ----------------------------home route-----------------------------

app.get("/", (req, res) => {
  // console.log("home route");
  // res.send("this is home route")
  res.render("home.ejs")
})

// ----------------------signup---------------------

app.get("/signup", (req, res) => {
  res.render("./users/signup.ejs");
})

app.post("/signup", async (req, res) => {
  try {

    let { username, email, password, phone, userType, address, education, hospitalName } = req.body;
    if (userType == "Patient") {


      const newUser = new User({ email, username, phone, userType, address ,image: { url: req.body.image.url},})
      const registeredUser = await User.register(newUser, password);
      req.flash("success", `Signup Success ${userType} , Log in!`);
      // console.log(registeredUser);
      res.redirect("/login")
    }
    if (userType === "Doctor") {
      const newDoctor = new Doctor({
        username,
        email,
        phone,
        userType,
        education,
        hospitalName,
        address,
        image: {
          url: req.body.image.url || "https://cdn.pixabay.com/photo/2017/01/31/22/32/doctor-2027768_1280.png"
        },
      });
      const registeredDoctor = await Doctor.register(newDoctor, password);
      req.flash("success", `Signup Success ${userType}, Log in!`);
      // console.log(registeredDoctor);
      res.redirect("/login")
    }
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
})


app.get("/login", async (req, res) => {
  res.render("users/login.ejs");

});

// passport.authenticate() it will check the 
app.post(
  "/login",
  (req, res, next) => {
    const strategy = req.body.userType === "Doctor" ? "doctor-local" : "user-local";
    passport.authenticate(strategy, { failureRedirect: "/login", failureFlash: true })(req, res, next);
  },
  (req, res) => {
    req.flash("success", `Welcome to Hospital Management System! You are logged in as ${req.body.username}`);

    const redirectUrl = req.session.redirectUrl || "/records"; // Use session or default to "/records"
    delete req.session.redirectUrl; // Clear session value after use
    res.redirect(redirectUrl);
  }
);


app.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logout Success!")
    res.redirect("/");
  })
})

// -------------------------near by hospitals--------------------------------------------
app.get("/nearbyhospitals", async (req, res) => {

  const axios = require('axios');

  const getNearbyHospitals = async (latitude, longitude) => {
    const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoieWFzaHJham5ldGtlIiwiYSI6ImNtM3d0cnd0YzE1ZWEybnM3a3BpYTcydjgifQ.EnjlB_yRgQz7t2JMHad-7Q"; // Replace with your actual Mapbox Access Token

    // Mapbox Geocoding API URL to search for hospitals near the given location
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/hospital.json?proximity=${longitude},${latitude}&types=poi&access_token=${MAPBOX_ACCESS_TOKEN}`;

    try {
      // Make an async GET request to the Mapbox API
      const response = await axios.get(url);

      // Extract the list of hospitals from the response
      const hospitals = response.data.features;

      // Check if there are hospitals found
      if (hospitals.length === 0) {
        console.log("No nearby hospitals found.");
        return;
      }

      // Display hospital names, addresses, and their coordinates
      // hospitals.forEach((hospital) => {
      //   console.log(`Name: ${hospital.text}`);
      //   console.log(`Address: ${hospital.place_name}`);
      //   console.log(`Latitude: ${hospital.center[1]}`);
      //   console.log(`Longitude: ${hospital.center[0]}`);
      //   console.log('------------------------------------');
      // });
      // console.log(hospitals)
      res.render("./hospitals/nearbyh.ejs", { hospitals })
    } catch (error) {
      // Log error details
      console.error("Error fetching hospital data:", error.message);
      if (error.response) {
        console.error("Response Status:", error.response.status);
        console.error("Response Data:", error.response.data);
      }
      res.send(`${error.message}`);
    }
  };

  // Replace with your actual latitude and longitude values
  getNearbyHospitals(18.516726, 73.856255); // Example: Mumbai coordinates


})


app.post('/nearbyh/getlocation', (req, res) => {
  const data = req.body;

  res.render("./hospitals/map.ejs", { data });
  // res.send({data})
});


app.post("/check", async (req, res) => {
  res.send("done");

  console.log(req.body);
})


//   ------------------------------------records section show/add new ----------------------------

app.get("/records", isLoggedIn, wrapAsync(async (req, res) => {
  //  console.log(req.user.id);
  let id = req.user.id;
  // console.log("curr user id:",id);
  let records = await Record.find({})
  //    .populate("owner");   //Working;
  res.render("./records/records.ejs", { records, id });
}))

app.get("/records/new", isLoggedIn, (req, res) => {
  if (req.user) {
    res.render("./records/newRecord.ejs")
  }
})

app.post("/records/new", isLoggedIn, async (req, res) => {
  let { title, description, cost, location, country } = req.body;
  let newRecord = new Record({
    title: title,
    description: description,
    price: cost,
    location: location,
    country: country,
  })

  newRecord.owner = req.user._id;
  let savedRecord = await newRecord.save();
  // console.log("new Saved record data:", savedRecord);

  req.flash("success", "New Record Added Successfully");
  res.redirect("/records");
  // console.log("New Record Added Successfully");
});

//-------------------update record------------------------

app.get("/records/update/:id", async (req, res) => {
  let { id } = req.params;

  let record = await Record.findById(id);
  //   console.log(record);
  res.render("./records/update_record.ejs", { record })
})

app.post("/records/update/:id", isLoggedIn, async (req, res) => {
  let { id } = req.params;
  let { title, description, price, location, country, image } = req.body;
  let record = await Record.findByIdAndUpdate(id, {
    title: title,
    description: description,
    price: price,
    location: location,
    country: country,
    image: { url: image },

  }, { new: true, runValidators: true })
  let savedRecord = await record.save();
  // console.log("updated record:", savedRecord);
  req.flash("success", "Record Updated Successfully");
  res.redirect("/records");
  // console.log("Record Updated Successfully");
})
//------------------delete record---------------------
app.delete("/records/delete/:id", isLoggedIn, async (req, res) => {
  let { id } = req.params;
  let deleteRecord = await Record.findByIdAndDelete(id);
  req.flash("success", "Record deleted Successfully!");
  // console.log("Deletion Successfull of: ", deleteRecord);
  res.redirect("/records");
})


//----------------------profile Section---------------

app.get("/profile",isLoggedIn, async (req, res) => {
  // Access the current user from req.user
  const currentUser = req.user;
  // console.log("Curr user:",currentUser);
  

  if (!currentUser) {
    req.flash("error", "You need to be logged in to view your profile.");
    return res.redirect("/login");
  }

  // Fetch the user's profile data (e.g., from the database)
  try {
    if (currentUser.userType=="Patient") {
      
 
    let user = await User.findById(currentUser._id); // Assuming req.user contains the user's ID
    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/");
    }
    res.render("./users/profile.ejs", { user }); // Pass the user data to the view
  }

  if (currentUser.userType=="Doctor") {
    let  doctor = await Doctor.findById(currentUser._id); // Assuming req.user contains the user's ID
    if (!doctor) {
      req.flash("error", "User not found.");
      return res.redirect("/");
    }
    res.render("./users/Dprofile.ejs", { doctor}); // Pass the user data to the view
  }

  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/");
  }
});

