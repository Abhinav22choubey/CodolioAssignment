const mongoose = require("mongoose");
const Question = require("../models/Question");
const SubTopic = require("../models/SubTopic");


const getQuestions = async (req, res) => {
  try {
    const { subTopicId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subTopicId)) {
      return res.status(400).json({
        message: "Invalid subtopic ID",
      });
    }

    const subTopic = await SubTopic.findById(subTopicId);

    if (!subTopic) {
      return res.status(404).json({
        message: "Subtopic not found",
      });
    }

    const questions = await Question.find({
      subTopicId: subTopic._id,
    })
      .sort({ order: 1 })
      .lean();

    return res.status(200).json(
      questions.map((question) => ({
        id: question._id.toString(),
        title: question.title,
        difficulty: question.difficulty,
        platform: question.platform || null,
        problemUrl: question.problemUrl || null,
        resource: question.resource || null,
      }))
    );
  } catch (error) {
    console.error("Get questions error:", error);

    return res.status(500).json({
      message: "Failed to get questions",
      error: error.message,
    });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { subTopicId } = req.params;

    const {
      title,
      difficulty,
      platform,
      problemUrl,
      resource,
    } = req.body;

    // Validate subtopic ID
    if (!mongoose.Types.ObjectId.isValid(subTopicId)) {
      return res.status(400).json({
        message: "Invalid subtopic ID",
      });
    }

    // Find subtopic
    const subTopic = await SubTopic.findById(subTopicId);

    if (!subTopic) {
      return res.status(404).json({
        message: "Subtopic not found",
      });
    }

    // Validate title
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Question title is required",
      });
    }

    // Validate difficulty
    if (
      !difficulty ||
      typeof difficulty !== "string" ||
      !difficulty.trim()
    ) {
      return res.status(400).json({
        message: "Question difficulty is required",
      });
    }

    // Find the question with the highest order
    const lastQuestion = await Question.findOne({
      subTopicId: subTopic._id,
    }).sort({
      order: -1,
    });

    // Start from 1 if there are no questions
    const questionOrder = lastQuestion
      ? lastQuestion.order + 1
      : 1;

    // Create question
    const question = await Question.create({
      title: title.trim(),
      difficulty: difficulty.trim(),
      platform:
        typeof platform === "string" ? platform.trim() : "",
      problemUrl:
        typeof problemUrl === "string" ? problemUrl.trim() : "",
      resource:
        typeof resource === "string" ? resource.trim() : "",
      subTopicId: subTopic._id,
      order: questionOrder,
    });

    return res.status(201).json({
      id: question._id.toString(),
      title: question.title,
      difficulty: question.difficulty,
      platform: question.platform || null,
      problemUrl: question.problemUrl || null,
      resource: question.resource || null,
    });
  } catch (error) {
    console.error("Create question error:", error);

    return res.status(500).json({
      message: "Failed to create question",
      error: error.message,
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      difficulty,
      platform,
      problemUrl,
      resource,
      order,
    } = req.body;

    // Validate question ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid question ID",
      });
    }

    // Find question
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const updateData = {};

    // Title
    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          message: "Question title cannot be empty",
        });
      }

      updateData.title = title.trim();
    }

    // Difficulty
    if (difficulty !== undefined) {
      if (
        typeof difficulty !== "string" ||
        !difficulty.trim()
      ) {
        return res.status(400).json({
          message: "Question difficulty cannot be empty",
        });
      }

      updateData.difficulty = difficulty.trim();
    }

    // Platform
    if (platform !== undefined) {
      if (typeof platform !== "string") {
        return res.status(400).json({
          message: "Platform must be a string",
        });
      }

      updateData.platform = platform.trim();
    }

    // Problem URL
    if (problemUrl !== undefined) {
      if (typeof problemUrl !== "string") {
        return res.status(400).json({
          message: "Problem URL must be a string",
        });
      }

      updateData.problemUrl = problemUrl.trim();
    }

    // Order
    if (order !== undefined) {
      if (
        typeof order !== "number" ||
        !Number.isInteger(order) ||
        order < 1
      ) {
        return res.status(400).json({
          message: "Order must be a positive integer",
        });
      }

      updateData.order = order;
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    return res.status(200).json({
      id: updatedQuestion._id.toString(),
      title: updatedQuestion.title,
      difficulty: updatedQuestion.difficulty,
      platform: updatedQuestion.platform || null,
      problemUrl: updatedQuestion.problemUrl || null,
      resource: updatedQuestion.resource || null,
    });
  } catch (error) {
    console.error("Update question error:", error);

    return res.status(500).json({
      message: "Failed to update question",
      error: error.message,
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate question ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid question ID",
      });
    }

    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    return res.status(200).json({
      message: "Question deleted",
      question: {
        id: question._id.toString(),
        title: question.title,
        difficulty: question.difficulty,
        platform: question.platform || null,
        problemUrl: question.problemUrl || null,
        resource: question.resource || null,
      },
    });
  } catch (error) {
    console.error("Delete question error:", error);

    return res.status(500).json({
      message: "Failed to delete question",
      error: error.message,
    });
  }
};

