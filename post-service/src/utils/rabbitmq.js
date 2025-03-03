import amqp from "amqplib";
import logger from "./logger";

const EXCHANGE_NAME = "social-media-exchange";

const connectToRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, "topic", {
            durable: false,
        });
        logger.info("Connected to rabbitmq");
        return channel;
    } catch (error) {
        logger.error("Error in connecting to rabbitmq", error);
    }
};
export default connectToRabbitMQ;
