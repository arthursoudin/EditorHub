# 🎬 Editor Hub

Plataforma do editor **arthursoudin**: landing page de captação de clientes, portfólio,
página de contato e painel administrativo integrado ao GitHub.

Design system: **Dark Mode inspirado no GitHub Copilot** — cards com bordas sutis,
superfícies `#0F171D`, verde institucional `#1B4D3E` e dourado de acento `#E9AF22`.

---

## ✅ Sprint 1 — Landing Page, Portfólio e Contato (concluída)

### Estrutura entregue (Sprint 1)

```
editor-hub/
├── MASTER_PLAN.md
├── README.md                        ← este arquivo
├── public/
│   └── assets/
│       └── logo.svg                 marca + favicon
└── src/
    ├── client/
    │   ├── index.html               landing page
    │   ├── portfolio.html           portfólio com filtros + lightbox
    │   ├── contact.html             formulário de briefing
    │   ├── style.css                design system completo (dark mode)
    │   └── client.js                nav, reveal, portfólio, formulário
    └── core/
        └── storage.js               persistência compartilhada (base da Sprint 2)
```

### Como rodar

Não há build nem dependências. Sirva a **raiz do projeto** (para que os caminhos de
`public/` e `src/core/` funcionem) e abra a pasta do client:

```powershell
cd C:\Users\20260026-IEG\.skales-data\workspace\editor-hub
python -m http.server 8000
```

Depois abra: `http://localhost:8000/src/client/index.html`

> Também funciona abrindo o arquivo direto (`file://`), pois todos os scripts são
> clássicos (sem `type="module"`).

### O que cada página entrega

| Página | Destaques |
| --- | --- |
| `index.html` | Hero com painel "code-like", stats, 6 serviços, processo em 4 passos, destaques do portfólio, depoimentos, CTA |
| `portfolio.html` | Filtros por formato (chips), busca em tempo real, contador de resultados, deep-link `?filtro=reels`, lightbox com detalhes do case |
| `contact.html` | Formulário validado (nome, e-mail, WhatsApp, empresa, tipo, orçamento, prazo, mensagem, consentimento), card de sucesso com protocolo, FAQ, cards de contato |

Recursos de UX/acessibilidade: skip-link, navegação com `aria-expanded`, foco visível,
`aria-live` nos toasts, animação de entrada desativada em `prefers-reduced-motion`,
layout responsivo (1024 / 860 / 720 px).

---

## 🔌 Contrato de dados (handoff para a Sprint 2)

O formulário **não** envia nada para servidores externos nesta sprint: ele grava no
`localStorage` pela camada `src/core/storage.js`, exposta globalmente como
`window.EditorHubStorage`. O painel `/admin` deve reutilizar essa mesma API.

- **Chave:** `editorHub.messages.v1` (constante `EditorHubStorage.STORAGE_KEY`)
- **Valor:** array JSON de mensagens, mais recentes primeiro.

### Formato de uma mensagem

```json
{
  "id": "MSG-K9X2AB-4F1D",
  "protocol": "EH-K9X2AB-9C3E",
  "createdAt": "2026-09-30T13:04:11.482Z",
  "updatedAt": "2026-09-30T13:04:11.482Z",
  "status": "nova",
  "confirmedAt": null,
  "github": null,
  "timeline": [{ "at": "2026-09-30T13:04:11.482Z", "event": "mensagem-recebida" }],
  "name": "Marina Campos",
  "email": "marina@studionorte.com",
  "phone": "(11) 98888-7777",
  "company": "Studio Norte",
  "projectType": "Reels & Shorts",
  "budget": "R$ 1.500 – R$ 3.000",
  "deadline": "Esta semana",
  "message": "Preciso de 8 reels para o lançamento...",
  "source": "contact.html"
}
```

### API disponível

| Método | Descrição |
| --- | --- |
| `isAvailable()` | `true` se o `localStorage` está utilizável |
| `getAll()` | lista completa de mensagens |
| `countByStatus()` | contadores `{ total, nova, confirmada, "em-andamento", concluida, recusada }` |
| `findById(id)` | busca uma mensagem |
| `create(payload)` | cria a mensagem com `id`, `protocol`, `status: "nova"` e `timeline` |
| `updateById(id, patch)` | atualização parcial |
| `setStatus(id, status)` | muda o status e registra no `timeline` |
| `setGithub(id, data)` | anexa dados do GitHub (Sprint 3) |
| `removeById(id)` / `clear()` | exclusão |
| `subscribe(cb)` / `notify()` | pub/sub para o painel se atualizar ao vivo |

