/* ============================================================
   EDITOR HUB — Camada de persistência compartilhada (src/core)
   ------------------------------------------------------------
   Sprint 1: usada pelo formulário de contato (client).
   Sprint 2: o painel /admin reutiliza exatamente esta API para
             listar, confirmar e remover mensagens.
   Sprint 3: a confirmação ("Confirmar") dispara github_bridge.js.

   Contrato de dados (versão 1) — ver README.md
   ============================================================ */
(function (global) {
  "use strict";

  var STORAGE_KEY = "editorHub.messages.v1";

  /** Status possíveis de uma mensagem (fluxo de trabalho do editor). */
  var STATUS = {
    NOVA: "nova",
    CONFIRMADA: "confirmada",
    EM_ANDAMENTO: "em-andamento",
    CONCLUIDA: "concluida",
    RECUSADA: "recusada"
  };

  var STATUS_LABEL = {
    nova: "Nova",
    confirmada: "Confirmada",
    "em-andamento": "Em andamento",
    concluida: "Concluída",
    recusada: "Recusada"
  };

  var subscribers = [];

  function nowISO() {
    return new Date().toISOString();
  }

  function uid(prefix) {
    var stamp = Date.now().toString(36).toUpperCase();
    var rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return (prefix || "MSG") + "-" + stamp + "-" + rand;
  }

  /** True quando o ambiente permite persistência local. */
  function isAvailable() {
    try {
      var probe = "__eh_probe__";
      global.localStorage.setItem(probe, "1");
      global.localStorage.removeItem(probe);
      return true;
    } catch (err) {
      return false;
    }
  }

  /** Lê todas as mensagens (array, nunca null). */
  function getAll() {
    if (!isAvailable()) return [];
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn("[EditorHubStorage] Falha ao ler mensagens:", err);
      return [];
    }
  }

  function writeAll(list, options) {
    if (!isAvailable()) {
      throw new Error("localStorage indisponível neste navegador.");
    }
    var payload = Array.isArray(list) ? list : [];
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    if (!(options && options.silent)) notify();
    return payload;
  }

  function normalize(input) {
    var data = input || {};
    var text = function (value) {
      return typeof value === "string" ? value.trim() : "";
    };
    return {
      name: text(data.name),
      email: text(data.email).toLowerCase(),
      phone: text(data.phone),
      company: text(data.company),
      projectType: text(data.projectType),
      budget: text(data.budget),
      deadline: text(data.deadline),
      message: text(data.message),
      source: text(data.source) || "landing-page"
    };
  }
  /**
   * Cria e persiste uma nova mensagem.
   * @returns {Object} mensagem completa (com id, protocolo, status e datas)
   */
  function create(input) {
    var data = normalize(input);
    if (!data.name || !data.email || !data.message) {
      throw new Error("Campos obrigatórios: nome, e-mail e mensagem.");
    }
    var timestamp = nowISO();
    var record = {
      id: uid("MSG"),
      protocol: uid("EH"),
      createdAt: timestamp,
      updatedAt: timestamp,
      status: STATUS.NOVA,
      confirmedAt: null,
      github: null, // preenchido na Sprint 3 pelo github_bridge.js
      timeline: [{ at: timestamp, event: "mensagem-recebida" }]
    };
    Object.keys(data).forEach(function (key) {
      record[key] = data[key];
    });

    var list = getAll();
    list.unshift(record);
    writeAll(list);
    return record;
  }

  function findById(id) {
    return (
      getAll().filter(function (item) {
        return item.id === id;
      })[0] || null
    );
  }

  function updateById(id, patch) {
    var list = getAll();
    var updated = null;
    list = list.map(function (item) {
      if (item.id !== id) return item;
      updated = Object.assign({}, item, patch || {}, { updatedAt: nowISO() });
      return updated;
    });
    if (updated) writeAll(list);
    return updated;
  }

  /** Atualiza o status (ex.: admin clica em "Confirmar"). */
  function setStatus(id, status) {
    if (!STATUS_LABEL[status]) {
      throw new Error("Status inválido: " + status);
    }
    var current = findById(id);
    if (!current) return null;
    var timeline = (current.timeline || []).concat([
      { at: nowISO(), event: "status:" + status }
    ]);
    var patch = { status: status, timeline: timeline };
    if (status === STATUS.CONFIRMADA && !current.confirmedAt) {
      patch.confirmedAt = nowISO();
    }
    return updateById(id, patch);
  }

  /** Anexa dados de integração do GitHub (Sprint 3). */
  function setGithub(id, githubData) {
    var current = findById(id) || { timeline: [] };
    return updateById(id, {
      github: githubData || null,
      timeline: (current.timeline || []).concat([
        {
          at: nowISO(),
          event: "github:" + ((githubData && githubData.kind) || "sync")
        }
      ])
    });
  }

  function removeById(id) {
    var list = getAll().filter(function (item) {
      return item.id !== id;
    });
    return writeAll(list);
  }

  function clear() {
    return writeAll([], { silent: true });
  }

  function countByStatus() {
    var counters = { total: 0 };
    Object.keys(STATUS_LABEL).forEach(function (key) {
      counters[key] = 0;
    });
    getAll().forEach(function (item) {
      counters.total += 1;
      if (counters[item.status] === undefined) counters[item.status] = 0;
      counters[item.status] += 1;
    });
    return counters;
  }

  /* ----- Pub/Sub: o painel admin se atualiza quando o client grava ----- */
  function subscribe(callback) {
    if (typeof callback !== "function") return function () {};
    subscribers.push(callback);
    return function unsubscribe() {
      subscribers = subscribers.filter(function (fn) {
        return fn !== callback;
      });
    };
  }

  function notify() {
    var snapshot = getAll();
    subscribers.forEach(function (fn) {
      try {
        fn(snapshot);
      } catch (err) {
        console.warn("[EditorHubStorage] assinante falhou:", err);
      }
    });
  }

  global.EditorHubStorage = {
    STORAGE_KEY: STORAGE_KEY,
    STATUS: STATUS,
    STATUS_LABEL: STATUS_LABEL,
    isAvailable: isAvailable,
    getAll: getAll,
    countByStatus: countByStatus,
    findById: findById,
    create: create,
    updateById: updateById,
    setStatus: setStatus,
    setGithub: setGithub,
    removeById: removeById,
    clear: clear,
    subscribe: subscribe,
    notify: notify
  };
})(window);
