const express = require("express");

const router = express.Router();

const {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics
} = require("../controllers/topicController");

router.get("/", getTopics);

router.get("/:id", getTopic);

router.post("/", createTopic);

router.put("/reorder", reorderTopics);

router.put("/:id", updateTopic);

router.delete("/:id", deleteTopic);

module.exports = router;