const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      required: true,
      trim: true,
    },

    platform: {
      type: String,
      default: "",
      trim: true,
    },

    problemUrl: {
      type: String,
      default: "",
      trim: true,
    },

    resource: {
      type: String,
      default: "",
      trim: true,
    },

    subTopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubTopic",
      required: true,
    },

    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ subTopicId: 1, order: 1 });

module.exports = mongoose.model("Question", questionSchema);