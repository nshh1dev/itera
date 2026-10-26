import type { Json } from "./types";

export type FirstDifference = { path: string; kind: "type" | "value" | "length" | "key"; message: string };

function typeOf(value: Json): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "una lista";
  switch (typeof value) {
    case "string": return "un texto";
    case "number": return "un número";
    case "boolean": return "un booleano";
    default: return "un objeto";
  }
}

function isObject(value: Json): value is { [key: string]: Json } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function preview(value: Json): string {
  const text = JSON.stringify(value) ?? String(value);
  return text.length > 60 ? `${text.slice(0, 57)}…` : text;
}

// Localiza el primer punto en el que el resultado se separa de lo esperado.
// Solo se usa con datos visibles; los casos ocultos nunca llegan al cliente.
export function firstDifference(expected: Json, actual: Json): FirstDifference | null {
  const expectedType = typeOf(expected);
  const actualType = typeOf(actual);
  if (expectedType !== actualType) return { path: "", kind: "type", message: `Se esperaba ${expectedType} y recibiste ${actualType}.` };
  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) return { path: "", kind: "length", message: `Se esperaban ${expected.length} elementos y recibiste ${actual.length}.` };
    for (let index = 0; index < expected.length; index++) {
      const diff = firstDifference(expected[index], actual[index]);
      if (diff) return { path: `[${index}]${diff.path}`, kind: diff.kind, message: `En [${index}]${diff.path}: ${diff.message}` };
    }
    return null;
  }
  if (isObject(expected) && isObject(actual)) {
    for (const key of Object.keys(expected)) if (!(key in actual)) return { path: `.${key}`, kind: "key", message: `Falta la propiedad «${key}».` };
    for (const key of Object.keys(actual)) if (!(key in expected)) return { path: `.${key}`, kind: "key", message: `Sobra la propiedad «${key}».` };
    for (const key of Object.keys(expected)) {
      const diff = firstDifference(expected[key], actual[key]);
      if (diff) return { path: `.${key}${diff.path}`, kind: diff.kind, message: `En .${key}${diff.path}: ${diff.message}` };
    }
    return null;
  }
  if (expected !== actual) return { path: "", kind: "value", message: `Se esperaba ${preview(expected)} y recibiste ${preview(actual)}.` };
  return null;
}

export type FirstTextDifference = { line: number; column: number; message: string };

function describeCharacter(character: string | undefined): string {
  if (character === undefined) return "el final de la salida";
  if (character === "\n") return "un salto de línea";
  if (character === " ") return "un espacio";
  if (character === "\t") return "una tabulación";
  if (/\s/u.test(character)) return `el carácter U+${character.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`;
  return JSON.stringify(character);
}

// Misma normalización que judgeProgram, verificada por las pruebas de paridad.
// Las columnas cuentan puntos Unicode desde 1, no unidades UTF-16 ni píxeles.
// Solo se invoca en el cliente, después de filtrar los casos visibles.
export function firstTextDifference(expected: string, actual: string): FirstTextDifference | null {
  const characters = (text: string) => Array.from(text.replace(/\r\n?/g, "\n").split("\n").map(line => line.trimEnd()).join("\n").trimEnd());
  const wanted = characters(expected);
  const received = characters(actual);
  let line = 1;
  let column = 1;
  for (let index = 0; index < Math.max(wanted.length, received.length); index++) {
    if (wanted[index] !== received[index]) return { line, column, message: `En la línea ${line}, columna ${column}: se esperaba ${describeCharacter(wanted[index])} y recibiste ${describeCharacter(received[index])}.` };
    if (wanted[index] === "\n") { line++; column = 1; }
    else column++;
  }
  return null;
}
