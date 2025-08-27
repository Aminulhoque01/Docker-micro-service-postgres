import { NextFunction, Request, Response } from "express";
import { ProductUpdateDTOSchema } from "../schema";
import prisma from "../prisma";



const updatedProduct=async (req:Request,res:Response, next:NextFunction)=>{
    try {
        
        // verify if the request body is valid;

        const parseBody=ProductUpdateDTOSchema.safeParse(req.body);
        if(!parseBody.success){
            return res.status(400).json({message:"Invalid request", errors:parseBody.error});
        }
        // check if the product exists
        const existingProduct= await prisma.product.findUnique({where:{id:req.params.id}});
        if(!existingProduct){
            return res.status(404).json({message:"Product not found"});
        }


        // update the product
        const updatedProduct = await prisma.product.update({
            where:{id:req.params.id},
            data:parseBody.data
        })

        return res.status(200).json({data:updatedProduct});


    } catch (error) {
        next(error);
    }
}

export default updatedProduct;