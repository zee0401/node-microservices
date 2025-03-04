import amqp from "amqplib";
import logger from "./logger.js";

let connection = null;
let channel = null;

const EXCHANGE = "search-event";

export const connectToRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE, "topic", { durable: false });
        logger.info("Connected to RabbitMQ");
        return channel;
    } catch (error) {
        logger.error("Error connecting to rabbit mq", error);
    }
};

export const consumeEvent = async (routingKey, callback) => {
    if (!channel) {
        await connectToRabbitMQ();
    }

    const queue = await channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(queue.queue, EXCHANGE, routingKey);
    channel.consume(queue.queue, async (msg) => {
        if (msg !== null) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg);
        }
    });
    logger.info(`Subscribed to event: ${routingKey}`);
};
