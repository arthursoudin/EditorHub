/* ============================================================
   EDITOR HUB - github_bridge.js (MOCK - Sprint 3)
   Modo portfolio: nenhuma chamada real a API do GitHub.
   Confirmar = simular envio, alert de sucesso e registrar
   no espelho do log (localStorage + download logs_github.txt).
   O navegador nao grava na raiz sozinho: o painel tem o botao
   "Baixar logs_github.txt". Script classico, sem dependencias.
   ============================================================ */
(function (global) {
  "use strict";

  var REPO = "arthursoudin/Editor-Landing";
  var REPO_URL = "https://github.com/" + REPO;
  var LOG_KEY = "editorHub.githubMockLog.v1";

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function stamp(date) {
    var d = date instanceof Date ? date : new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
      " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }

  function buildMockIssue(message) {
    var msg = message || {};
    return {
      title: "[Briefing " + (msg.protocol || msg.id || "s/protocolo") + "] " +
        (msg.name || "Novo cliente") + " - " + (msg.projectType || "projeto a definir"),
      repo: REPO,
      repoUrl: REPO_URL,
      labels: ["briefing", "editor-hub", "mock"]
    };
  }

  function readLog() {
    try {
      var raw = global.localStorage.getItem(LOG_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) { return []; }
  }

  function writeLog(entries) {
    try { global.localStorage.setItem(LOG_KEY, JSON.stringify(entries)); } catch (err) {}
    return entries;
  }

  function formatLine(entry) {
    return "[" + entry.at + "] MOCK GitHub OK :: protocolo=" + entry.protocol +
      " :: cliente=" + entry.client + " :: issue=" + entry.issueTitle +
      " :: repo=" + entry.repo + " :: status=" + entry.status;
  }

  function renderLogFile() {
    var entries = readLog();
    var lines = [
      "# logs_github.txt - Editor Hub (Sprint 3 - MOCK, portfolio)",
      "# Nenhuma chamada real a API do GitHub foi feita.",
      "# Para atualizar o arquivo na raiz: painel /admin -> botao Baixar logs_github.txt.",
      ""
    ];
    if (!entries.length) {
      lines.push("(nenhuma confirmacao simulada registrada ainda)");
    } else {
      entries.forEach(function (entry) { lines.push(formatLine(entry)); });
    }
    lines.push("");
    return lines.join("\n");
  }

  function downloadLogFile() {
    var blob = new global.Blob([renderLogFile()], { type: "text/plain;charset=utf-8" });
    var url = global.URL.createObjectURL(blob);
    var a = global.document.createElement("a");
    a.href = url;
    a.download = "logs_github.txt";
    global.document.body.appendChild(a);
    a.click();
    global.document.body.removeChild(a);
    global.setTimeout(function () { global.URL.revokeObjectURL(url); }, 1000);
  }

  function confirmAndSync(messageId) {
    var store = global.EditorHubStorage || null;
    if (!store) return Promise.reject(new Error("EditorHubStorage nao carregado."));
    var message = store.findById(messageId);
    if (!message) return Promise.reject(new Error("Mensagem nao encontrada: " + messageId));
    if (message.status !== "confirmada") {
      store.setStatus(messageId, "confirmada");
      message = store.findById(messageId) || message;
    }
    var issue = buildMockIssue(message);
    var result = {
      simulated: true, mock: true, kind: "issue",
      number: 1000 + (String(message.id || "").length * 37) % 9000,
      html_url: REPO_URL + "/issues (simulado - portfolio, sem envio real)",
      state: "open", repo: REPO, title: issue.title, at: new Date().toISOString()
    };
    var entry = {
      at: stamp(new Date()),
      protocol: message.protocol || "-",
      messageId: message.id || "-",
      client: (message.name || "-") + " <" + (message.email || "-") + ">",
      projectType: message.projectType || "-",
      issueTitle: issue.title,
      repo: REPO,
      status: "confirmada"
    };
    writeLog(readLog().concat([entry]));
    store.setGithub(messageId, result);
    var text = "Task simulada enviada ao GitHub (MOCK)!\n\n" + entry.issueTitle +
      "\nRepo: " + REPO + "\nProtocolo: " + entry.protocol +
      "\n\nRegistrado no log. Use Baixar logs_github.txt para atualizar o arquivo na raiz.";
    try { global.alert(text); } catch (err) {}
    var updated = store.findById(messageId) || message;
    return Promise.resolve({ message: updated, github: result, logEntry: entry });
  }

  global.EditorHubGithub = {
    MOCK: true, REPO: REPO, REPO_URL: REPO_URL, LOG_KEY: LOG_KEY,
    buildMockIssue: buildMockIssue,
    confirmAndSync: confirmAndSync,
    readLog: readLog,
    renderLogFile: renderLogFile,
    downloadLogFile: downloadLogFile
  };
})(window);