const reorderQuestions = async (req, res) => {
  try {
    const { subTopicId, questionIds } = req.body;

    // Validate subtopicId
    if (!subTopicId) {
      return res.status(400).json({
        message: "subTopicId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(subTopicId)) {
      return res.status(400).json({
        message: "Invalid subtopic ID",
      });
    }

    // Validate questionIds
    if (!Array.isArray(questionIds)) {
      return res.status(400).json({
        message: "questionIds must be an array",
      });
    }

    // Validate every question ID
    const invalidObjectIds = questionIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidObjectIds.length > 0) {
      return res.status(400).json({
        message: "Some question IDs are invalid",
        invalidIds: invalidObjectIds,
      });
    }

    // Find subtopic
    const subTopic = await SubTopic.findById(subTopicId);

    if (!subTopic) {
      return res.status(404).json({
        message: "Subtopic not found",
      });
    }

    // Get all questions belonging to this subtopic
    const questions = await Question.find({
      subTopicId: subTopic._id,
    });

    // Every question must be included
    if (questionIds.length !== questions.length) {
      return res.status(400).json({
        message:
          "questionIds must contain all questions in this subtopic",
      });
    }

    // Map questions by MongoDB _id
    const questionMap = new Map(
      questions.map((question) => [
        question._id.toString(),
        question,
      ])
    );

    // Check that every question belongs to this subtopic
    const invalidIds = questionIds.filter(
      (id) => !questionMap.has(id.toString())
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        message:
          "Some question IDs are invalid or do not belong to this subtopic",
        invalidIds,
      });
    }

    // Check duplicate IDs
    const uniqueIds = new Set(
      questionIds.map((id) => id.toString())
    );

    if (uniqueIds.size !== questionIds.length) {
      return res.status(400).json({
        message: "questionIds cannot contain duplicates",
      });
    }

    // Update order
    const operations = questionIds.map(
      (questionId, index) => ({
        updateOne: {
          filter: {
            _id: questionId,
            subTopicId: subTopic._id,
          },
          update: {
            $set: {
              order: index + 1,
            },
          },
        },
      })
    );

    if (operations.length > 0) {
      await Question.bulkWrite(operations);
    }

    // Return reordered questions
    const reorderedQuestions = await Question.find({
      subTopicId: subTopic._id,
    })
      .sort({
        order: 1,
      })
      .lean();

    return res.status(200).json(
      reorderedQuestions.map((question) => ({
        id: question._id.toString(),
        title: question.title,
        difficulty: question.difficulty,
        platform: question.platform || null,
        problemUrl: question.problemUrl || null,
        resource: question.resource || null,
      }))
    );
  } catch (error) {
    console.error("Reorder questions error:", error);

    return res.status(500).json({
      message: "Failed to reorder questions",
      error: error.message,
    });
  }
};

module.exports = {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
};