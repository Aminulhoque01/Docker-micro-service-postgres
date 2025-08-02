import { NextFunction, Request, Response } from "express";
import { UserLoginSchema } from "../schema";
import prisma from "../prisma";
import bcrypt from "bcryptjs";


const userLogin = async (req:Request, res:Response, next:NextFunction) => {
    try {
        // Validate request body
        const parsedBody = UserLoginSchema.safeParse(req.body);
        if (!parsedBody.success) {  
            return res.status(400).json({
                message: parsedBody.error.issues,
            });
        }
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: {
                email: parsedBody.data.email,
            },
            select: {
                id: true,
                email: true,
                password: true, // Include password for comparison
                name: true,
                role: true,
                status: true,
                createdAt: true,
                verified: true,
            }
        })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        // compare passwords
        const isPasswordValid = await bcrypt.compare(parsedBody.data.password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        //check if user is verified
        if (!user.verified) {
            return res.status(403).json({
                message: "User is not verified",
            });
        }

        const ipAddress = req.headers['x-forwarded-for'] || req.ip || "";
        const userAgent = req.headers['user-agent'] || "";
    } catch (error) {
        next(error);
    }
};


export default userLogin;