Status válidos: `EditorHubStorage.STATUS` → `nova`, `confirmada`, `em-andamento`,
`concluida`, `recusada` (rótulos legíveis em `EditorHubStorage.STATUS_LABEL`).

---

## 🧪 Validação da Sprint 1

| Recurso | O que faz |
| --- | --- |
| `tests/sprint1-smoke.html` | Smoke test no navegador: 77 asserts cobrindo `storage.js`, navegação, lightbox, filtros/busca do portfólio, validação + persistência do formulário e o painel admin com a ponte GitHub (Sprints 2 + 3). |
| `tests/html-check.py` | Confere o balanceamento de tags dos quatro HTMLs. |
| `tests/asset-check.py` | Confere se todo `src`/`href` (HTML) e `url()` (CSS) aponta para um arquivo existente e valida o XML do `logo.svg`. |
| `tests/responsive-probe.html` | Mede `scrollWidth` × `innerWidth` das quatro páginas em 360 / 430 / 768 / 1024 / 1440 px e lista os elementos que estouram a largura. |
| `tests/viewport-preview.html` | Renderiza páginas lado a lado em um viewport real de largura arbitrária, para inspeção visual (ex.: `?w=430&h=2500` e `?w=1280&pages=admin/dashboard`). |

Como rodar (com o servidor da raiz do projeto no ar, porta 8000):

1. Abra `http://localhost:8000/tests/sprint1-smoke.html` — o resultado (PASS/FAIL) aparece no topo da página.
2. `python tests/html-check.py` — imprime OK/erros por arquivo.
3. `python tests/asset-check.py` — imprime quantos assets foram verificados e quais estão quebrados (sai com código 1 se houver).
4. Abra `http://localhost:8000/tests/responsive-probe.html` — cada linha traz `página @ largura`, `overflow` (≤ 0 é OK) e os seletores problemáticos, se houver.
5. Abra `http://localhost:8000/tests/viewport-preview.html?w=430` — preview visual em viewport real.

Resultado atual:

- **72 asserts** no smoke test (51 da Sprint 1 + 21 do painel/GitHub) e os quatro HTMLs
  estruturalmente OK.
- **91 assets verificados, nenhum quebrado** e `logo.svg` válido.
- **Sem overflow horizontal** em 20 combinações (4 páginas × 5 larguras: 360, 430, 768,
  1024 e 1440 px), confirmado também com preview visual em 430 px e 768 px.

> ⚠️ Ao tirar screenshot no Chrome headless, `--window-size` **não** garante o layout
> viewport em todos os casos (uma captura mobile pode parecer cortada sem que exista
> overflow real). Para medir/ver o mobile com fidelidade, use o probe ou o
> `viewport-preview.html` (iframes com largura forçada).

---

## ✅ Sprint 2 — Painel ADM (concluída)

`src/admin/dashboard.html` + `src/admin/admin.js`: lista as mensagens do
`EditorHubStorage`, com **contadores por status** (clicáveis), **busca** em tempo real,
**filtros por status** (chips), **detalhes** em `<dialog>` nativo e ações de fluxo
**Confirmar → Iniciar → Concluir**, além de **Recusar** e **Excluir**. Inclui botões
**"Criar 2 exemplos"** e **"Apagar tudo"** para demonstração, sincronização entre abas
(`storage` event + `subscribe`) e layout responsivo (6 → 3 → 2 colunas nos stats,
cards com ações flexíveis no mobile).

## ✅ Sprint 3 — Integração GitHub (MOCK p/ portfólio, concluída)

> Nenhuma chamada real à API do GitHub. Demonstração de portfólio:
> **Confirmar = simular envio + alerta de sucesso + registro em `logs_github.txt`.**

`src/core/github_bridge.js` expõe `window.EditorHubGithub` (MOCK):

| Método | Descrição |
| --- | --- |
| `confirmAndSync(id)` | **fluxo MOCK:** `setStatus(id, "confirmada")` → monta issue simulada → `setGithub(id, {...})` → `alert()` de sucesso → registra no espelho do log |
| `buildMockIssue(msg)` | título `[Briefing EH-…] Nome — Tipo` + `repo: "arthursoudin/Editor-Landing"` |
| `readLog()` / `renderLogFile()` / `downloadLogFile()` | espelho do log em `localStorage` (`editorHub.githubMockLog.v1`); download gera o `logs_github.txt` |

O navegador não grava na raiz sozinho: o painel tem o botão
**"Baixar logs_github.txt"** (seção "Integração GitHub — MOCK") + prévia do
log. O arquivo `logs_github.txt` na raiz é a cópia de referência — após
demonstrar, baixe e salve por cima dele.

---
