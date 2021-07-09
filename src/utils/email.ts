import { createTransport } from "nodemailer";
import { isProduction } from "./global";
import Email from "email-templates";
import path from "path";

export function createEmail(): Email {
  return new Email({
    send: isProduction(),
    message: {
      from: process.env.EMAIL_FROM,
    },
    transport: createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    }),
    getPath: (type, template) => {
      return path.join(__dirname, "../emails", template, type);
    },
  });
}
