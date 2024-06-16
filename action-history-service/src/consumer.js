const { PrismaClient } = require("@prisma/client");
const amqp = require("amqplib");

const prisma = new PrismaClient();

class RabbitMQConsumer {
  constructor(url, exchangeName, queueName) {
    this.url = url;
    this.exchangeName = exchangeName;
    this.queueName = queueName;
    this.channel = null;
    this.connection = null;
  }

  async startConsuming() {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchangeName, "direct");
      const q = await this.channel.assertQueue(this.queueName);

      await this.channel.bindQueue(q.queue, this.exchangeName, "UserCreated");
      await this.channel.bindQueue(q.queue, this.exchangeName, "UserUpdated");

      this.channel.consume(q.queue, async (msg) => {
        if (msg !== null) {
          const rawMessage = msg.content.toString();

          try {
            const data = JSON.parse(rawMessage);

            const { logType, userName, userEmail, userId } = data;

            await prisma.action.create({
              data: {
                action: logType,
                userEmail: userName,
                userName: userEmail,
                userId: userId,
              },
            });

            this.channel.ack(msg);
            console.log("Message processed and acknowledged:", data);
          } catch (error) {
            console.error("Error processing message:", error.message);
            this.channel.nack(msg, false, false); // requeue set to false to prevent infinite loop

            // Close the channel after handling the error
            await this.stopConsuming();
          }
        }
      });

      console.log("Consumer is set up and waiting for messages...");
    } catch (error) {
      console.error("Error setting up consumer:", error.message);
      if (this.channel) {
        await this.stopConsuming();
      }
    }
  }

  async stopConsuming() {
    if (this.channel !== null) {
      await this.channel.close();
    }
    if (this.connection !== null) {
      await this.connection.close();
    }
    console.log("Consumer stopped and channel closed.");
  }
}

module.exports = RabbitMQConsumer;
