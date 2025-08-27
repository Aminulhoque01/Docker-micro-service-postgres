import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
 

const getOrder=async(req:Request,res:Response,next:NextFunction)=>{
    try {
       const order= await prisma.order.findMany();
       return res.status(200).json({orders:order})
    } catch (error) {
        next(error)
    }

}
export default getOrder;