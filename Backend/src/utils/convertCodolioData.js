const fs = require("fs");
const path = require("path");

// --------------------------------------------------
// FILE PATHS
// --------------------------------------------------

const inputPath = path.join(
  __dirname,
  "../data/codolio-response.json"
);

const outputPath = path.join(
  __dirname,
  "../data/sheet.json"
);

// --------------------------------------------------
// READ CODOLIO DATA
// --------------------------------------------------

const rawData = fs.readFileSync(inputPath, "utf8");
const codolio = JSON.parse(rawData);

// Actual Codolio structure:
// codolio.data.sheet
// codolio.data.questions

const sheet = codolio.data.sheet;
const questions = codolio.data.questions || [];

const topicOrder = sheet.config?.topicOrder || [];
const questionOrder = sheet.config?.questionOrder || [];

// --------------------------------------------------
// QUESTION ORDER MAP
// --------------------------------------------------

const questionOrderMap = new Map();

questionOrder.forEach((questionId, index) => {
  questionOrderMap.set(questionId, index);
});

// --------------------------------------------------
// CREATE TOPICS
// --------------------------------------------------

const topics = topicOrder.map((topicName) => ({
  id: `topic-${slugify(topicName)}`,
  title: topicName,
  subTopics: []
}));

// Fast topic lookup
const topicMap = new Map();

topics.forEach((topic) => {
  topicMap.set(topic.title, topic);
});

// --------------------------------------------------
// ADD QUESTIONS
// --------------------------------------------------

questions.forEach((question) => {
  const topicName = question.topic;

  if (!topicName) {
    return;
  }

  // Find topic
  let topic = topicMap.get(topicName);

  // Safety: if question contains a topic that is not
  // present in topicOrder, create it.
  if (!topic) {
    topic = {
      id: `topic-${slugify(topicName)}`,
      title: topicName,
      subTopics: []
    };

    topics.push(topic);
    topicMap.set(topicName, topic);
  }

  // ------------------------------------------------
  // SUBTOPIC
  // ------------------------------------------------

  // Your Codolio data has many subTopic: null values.
  // Put those questions under "General".
  const subTopicName = question.subTopic || "General";

  let subTopic = topic.subTopics.find(
    (item) => item.title === subTopicName
  );

  if (!subTopic) {
    subTopic = {
      id: `subtopic-${slugify(topicName)}-${slugify(subTopicName)}`,
      title: subTopicName,
      questions: []
    };

    topic.subTopics.push(subTopic);
  }

  // ------------------------------------------------
  // QUESTION
  // ------------------------------------------------

  const questionInfo = question.questionId || {};

  subTopic.questions.push({
    id: question._id,

    title:
      question.title ||
      questionInfo.name ||
      "Untitled Question",

    difficulty: questionInfo.difficulty || null,

    platform: questionInfo.platform || null,

    problemUrl: questionInfo.problemUrl || null,

    resource: question.resource || null
  });
});

// --------------------------------------------------
// SORT QUESTIONS ACCORDING TO CODOLIO ORDER
// --------------------------------------------------

topics.forEach((topic) => {
  topic.subTopics.forEach((subTopic) => {
    subTopic.questions.sort((a, b) => {
      const indexA =
        questionOrderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;

      const indexB =
        questionOrderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;

      return indexA - indexB;
    });
  });
});

// --------------------------------------------------
// FINAL DATA
// --------------------------------------------------

const output = {
  topics
};

// --------------------------------------------------
// WRITE SHEET.JSON
// --------------------------------------------------

fs.writeFileSync(
  outputPath,
  JSON.stringify(output, null, 2),
  "utf8"
);

// --------------------------------------------------
// STATISTICS
// --------------------------------------------------

let totalSubTopics = 0;
let totalQuestions = 0;

topics.forEach((topic) => {
  totalSubTopics += topic.subTopics.length;

  topic.subTopics.forEach((subTopic) => {
    totalQuestions += subTopic.questions.length;
  });
});

console.log("");
console.log("======================================");
console.log(" Codolio → Sheet conversion complete");
console.log("======================================");
console.log(`Topics:      ${topics.length}`);
console.log(`SubTopics:   ${totalSubTopics}`);
console.log(`Questions:   ${totalQuestions}`);
console.log(`Output:      ${outputPath}`);
console.log("======================================");
console.log("");

// --------------------------------------------------
// HELPER
// --------------------------------------------------

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}