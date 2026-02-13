# Altus Benchmarking Pro: Backend API

### **Motor de Inteligência e Extração de Dados**
Esta API é o núcleo de processamento do ecossistema Altus Benchmarking. Desenvolvida em **Python** com o framework **Flask**, ela gerencia a coleta assíncrona de dados de e-commerces e a orquestração de modelos de Inteligência Artificial para análise técnica e scoring.

---

## Stack Tecnológica

* **Framework**: Flask (Python 3.12+)
* **Automação de Browser**: Playwright (Async)
* **Processamento de IA**: Google Generative AI (Gemini), OpenAI SDK (GPT/DeepSeek)
* **Segurança**: Flask-CORS para gestão de políticas de origem

---

## Arquitetura de Serviços

A API é organizada em camadas para garantir a separação de responsabilidades e facilidade de manutenção:

### 1. Scraper Service (`scraper_service.py`)
Responsável pela mineração de dados brutos das URLs fornecidas.
* **Concorrência Controlada**: Utiliza um **Semáforo Assíncrono** limitado a 3 execuções simultâneas para evitar bloqueios de IP e sobrecarga do sistema.
* **Bypass de Detecção**: Implementa rotação de User-Agents e emulação de comportamento humano (scroll, espera aleatória).
* **Resiliência**: Sistema de múltiplas tentativas (retries) e captura de logs de depuração em caso de erro no carregamento da página.

### 2. AI Service (`ai_service.py`)
Responsável por transformar texto bruto em JSON estruturado e realizar o ranking técnico.
* **Lógica de Pontuação (0-100)**: O cálculo considera os pesos definidos pelo usuário e aplica penalidades baseadas no `reliability_score` (ex: -10% para dados parciais, -30% para dados estimados via fallback).
* **Multi-Provider**: Suporte dinâmico para diferentes motores de IA, permitindo flexibilidade de custo e performance.
* **Prompt Engineering**: Construção de prompts complexos que instruem a IA a identificar especificações técnicas reais e distinguir dados fiéis de dados estimados.

---

## Endpoints Principais

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/scrape` | Recebe URLs e atributos; retorna o benchmark completo processado pela IA. |
| `GET` | `/api/export/download/<file>` | Disponibiliza o download de relatórios gerados (CSV/Excel). |
| `GET` | `/` | Health check da API e listagem de endpoints ativos. |

---

## Configuração e Instalação

### **Pré-requisitos**
1.  Python 3.12 ou superior.
2.  Instalação dos binários do Playwright:
    ```bash
    playwright install chromium
    ```

### **Instalação**
1.  Crie e ative um ambiente virtual:
    ```bash
    python -m venv .venv
    source .venv/bin/activate # Linux/Mac
    ```
2.  Instale as dependências:
    ```bash
    pip install -r requirements.txt
    ```
3.  Execute o servidor de desenvolvimento:
    ```bash
    python app.py
    ```
    *A API iniciará por padrão em `http://0.0.0.0:5000`.*

---

## Detalhes de Implementação: Reliability Score
A API classifica a extração em três níveis de confiança:
* **High**: Extração direta e completa do HTML.
* **Medium**: Alguns campos técnicos foram deduzidos ou completados pela IA.
* **Low**: Fallback total (quando o site bloqueia o bot); os dados são gerados com base no conhecimento prévio do modelo de IA.

---
*Módulo desenvolvido para o projeto Altus Benchmarking Pro.*
