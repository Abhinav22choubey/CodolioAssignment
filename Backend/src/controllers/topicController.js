const {
  getSheet,
  saveSheet,
  findTopic
} = require("../services/sheetService");

const { generateId } = require("../utils/idGenerator");

// GET /api/topics
function getTopics(req, res) {
  const sheet = getSheet();

  res.json(sheet.topics);
}

// GET /api/topics/:id
function getTopic(req, res) {
  const sheet = getSheet();

  const topic = findTopic(sheet, req.params.id);

  if (!topic) {
    return res.status(404).json({
      message: "Topic not found"
    });
  }

  res.json(topic);
}

// POST /api/topics
function createTopic(req, res) {
  const sheet = getSheet();

  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Topic title is required"
    });
  }

  const topic = {
    id: generateId("topic"),
    title: title.trim(),
    subTopics: []
  };

  sheet.topics.push(topic);

  saveSheet(sheet);

  res.status(201).json(topic);
}

// PUT /api/topics/:id
function updateTopic(req, res) {
  const sheet = getSheet();

  const topic = findTopic(sheet, req.params.id);

  if (!topic) {
    return res.status(404).json({
      message: "Topic not found"
    });
  }

  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Topic title is required"
    });
  }

  topic.title = title.trim();

  saveSheet(sheet);

  res.json(topic);
}

// DELETE /api/topics/:id
function deleteTopic(req, res) {
  const sheet = getSheet();

  const index = sheet.topics.findIndex(
    (topic) => topic.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Topic not found"
    });
  }

  const deletedTopic = sheet.topics.splice(index, 1)[0];

  saveSheet(sheet);

  res.json({
    message: "Topic deleted",
    topic: deletedTopic
  });
}

// PUT /api/topics/reorder
function reorderTopics(req, res) {
  const sheet = getSheet();

  const { topicIds } = req.body;

  if (!Array.isArray(topicIds)) {
    return res.status(400).json({
      message: "topicIds must be an array"
    });
  }

  const topicMap = new Map(
    sheet.topics.map((topic) => [
      topic.id,
      topic
    ])
  );

  const reorderedTopics = topicIds
    .map((id) => topicMap.get(id))
    .filter(Boolean);

  sheet.topics = reorderedTopics;

  saveSheet(sheet);

  res.json(sheet.topics);
}

module.exports = {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics
};