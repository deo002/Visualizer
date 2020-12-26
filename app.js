var express = require("express"),
  app = express();

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("listening on http://localhost:3000/");
});
