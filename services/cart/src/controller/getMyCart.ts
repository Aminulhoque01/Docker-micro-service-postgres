import { NextFunction, Request, Response } from "express";
import redis from "../redis";



const getMyCart = async(req: Request, res: Response, next:NextFunction) => {
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

        const cart = await redis.hgetall(`cart:${cartSessionId}`);

        return res.status(200).json({ message: "Cart fetched successfully", cart });

    } catch (error) {
        next(error);
    }
};

export default getMyCart;