import amqp from 'amqplib';

const receiverFromQueue = async (queue: string, callback: (message: string) => void) => {

    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    const exchange = 'order';
    await channel.assertExchange(exchange, 'direct', { durable: true });

    const q = await channel.assertQueue(queue, { durable: true });
    channel.bindQueue(q.queue, exchange, queue);

    channel.consume(q.queue, (msg) => {
        if (msg) {
            callback(msg.content.toString());
        }
    });
}