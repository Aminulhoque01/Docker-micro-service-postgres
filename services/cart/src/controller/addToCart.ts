



import { NextFunction, Request, Response } from "express";
import { CartItemSchema } from "../schemas";
import redis from "../redis";
import { v4 as uuid } from "uuid";
import { CART_TTL } from "../config";

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const parseBody = CartItemSchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({ message: "Invalid request", errors: parseBody.error });
        }

        let cartSessionId = req.headers["x-cart-session-id"] as string | null;

        // Check if cart session ID exists and is valid
        if (cartSessionId) {
            const existingCart = await redis.exists(`cart:${cartSessionId}`);
            if (!existingCart) {
                cartSessionId = null; // Reset to null to create a new cart
            }
        }

        // If no valid cart session ID, create a new one
        if (!cartSessionId) {
            cartSessionId = uuid();
            console.log("Created new session ID:", cartSessionId);

              //set the cart session id in the redis store
            await redis.setex(`session:${cartSessionId}`, CART_TTL, JSON.stringify({ sessionId: cartSessionId, createdAt: Date.now() }));
            // Set the cart session ID in the response header
            res.setHeader("x-cart-session-id", cartSessionId);
        }

        // Add item to the cart (store as a hash)
        await redis.hset(
            `cart:${cartSessionId}`,
            parseBody.data.productId,
            JSON.stringify({
                inventoryId: parseBody.data.inventoryId,
                quantity: parseBody.data.quantity,
            })
        );

        // Set TTL for the cart (optional, if you want the cart to expire)
        await redis.expire(`cart:${cartSessionId}`, CART_TTL);

        return res.status(200).json({ message: "Item added to cart", cartSessionId });

        // TODO: Check inventory for availability
        // TODO: Update the inventory
    } catch (error) {
        next(error);
    }
};

export default addToCart;