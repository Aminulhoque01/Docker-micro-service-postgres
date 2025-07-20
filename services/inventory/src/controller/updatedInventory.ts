import { NextFunction, Request, Response } from "express";

import { InventoryUpdateDTOSchema } from "../schema";
import prisma from "../prisma";

const updatedInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse request body using your DTO schema
   const {id}= req.params;

   const inventory= await prisma.inventory.findUnique({
    where:{id},
   })
    
   if(!inventory){
    return res.status(404).json({message:'Inventory not found'});

   }

    const parsedBody = InventoryUpdateDTOSchema.safeParse(req.body);
   
       // If validation fails, return 400 with error details
       if (!parsedBody.success) {
         return res.status(400).json({ error: parsedBody.error });
       }


    //    updated the inventory 

    const lasHistory= await prisma.history.findFirst({
        where:{inventoryId:id},
        orderBy:{createdAt:'desc'}
    })

    //calculate the new quantity

    let newQuantity= inventory.quantity;

    if(parsedBody.data.actionType === "In"){
        newQuantity += parsedBody.data.quantity;
    }else if(parsedBody.data.actionType === "OUT"){
        newQuantity -= parsedBody.data.quantity
    }else{
        return res.status(400).json({message: "Invelitd action type"})
    }


    const updatedInventory = await prisma.inventory.update({
        where:{id},
        data:{
            quantity: newQuantity,
            histories:{
                create:{
                    actionType: parsedBody.data.actionType,
                    quantityChanged:parsedBody.data.quantity,
                    lastQuantity:lasHistory?.newQuantity || 0,
                    newQuantity
                }
            }
        },
        select:{
            id:true,
            quantity:true,
        }

    })

    // Return the created inventory
    return res.status(200).json(updatedInventory);
  } catch (error) {
    console.log(error); // Log the error to console for debugging

    // Send an error response if something goes wrong
    return res.status(500).json({
      message: "An error occurred while creating the inventory",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export default updatedInventory;
