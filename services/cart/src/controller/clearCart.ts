import { NextFunction, Request, Response } from "express";
import redis from "../redis";


const clearCart=async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const cartSessionId = req.headers['x-cart-session-id'] as string || null;

        if (!cartSessionId) {
            return res.status(400).json({ message: "Cart session id is required" });
        }

        

        //Check if the session id exists in the store
        const Exists = await redis.exists(`session:${cartSessionId}`);
        if (!Exists) {
           delete req.headers['x-cart-session-id'] 
            return res.status(400).json({ data: [] });
        }

       
        

        //clear the cart
        await redis.del(`cart:${cartSessionId}`);
        await redis.del(`session:${cartSessionId}`);
         delete req.headers['x-cart-session-id']
        return res.status(200).json({ data: "Cart cleared successfully" });
        
    } catch (error) {
        next(error);
    }
}
export default clearCart;