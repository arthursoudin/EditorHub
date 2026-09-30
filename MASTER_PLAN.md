# 🚀 MASTER PLAN: Editor Hub Project

## 🎯 Objetivo
Criar uma plataforma completa para um editor, integrando captação de clientes, gestão de portfólio e um painel administrativo que se comunica com o GitHub do usuário (arthursoudin).

## 📂 Estrutura de Arquivos Sugerida
- `/public` (Assets, Imagens)
- `/src`
    - `/client`
        - `index.html` (Landing Page)
        - `portfolio.html` (Portfólio)
        - `contact.html` (Contato)
        - `style.css` (Design System Moderno/Dark)
    - `/admin`
        - `dashboard.html` (Painel de Mensagens)
        - `admin.js` (Lógica de Confirmação e Tasks)
    - `/core`
        - `github_bridge.js` (Integração com API do GitHub)

## 🛠️ Requisitos Técnicos
1. **Design:** Estilo "GitHub Copilot Dark Mode" (Cards, bordas sutis, cores #1B4D3E e #E9AF22).
2. **Fluxo de Dados:** 
   - Cliente envia mensagem $\rightarrow$ Armazenado (Local Storage para simulação ou Firebase/Supabase).
   - Editor acessa `/admin` $\rightarrow$ Visualiza mensagens $\rightarrow$ Clica em "Confirmar".
   - Confirmação $\rightarrow$ Dispara evento para o GitHub (Issue/Commit).

## 📅 Sprints de Execução (Para o Cline)
- **Sprint 1:** Build da Landing Page, Portfólio e Contato (Foco em UI/UX).
- **Sprint 2:** Build do Painel ADM e sistema de gestão de mensagens.
- **Sprint 3:** Implementação da `github_bridge.js` para automação na conta `arthursoudin`.
