const mongoose = require("mongoose");
const Topic = require("../models/Topic");

const mapTopic = (topic) => ({
  id: topic._id.toString(),
  title: topic.title,
});

const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find()
      .sort({ order: 1 })
      .lean();

    return res.status(200).json(
      topics.map(mapTopic)
    );
  } catch (error) {
    console.error("Get topics error:", error);

    return res.status(500).json({
      message: "Failed to get topics",
      error: error.message,
    });
  }
};

const getTopic = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid topic ID",
      });
    }

    const topic = await Topic.findById(id);

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    return res.status(200).json(
      mapTopic(topic)
    );
  } catch (error) {
    console.error("Get topic error:", error);

    return res.status(500).json({
      message: "Failed to get topic",
      error: error.message,
    });
  }
};

const createTopic = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Topic title is required",
      });
    }

    const lastTopic = await Topic.findOne()
      .sort({ order: -1 });

    const order = lastTopic
      ? lastTopic.order + 1
      : 1;

    const topic = await Topic.create({
      title: title.trim(),
      order,
    });

    return res.status(201).json(
      mapTopic(topic)
    );
  } catch (error) {
    console.error("Create topic error:", error);

    return res.status(500).json({
      message: "Failed to create topic",
      error: error.message,
    });
  }
};

const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid topic ID",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Topic title is required",
      });
    }

    const topic = await Topic.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    return res.status(200).json(
      mapTopic(topic)
    );
  } catch (error) {
    console.error("Update topic error:", error);

    return res.status(500).json({
      message: "Failed to update topic",
      error: error.message,
    });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid topic ID",
      });
    }

    const topic = await Topic.findByIdAndDelete(id);

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    return res.status(200).json({
      message: "Topic deleted",
      topic: mapTopic(topic),
    });
  } catch (error) {
    console.error("Delete topic error:", error);

    return res.status(500).json({
      message: "Failed to delete topic",
      error: error.message,
    });
  }
};

const reorderTopics = async (req, res) => {
  try {
    const { topicIds } = req.body;

    if (!Array.isArray(topicIds)) {
      return res.status(400).json({
        message: "topicIds must be an array",
      });
    }

    const topics = await Topic.find();

    if (topicIds.length !== topics.length) {
      return res.status(400).json({
        message: "All topic IDs must be provided",
      });
    }

    const invalidObjectIds = topicIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidObjectIds.length > 0) {
      return res.status(400).json({
        message: "Some topic IDs are invalid",
        invalidIds: invalidObjectIds,
      });
    }

    const topicMap = new Map(
      topics.map((topic) => [
        topic._id.toString(),
        topic,
      ])
    );

    const invalidIds = topicIds.filter(
      (id) => !topicMap.has(id.toString())
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: "Some topic IDs are invalid",
        invalidIds,
      });
    }

    const uniqueIds = new Set(
      topicIds.map((id) => id.toString())
    );

    if (uniqueIds.size !== topicIds.length) {
      return res.status(400).json({
        message: "topicIds cannot contain duplicates",
      });
    }

    const operations = topicIds.map(
      (topicId, index) => ({
        updateOne: {
          filter: {
            _id: topicId,
          },
          update: {
            $set: {
              order: index + 1,
            },
          },
        },
      })
    );

    await Topic.bulkWrite(operations);

    const reorderedTopics = await Topic.find()
      .sort({ order: 1 })
      .lean();

    return res.status(200).json(
      reorderedTopics.map(mapTopic)
    );
  } catch (error) {
    console.error("Reorder topics error:", error);

    return res.status(500).json({
      message: "Failed to reorder topics",
      error: error.message,
    });
  }
};

module.exports = {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
};