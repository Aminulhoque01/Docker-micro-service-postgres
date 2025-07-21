import { NextFunction,Request,Response } from "express";
import { ProductCreateDTOSchema } from "../schema";
import prisma from "../prisma";
import axios from "axios";
import { INVENTORY_URL } from "../config";


const createProduct = async(req:Request, res:Response, next:NextFunction)=>{
  try {
    
    const parsedBody = ProductCreateDTOSchema.safeParse(req.body);

    if(!parsedBody.success){
        return res .status(400).json({message:'Invalid request body', errors: parsedBody.error
        })
    }

    const existingProduct = await prisma.product.findFirst({
        where:{
            sku: parsedBody.data.sku,
        },

    });


    if(existingProduct){
        return res.status(400).json({message:'Product with the same SKU already'})
    }
 
    //    create product 
    const product = await prisma.product.create({
        data: parsedBody.data
        
    })
  console.log(`Product created successfully`, product.id);

    //   create invenotry 
  const {data:inventory}= await axios.post(
    `${INVENTORY_URL}/inventories`,
    {
        productId:product.id,
        sku: product.sku
    }
  )
  console.log(`Inventory created successfully`, inventory.id);

  await prisma.product.update({
    where:{id:product.id},
    data: {inventoryId: inventory.id}
  })
  console.log(`Product updated successfully with inventory id`, inventory.id);

  res.status(2001).json({...product, inventoryId: inventory.id})

  } catch (error) {
    next(error)
  }
}

export default createProduct