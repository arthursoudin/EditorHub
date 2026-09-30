/* ============================================================
   EDITOR HUB — Configuração de e-mail (src/core/email_config.js)
   ------------------------------------------------------------
   PREENCHA com os seus dados do EmailJS e o seu e-mail real.

   Passo a passo (5 min, grátis):
   1) Crie conta em https://www.emailjs.com
   2) Add New Service → Gmail → conecte seu e-mail → anote o Service ID
   3) Email Templates → Create → anote o Template ID.
      Variáveis usadas no template (cole no corpo do template):
      {{from_name}} {{reply_to}} {{phone}} {{company}}
      {{project_type}} {{budget}} {{deadline}} {{message}}
      {{protocol}} {{to_email}} {{created_at}}
   4) Account → General → Public Key → anote.
   5) Preencha abaixo e recarregue o contact.html.
   ============================================================ */
(function (global) {
  "use strict";

  global.EDITOR_HUB_EMAIL = {
    // Ex.: "service_abc1234"
    serviceId: "SEU_SERVICE_ID",
    // Ex.: "template_xyz1234"
    templateId: "SEU_TEMPLATE_ID",
    // Ex.: "AbCDeFgHiJkLmNoPq"
    publicKey: "SUA_PUBLIC_KEY",
    // E-mail REAL que vai receber os briefings. Ex.: "voce@gmail.com"
    toEmail: "contato@editorhub.dev"
  };
})(window);
