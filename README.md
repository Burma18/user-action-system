# User Action System

## Overview

The User Action System is a microservice architecture for handling user actions such as creation and updates. The system utilizes RabbitMQ for message brokering and Prisma for database interactions.

## Components

### Producer

The producer is responsible for sending user action messages to RabbitMQ when a user is created or updated.

### Consumer

The consumer listens for messages from RabbitMQ, processes them, and saves the actions to the database using Prisma.

## Setup

### Prerequisites

- Node.js
- RabbitMQ
- PostgreSQL or another database supported by Prisma

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd user-action-system
   cd action-history-service
   cd user-management-service

   ```

2. Install dependencies:

   ```bash
   npm install

   ```

3. Configuration:

   ```plaintext
   DATABASE_URL="postgresql://user:password@localhost:5432/database"
   RABBITMQ_URL="amqp://localhost"

   ```

## Running the Application

1.  Start the Consumer:

```bash
cd action-history-service
npm run start

```

2.  Start the Producer:

```bash
cd user-management-service
npm run start
```

## Contributing

Feel free to contribute by opening issues or pull requests.
