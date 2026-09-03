const {
  getSheet,
  saveSheet,
  findTopic,
  findSubTopic
} = require("../services/sheetService");

const { generateId } = require("../utils/idGenerator");

// GET /api/topics/:topicId/subtopics
function getSubTopics(req, res) {
  const sheet = getSheet();

  const topic = findTopic(
    sheet,
    req.params.topicId
  );

  if (!topic) {
    return res.status(404).json({
      message: "Topic not found"
    });
  }

  res.json(topic.subTopics);
}

// POST /api/topics/:topicId/subtopics
function createSubTopic(req, res) {
  const sheet = getSheet();

  const topic = findTopic(
    sheet,
    req.params.topicId
  );

  if (!topic) {
    return res.status(404).json({
      message: "Topic not found"
    });
  }

  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Subtopic title is required"
    });
  }

  const subTopic = {
    id: generateId("subtopic"),
    title: title.trim(),
    questions: []
  };

  topic.subTopics.push(subTopic);

  saveSheet(sheet);

  res.status(201).json(subTopic);
}

// PUT /api/subtopics/:id
function updateSubTopic(req, res) {
  const sheet = getSheet();

  const subTopic = findSubTopic(
    sheet,
    req.params.id
  );

  if (!subTopic) {
    return res.status(404).json({
      message: "Subtopic not found"
    });
  }

  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Subtopic title is required"
    });
  }

  subTopic.title = title.trim();

  saveSheet(sheet);

  res.json(subTopic);
}

// DELETE /api/subtopics/:id
function deleteSubTopic(req, res) {
  const sheet = getSheet();

  for (const topic of sheet.topics) {
    const index = topic.subTopics.findIndex(
      (sub) => sub.id === req.params.id
    );

    if (index !== -1) {
      const deleted = topic.subTopics.splice(
        index,
        1
      )[0];

      saveSheet(sheet);

      return res.json({
        message: "Subtopic deleted",
        subTopic: deleted
      });
    }
  }

  res.status(404).json({
    message: "Subtopic not found"
  });
}

// PUT /api/subtopics/reorder
function reorderSubTopics(req, res) {
  const sheet = getSheet();

  const {
    topicId,
    subTopicIds
  } = req.body;

  const topic = findTopic(sheet, topicId);

  if (!topic) {
    return res.status(404).json({
      message: "Topic not found"
    });
  }

  if (!Array.isArray(subTopicIds)) {
    return res.status(400).json({
      message: "subTopicIds must be an array"
    });
  }

  const subTopicMap = new Map(
    topic.subTopics.map((subTopic) => [
      subTopic.id,
      subTopic
    ])
  );

  topic.subTopics = subTopicIds
    .map((id) => subTopicMap.get(id))
    .filter(Boolean);

  saveSheet(sheet);

  res.json(topic.subTopics);
}

module.exports = {
  getSubTopics,
  createSubTopic,
  updateSubTopic,
  deleteSubTopic,
  reorderSubTopics
};