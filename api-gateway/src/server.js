import cors from "cors";
import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use(cors());

app.listen(3000);
