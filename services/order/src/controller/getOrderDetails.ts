import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";

const getOrderByeId=async(req:Request,res:Response,next:NextFunction)=>{
    try {
       const {id}=req.params;
       const order= await prisma.order.findUnique({
        where:{
            id: req.params.id
        },
         include:{
            orderItems:true
         }
       });
       if(!order){
        return res.status(404).json({message:"Order not found"})
       }
       return res.status(200).json({order})
    } catch (error) {
        next(error)
    }
}

export default getOrderByeId;