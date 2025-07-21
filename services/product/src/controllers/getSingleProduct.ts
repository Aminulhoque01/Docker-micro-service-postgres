import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import axios from "axios";
import { INVENTORY_URL } from "../config";

const getProductDetails = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        console.log('Origin', req.headers.origin);

        const{id}= req.params;

        const product = await prisma.product.findUnique({
            where: {id}
        });

        if(!product){
            res.status(400).json({message:"product not found"})
        }


        if(product?.inventoryId === null){
            const {data: invenotry} = await axios.post(
                `${INVENTORY_URL}/inventories`,
                {
                    productId: product.id,
                    sku: product.sku,
                }
            );

            console.log(`Inventory create successfully`, invenotry.id);


            await prisma.product.update({
                where:{id: product.id},
                data:{
                    inventoryId:invenotry.id
                }
            });

            console.log(`Product updated successfully with inventory id`, invenotry.id);

            return res.status(200).json({
                ...product,
                invenotryId:invenotry.id,
                stock:invenotry.quantity || 0,
                stockStatus: invenotry.quantity > 0?"In stock":" Out of stock"
            })
        }

    } catch (error) {
        next(error)
    }
}

export default getProductDetails;