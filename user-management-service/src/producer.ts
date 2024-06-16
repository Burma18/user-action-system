import * as amqp from "amqplib";
import { config } from "./config/config";
import { User } from "@prisma/client";

interface LogDetails {
  logType: string;
  userName: string;
  userEmail: string;
  userId: number;
  dateTime: Date;
}

class Producer {
  private channel: amqp.Channel | null = null;
  private connection: amqp.Connection | null = null;

  constructor() {
    this.init();
  }

  async init() {
    this.connection = await amqp.connect(config.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(config.exchangeName, "direct");
  }

  async publishMessage(routingKey: string, user: User): Promise<void> {
    if (!this.channel || !this.connection) {
      await this.init();
    }

    const logDetails: LogDetails = {
      logType: routingKey,
      userName: user.name,
      userEmail: user.email,
      userId: user.id,
      dateTime: new Date(),
    };

    this.channel!.publish(
      config.exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(logDetails))
    );

    console.log(
      `The log ${JSON.stringify(logDetails)} is sent to exchange ${
        config.exchangeName
      }`
    );

    setTimeout(() => {
      if (this.connection) {
        this.connection.close().then(() => {
          console.log("Connection closed, exiting process...");
          process.exit(0);
        });
      } else {
        console.log("No active connection to close.");
        process.exit(0);
      }
    }, 500);
  }
}

export default Producer;
