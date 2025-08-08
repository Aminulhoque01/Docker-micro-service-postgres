import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT || "2525", 10),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || "", // SMTP username
        pass: process.env.SMTP_PASS || ""  // SMTP password
    }
});


export const defaultSender = process.env.DEFAULT_SENDER_EMAIL || "admin@example.com"
