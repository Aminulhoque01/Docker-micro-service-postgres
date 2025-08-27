import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "../config";


const redis = new Redis({
    host:REDIS_HOST,
    port: REDIS_PORT,  
});

const CHENNEL_KEY= '__keyevent@0__:expired';
redis.config("SET", "notify-keyspace-events", "Ex");
redis.subscribe(CHENNEL_KEY);

redis.on("message", async (channel, message) => {
    if (channel === CHENNEL_KEY) {
        console.log(`Key expired:`, message);
        const carKey = message.split(':').pop();
        if(!carKey) return;
        
    }
});