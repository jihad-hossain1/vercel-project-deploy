// Use "type: commonjs" in package.json to use CommonJS modules
const express = require("express");
const app = express();
const port = 3000;

// Define your routes
app.get("/", (req, res) => {
  res.json({ message: "Hello from Express on Vercel!" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
