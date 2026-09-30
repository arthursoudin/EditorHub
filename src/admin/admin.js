/* ============================================================
   EDITOR HUB — admin.js (Sprint 2 + Sprint 3)
   Painel: lista mensagens do storage, filtra por status,
   abre detalhes e confirma (Sprint 2). A confirmacao chama
   EditorHubGithub.confirmAndSync, criando a Issue na Sprint 3.
   Script classico, sem dependencias.
   ============================================================ */
(function (window, document) {
  "use strict";

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function store() { return window.EditorHubStorage || null; }
  function bridge() { return window.EditorHubGithub || null; }

  var state = { status: "todas", term: "", busyId: null };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleString("pt-BR"); } catch (e) { return iso || "-"; }
  }

  function toast(title, text, variant) {
    if (window.EditorHub && window.EditorHub.showToast) {
      window.EditorHub.showToast(title, text, variant, 6000);
      return;
    }
    var stack = $("#toast-stack");
    if (!stack) { if (text) window.alert(title + ": " + text); return; }
    var el = document.createElement("div");
    el.className = "toast" + (variant ? " toast--" + variant : "");
    el.innerHTML = "<span><strong>" + esc(title) + "</strong>" +
      (text ? "<p>" + esc(text) + "</p>" : "") + "</span>";
    stack.appendChild(el);
    window.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 5000);
  }
  function statusLabel(s) {
    var st = store();
    if (st && st.STATUS_LABEL && st.STATUS_LABEL[s]) return st.STATUS_LABEL[s];
    return s || "-";
  }

  function filtered(messages) {
    var term = state.term.toLowerCase();
    return messages.filter(function (m) {
      var okStatus = state.status === "todas" || m.status === state.status;
      if (!okStatus) return false;
      if (!term) return true;
      var hay = [m.name, m.email, m.company, m.projectType, m.message, m.protocol, m.id]
        .map(function (v) { return String(v || "").toLowerCase(); }).join(" ");
      return hay.indexOf(term) !== -1;
    });
  }

  function renderStats() {
    var st = store();
    var box = $("#admin-stats");
    if (!st || !box) return;
    var c = st.countByStatus();
    var defs = [["todas", c.total, "Todas"], ["nova", c.nova, "Novas"],
      ["confirmada", c.confirmada, "Confirmadas"], ["em-andamento", c["em-andamento"], "Em andamento"],
      ["concluida", c.concluida, "Concluidas"], ["recusada", c.recusada, "Recusadas"]];
    box.innerHTML = defs.map(function (d) {
      return '<button type="button" class="admin-stat' + (state.status === d[0] ? " is-active" : "") +
        '" data-status-filter="' + d[0] + '" aria-pressed="' + (state.status === d[0]) + '">' +
        "<strong>" + d[1] + "</strong><span>" + d[2] + "</span></button>";
    }).join("");
  }

  function ghLine(m) {
    if (!m.github) return '<span class="text-dim">GitHub: pendente</span>';
    var url = m.github.html_url || "";
    var label = m.github.simulated ? "Issue simulada #" + (m.github.number || "?")
      : "Issue #" + (m.github.number || "?");
    var sim = m.github.simulated ? ' <span class="gh-sim">(dry-run)</span>' : "";
    if (url.indexOf("http") === 0) {
      return '<a class="gh-link" href="' + esc(url.split(" ")[0]) + '" target="_blank" rel="noopener">' +
        esc(label) + "</a>" + sim;
    }
    return '<span class="gh-link">' + esc(label) + "</span>" + sim;
  }

  function renderList() {
    var st = store();
    var list = $("#msg-list");
    var count = $("#msg-count");
    var empty = $("#msg-empty");
    if (!st || !list) return;
    var all = st.getAll();
    var items = filtered(all);
    if (count) {
      count.textContent = items.length + (items.length === 1 ? " mensagem" : " mensagens") +
        " · " + all.length + " no total";
    }
    if (empty) empty.hidden = items.length !== 0;
    list.innerHTML = items.map(function (m) {
      var busy = state.busyId === m.id;
      var snippet = String(m.message || "").slice(0, 140);
      return '<article class="msg-card" data-msg-card="' + esc(m.id) + '">' +
        '<div class="msg-card__top"><h3>' + esc(m.name || "Sem nome") + "</h3>" +
        '<span class="status-pill status-pill--' + esc(m.status || "nova") + '">' +
        esc(statusLabel(m.status)) + "</span></div>" +
        '<div class="msg-card__meta">' + esc(m.protocol || "-") + " · " + esc(fmtDate(m.createdAt)) + "</div>" +
        '<p class="msg-card__text">' + esc(snippet) + "</p>" +
        '<div class="msg-card__meta">' + ghLine(m) + "</div>" +
        '<div class="msg-card__foot">' +
        '<button type="button" class="btn btn--ghost btn--sm" data-act="details">Detalhes</button>' +
        (m.status === "nova"
          ? '<button type="button" class="btn btn--accent btn--sm" data-act="confirm"' +
            (busy ? " disabled" : "") + ">" + (busy ? "Confirmando…" : "Confirmar") + "</button>"
          : "") +
        (m.status === "confirmada"
          ? '<button type="button" class="btn btn--primary btn--sm" data-act="advance">Iniciar</button>' : "") +
        (m.status === "em-andamento"
          ? '<button type="button" class="btn btn--primary btn--sm" data-act="finish">Concluir</button>' : "") +
        ((m.status === "nova" || m.status === "confirmada")
          ? '<button type="button" class="btn btn--ghost btn--sm" data-act="refuse">Recusar</button>' : "") +
        '<button type="button" class="btn btn--ghost btn--sm" data-act="remove">Excluir</button>' +
        "</div></article>";
    }).join("");
  }

  function refresh() { renderStats(); renderList(); renderGhStatus(); }

  function openDetails(m) {
    var dlg = $("#msg-dialog");
    if (!dlg) return;
    $("#dlg-title").textContent = m.name || "Mensagem";
    var rows = [["Protocolo", m.protocol], ["E-mail", m.email], ["Telefone", m.phone],
      ["Empresa", m.company || "-"], ["Tipo", m.projectType || "-"],
      ["Orcamento", m.budget || "-"], ["Prazo", m.deadline || "-"],
      ["Status", statusLabel(m.status)], ["Recebido em", fmtDate(m.createdAt)],
      ["Origem", m.source || "-"]];
    $("#dlg-fields").innerHTML = rows.map(function (r) {
      return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1] || "-") + "</dd>";
    }).join("");
    $("#dlg-message").textContent = m.message || "(sem mensagem)";
    var ghBox = $("#dlg-github");
    if (ghBox) ghBox.innerHTML = ghLine(m);
    var confirmBtn = $("#dlg-confirm");
    if (confirmBtn) {
      confirmBtn.disabled = m.status !== "nova" || state.busyId === m.id;
      confirmBtn.textContent = state.busyId === m.id ? "Confirmando…" : "Confirmar";
      confirmBtn.setAttribute("data-id", m.id);
    }
    if (typeof dlg.showModal === "function") dlg.showModal();
  }

  function closeDetails() {
    var dlg = $("#msg-dialog");
    if (dlg && typeof dlg.close === "function" && dlg.open) dlg.close();
  }

  function doConfirm(id, btn) {
    var st = store();
    var br = bridge();
    if (!st || !br) { toast("Integracao ausente", "storage ou github_bridge nao carregado.", "error"); return; }
    state.busyId = id;
    renderList();
    if (btn) { btn.disabled = true; btn.textContent = "Confirmando…"; }
    br.confirmAndSync(id).then(function (res) {
      state.busyId = null;
      refresh();
      var g = res.github || {};
      toast("Simulacao enviada ao GitHub (MOCK)",
        "Issue simulada #" + (g.number || "?") + " em " + (g.repo || "arthursoudin/Editor-Landing") + ". Registrado em logs_github.txt.",
        "success");
      var dlg = $("#msg-dialog");
      if (dlg && dlg.open) { var m = st.findById(id); if (m) openDetails(m); else closeDetails(); }
    }, function (err) {
      state.busyId = null;
      refresh();
      toast("Falha ao confirmar", String((err && err.message) || err), "error");
    });
  }

  function renderGhStatus() {
    var br = bridge();
    var box = $("#gh-mode");
    if (!box) return;
    var repo = (br && br.REPO) || "arthursoudin/Editor-Landing";
    var url = (br && br.REPO_URL) || "https://github.com/arthursoudin/Editor-Landing";
    box.innerHTML = 'Destino <a class="gh-link" href="' + esc(url) +
      '" target="_blank" rel="noopener">' + esc(repo) + "</a> · modo <strong>MOCK</strong>" +
      " (portfolio: nenhum envio real a API; o Confirmar simula e registra em logs_github.txt)";
  }

  function initGhForm() {
    var br = bridge();
    if (!br) return;
    renderGhStatus();
    var dl = $("#gh-download");
    if (dl) {
      dl.addEventListener("click", function () { br.downloadLogFile(); });
    }
    var preview = $("#gh-log-preview");
    if (preview) {
      var render = function () { preview.textContent = br.renderLogFile(); };
      render();
      window.setTimeout(render, 500);
    }
  }

  function initList() {
    var st = store();
    if (!st) return;
    var search = $("#msg-search");
    if (search) {
      var t = null;
      search.addEventListener("input", function () {
        window.clearTimeout(t);
        t = window.setTimeout(function () { state.term = search.value.trim(); renderList(); }, 160);
      });
    }
    var stats = $("#admin-stats");
    if (stats) {
      stats.addEventListener("click", function (ev) {
        var btn = ev.target.closest("[data-status-filter]");
        if (btn) { state.status = btn.getAttribute("data-status-filter"); refresh(); }
      });
    }
    var chips = $("#status-chips");
    if (chips) {
      chips.addEventListener("click", function (ev) {
        var btn = ev.target.closest("[data-status-filter]");
        if (!btn) return;
        state.status = btn.getAttribute("data-status-filter");
        $all("[data-status-filter]", chips).forEach(function (c) {
          var on = c === btn;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        refresh();
        $all("[data-status-filter]", chips).forEach(function (c) {
          var on = c.getAttribute("data-status-filter") === state.status;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
      });
    }
    var list = $("#msg-list");
    if (list) {
      list.addEventListener("click", function (ev) {
        var btn = ev.target.closest("[data-act]");
        if (!btn) return;
        var card = ev.target.closest("[data-msg-card]");
        if (!card) return;
        var id = card.getAttribute("data-msg-card");
        var act = btn.getAttribute("data-act");
        var m = st.findById(id);
        if (!m) return;
        if (act === "details") openDetails(m);
        else if (act === "confirm") doConfirm(id, btn);
        else if (act === "advance") { st.setStatus(id, "em-andamento"); refresh(); }
        else if (act === "finish") { st.setStatus(id, "concluida"); refresh(); }
        else if (act === "refuse") { st.setStatus(id, "recusada"); refresh(); }
        else if (act === "remove") {
          if (window.confirm("Excluir esta mensagem?")) { st.removeById(id); refresh(); }
        }
      });
    }
    var dlgConfirm = $("#dlg-confirm");
    if (dlgConfirm) {
      dlgConfirm.addEventListener("click", function () {
        var id = dlgConfirm.getAttribute("data-id");
        if (id) doConfirm(id, dlgConfirm);
      });
    }
    var seed = $("#seed-btn");
    if (seed) {
      seed.addEventListener("click", function () {
        st.create({ name: "Mariana Lopes", email: "mari@exemplo.com", phone: "(11) 98888-1111",
          company: "Studio Aurora", projectType: "Reels & Shorts", budget: "R$ 1.500 – R$ 3.000",
          deadline: "Em 2 semanas", message: "Preciso de 8 reels para o lancamento.", source: "painel-demo" });
        st.create({ name: "Rafael Prado", email: "rafa@exemplo.com", phone: "(21) 97777-2222",
          company: "", projectType: "Podcast", budget: "A combinar", deadline: "Mensal",
          message: "Episodios semanais com cortes verticais.", source: "painel-demo" });
        refresh();
        toast("Demonstracao", "2 mensagens de exemplo criadas.", "success");
      });
    }
    var clearBtn = $("#clear-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (window.confirm("Apagar todas as mensagens?")) { st.clear(); refresh(); }
      });
    }
    st.subscribe(function () { refresh(); });
    window.addEventListener("storage", function (ev) {
      if (ev.key === st.STORAGE_KEY) refresh();
    });
  }

  function init() {
    initList();
    initGhForm();
    refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.EditorHubAdmin = {
    refresh: refresh,
    confirm: doConfirm,
    getState: function () { return { status: state.status, term: state.term }; }
  };
})(window, document);


