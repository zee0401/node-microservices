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
