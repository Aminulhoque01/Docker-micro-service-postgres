

import { NextFunction, Request, Response } from "express";
import { OrderSchema, CartItemSchema } from "../schema";
import axios from "axios";
import { CART_SERVICE, EMAIL_SERVICE, PRODUCT_SERVICE } from "../config";
import { z } from "zod";
import prisma from "../prisma";
import sendToQueue from "../queue";

const checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request
        const parsedBody = OrderSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ message: "Invalid request", errors: parsedBody.error });
        }

        // Get cart details
        const { data: cartData } = await axios.get(`${CART_SERVICE}/my-cart`, {
            headers: {
                "x-cart-session-id": parsedBody.data.cartSessionId,
            },
        });
        if (!cartData.data || !Array.isArray(cartData.data)) {
            return res.status(500).json({ message: "Invalid cart data from CART_SERVICE" });
        }

        const cartItems = z.array(CartItemSchema).safeParse(cartData.data);
        if (!cartItems.success) {
            return res.status(500).json({ message: "Invalid cart items schema", errors: cartItems.error });
        }
        if (cartItems.data.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Get product details for each cart item
        const productDetails = await Promise.all(
            cartItems.data.map(async (item) => {
                try {
                    const { data: product } = await axios.get(`${PRODUCT_SERVICE}/product/${item.productId}`);
                    if (!product || !product.id || !product.name || !product.price || !product.sku) {
                        throw new Error(`Invalid product data for productId: ${item.productId}`);
                    }
                    return {
                        productId: product.id as string,
                        productName: product.name as string,
                        unitPrice: product.price as number,
                        quantity: item.quantity as number,
                        sku: product.sku as string,
                        totalPrice: product.price * item.quantity,
                    };
                } catch (error) {
                    throw new Error(`Failed to fetch product ${item.productId}: ${error}`);
                }
            })
        );

        const subTotal = productDetails.reduce((acc, item) => acc + item.totalPrice, 0);
        const tax = 0;
        const grandTotal = subTotal + tax;

        // Create order
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
                        productId: item.productId,
                        productName: item.productName,
                        unitPrice: item.unitPrice,
                        quantity: item.quantity,
                        sku: item.sku,
                        totalPrice: item.totalPrice,
                    })),
                },
            },
        });

        console.log(`order created`, order)

        // Clear cart
        // await axios.get(`${CART_SERVICE}/clear-cart`, {
        //     headers: {
        //         "x-cart-session-id": parsedBody.data.cartSessionId,
        //     },
        // });

        // Send order confirmation email (non-blocking)
        // try {
        //     const emailPayload = {
        //         recipient: parsedBody.data.userEmail,
        //         subject: "Order Confirmation",
        //         body: `Thank you for your order.Your order with id ${order.id} has been placed successfully.`,
        //         source: "Checkout",
        //     };
        //     console.log("Email Payload:", emailPayload);
        //     await axios.post(`${EMAIL_SERVICE}/emails/send-email`, emailPayload);
        //     console.log("Email sent successfully");
        // } catch (emailError) {
        //     console.error("Failed to send email:", emailError);
        //     // Log the error but don't fail the request
        // }

        // send queue message (non-blocking)
        sendToQueue('/emails/send-email', JSON.stringify(order));
        sendToQueue('clear-cart', JSON.stringify({ cartSessionId: parsedBody.data.cartSessionId }));

        return res.status(201).json({ message: "Order created successfully", order });

    } catch (error) {
        if (axios.isAxiosError(error)) {
            return res.status(500).json({
                message: `Failed to process request to ${error.config?.url}`,
                status: error.response?.status,
                details: error.response?.data,
            });
        }
        return res.status(500).json({ message: "Internal server error", error: error });
    }
};

export default checkout;