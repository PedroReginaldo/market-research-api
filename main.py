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
# Limpar o titulo
# -------------------------

import re

def clean_keyword(title):
    # deixa tudo minúsculo
    title = title.lower()

    # remove caracteres especiais
    title = re.sub(r"[^a-zA-Z0-9áéíóúãõâêôç\s]", "", title)

    # converte título longo em 3–4 palavras chave no máximo
    words = title.split()

    # regra simples:
    # pega apenas palavras relevantes
    filtered = [w for w in words if len(w) > 2]

    # limita a 3 palavras
    short = filtered[:3]

    return " ".join(short)



# -------------------------
# Consultar DataForSEO - Trends e Volume
# -------------------------
def get_keyword_data(term):
    endpoint = "https://api.dataforseo.com/v3/keywords_data/google_trends/graph/live"

    payload = {
        "tasks": [
            {
                "keywords": [term],
                "location_code": 2076,  # Brasil
                "time_range": "today 3-m",
                "search_type": "web"
            }
        ]
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

    # limpa o título para Google Trends
    keyword = clean_keyword(title)

    keyword_data = get_keyword_data(keyword)

    return {
        "product_title": title,
        "keyword_used": keyword,
        "keyword_data": keyword_data
    }
