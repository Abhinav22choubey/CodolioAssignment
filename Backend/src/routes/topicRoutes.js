const express = require("express");

const router = express.Router();

const {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
} = require("../controllers/topicController");

// GET /api/topics
router.get("/", getTopics);

// POST /api/topics
router.post("/", createTopic);

// PUT /api/topics/reorder
router.put("/reorder", reorderTopics);

// GET /api/topics/:id
router.get("/:id", getTopic);

// PUT /api/topics/:id
router.put("/:id", updateTopic);

// DELETE /api/topics/:id
router.delete("/:id", deleteTopic);

module.exports = router;