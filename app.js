var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  methodOverride = require("method-override"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  flash = require("connect-flash");

mongoose.connect('mongodb+srv://Akash:iqNNO4NtnUOtKXHv@cluster0.iyuwe.mongodb.net/Visualizers?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.locals.moment = require("moment");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//scahema setup
var userSchema = new mongoose.Schema({
  username: String,
  email:String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User",userSchema);

var commentSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
  author: {
    id: {
      type:  mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  username: String
  },
  rating: Number
});

var Comment = mongoose.model("Comment",commentSchema);

var algoSchema = new mongoose.Schema({
  name: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }],
  rateAvg: Number,
  rateCount: Number,
  hasRated: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
 });

var Algorithm = mongoose.model("Algorithm",algoSchema);

// PASSPORT CONFIG
app.use(
  require("express-session")({
    secret: "shibas are the best dogs in the world.",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

function checkCommentOwnership(req, res, next) {
  Comment.findById(req.params.comment_id, function(err, foundComment) {
    if (err || !foundComment) {
      req.flash("error", "Sorry, that comment does not exist!");
      res.redirect("/courses");
    } else if (
      foundComment.author.id.equals(req.user._id) ||
      req.user.isAdmin
    ) {
      req.comment = foundComment;
      next();
    } else {
      req.flash("error", "You don't have permission to do that!");
      res.redirect("/Visualizers/" + req.params.name);
    }
  });
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that!");
  res.redirect("/login");
};


app.get("/", function(req, res) {
  res.render("landing");
});

app.get("/Visualizers",function(req,res){
  res.render("visualizers/index");
});

app.get("/Visualizers/:name",function(req,res){

  Algorithm.find({ name: req.params.name }).populate("comments").exec(function(err,foundAlgo){
  if(err) 
    {console.log(err);}
  else
    {console.log(foundAlgo[0].comments)
     res.render("visualizers/"+ req.params.name,{algo:foundAlgo[0]});
     }
   });
});
//Login Routes
app.get("/login",function(req,res){ 
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/Visualizers",
    failureRedirect: "/login",
    failureFlash: true
  }),
  function(req, res) {
  if(err)
  {req.flash("err",err);}
  else
  {req.flash("success", "Logged Out Successfully!");}
  }
);

// logout route
app.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Loggged Out Successfully!");
  res.redirect("/Visualizers");
});

//Signup Routes
app.get("/signup",function(req,res){
  res.render("register");
});

app.post("/signup",function(req, res) {
   console.log(req.body.email,req.body.username);
   var newUser = new User({
     email: req.body.email,
     username: req.body.username});

     User.register(newUser, req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        return res.render("register", {
          error: err.message
        });
      }
        passport.authenticate("local")(req, res, function() { 
        req.flash("success", "Signup Successfully!");
        res.redirect("/Visualizers");
      });
    });
});

//comment Create route
app.post("/Visualizers/:name/comments",isLoggedIn,function(req, res) {
  Algorithm.find( { name: req.params.name },function(err,found){
    if (err) {
      console.log(err);
    }
    var ratedArray = [];
    found[0].hasRated.forEach(function(rated) {
      ratedArray.push(String(rated));
    });
    if (ratedArray.includes(String(req.user._id))) {
      console.log(
        "error",
        "You've already reviewed this, please edit your review instead."
      );
      res.redirect("/Visualizers/" + req.params.name);
    } else {
      Algorithm.find( { name: req.params.name },function(err,foundAlgo){
        if (err) {
          console.log(err);
          res.redirect("/Visualizers");
        } else {
          var newComment = req.body.comment;
          Comment.create(newComment, function(err, comment) {
            if (err) {
              req.flash("error", "Something went wrong.");

            } else {
              // add username and id to comment
              comment.author.id = req.user._id;
              comment.author.username = req.user.username;
              // save comment
              comment.save();
              foundAlgo[0].comments.push(comment);
              foundAlgo[0].hasRated.push(req.user._id);
              var ratingsArray = [];
              foundAlgo[0].comments.forEach(function(rating) {
              ratingsArray.push(rating.rating);
              });
              if (ratingsArray.length === 0) {
              foundAlgo[0].rateAvg = 0;
              } else {
              var ratings = ratingsArray.reduce(function(total, rating) {
              return total + rating;
              foundAlgo[0].rateAvg = ratings / foundAlgo[0].comments.length;
              });
              foundAlgo[0].rateCount = foundAlgo[0].comments.length;
              }
              foundAlgo[0].save();
              res.redirect("/Visualizers/" + req.params.name);
            }
          });
        }
      });
    }
  });
});

// DESTROY COMMENT ROUTE
app.delete("/Visualizers/:id/comments/:comment_id",checkCommentOwnership,isLoggedIn,function(
  req,
  res
) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err) {
    if (err) {
      res.redirect("back");
    } else {
      Algorithm.findByIdAndUpdate(
        req.params.id,
        { $pull: { comments: { $in: [req.params.comment_id] } } },
        function(err) {
          if (err) {
            console.log(err);
          }
        }
      );
      Algorithm.findByIdAndUpdate(
        req.params.id,
        { $pull: { hasRated: { $in: [req.user._id] } } },
        function(err) {
          if (err) {
            console.log(er);
          }
        }
      );
      Algorithm.findById(req.params.id,function(err, found) {
      if (err || !found) {
        console.log(err);
      }
      res.redirect("/Visualizers/" + found.name);
    });
    }
  });
});

// COMMENT UPDATE ROUTE
app.put("/Visualizers/:id/comments/:comment_id",checkCommentOwnership,isLoggedIn,function(
  req,
  res
) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
    err,
    updatedComment
  ) {
    if (err) {
      res.redirect("back");
    } else {
      Algorithm.findById(req.params.id,function(err, found) {
      if (err || !found) {
        console.log(err);
      }
      res.redirect("/Visualizers/" + found.name);
    });
    }
  });
});


app.get("/about",function(req,res){
  res.render("about");
});

app.get("*",function(req,res){
  res.render("error");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("listening on http://localhost:3000/");
});
