const express = require("express");

const router = express.Router();

const {
  getSubTopics,
  createSubTopic,
  updateSubTopic,
  deleteSubTopic,
  reorderSubTopics
} = require("../controllers/subTopicController");

router.get(
  "/topics/:topicId/subtopics",
  getSubTopics
);

router.post(
  "/topics/:topicId/subtopics",
  createSubTopic
);

router.put(
  "/subtopics/reorder",
  reorderSubTopics
);

router.put(
  "/subtopics/:id",
  updateSubTopic
);

router.delete(
  "/subtopics/:id",
  deleteSubTopic
);

module.exports = router;