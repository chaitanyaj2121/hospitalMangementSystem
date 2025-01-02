
module.exports.isLoggedIn=(req,res,next)=>{
    // in req
  console.log(req.path,"..",req.originalUrl); // in which the path that user want to go is give in the req object
  // that helps us to get the user at that path after log in

  //check the user is logged in? if Y then render required .ejs file
  if (!req.isAuthenticated()) {

      //redirectUrl Save
      req.session.redirectUrl=req.originalUrl; 
      req.flash("error","You must be logged in!");
      res.redirect("/login");
  }
  next();
}
