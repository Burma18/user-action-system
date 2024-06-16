import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import Producer from "./producer";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();
const producer = new Producer();

app.use(cors());
app.use(express.json());

app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({ data: { name, email } });
    await producer.publishMessage("UserCreated", user);
    res.status(201).json(user);
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const allUsers = await prisma.user.findMany();

    res.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.put("/users/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { name, email } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });

    await producer.publishMessage("UserUpdated", updatedUser);

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ error: "Failed to update user" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
