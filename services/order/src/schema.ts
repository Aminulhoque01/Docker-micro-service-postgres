
import { z } from "zod";



export const OrderSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  cartSessionId: z.string(),
});

export const CartItemSchema = z.object({
  inventoryId: z.string().min(1),
  quantity: z.number(),
  productId: z.string().min(1),
})