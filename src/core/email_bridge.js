/* EditorHub email bridge */
(function(g){
"use strict";
function cfg(){return g.EDITOR_HUB_EMAIL||{};}
function isCfg(c){
return c&&c.serviceId&&c.templateId&&c.publicKey
&&c.serviceId.indexOf("SEU_")!==0&&c.templateId.indexOf("SEU_")!==0
&&c.publicKey.indexOf("SUA_")!==0;
}
function isConfigured(){return isCfg(cfg());}
function params(r,c){
return {
from_name:r.name||"",reply_to:r.email||"",phone:r.phone||"",
company:r.company||"",project_type:r.projectType||"",
budget:r.budget||"",deadline:r.deadline||"",
message:r.message||"",protocol:r.protocol||"",
to_email:c.toEmail||"",created_at:r.createdAt||""
};
}
function send(r){
var c=cfg();
if(!isCfg(c))return Promise.reject(new Error("EmailJS nao configurado."));
return fetch("https://api.emailjs.com/api/v1.0/email/send",{
method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({service_id:c.serviceId,template_id:c.templateId,
user_id:c.publicKey,template_params:params(r,c)})
}).then(function(res){
if(!res.ok)throw new Error("EmailJS HTTP "+res.status);
return {ok:true,provider:"emailjs"};
});
}
g.EditorHubEmail={isConfigured:isConfigured,send:send};
})(window);
