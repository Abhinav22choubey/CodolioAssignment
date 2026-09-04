require("dotenv").config();

const mongoose = require("mongoose");

const Topic = require("../models/Topic");
const SubTopic = require("../models/SubTopic");
const Question = require("../models/Question");

const API_URL =
  "https://node.codolio.com/api/question-tracker/v1/sheet/public/get-sheet-by-slug/striver-sde-sheet";

async function seedStriver() {
  try {
    // 1. Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // 2. Fetch Striver SDE Sheet
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();

    const sheet = result?.data?.sheet;
    const questions = result?.data?.questions || [];

    if (!sheet) {
      throw new Error("Sheet data not found");
    }

    if (!questions.length) {
      throw new Error("No questions found in API response");
    }

    console.log(`Fetched ${questions.length} questions`);

    // --------------------------------------------------
    // 3. Get last topic order from your database
    // --------------------------------------------------

    const lastTopic = await Topic.findOne()
      .sort({ order: -1 })
      .lean();

    let nextTopicOrder = lastTopic
      ? lastTopic.order + 1
      : 1;

    // --------------------------------------------------
    // 4. Group questions by topic + subtopic
    // --------------------------------------------------

    const grouped = new Map();

    for (const item of questions) {
      const topicName = item.topic?.trim();

      if (!topicName) continue;

      const subTopicName =
        item.subTopic?.trim() || "General";

      if (!grouped.has(topicName)) {
        grouped.set(topicName, new Map());
      }

      const subTopics = grouped.get(topicName);

      if (!subTopics.has(subTopicName)) {
        subTopics.set(subTopicName, []);
      }

      subTopics.get(subTopicName).push(item);
    }

    // --------------------------------------------------
    // 5. Create Topics
    // --------------------------------------------------

    const topicOrder = sheet.config?.topicOrder || [];

    // Use Codolio's topic order
    // and only create topics that actually have questions.
    const orderedTopics = topicOrder.filter((topicName) =>
      grouped.has(topicName)
    );

    // In case API has a topic not present in topicOrder
    for (const topicName of grouped.keys()) {
      if (!orderedTopics.includes(topicName)) {
        orderedTopics.push(topicName);
      }
    }

    const topicDocs = orderedTopics.map((topicName, index) => ({
      title: topicName,
      order: nextTopicOrder + index,
    }));

    const createdTopics = await Topic.insertMany(topicDocs);

    console.log(`Created ${createdTopics.length} topics`);

    // Map topic title -> MongoDB ObjectId
    const topicMap = new Map();

    createdTopics.forEach((topic) => {
      topicMap.set(topic.title, topic._id);
    });

    // --------------------------------------------------
    // 6. Create SubTopics
    // --------------------------------------------------

    const subTopicDocs = [];

    for (const topicName of orderedTopics) {
      const subTopics = grouped.get(topicName);
      const topicId = topicMap.get(topicName);

      let subTopicOrder = 1;

      for (const subTopicName of subTopics.keys()) {
        subTopicDocs.push({
          title: subTopicName,
          topicId,
          order: subTopicOrder++,
        });
      }
    }

    const createdSubTopics =
      await SubTopic.insertMany(subTopicDocs);

    console.log(
      `Created ${createdSubTopics.length} subtopics`
    );

    // Map "topic::subtopic" -> MongoDB ObjectId
    const subTopicMap = new Map();

    createdSubTopics.forEach((subTopic) => {
      const topic = createdTopics.find(
        (topic) =>
          topic._id.toString() ===
          subTopic.topicId.toString()
      );

      const key = `${topic.title}::${subTopic.title}`;

      subTopicMap.set(key, subTopic._id);
    });

    // --------------------------------------------------
    // 7. Create Questions
    // --------------------------------------------------

    const questionDocs = [];

    // Keep separate order for every subtopic
    const questionOrders = new Map();

    for (const topicName of orderedTopics) {
      const subTopics = grouped.get(topicName);

      for (const [subTopicName, items] of subTopics) {
        const key = `${topicName}::${subTopicName}`;

        const subTopicId = subTopicMap.get(key);

        let order = 1;

        for (const item of items) {
          const question = item.questionId || {};

          questionDocs.push({
            title:
              item.title ||
              question.name ||
              "Untitled",

            difficulty:
              question.difficulty || "Unknown",

            platform:
              question.platform || "",

            problemUrl:
              question.problemUrl || "",

            resource:
              item.resource || "",

            subTopicId,

            order: order++,
          });
        }

        questionOrders.set(key, order - 1);
      }
    }

    const createdQuestions =
      await Question.insertMany(questionDocs);

    console.log(
      `Created ${createdQuestions.length} questions`
    );

    console.log("\nSeed completed successfully!");
    console.log(`Topics: ${createdTopics.length}`);
    console.log(`SubTopics: ${createdSubTopics.length}`);
    console.log(`Questions: ${createdQuestions.length}`);

  } catch (error) {
    console.error("\nSeed failed:");
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

seedStriver();