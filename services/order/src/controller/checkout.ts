// validation user inputs
// Get cart items using cartSessionId
// If cart is empty return error 400
// Create order in orders items
// invoke email service
// invoke cart service

import { NextFunction, Request, Response } from "express";
import { OrderSchema, CartItemSchema } from "../schema";
import axios from "axios";
import { CART_SERVICE, EMAIL_SERVICE, PRODUCT_SERVICE } from "../config";
import z from "zod";
import prisma from "../prisma";


const checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // validation request
        const parsedBody = OrderSchema.safeParse(req.body)
        if (!parsedBody.success) {
            return res.status(400).json({ message: "Invalid request", errors: parsedBody.error })
        }

        // get cart details
        const { data: cartData } = await axios.get(`${CART_SERVICE}/cart/me`, {
            headers: {
                'x-cart-session-id': parsedBody.data.cartSessionId
            }
        });
        const cartItems = z.array(CartItemSchema).safeParse(cartData.items);
        if (!cartItems.success) {
            return res.status(500).json({ message: "Invalid cart items schema", errors: cartItems.error })
        }
        if (cartItems.data.length === 0) {
            return res.status(400).json({ message: "Cart is empty" })
        }

        // get product details for each cart items
        const productDetails = await Promise.all(
            cartItems.data.map(async (item) => {
                const { data: product } = await axios.get(`${PRODUCT_SERVICE}/product/${item.productId}`);
                return {
                    productId: product.id as string,
                    productName: product.name as string,
                    unitPrice: product.price as number,
                    quantity: item.quantity as number,
                    sku: product.sku as string,
                    inventoryId: item.inventoryId as string,
                    totalPrice: product.price * item.quantity
                };
            })
        )

        const subTotal = productDetails.reduce((acc, item) => acc + item.totalPrice, 0);

        // TODO: will handle tax calculation later
        const tax = 0;
        const grandTotal = subTotal + tax;

        // create order 

        const order = await prisma.order.create({
            data: {
                userId: parsedBody.data.userId,
                userName: parsedBody.data.userName,
                userEmail: parsedBody.data.userEmail,
                subtotal: subTotal,
                tax,
                grandTotal,
                totalPrice: grandTotal,
                orderItems: {
                    create: productDetails.map((item) => ({
                        ...item,
                    }))
                },

            },
        });

        //clear cart
        await axios.get(`${CART_SERVICE}/cart/clear`, {
            headers: {
                'x-cart-session-id': parsedBody.data.cartSessionId
            }
        });

        // send order confirmation email
        await axios.post(`${EMAIL_SERVICE}/emails/send`,{
            recipient: parsedBody.data.userEmail,
            subject: "Order Confirmation",
            body: `Your order with id ${order.id} has been placed successfully.`,
            source: "Checkout"
        });

        return res.status(201).json({ message: "Order created successfully", order })
    } catch (error) {
        next(error)

    }
}

export default checkout;