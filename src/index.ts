// Use "type: module" in package.json to use ES modules
import express from "express";
import prisma from "./lib/prisma";
import dotenv from "dotenv";
dotenv.config();

dotenv.config();

const app = express();
const port = 3000;

// Define your routes
app.get("/", (req, res) => {
    res.json({ message: "Hello from Express on Vercel!" });
});

app.get("/test", async (req, res) => {
    const result = await prisma.logs.findMany();
    res.json(result);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
