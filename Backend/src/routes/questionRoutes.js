const express = require("express");

const router = express.Router();

const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} = require("../controllers/questionController");

router.get(
  "/subtopics/:subTopicId/questions",
  getQuestions
);

router.post(
  "/subtopics/:subTopicId/questions",
  createQuestion
);

router.put(
  "/questions/reorder",
  reorderQuestions
);

router.put(
  "/questions/:id",
  updateQuestion
);

router.delete(
  "/questions/:id",
  deleteQuestion
);

module.exports = router;