import { NextFunction, Request, Response } from "express";
import { EmailCreateSchema } from "../schema";
import { defaultSender, transporter } from "../config";
import prisma from "../prisma";


const sentEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {

        //validate the request body
        const parsedBody = EmailCreateSchema.parse(req.body);
        if (!parsedBody) {
            return res.status(400).json({ error: "Invalid request body" });
        }

        //create mail option
        const { sender, recipient, subject, body, source } = parsedBody;
        const from = sender || defaultSender;
        const mailOptions = {
            from,
            to: recipient,
            subject: subject,
            text: body,

        };

        //send email
        const { rejected } = await transporter.sendMail(mailOptions);
        if (rejected.length) {
            console.log("rejected email", rejected)
            return res.send(500).json({ message: "Email rejected" })
        }

        //save to data

        await prisma.email.create({
            data: {
                sender: from,
                recipient,
                subject,
                body,
                source,

            }
        });

        return res.status(200).json({message:"Email sent"})

    } catch (error) {
        next(error);
    }
}

export default sentEmail;