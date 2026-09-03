const express = require("express");
const cors = require("cors");

const topicRoutes = require("./routes/topicRoutes");
const subTopicRoutes = require("./routes/subTopicRoutes");
const questionRoutes = require("./routes/questionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/topics", topicRoutes);
app.use("/api", subTopicRoutes);
app.use("/api", questionRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK"
  });
});

module.exports = app;