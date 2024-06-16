import dotenv from "dotenv";
dotenv.config();

export const config = {
  url: process.env.RABBITMQ_URL! || "amqp://localhost",
  exchangeName: "user-actions",
};
