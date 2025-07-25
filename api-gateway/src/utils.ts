
import {Express, Request,Response} from "express";
import config from './config.json';
import axios from "axios";


export const createHandler = (hostname:string, path:string, method:string)=>{
    return async(req:Request, res:Response)=>{
  const {data}= await axios({
    method,
    url:`${hostname}${path}`,
    data: req.body
  })
  res.json(data)
}}

export const configureRoutes= (app:Express)=>{
 Object.entries(config.services).forEach(([name,service])=>{
    const hostname= service.url;
    service.routes.forEach((route)=>{
        route.methods.forEach((method)=>{
           const handler = createHandler(hostname, route.path, method);
           app[method](`/api/${route.path}`, handler)
        })
    })
     
 })
}