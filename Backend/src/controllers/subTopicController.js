const mongoose = require("mongoose");
const SubTopic = require("../models/SubTopic");
const Topic = require("../models/Topic");

const mapSubTopic = (subTopic) => ({
  id: subTopic._id.toString(),
  title: subTopic.title,
});

const getSubTopics = async (req, res) => {
  try {
    const { topicId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        message: "Invalid topic ID",
      });
    }

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    const subTopics = await SubTopic.find({
      topicId: topic._id,
    }).sort({
      order: 1,
    });

    return res.status(200).json(
      subTopics.map(mapSubTopic)
    );
  } catch (error) {
    console.error("Get subtopics error:", error);

    return res.status(500).json({
      message: "Failed to get subtopics",
      error: error.message,
    });
  }
};

const createSubTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { title } = req.body;

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        message: "Invalid topic ID",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Subtopic title is required",
      });
    }

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    const lastSubTopic = await SubTopic.findOne({
      topicId: topic._id,
    }).sort({
      order: -1,
    });

    const subTopicOrder = lastSubTopic
      ? lastSubTopic.order + 1
      : 1;

    const subTopic = await SubTopic.create({
      title: title.trim(),
      topicId: topic._id,
      order: subTopicOrder,
    });

    return res.status(201).json(
      mapSubTopic(subTopic)
    );
  } catch (error) {
    console.error("Create subtopic error:", error);

    return res.status(500).json({
      message: "Failed to create subtopic",
      error: error.message,
    });
  }
};

const updateSubTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, order } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid subtopic ID",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Subtopic title is required",
      });
    }

    const updateData = {
      title: title.trim(),
    };

    if (order !== undefined) {
      updateData.order = order;
    }

    const subTopic = await SubTopic.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!subTopic) {
      return res.status(404).json({
        message: "Subtopic not found",
      });
    }

    return res.status(200).json(
      mapSubTopic(subTopic)
    );
  } catch (error) {
    console.error("Update subtopic error:", error);

    return res.status(500).json({
      message: "Failed to update subtopic",
      error: error.message,
    });
  }
};

const deleteSubTopic = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid subtopic ID",
      });
    }

    const subTopic = await SubTopic.findByIdAndDelete(id);

    if (!subTopic) {
      return res.status(404).json({
        message: "Subtopic not found",
      });
    }

    return res.status(200).json({
      message: "Subtopic deleted",
      subTopic: mapSubTopic(subTopic),
    });
  } catch (error) {
    console.error("Delete subtopic error:", error);

    return res.status(500).json({
      message: "Failed to delete subtopic",
      error: error.message,
    });
  }
};

const reorderSubTopics = async (req, res) => {
  try {
    const { topicId, subTopicIds } = req.body;

    if (!topicId) {
      return res.status(400).json({
        message: "topicId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        message: "Invalid topic ID",
      });
    }

    if (!Array.isArray(subTopicIds)) {
      return res.status(400).json({
        message: "subTopicIds must be an array",
      });
    }

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    const subTopics = await SubTopic.find({
      topicId: topic._id,
    });

    const invalidObjectIds = subTopicIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidObjectIds.length > 0) {
      return res.status(400).json({
        message: "Some subtopic IDs are invalid",
        invalidIds: invalidObjectIds,
      });
    }

    const subTopicMap = new Map(
      subTopics.map((subTopic) => [
        subTopic._id.toString(),
        subTopic,
      ])
    );

    const invalidIds = subTopicIds.filter(
      (id) => !subTopicMap.has(id.toString())
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        message:
          "Some subtopic IDs are invalid or do not belong to this topic",
        invalidIds,
      });
    }

    const uniqueIds = new Set(
      subTopicIds.map((id) => id.toString())
    );

    if (uniqueIds.size !== subTopicIds.length) {
      return res.status(400).json({
        message: "subTopicIds cannot contain duplicates",
      });
    }

    const operations = subTopicIds.map(
      (subTopicId, index) => ({
        updateOne: {
          filter: {
            _id: subTopicId,
            topicId: topic._id,
          },
          update: {
            $set: {
              order: index + 1,
            },
          },
        },
      })
    );

    if (operations.length > 0) {
      await SubTopic.bulkWrite(operations);
    }

    const reorderedSubTopics = await SubTopic.find({
      topicId: topic._id,
    }).sort({
      order: 1,
    });

    return res.status(200).json(
      reorderedSubTopics.map(mapSubTopic)
    );
  } catch (error) {
    console.error("Reorder subtopics error:", error);

    return res.status(500).json({
      message: "Failed to reorder subtopics",
      error: error.message,
    });
  }
};

module.exports = {
  getSubTopics,
  createSubTopic,
  updateSubTopic,
  deleteSubTopic,
  reorderSubTopics,
};