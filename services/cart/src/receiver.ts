import amqp from 'amqplib';
import redis from './redis';

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
    },{
        noAck:true
    });
}

receiverFromQueue('clear-cart',(msg)=>{
    console.log(`Recived clear-cart: ${msg}`)
    const parsedMessage = JSON.parse(msg);

    const cartSessionId = parsedMessage.cartSessionId;
    redis.del(`session:${cartSessionId}`);
    redis.del(`Cart:${cartSessionId}`);

    console.log(`cart clear`)
})