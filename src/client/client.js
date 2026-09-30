/* ============================================================
   EDITOR HUB — client.js
   Sprint 1: navegação, animações de entrada, portfólio (filtros +
   lightbox) e formulário de contato.
   Persistência: window.EditorHubStorage (src/core/storage.js).
   ============================================================ */
(function (window, document) {
  "use strict";

  /* ----------------------------------------------------------
     DADOS DO PORTFÓLIO
     (Sprint 3 pode substituir este array por dados da API do GitHub)
     ---------------------------------------------------------- */
  var CATEGORY_LABEL = {
    reels: "Reels & Shorts",
    institucional: "Institucional",
    motion: "Motion design",
    podcast: "Podcast"
  };

  var PROJECTS = [
    {
      id: "proj-norte-reels",
      title: "Campanha sempre-verde",
      client: "Studio Norte",
      category: "reels",
      format: "9:16",
      duration: "00:42",
      featured: true,
      thumb:
        "linear-gradient(135deg, #1B4D3E 0%, #0F171D 60%), radial-gradient(circle at 70% 20%, #E9AF22 0%, transparent 45%)",
      description:
        "Pacote de 12 Reels com ganchos testados em duas variantes e legendas dinâmicas por palavra. A retenção média subiu 38% em três meses de publicação.",
      tags: ["CapCut", "Legenda animada", "Teste A/B"],
      metrics: [
        { label: "Retenção", value: "+38%" },
        { label: "Views", value: "2,1 mi" }
      ]
    },
    {
      id: "proj-vetta-institucional",
      title: "Vetta Energia — institucional 2026",
      client: "Vetta Energia",
      category: "institucional",
      format: "16:9 / 4K",
      duration: "02:18",
      featured: true,
      thumb:
        "linear-gradient(135deg, #0F171D 0%, #1B4D3E 70%), radial-gradient(circle at 20% 80%, #E9AF22 0%, transparent 50%)",
      description:
        "Vídeo institucional de abertura de ano com trilha original, color grading cinematográfico e grafismos que traduzem os números da companhia.",
      tags: ["Color grade", "Trilha original", "Lower thirds"],
      metrics: [
        { label: "Uso comercial", value: "3 campanhas" },
        { label: "Aprovação", value: "1ª versão" }
      ]
    },
    {
      id: "proj-frequencia-podcast",
      title: "Frequência Alta — temporada 4",
      client: "Podcast Frequência Alta",
      category: "podcast",
      format: "Multicam 16:9 + 9:16",
      duration: "01:04:00",
      featured: true,
      thumb:
        "linear-gradient(135deg, #131E25 0%, #1B4D3E 55%), radial-gradient(circle at 50% 0%, #E9AF22 0%, transparent 55%)",
      description:
        "Doze episódios editados com sincronia multicam, limpeza de áudio e 36 cortes verticais derivados dos melhores momentos de cada conversa.",
      tags: ["Multicam", "Noise reduction", "36 cortes"],
      metrics: [
        { label: "Episódios", value: "12" },
        { label: "Derivados", value: "36" }
      ]
    },
    {
      id: "proj-kaya-motion",
      title: "Kaya — abertura animada",
      client: "Kaya Tecnologia",
      category: "motion",
      format: "16:9 / Alpha",
      duration: "00:12",
      featured: false,
      thumb:
        "linear-gradient(135deg, #0B1116 0%, #2A7A63 80%), radial-gradient(circle at 80% 30%, #E9AF22 0%, transparent 45%)",
      description:
        "Abertura de marca com animação de logo, reveal tipográfico e transições reaproveitáveis em todos os vídeos do canal.",
      tags: ["After Effects", "Logo animado", "Presets"],
      metrics: [
        { label: "Reuso", value: "40 vídeos" },
        { label: "Render", value: "Alpha" }
      ]
    },
    {
      id: "proj-lumina-reels",
      title: "Lúmina Joias — coleção verão",
      client: "Lúmina Joias",
      category: "reels",
      format: "9:16",
      duration: "00:28",
      featured: false,
      thumb:
        "linear-gradient(135deg, #1B4D3E 0%, #131E25 100%), radial-gradient(circle at 30% 90%, #E9AF22 0%, transparent 50%)",
      description:
        "Edição de produto com macro cuts, sound design sutil e ritmo sincronizado com a trilha para destacar detalhes das peças.",
      tags: ["Sound design", "Macro cut", "Produto"],
      metrics: [
        { label: "CTR", value: "+2.4x" },
        { label: "Carrinho", value: "+19%" }
      ]
    },
    {
      id: "proj-colegio-motion",
      title: "Colégio Horizonte — tour virtual",
      client: "Colégio Horizonte",
      category: "motion",
      format: "16:9 / 4K",
      duration: "01:35",
      featured: false,
      thumb:
        "linear-gradient(135deg, #0F171D 0%, #1B4D3E 100%), radial-gradient(circle at 10% 20%, #E9AF22 0%, transparent 40%)",
      description:
        "Tour institucional com mapa animado, legendas por seção e motion graphics que apresentam cada ambiente da escola.",
      tags: ["Motion graphics", "Mapa animado", "Narração"],
      metrics: [
        { label: "Tempo médio", value: "01:35" },
        { label: "Conversão", value: "+12%" }
      ]
    },
    {
      id: "proj-indie-institucional",
      title: "Indie Labs — pitch para investidores",
      client: "Indie Labs",
      category: "institucional",
      format: "16:9",
      duration: "03:10",
      featured: false,
      thumb:
        "linear-gradient(135deg, #131E25 0%, #2A7A63 100%), radial-gradient(circle at 90% 80%, #E9AF22 0%, transparent 45%)",
      description:
        "Vídeo de captação com gráficos de tração, animação de métricas e cortes de depoimentos de clientes em ritmo de apresentação.",
      tags: ["Gráficos animados", "Depoimentos", "Pitch"],
      metrics: [
        { label: "Rodada", value: "R$ 4 mi" },
        { label: "Versões", value: "3 cortes" }
      ]
    },
    {
      id: "proj-corrente-reels",
      title: "Cortes de lançamento",
      client: "Banda Corrente",
      category: "reels",
      format: "9:16 / 1:1",
      duration: "00:35",
      featured: false,
      thumb:
        "linear-gradient(135deg, #0B1116 0%, #1B4D3E 70%), radial-gradient(circle at 60% 10%, #E9AF22 0%, transparent 40%)",
      description:
        "Cortes de show com estabilização, mixagem de dois microfones e legendas para teaser de single nas redes sociais.",
      tags: ["Estabilização", "Mix de áudio", "Teaser"],
      metrics: [
        { label: "Formatos", value: "2" },
        { label: "Entrega", value: "48h" }
      ]
    },
    {
      id: "proj-base-podcast",
      title: "Mentoria em vídeo — série",
      client: "Projeto Base",
      category: "podcast",
      format: "16:9 + 9:16",
      duration: "00:22:00",
      featured: false,
      thumb:
        "linear-gradient(135deg, #101B21 0%, #2A7A63 90%), radial-gradient(circle at 40% 20%, #E9AF22 0%, transparent 45%)",
      description:
        "Oito aulas de mentoria com padronização de abertura, capítulos marcados e material de apoio em cards animados.",
      tags: ["Capítulos", "Cards animados", "Padronização"],
      metrics: [
        { label: "Aulas", value: "8" },
        { label: "Conclusão", value: "71%" }
      ]
    }
  ];

  /* ----------------------------------------------------------
     HELPERS
     ---------------------------------------------------------- */
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function esc(value) {
    return String(value === undefined || value === null ? "" : value).replace(
      /[&<>"']/g,
      function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[char];
      }
    );
  }

  var storage = window.EditorHubStorage || null;

  if (!storage) {
    console.warn("[EditorHub] storage.js não carregado — persistência desativada.");
  }

  /* ----------------------------------------------------------
     TOASTS
     ---------------------------------------------------------- */
  function showToast(title, text, variant, timeout) {
    var stack = $("#toast-stack");
    if (!stack) return;

    var toast = document.createElement("div");
    toast.className = "toast" + (variant ? " toast--" + variant : "");
    toast.setAttribute("role", "status");
    toast.innerHTML =
      "<span><strong>" +
      esc(title) +
      "</strong>" +
      (text ? "<p>" + esc(text) + "</p>" : "") +
      "</span>";

    stack.appendChild(toast);

    window.setTimeout(function () {
      toast.classList.add("is-leaving");
      window.setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 220);
    }, timeout || 4600);
  }

  /* ----------------------------------------------------------
     NAVEGAÇÃO
     ---------------------------------------------------------- */
  function initNav() {
    var toggle = $(".nav-toggle");
    var body = document.body;

    if (toggle) {
      toggle.addEventListener("click", function () {
        var isOpen = body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        toggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
      });
    }

    document.addEventListener("click", function (event) {
      if (!body.classList.contains("nav-open")) return;
      if (event.target.closest(".site-header")) return;
      body.classList.remove("nav-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && body.classList.contains("nav-open")) {
        body.classList.remove("nav-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    });

    var current = window.location.pathname.split("/").pop() || "index.html";
    var key = current.replace(".html", "");
    var link = $('[data-nav="' + key + '"]');
    if (link) link.classList.add("is-active");
  }

  function initYear() {
    var year = String(new Date().getFullYear());
    $$("[data-current-year]").forEach(function (node) {
      node.textContent = year;
    });
  }

  /* ----------------------------------------------------------
     REVEAL ON SCROLL
     ---------------------------------------------------------- */
  function initReveal() {
    var items = $$(".reveal").filter(function (item) {
      return !item.classList.contains("is-visible");
    });
    if (!items.length) return;

    var reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ----------------------------------------------------------
     PORTFÓLIO — TEMPLATE DOS CARDS
     ---------------------------------------------------------- */
  function workCardHTML(project) {
    var tags = project.tags
      .map(function (tag) {
        return '<span class="tag">' + esc(tag) + "</span>";
      })
      .join("");

    var metrics = project.metrics
      .map(function (metric) {
        return "<span>" + esc(metric.label) + ": <b>" + esc(metric.value) + "</b></span>";
      })
      .join("");

    return (
      '<article class="work reveal" style="--thumb: ' +
      project.thumb +
      '">' +
      '<div class="work__thumb" data-work-open="' +
      esc(project.id) +
      '" role="button" tabindex="0" aria-label="Ver detalhes de ' +
      esc(project.title) +
      '">' +
      '<span class="badge badge--accent work__cat">' +
      esc(CATEGORY_LABEL[project.category] || project.category) +
      "</span>" +
      '<span class="work__play">' +
      '<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M5 3.2 12 8l-7 4.8V3.2Z" /></svg>' +
      "</span>" +
      '<span class="work__time">' +
      esc(project.duration) +
      "</span>" +
      "</div>" +
      '<div class="work__body">' +
      "<h3 class=\"work__title\">" +
      esc(project.title) +
      "</h3>" +
      '<p class="work__desc">' +
      esc(project.description) +
      "</p>" +
      '<div class="tag-list">' +
      tags +
      "</div>" +
      '<div class="work__metrics">' +
      metrics +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function emptyStateHTML(term) {
    return (
      '<div class="empty-state">' +
      "<p><strong>Nenhum projeto encontrado" +
      (term ? ' para "' + esc(term) + '"' : "") +
      ".</strong></p>" +
      "<p>Tente outro filtro ou limpe a busca para ver todos os trabalhos.</p>" +
      "</div>"
    );
  }

  /* ----------------------------------------------------------
     PORTFÓLIO — LIGHTBOX
     ---------------------------------------------------------- */
  var lastFocused = null;

  function openWorkModal(project) {
    var modal = $("#work-modal");
    if (!modal || !project) return;

    lastFocused = document.activeElement;

    var media = $("#work-modal-media");
    if (media) media.style.setProperty("--thumb", project.thumb);

    var category = $("#work-modal-category");
    if (category) category.textContent = CATEGORY_LABEL[project.category] || project.category;

    var title = $("#work-modal-title");
    if (title) title.textContent = project.title;

    var description = $("#work-modal-description");
    if (description) description.textContent = project.description;

    var client = $("#work-modal-client");
    if (client) client.textContent = project.client;

    var duration = $("#work-modal-duration");
    if (duration) duration.textContent = project.duration;

    var format = $("#work-modal-format");
    if (format) format.textContent = project.format;

    var tags = $("#work-modal-tags");
    if (tags) {
      tags.innerHTML = project.tags
        .map(function (tag) {
          return '<span class="tag">' + esc(tag) + "</span>";
        })
        .join("");
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    var closeBtn = $("[data-modal-close]", modal);
    if (closeBtn) closeBtn.focus();
  }

  function closeWorkModal() {
    var modal = $("#work-modal");
    if (!modal || !modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (lastFocused && lastFocused.focus) lastFocused.focus();
    lastFocused = null;
  }

  function findProject(id) {
    return (
      PROJECTS.filter(function (project) {
        return project.id === id;
      })[0] || null
    );
  }

  function initModal() {
    var modal = $("#work-modal");
    if (!modal) return;

    $$("[data-modal-close]", modal).forEach(function (button) {
      button.addEventListener("click", closeWorkModal);
    });

    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeWorkModal();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeWorkModal();
    });
  }

  /* ----------------------------------------------------------
     PORTFÓLIO — RENDERIZAÇÃO E FILTROS
     ---------------------------------------------------------- */
  function renderWorks(container, list, term) {
    if (!container) return;
    if (!list.length) {
      container.innerHTML = emptyStateHTML(term);
      return;
    }
    container.innerHTML = list.map(workCardHTML).join("");
    initReveal();
  }

  function matchesSearch(project, term) {
    if (!term) return true;
    var haystack = [project.title, project.client, project.description, project.category]
      .concat(project.tags)
      .join(" ")
      .toLowerCase();
    return haystack.indexOf(term.toLowerCase()) !== -1;
  }

  function initPortfolio() {
    var grid = $("#work-grid");
    if (!grid) return;

    var chips = $$("#filter-chips .chip");
    var search = $("#portfolio-search");
    var count = $("#portfolio-count");
    var state = { category: "all", term: "" };

    function apply() {
      var list = PROJECTS.filter(function (project) {
        var byCategory = state.category === "all" || project.category === state.category;
        return byCategory && matchesSearch(project, state.term);
      });

      renderWorks(grid, list, state.term);

      if (count) {
        count.textContent =
          list.length +
          (list.length === 1 ? " projeto encontrado" : " projetos encontrados") +
          (state.category === "all"
            ? ""
            : " · filtro: " + (CATEGORY_LABEL[state.category] || state.category));
      }

      var url = new URL(window.location.href);
      if (state.category === "all") url.searchParams.delete("filtro");
      else url.searchParams.set("filtro", state.category);
      window.history.replaceState({}, "", url.toString());
    }

    function setCategory(category) {
      state.category = category;
      chips.forEach(function (chip) {
        var active = chip.getAttribute("data-filter") === category;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", active ? "true" : "false");
      });
      apply();
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        setCategory(chip.getAttribute("data-filter") || "all");
      });
    });

    if (search) {
      var timer = null;
      search.addEventListener("input", function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          state.term = search.value.trim();
          apply();
        }, 160);
      });
    }

    // Delegação: abrir o lightbox ao clicar/teclar no card
    grid.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-work-open]");
      if (trigger) openWorkModal(findProject(trigger.getAttribute("data-work-open")));
    });

    grid.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      var trigger = event.target.closest("[data-work-open]");
      if (!trigger) return;
      event.preventDefault();
      openWorkModal(findProject(trigger.getAttribute("data-work-open")));
    });

    // Filtro vindo da URL (?filtro=reels) ou dos links do rodapé
    var fromUrl = new URL(window.location.href).searchParams.get("filtro");
    setCategory(fromUrl && CATEGORY_LABEL[fromUrl] ? fromUrl : "all");

    $$("[data-filter-link]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        // Os links do rodapé filtram a lista sem recarregar a página
        event.preventDefault();
        setCategory(link.getAttribute("data-filter-link"));
        window.scrollTo({ top: grid.offsetTop - 120, behavior: "smooth" });
      });
    });
  }

  function initFeatured() {
    var grid = $("#featured-grid");
    if (!grid) return;

    var limit = parseInt(grid.getAttribute("data-featured"), 10);
    if (isNaN(limit) || limit <= 0) limit = 3;

    var featured = PROJECTS.filter(function (project) {
      return project.featured;
    }).slice(0, limit);

    renderWorks(grid, featured);

    grid.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-work-open]");
      if (trigger) openWorkModal(findProject(trigger.getAttribute("data-work-open")));
    });

    grid.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      var trigger = event.target.closest("[data-work-open]");
      if (!trigger) return;
      event.preventDefault();
      openWorkModal(findProject(trigger.getAttribute("data-work-open")));
    });
  }


  /* ----------------------------------------------------------
     FORMULÁRIO DE CONTATO
     ---------------------------------------------------------- */
  var RULES = {
    name: function (value) {
      if (!value) return "Informe o seu nome.";
      if (value.length < 2) return "O nome precisa de pelo menos 2 caracteres.";
      return "";
    },
    email: function (value) {
      if (!value) return "Informe o seu e-mail.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "E-mail inválido.";
      return "";
    },
    phone: function (value) {
      if (!value) return "";
      if (value.replace(/\D/g, "").length < 10) return "Telefone incompleto (DDD + número).";
      return "";
    },
    projectType: function (value) {
      if (!value) return "Escolha o tipo de projeto.";
      return "";
    },
    message: function (value) {
      if (!value) return "Descreva o projeto.";
      if (value.length < 20) return "Conte um pouco mais (mínimo 20 caracteres).";
      if (value.length > 1200) return "Máximo de 1200 caracteres.";
      return "";
    },
    consent: function (value, field) {
      if (field && field.type === "checkbox" && !field.checked) {
        return "É necessário autorizar o contato.";
      }
      return "";
    }
  };

  function fieldWrapper(name) {
    var field = document.getElementById(name);
    if (!field) return null;
    return field.closest(".field") || field.closest(".checkbox");
  }

  function setFieldError(name, message) {
    var errorBox = $('[data-error-for="' + name + '"]');
    if (errorBox) errorBox.textContent = message || "";

    var wrapper = fieldWrapper(name);
    if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
  }

  function clearFieldErrors(form) {
    Object.keys(RULES).forEach(function (name) {
      setFieldError(name, "");
    });
    var status = $("#form-status", form);
    if (status) {
      status.textContent = "Preencha e envie — a mensagem chega no e-mail do editor.";
    }
  }

  /** Campos coletados do formulário (validados ou não). */
  var FORM_FIELDS = [
    "name",
    "email",
    "phone",
    "company",
    "projectType",
    "budget",
    "deadline",
    "message"
  ];

  function readField(name) {
    var field = document.getElementById(name);
    if (!field) return "";
    return field.type === "checkbox" ? String(field.checked) : field.value.trim();
  }

  /** Lê TODOS os campos do formulário (inclusive os opcionais). */
  function collectData() {
    var data = {};
    FORM_FIELDS.forEach(function (name) {
      data[name] = readField(name);
    });
    return data;
  }

  function validateForm() {
    var data = collectData();
    var firstInvalid = null;

    Object.keys(RULES).forEach(function (name) {
      var field = document.getElementById(name);
      var value = field && field.type === "checkbox" ? null : data[name] || "";
      var error = RULES[name](value, field);

      setFieldError(name, error);

      if (error && !firstInvalid) firstInvalid = field;
    });

    return { ok: !firstInvalid, data: data, firstInvalid: firstInvalid };
  }
  function showSuccess(record, form, successCard) {
    var protocol = $("#success-protocol");
    if (protocol) protocol.textContent = record.protocol;

    var whatsapp = $("#success-whatsapp");
    if (whatsapp) {
      var text =
        "Olá! Acabei de enviar um briefing pelo site (protocolo " +
        record.protocol +
        "). Projeto: " +
        (record.projectType || "a definir") +
        ".";
      whatsapp.href = "https://wa.me/5511999999999?text=" + encodeURIComponent(text);
    }

    var wrapper = $("#contact-form-wrapper");
    if (wrapper) wrapper.classList.add("hidden");

    if (successCard) {
      successCard.classList.add("is-visible");
      successCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (form) form.reset();
  }

  function initContactForm() {
    var form = $("#contact-form");
    if (!form) return;

    var successCard = $("#contact-success");
    var submitBtn = $("#submit-btn");

    $$("input, select, textarea", form).forEach(function (field) {
      var handler = function () {
        if (RULES[field.name]) setFieldError(field.name, "");
      };
      field.addEventListener("input", handler);
      field.addEventListener("change", handler);
    });

    form.addEventListener("reset", function () {
      window.setTimeout(function () {
        clearFieldErrors(form);
      }, 0);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var result = validateForm();

      if (!result.ok) {
        showToast("Revise o formulário", "Alguns campos precisam de atenção.", "error");
        if (result.firstInvalid && result.firstInvalid.focus) result.firstInvalid.focus();
        return;
      }

      if (!storage || !storage.isAvailable()) {
        showToast(
          "Armazenamento indisponível",
          "Não foi possível registrar o briefing neste navegador. Fale por e-mail ou WhatsApp.",
          "error",
          7000
        );
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.innerHTML;
        submitBtn.innerHTML = "Enviando…";
      }
      var statusEl = $("#form-status", form);
      if (statusEl) statusEl.textContent = "Enviando briefing…";

      var record;
      try {
        record = storage.create(
          Object.assign({}, result.data, { source: "contact.html" })
        );
      } catch (err) {
        console.error("[EditorHub] falha ao salvar briefing:", err);
        showToast("Não foi possível enviar", String(err.message || err), "error", 7000);
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.dataset.label) submitBtn.innerHTML = submitBtn.dataset.label;
        }
        return;
      }

      function finish(emailState) {
        try {
          var delivery = { provider: "emailjs", status: emailState, at: new Date().toISOString() };
          if (storage.updateById) storage.updateById(record.id, { emailStatus: delivery });
          record.emailStatus = delivery;
        } catch (e) { /* mantém fluxo mesmo se patch falhar */ }

        showSuccess(record, form, successCard);

        if (emailState === "sent") {
          showToast(
            "Briefing enviado",
            "Protocolo " + record.protocol + ". Chegou no e-mail do editor.",
            "success",
            7000
          );
        } else if (emailState === "not-configured") {
          showToast(
            "Salvo localmente — e-mail ainda não configurado",
            "Protocolo " + record.protocol + ". Preencha src/core/email_config.js para receber por e-mail.",
            "error",
            9000
          );
        } else {
          showToast(
            "Salvo, mas o e-mail falhou",
            "Protocolo " + record.protocol + ". O briefing está no painel; tente de novo.",
            "error",
            9000
          );
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.dataset.label) submitBtn.innerHTML = submitBtn.dataset.label;
        }
        if (statusEl) statusEl.textContent = "Preencha e envie — a mensagem chega no e-mail do editor.";
      }

      try {
        var bridge = window.EditorHubEmail;
        if (bridge && bridge.isConfigured && bridge.isConfigured()) {
          bridge.send(record).then(
            function () { finish("sent"); },
            function (err) {
              console.error("[EditorHub] EmailJS falhou:", err);
              finish("failed");
            }
          );
        } else {
          console.warn("[EditorHub] EmailJS não configurado — ver src/core/email_config.js");
          finish("not-configured");
        }
      } catch (err) {
        console.error("[EditorHub] EmailJS erro:", err);
        finish("failed");
      }
    });

    var newMessage = $("#new-message");
    if (newMessage) {
      newMessage.addEventListener("click", function () {
        if (successCard) successCard.classList.remove("is-visible");
        var wrapper = $("#contact-form-wrapper");
        if (wrapper) wrapper.classList.remove("hidden");
        clearFieldErrors(form);
        if (wrapper) wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
        var name = $("#name");
        if (name) name.focus();
      });
    }
  }

  function init() {
    initNav();
    initYear();
    initReveal();
    initModal();
    initFeatured();
    initPortfolio();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.EditorHub = {
    projects: PROJECTS,
    categoryLabel: CATEGORY_LABEL,
    showToast: showToast,
    storage: storage,
    esc: esc
  };
})(window, document);
