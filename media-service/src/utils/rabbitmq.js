import amqp from "amqplib";
import logger from "./logger";

const EXCHANGE_NAME = "social-media-exchange";

let channel = null;

export const connectToRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, "topic", {
            durable: false,
        });
        logger.info("Connected to rabbitmq");
        return channel;
    } catch (error) {
        logger.error("Error in connecting to rabbitmq", error);
    }
};

export const publishEventToRabbitMQ = async (routingKey, message) => {
    if (!channel) {
        connectToRabbitMQ();
    }
    await channel.publish(
        EXCHANGE_NAME,
        routingKey,
        Buffer.from(JSON.stringify(message))
    );
    logger.info("Published event :", routingKey);
};

export const consumeEventFromRabbitMQ = async (routingKey, callback) => {
    if (!channel) {
        connectToRabbitMQ();
    }
    const q = await channel.assertQueue("", {
        exclusive: true,
    });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
    channel.consume(q.queue, (msg) => {
        if (msg !== null) {
            const message = JSON.parse(msg.content.toString());
            callback(message);
            channel.ack(msg);
        }
    });
};
