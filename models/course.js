var mongoose = require("mongoose");

// SCHEME SETUP
var courseSchema = new mongoose.Schema({
  name: String,
  type: String,
  image: String,
  imageId: String,
  description: String,
  course_name: String,
  subjects: [],
  tags: [],
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  rateAvg: Number,
  rateCount: Number,
  hasRated: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

module.exports = mongoose.model("Course", courseSchema);
