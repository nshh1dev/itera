import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { PasswordRecoveryHelp } from "../src/components/password-recovery-help";

test("la ayuda distingue la carpeta nativa del volumen Docker y protege el enlace", () => {
  const html = renderToStaticMarkup(createElement(PasswordRecoveryHelp));
  for (const text of ["No se envía por correo", "Instalación nativa", ".local/mail/", "Instalación con Docker", "local-mail", "Para:", "no lo compartas", "quien mantiene esta instalación"]) assert.ok(html.includes(text), text);
  assert.match(html, /<summary[^>]*>Dónde encontrar el enlace<\/summary>/);
  assert.doesNotMatch(html, /<details[^>]*open/);
});

test("los comandos informativos usan el lanzador existente y la ruta del volumen montado", () => {
  const html = renderToStaticMarkup(createElement(PasswordRecoveryHelp));
  assert.ok(html.includes("node scripts/docker.mjs exec -T app ls -t .local/mail"));
  assert.ok(html.includes("node scripts/docker.mjs exec -T app cat .local/mail/ARCHIVO.txt"));
  assert.match(readFileSync("docker/compose.app.yaml", "utf8"), /local-mail:\/app\/\.local\/mail/);
  assert.match(readFileSync("docker/Dockerfile", "utf8"), /WORKDIR \/app/);
  assert.doesNotMatch(html, /docker compose up|docker-iniciar/);
});
