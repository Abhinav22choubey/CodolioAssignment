const mongoose = require("mongoose");

const subTopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
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

subTopicSchema.index({ topicId: 1, order: 1 });

module.exports = mongoose.model("SubTopic", subTopicSchema);