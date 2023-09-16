import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import * as cheerio from "cheerio";
import morgan from "morgan";
import axios from "axios";

dotenv.config();

const app = express();
const cache = new Map();

app.use(morgan("tiny"));
app.use(express.json());
app.use(cors());

app.get("/", async (_req, res) => {
    res.json({ msg: "Hello! There's nothing interesting for GET /." });
});

app.get("/image", async (req, res) => {
    const { link } = req.query;

    if (!link) {
        return res.status(400).send("Missing 'link' query parameter.");
    }

    if (cache.has(link)) {
        const cachedImageUrl = cache.get(link);
        res.send(cachedImageUrl);
        return;
    }

    try {
        const response = await axios.get(link.toString());
        const html = response.data;
        const $ = cheerio.load(html);

        const imageUrl =
            $('meta[property="og:image"]').attr("content") ||
            $("img").attr("src");

        if (imageUrl) {
            if (!imageUrl.startsWith("http")) {
                res.send("no image found");
            } else {
                cache.set(link, imageUrl);
                res.send(imageUrl);
            }
        } else {
            res.send("no image found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
});

app.listen(4000, () => {
    console.log(
        `Server started listening for HTTP requests on port ${4000}. Let's go!`
    );
});
