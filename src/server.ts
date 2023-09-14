import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import * as cheerio from "cheerio";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", async (_req, res) => {
    res.json({ msg: "Hello! There's nothing interesting for GET /." });
});

app.post("/image", async (req, res) => {
    const { link } = req.body;

    try {
        const response = await fetch(link);
        const html = await response.text();
        const $ = cheerio.load(html);

        const imageUrl =
            $('meta[property="og:image"]').attr("content") ||
            $("img").attr("src");

        res.send(imageUrl);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.listen(4000, () => {
    console.log(
        `Server started listening for HTTP requests on port ${4000}.  Let's go!`
    );
});
