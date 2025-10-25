// Use "type: commonjs" in package.json to use CommonJS modules
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const prisma = require("./lib/prisma");
const app = express();
const port = 3000;

// Define your routes
app.get("/", (req, res) => {
  res.json({ message: "Hello from Express on Vercel!" });
});

app.get("/test", async (req, res) => {
  const timeServer = await prisma.$queryRaw`SELECT NOW() AS now`;
  res.json(timeServer);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
