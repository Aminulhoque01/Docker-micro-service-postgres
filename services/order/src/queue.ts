import amqp from "amqplib";
import { Queue_url } from "./config";
import { de } from "zod/v4/locales/index.cjs";

const sendToQueue = async(queue:string, message:string)=>{
    const connection = await amqp.connect(Queue_url);
    const channel = await connection.createChannel();

    const exchange = 'order';
    await channel.assertExchange(exchange, 'direct', { durable: true });

    channel.publish(exchange, queue, Buffer.from(message));
    console.log(`Sent ${message} to${queue}`);

    setTimeout(() => {
        connection.close();
    }, 500); // Give some time for the message to be sent before closing the connection
}

export default sendToQueue;