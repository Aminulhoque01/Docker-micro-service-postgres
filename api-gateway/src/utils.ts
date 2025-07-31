
import  {Express, Request, Response } from "express";
import config from './config.json';
import axios from "axios";



export const createHandler = (hostname: string, path: string, method: string) => {
    return async (req: Request, res: Response) => {
      try {
          const { data } = await axios({
            method,
            url: `${hostname}${path}`,
            data: req.body
        })
        res.json(data)
      } catch (error) {
        if(error instanceof axios.AxiosError) {
            
            res.status(error.response?.status || 500).json({ message: error.message });
        }
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
}


export const configureRoutes = (app:Express) => {
    Object.entries(config.services).forEach(([_name, service]) => {
        const hostname = service.url;
        service.routes.forEach((route) => {
            route.methods.forEach((method) => {
                const handler = createHandler(hostname, route.path, method);
                const expressMethod = method.toLowerCase() as keyof Express;
                (app[expressMethod] as any)(`/api${route.path}`, handler);
               
            });
        })
    })
}


// import { Express, Request, Response } from "express";
// import axios, { AxiosError } from "axios";
// import config from "./config.json";

// // Define valid Express HTTP methods for type safety
// type ExpressMethod = "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

// // Define config structure for better type checking
// interface RouteConfig {
//   path: string;
//   methods: ExpressMethod[];
// }

// interface ServiceConfig {
//   url: string;
//   routes: RouteConfig[];
// }

// interface Config {
//   services: Record<string, ServiceConfig>;
// }

// // Create a handler for forwarding requests to the target service
// export const createHandler = (hostname: string, path: string, method: ExpressMethod) => {
//   return async (req: Request, res: Response) => {
//     try {
//       console.log(`Forwarding ${method.toUpperCase()} request to ${hostname}${path}`);
//       const { data } = await axios({
//         method,
//         url: `${hostname}${path}`,
//         data: req.body,
//         params: req.params, // Forward URL parameters
//         headers: {
//           // Forward relevant headers, excluding internal Express headers
//           ...req.headers,
//           host: new URL(hostname).host, // Set correct host for the target service
//         },
//       });
//       res.json(data);
//     } catch (error) {
//       if (error instanceof AxiosError) {
//         console.error(`Axios error: ${error.message}, Status: ${error.response?.status}`);
//         return res.status(error.response?.status || 500).json({ message: error.message });
//       }
//       console.error(`Unexpected error: ${error}`);
//       return res.status(500).json({ message: "Internal server error" });
//     }
//   };
// };

// // Configure routes based on the config file
// export const configureRoutes = (app: Express) => {
//   // Validate config
//   if (!config.services || typeof config.services !== "object") {
//     throw new Error("Invalid or missing services configuration in config.json");
//   }

//   // Log the full config for debugging (solves [Object] issue)
//   console.log("Loaded config:", JSON.stringify(config.services, null, 2));

//   Object.entries(config.services as Config["services"]).forEach(([serviceName, service]) => {
//     // Validate service configuration
//     if (!service.url || !Array.isArray(service.routes)) {
//       console.error(`Invalid configuration for service: ${serviceName}`);
//       return;
//     }

//     const hostname = service.url;
//     service.routes.forEach((route: RouteConfig) => {
//       // Validate route configuration
//       if (!route.path || !Array.isArray(route.methods)) {
//         console.error(`Invalid route in service ${serviceName}: ${JSON.stringify(route)}`);
//         return;
//       }

//       route.methods.forEach((method) => {
//         // Ensure method is a valid Express method
//         const expressMethod = method.toLowerCase() as ExpressMethod;
//         if (!(expressMethod in app)) {
//           console.error(`Invalid HTTP method ${method} for route ${route.path} in service ${serviceName}`);
//           return;
//         }

//         const handler = createHandler(hostname, route.path, expressMethod);
//         app[expressMethod](`/api${route.path}`, handler);
//         console.log(`Registered route: ${expressMethod.toUpperCase()} /api${route.path} -> ${hostname}${route.path}`);
//       });
//     });
//   });
// };