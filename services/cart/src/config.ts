import dotenv from 'dotenv';

dotenv.config({
    path:'.env'
});


export const REDIS_PORT=process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
export const REDIS_HOST=process.env.REDIS_HOST || 'localhost';

export const CART_TTL=process.env.CART_TTL ? parseInt(process.env.CART_TTL) : 900; // default 1 hour

export const INVERTORY_SERVICE=process.env.INVERTORY_SERVICE_URL || 'http://localhost:4001';