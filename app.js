var express = require("express"),
  app = express();

app.set("view engine", "ejs");
app.locals.moment = require("moment");
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.render("landing");
});

app.get("/Visualizers",function(req,res){
  res.render("visualizers/index");
});

app.get("/Visualizers/:id/show",function(req,res){
 var course = { comments: [{
  text: "nice",
  createdAt: Date.now(),
  author: {
    id: {
      type: "sort",
      ref: "akash"
    },
    username: "akashdeep"
  },
  rating: 3,
  length: 1}]
};
  res.render("visualizers/show",{course:course});
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/signup",function(req,res){
  res.render("register");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("listening on http://localhost:3000/");
});
