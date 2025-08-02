
import z from "zod";


export const UserCreateSchema = z.object({
   email: z.string().email(),
   password: z.string().min(8, "Password must be at least 8 characters  long"),
   name: z.string().min(3).max(100)  
})

export const UserLoginSchema = z.object({
   email: z.string().email(),
   password: z.string().min(8, "Password must be at least 8 characters long"),
});