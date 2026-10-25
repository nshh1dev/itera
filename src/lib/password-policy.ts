export const passwordPolicyMessage = "Elige una contraseña menos predecible. Evita palabras comunes, secuencias y repeticiones; puedes usar una frase de varias palabras.";

// Lista local deliberadamente acotada: no es una comprobación de filtraciones.
const commonPasswords = new Set([
  "password", "passwords", "passwordpassword", "contrasena", "contrasenas",
  "contrasenacontrasena", "qwerty", "qwertyuiop", "qwertyuiopasdfghjkl",
  "asdfghjkl", "zxcvbnm", "azerty", "letmein", "welcome", "bienvenido",
  "bienvenida", "iloveyou", "tequiero", "administrador", "administrator",
  "admin", "changeme", "cambiame", "abc", "abcdef", "abcdefghij",
  "passw0rd", "p4ssw0rd", "pssw0rd", "secret", "secreto", "holamundo",
  "monkey", "dragon", "football", "baseball", "sunshine", "princess",
  "superman", "trustno", "whatever", "login", "itera",
]);

export function newPasswordIssue(password: string): string | null {
  if (password.length < 10) return "Usa al menos 10 caracteres para la nueva contraseña.";
  if (password.length > 128) return "La nueva contraseña no puede superar los 128 caracteres.";
  // Normalizar solo para detectar patrones. Nunca modificar la contraseña guardada.
  const normalized = password.normalize("NFKD").toLowerCase().replace(/\p{M}/gu, "");
  const compact = normalized.replace(/[^\p{L}\p{N}]/gu, "");
  const pattern = compact || normalized.replace(/\s/gu, "");
  if (!pattern || commonPasswords.has(compact.replace(/\d+$/u, ""))) return passwordPolicyMessage;
  for (let size = 1; size <= 4; size++) {
    if (pattern.length % size === 0 && pattern.slice(0, size).repeat(pattern.length / size) === pattern) return passwordPolicyMessage;
  }
  const sequences = ["0123456789", "9876543210", "abcdefghijklmnopqrstuvwxyz", "zyxwvutsrqponmlkjihgfedcba", "qwertyuiopasdfghjklzxcvbnm"];
  if (sequences.some(sequence => sequence.repeat(Math.ceil(pattern.length / sequence.length) + 1).includes(pattern))) return passwordPolicyMessage;
  return null;
}
