const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const RabbitMQConsumer = require("./consumer");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const consumer = new RabbitMQConsumer(
  process.env.RABBITMQ_URL || "amqp://localhost",
  "user-actions",
  "ActionHistoryQueue"
);
consumer.startConsuming();

app.get("/actions", async (req, res) => {
  try {
    const allActions = await prisma.action.findMany();
    res.json(allActions);
  } catch (error) {
    console.error("Error fetching actions:", error);
    res.status(500).json({ error: "Failed to fetch actions" });
  }
});

app.get("/action-history", async (req, res) => {
  try {
    const { userId, page, pageSize } = req.query;
    const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || 10) : 0;
    const take = parseInt(pageSize || 10);

    const where = userId ? { userId: parseInt(userId) } : {};

    const actionHistory = await prisma.action.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });

    res.json(actionHistory);
  } catch (error) {
    console.error("Error fetching action history:", error);
    res.status(500).json({ error: "Failed to fetch action history" });
  }
});

app.listen(port, () => {
  console.log(`Action History Service is running on port: ${port}`);
});
