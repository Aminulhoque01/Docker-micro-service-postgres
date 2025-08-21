// import { NextFunction, Request, Response } from "express";
// import Jwt from "jsonwebtoken";
// import prisma from "../prisma";
// import { AccessTokenSchema } from "../schema";


// const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         //validate request body
//         const parsedBody = AccessTokenSchema.safeParse(req.body);
//         if (!parsedBody.success) {
//             return res.status(400).json({
//                 message: parsedBody.error.issues,
//             });
//         }

//         const { accessToken } = parsedBody.data;

//         const decoded = Jwt.verify(
//             accessToken,
//             process.env.JWT_SECRET as string    
//         )
//         const user = await prisma.user.findUnique({
//             where: {

//                 id: ( decoded as any).id,
//             },

//             select: {
//                 id: true,
//                 email: true,
//                 name: true,
//                 role: true,
//                 status: true,
//                 createdAt: true,
//                 verified: true,
//             },


//         });
//         if (!user) {
//             return res.status(401).json({
//                 message: "Unauthorized",
//             });
//         }

//         return res.status(200).json({
//             message: "Authenticated successfully",
//             user,
//         });


//     } catch (error) {
//         next(error);
//     }
// }

// export default verifyToken;




import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import prisma from "../prisma";
import { AccessTokenSchema } from "../schema";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const parsedBody = AccessTokenSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                message: parsedBody.error.issues,
            });
        }

        const { accessToken } = parsedBody.data;
        console.log("Access Token:", accessToken); // Debug log to check the access token
        // Decode the JWT token
        const decoded = Jwt.verify(
            accessToken,
            process.env.JWT_SECRET as string    
        );

         
        // Extract the user ID from the decoded token
        const userId = (decoded as any).userId;

        // Check if the user ID is available
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: Invalid or missing user id in token",
            });
        }

        // Query the user from the database using Prisma
        const user = await prisma.user.findUnique({
            where: {
                id: userId, // Use the extracted user ID
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                 
            },
        });

        // If user is not found, return unauthorized error
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized: User not found",
            });
        }

        // If user is found, respond with user details
        return res.status(200).json({
            message: "Authenticated successfully",
            user,
        });

    } catch (error) {
        // Handle unexpected errors
        next(error);
    }
}

export default verifyToken;
