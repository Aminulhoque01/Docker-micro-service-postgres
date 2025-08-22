
import  {Express, Request, Response } from "express";
import config from './config.json';
import axios from "axios";
import middlewares from "./middlewares";
 



export const createHandler = (hostname: string, path: string, method: string) => {
    return async (req: Request, res: Response) => {
        try {
            let url = `${hostname}${path}`;
            req.params && Object.keys(req.params).forEach(params => {
                url = url.replace(`:${params}`, req.params[params]);
            });
            // console.log(`Forwarding ${method} request to: ${url}`); // Debug log
            const { data } = await axios({
                method,
                url, // Use the modified url
                data: req.body,
                headers:{
                    origin:'http://localhost:8085',
                    'x-user-id':req.headers['x-user-id']||"",
                    'x-user-email':req.headers['x-user-email']|| "",
                    'x-user-name':req.headers['x-user-name']||'',
                    'x-user-role':req.headers['x-user-role']||'',
                    'user-agent': req.headers['user-agent'] || '',
                }
            });
            res.json(data);
        } catch (error) {
            if (error instanceof axios) {
             
                return res.status((await error)?.status || 500).json({ message: error  });
            }
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
};

export const getMiddlewares = (names: string[]) => {
    return names
        .map((name) => middlewares.find((m) => m.name === name))
    
};

export const configureRoutes = (app: Express) => {
    // console.log('Config:', JSON.stringify(config, null, 2));
    Object.entries(config.services).forEach(([_name, service]) => {
        const hostname = service.url;
        service.routes.forEach((route) => {
            route.methods.forEach((method) => {
                const handler = createHandler(hostname, route.path, method);
                const endpoint = `/api${route.path}`;
                const middleware= getMiddlewares(route.middlewares)
                app[method.toLowerCase() as keyof Express](endpoint,middleware, handler);
                // console.log(`Registered route: ${method.toUpperCase()} ${endpoint} -> ${hostname}${route.path}`);
            });
        })
    });
};

