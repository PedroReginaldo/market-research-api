// Rota de teste GET
app.get("/test", async (req, res) => {
  const product_title = req.query.product_title;

  if (!product_title) {
    return res.status(400).send("Envie o parâmetro product_title na URL, exemplo: ?product_title=Bola");
  }

  try {
    const keyword = product_title.split(" ").slice(0, 3).join(" ");

    const requestBody = {
      0: {
        keywords: [keyword],
        location_code: 2076,
        language_code: "pt"
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
    res.status(500).json({
      error: "Falha ao consultar DataForSEO",
      details: error.response?.data || error.message
    });
  }
});
