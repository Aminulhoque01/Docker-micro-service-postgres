import { NextFunction, Request, Response } from "express";
import { UserCreateSchema } from "../schema";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import axios from "axios";


const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedBody = UserCreateSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                message: parsedBody.error.issues,
            });
        }
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: parsedBody.data.email,
            },
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10)
         const hashedPassword = await bcrypt.hash(parsedBody.data.password, salt);
        
         // Create auth user
        const user = await prisma.user.create({
            data: {
                ...parsedBody.data,
                password: hashedPassword, // Save the hashed password
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
                verified: true,
            }
        });
        console.log(`User created successfully with ID: ${user}`);
        // user profile creation can be handled here if needed
        // Return the created user without the password
         await axios.post(`${process.env.USER_SERVICE_URL}/users`, {
            authUserId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            verified: user.verified,
         });

        return res.status(201).json({
            message: "User registered successfully",
            user,
        });
     
    } catch (error) {
        next(error);
    }
}

export default userRegistration;