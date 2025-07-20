import { NextFunction, Request, Response } from "express";

import { InventoryCreateDTOSchema } from "../schema";
import prisma from "../prisma";

const createInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse request body using your DTO schema
    const parsedBody = InventoryCreateDTOSchema.safeParse(req.body);

    // If validation fails, return 400 with error details
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error });
    }

    // Create the inventory record along with history
    const inventory = await prisma.inventory.create({
      data: {
       ...parsedBody.data,
        productId: parsedBody.data.productId, // Ensure the productId matches the Prisma schema
        histories: { // Create History using the proper relation
          create: {
            actionType: "In", // Assuming "IN" is a valid action type
            quantityChanged: parsedBody.data.quantity,
            lastQuantity: 0,  // Assuming no previous quantity (can be adjusted based on your logic)
            newQuantity: parsedBody.data.quantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    // Return the created inventory
    return res.status(200).json(inventory);
  } catch (error) {
    console.log(error); // Log the error to console for debugging

    // Send an error response if something goes wrong
    return res.status(500).json({
      message: "An error occurred while creating the inventory",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export default createInventory;
