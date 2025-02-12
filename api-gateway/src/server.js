import express from "express";
import cors from "cors";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

console.log("Server started on port 3000");

app.use(cors());

app.listen(3000);
