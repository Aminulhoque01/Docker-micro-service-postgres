import { NextFunction, Request, Response } from "express";
import { UserLoginSchema } from "../schema";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // history tracking
        // You can implement a history tracking mechanism here if needed
        const ipAddress = req.headers['x-forwarded-for'] || req.ip || "";
        const userAgent = req.headers['user-agent'] || "";

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

        //check if user is active
        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                message: `User is not active, current status: ${user.status.toLocaleLowerCase()}`,
            });
        }

        //ganarate JWT token
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "1h" }
        )

        return res.status(200).json({
            message: "User logged in successfully",
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
                verified: user.verified,
            }
        });

    } catch (error) {
        next(error);
    }
};


export default userLogin;