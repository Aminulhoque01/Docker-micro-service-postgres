import { NextFunction, Request, Response } from "express";
import redis from "../redis";



const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cartSessionId = req.headers['x-cart-session-id'] as string || null;

        if (!cartSessionId) {
            return res.status(400).json({ message: "Cart session id is required" });
        }

        // fetch cart from redis
        // const cart = await redis.hgetall(`cart:${cartSessionId}`);
        // if (!cart) {
        //     return res.status(404).json({ message: "Cart not found" });
        // }

        // return res.status(200).json({ cart });

        //Check if the session id exists in the store
        const sessionExists = await redis.exists(`session:${cartSessionId}`);
        if (!sessionExists) {
            await redis.del(`cart:${cartSessionId}`); // Delete the cart if session is invalid
            return res.status(400).json({ data: [] });
        }

        const items = await redis.hgetall(`cart:${cartSessionId}`);
        if (Object.keys(items).length === 0) {
            return res.status(200).json({ data: [] })
        }

        //format the cart items
        const formattedItems = Object.keys(items).map((key) => {
            const { inventoryId, quantity } = JSON.parse(items[key]) as { inventoryId: string; quantity: number };
            return {
                inventoryId,
                quantity,
                productId: key
            }
        });

        return res.status(200).json({ data: formattedItems });






    } catch (error) {
        next(error);
    }
};

export default getMyCart;