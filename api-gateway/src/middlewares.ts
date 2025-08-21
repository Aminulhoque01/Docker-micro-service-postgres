import axios from "axios";
import { NextFunction, Request, Response } from "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
            };
        }
    }
}

interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers['authorization']) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const token = req.headers['authorization']?.split(' ')[1];
 
        const { data } = await axios.post<AuthResponse>('http://localhost:4003/auth/verify-token', {
            accessToken: token,
            headers: {
                ip: req.ip,
                'user-agent': req.headers['user-agent']
            }
        });
        req.user = data.user;
       

        req.headers['x-user-id'] = data.user.id;
        req.headers['x-user-email'] = data.user.email;
        req.headers['x-user-name'] = data.user.name;
        req.headers['x-user-role'] = data.user.role;

        next();

    } catch (error) {
        console.log('[auth middleware]', error);

        // Return 500 for internal server error
        return res.status(500).json({ message: 'Internal Server Error', error: error });
    }
};

const middlewares = [auth];

export default middlewares;




