const express = require("express");

const router = express.Router();

const {
  getSubTopics,
  createSubTopic,
  updateSubTopic,
  deleteSubTopic,
  reorderSubTopics,
} = require("../controllers/subTopicController");

// Get all subtopics for a topic
router.get("/topics/:topicId/subtopics", getSubTopics);

// Create a subtopic inside a topic
router.post("/topics/:topicId/subtopics", createSubTopic);

// Reorder subtopics
router.put("/subtopics/reorder", reorderSubTopics);

// Update subtopic
router.put("/subtopics/:id", updateSubTopic);

// Delete subtopic
router.delete("/subtopics/:id", deleteSubTopic);

module.exports = router;