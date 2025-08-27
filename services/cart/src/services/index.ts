 
import { id } from "zod/v4/locales/index.cjs";
import redis from "../redis";
import { INVERTORY_SERVICE } from "../config";
import axios from "axios";

export const clearCart= async(id:string)=>{
    try {
        const data = await redis.hgetall(`cart:${id}`);
        if(Object.keys(data).length ===0){
            console.log("Cart is empty");
            return;
        }

        const items = Object.keys(data).map((key)=>{
            const {inventoryId, quantity} = JSON.parse(data[key]) as {inventoryId:string, quantity:number};
            return {
                inventoryId,
                quantity,
                productId:key
            }
        });

        //update the inventory
        const requests = items.map(item=>{
            return axios.put(`${INVERTORY_SERVICE}/inventories/${item.inventoryId}`,{
                quantity: item.quantity,
                actionType:'IN'
            });
        });
        await Promise.all(requests);

        //delete the cart
        await redis.del(`cart:${id}`);

    } catch (error) {
        console.log(error);
    }
}