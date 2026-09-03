const {
  getSheet,
  saveSheet,
  findSubTopic,
  findQuestion
} = require("../services/sheetService");

const { generateId } = require("../utils/idGenerator");

// GET /api/subtopics/:subTopicId/questions
function getQuestions(req, res) {
  const sheet = getSheet();

  const subTopic = findSubTopic(
    sheet,
    req.params.subTopicId
  );

  if (!subTopic) {
    return res.status(404).json({
      message: "Subtopic not found"
    });
  }

  res.json(subTopic.questions);
}

// POST /api/subtopics/:subTopicId/questions
function createQuestion(req, res) {
  const sheet = getSheet();

  const subTopic = findSubTopic(
    sheet,
    req.params.subTopicId
  );

  if (!subTopic) {
    return res.status(404).json({
      message: "Subtopic not found"
    });
  }

  const {
    title,
    difficulty,
    platform,
    problemUrl,
    resource
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Question title is required"
    });
  }

  const question = {
    id: generateId("question"),
    title: title.trim(),
    difficulty: difficulty || null,
    platform: platform || null,
    problemUrl: problemUrl || null,
    resource: resource || null
  };

  subTopic.questions.push(question);

  saveSheet(sheet);

  res.status(201).json(question);
}

// PUT /api/questions/:id
function updateQuestion(req, res) {
  const sheet = getSheet();

  const question = findQuestion(
    sheet,
    req.params.id
  );

  if (!question) {
    return res.status(404).json({
      message: "Question not found"
    });
  }

  const {
    title,
    difficulty,
    platform,
    problemUrl,
    resource
  } = req.body;

  if (title !== undefined) {
    question.title = title.trim();
  }

  if (difficulty !== undefined) {
    question.difficulty = difficulty;
  }

  if (platform !== undefined) {
    question.platform = platform;
  }

  if (problemUrl !== undefined) {
    question.problemUrl = problemUrl;
  }

  if (resource !== undefined) {
    question.resource = resource;
  }

  saveSheet(sheet);

  res.json(question);
}

// DELETE /api/questions/:id
function deleteQuestion(req, res) {
  const sheet = getSheet();

  for (const topic of sheet.topics) {
    for (const subTopic of topic.subTopics) {
      const index = subTopic.questions.findIndex(
        (question) =>
          question.id === req.params.id
      );

      if (index !== -1) {
        const deleted =
          subTopic.questions.splice(index, 1)[0];

        saveSheet(sheet);

        return res.json({
          message: "Question deleted",
          question: deleted
        });
      }
    }
  }

  res.status(404).json({
    message: "Question not found"
  });
}

// PUT /api/questions/reorder
function reorderQuestions(req, res) {
  const sheet = getSheet();

  const {
    subTopicId,
    questionIds
  } = req.body;

  const subTopic = findSubTopic(
    sheet,
    subTopicId
  );

  if (!subTopic) {
    return res.status(404).json({
      message: "Subtopic not found"
    });
  }

  if (!Array.isArray(questionIds)) {
    return res.status(400).json({
      message: "questionIds must be an array"
    });
  }

  const questionMap = new Map(
    subTopic.questions.map((question) => [
      question.id,
      question
    ])
  );

  subTopic.questions = questionIds
    .map((id) => questionMap.get(id))
    .filter(Boolean);

  saveSheet(sheet);

  res.json(subTopic.questions);
}

module.exports = {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions
};