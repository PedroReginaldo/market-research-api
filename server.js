import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando");
});

// ========== ROTA PRINCIPAL ==========
app.post("/keyword", async (req, res) => {
  try {
    const { product_title } = req.body;

    if (!product_title) {
      return res.status(400).json({ error: "Envie product_title no body" });
    }

    // extrai palavra chave simples (bem básico)
    const keyword = product_title.split(" ").slice(0, 3).join(" ");

    const requestBody = {
      0: {
        keywords: [keyword],
        location_code: 2076,
        language_code: "pt",
      }
    };

    const response = await axios.post(
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
      product_title,
      keyword_used: keyword,
      keyword_data: response.data
    });

  } catch (error) {
    console.error("Erro DataForSEO:", error.response?.data || error);
    res.status(500).json({
      error: "Falha ao consultar DataForSEO",
      details: error.response?.data || error.message
    });
  }
});

// ====================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
