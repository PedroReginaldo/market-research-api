from fastapi import FastAPI
import requests
from bs4 import BeautifulSoup

app = FastAPI()

# SUAS CREDENCIAIS DA DATAFORSEO 
API_LOGIN = "marketing4@madel.com.br"
API_PASSWORD = "705c13a5683c3332"

# -------------------------
# Extrair título da página
# -------------------------
def get_product_title(url):
    html = requests.get(url, timeout=10).text
    soup = BeautifulSoup(html, "html.parser")

    title = soup.find("title")
    if title:
        return title.text.strip()

    h1 = soup.find("h1")
    if h1:
        return h1.text.strip()

    return "Produto"

# -------------------------
# Consultar DataForSEO - Trends e Volume
# -------------------------
def get_keyword_data(term):
    endpoint = "https://api.dataforseo.com/v3/keywords_data/google_trends/explore/live"

    payload = {
        "keywords": [term],
        "location_code": 2076,  # Brasil
        "language_code": "pt"
    }

    response = requests.post(
        endpoint,
        auth=(API_LOGIN, API_PASSWORD),
        json=payload
    )

    return response.json()

# -------------------------
# Endpoint principal
# -------------------------
@app.get("/analyze")
def analyze(url: str):
    title = get_product_title(url)
    keyword_data = get_keyword_data(title)

    return {
        "product_title": title,
        "keyword_data": keyword_data
    }
