const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../data/sheet.json"
);

function getSheet() {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

function saveSheet(sheet) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(sheet, null, 2),
    "utf8"
  );
}

// -------------------------------
// Find helpers
// -------------------------------

function findTopic(sheet, topicId) {
  return sheet.topics.find(
    (topic) => topic.id === topicId
  );
}

function findSubTopic(sheet, subTopicId) {
  for (const topic of sheet.topics) {
    const subTopic = topic.subTopics.find(
      (sub) => sub.id === subTopicId
    );

    if (subTopic) {
      return subTopic;
    }
  }

  return null;
}

function findQuestion(sheet, questionId) {
  for (const topic of sheet.topics) {
    for (const subTopic of topic.subTopics) {
      const question = subTopic.questions.find(
        (q) => q.id === questionId
      );

      if (question) {
        return question;
      }
    }
  }

  return null;
}

module.exports = {
  getSheet,
  saveSheet,
  findTopic,
  findSubTopic,
  findQuestion
};