import { createApp } from "./app";

const app = createApp();

console.log("Server running on", process.env.APP_PORT);
app.listen(process.env.APP_PORT);
