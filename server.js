import express from "express";
import axios from "axios";
import cheerio from "cheerio";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/test-link", async (req, res) => {
  const product_url = req.query.url;
  if (!product_url) {
    return res.status(400).send("Envie o parâmetro url na URL, exemplo: ?url=https://...");
  }

  try {
    const response = await axios.get(product_url);
    const $ = cheerio.load(response.data);
    const title = $("title").text() || "Produto sem título";

    const keyword = title.split(" ").slice(0, 3).join(" ");

    const requestBody = {
      0: {
        keywords: [keyword],
        location_code: 2076,
        language_code: "pt"
      }
    };

    const keyword_response = await axios.post(
      "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
      requestBody,
      {
        auth: {
          username: process.env.DATAFORSEO_LOGIN,
          password: process.env.DATAFORSEO_PASSWORD
        }
      }
    );

    res.json({
      product_title: title,
      keyword_used: keyword,
      product_url,
      keyword_data: keyword_response.data
    });
  } catch (err) {
    res.status(500).json({
      error: "Falha ao processar o link",
      details: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
