// Reglas pequeñas y versionadas. No son una certificación de dominio ni un
// analizador general de algoritmos: solo acompañan las primeras prácticas.
export const conceptRules = ["variable", "update", "swap", "expression", "addition", "subtraction", "multiplication", "grouping", "number-text", "boolean"] as const;
export type ConceptRule = typeof conceptRules[number];
export const conceptLabels: Record<ConceptRule, string> = {
  variable: "Usar una variable", update: "Actualizar una variable", swap: "Intercambiar con una auxiliar", expression: "Distinguir cálculo y texto",
  addition: "Sumar variables", subtraction: "Restar variables", multiplication: "Multiplicar variables", grouping: "Sumar antes de multiplicar", "number-text": "Sumar números y unir textos", boolean: "Usar un booleano",
};
export const conceptMessages: Record<ConceptRule, string> = {
  variable: "La salida coincide. Guarda el valor en una variable y utiliza esa variable al mostrarlo.",
  update: "La salida coincide. Actualiza la variable usando su valor anterior y muestra el valor actualizado.",
  swap: "La salida coincide. Conserva un valor en una variable auxiliar e intercambia los valores de las dos variables antes de mostrarlas.",
  expression: "La salida coincide. Utiliza una expresión numérica para calcular la primera línea; conserva el texto literal en la segunda.",
  addition: "La salida coincide. Calcula la suma a partir de las cantidades guardadas en variables, en lugar de escribir el resultado.",
  subtraction: "La salida coincide. Calcula el cambio con una resta entre las cantidades guardadas en variables, en lugar de escribir el resultado.",
  multiplication: "La salida coincide. Multiplica las cantidades guardadas en variables y muestra el resultado del cálculo.",
  grouping: "La salida coincide. Calcula primero la suma y utiliza ese resultado en la multiplicación.",
  "number-text": "La salida coincide. Utiliza una suma de números y una unión de textos para obtener las dos líneas.",
  boolean: "La salida coincide. Guarda un valor booleano verdadero y utiliza esa variable para mostrarlo.",
};

// Formato intermedio emitido por analizadores AST dentro de Piston. El servidor
// solo recorre datos; nunca evalúa expresiones ni código del estudiante.
type Expr = { kind: string; value?: unknown; name?: string; op?: string; left?: Expr; right?: Expr; args?: Expr[] };
type Statement = { kind: string; name?: string; expr?: Expr };
type Value = { value: unknown; reads: Set<string>; influence: Map<string, number>; ops: Set<string>; variable: boolean; updated: boolean; origin?: string; grouped: boolean; boolean: boolean };
const empty = (): Value => ({ value: undefined, reads: new Set(), influence: new Map(), ops: new Set(), variable: false, updated: false, grouped: false, boolean: false });

export function satisfiesConcept(program: unknown, rule: ConceptRule): boolean {
  if (!Array.isArray(program) || program.length > 500) return false;
  const env = new Map<string, Value>();
  const initial = new Map<string, unknown>();
  const outputs: { name?: string; result: Value }[] = [];
  let budget = 4000;
  const evaluate = (expr?: Expr, depth = 0): Value => {
    if (!expr || depth > 80 || --budget < 0) return empty();
    if (expr.kind === "literal") return { ...empty(), value: expr.value, boolean: typeof expr.value === "boolean" };
    if (expr.kind === "name" && typeof expr.name === "string") {
      const value = env.get(expr.name);
      return value ? { ...value, reads: new Set([...value.reads, expr.name]), variable: true, origin: value.origin ?? expr.name } : empty();
    }
    if (expr.kind === "unary") {
      const value = evaluate(expr.left, depth + 1);
      if (typeof value.value !== "number") return empty();
      return { ...value, value: expr.op === "-" ? -value.value : value.value, influence: new Map([...value.influence].map(([key, coefficient]) => [key, expr.op === "-" ? -coefficient : coefficient])) };
    }
    if (expr.kind === "call" && Array.isArray(expr.args) && expr.args.length === 1) {
      const value = evaluate(expr.args[0], depth + 1);
      if (["str", "String"].includes(expr.name ?? "")) return { ...value, value: String(value.value) };
      if (expr.name === "lower" && typeof value.value === "string") return { ...value, value: value.value.toLowerCase() };
      return empty();
    }
    if (expr.kind !== "binary") return empty();
    const left = evaluate(expr.left, depth + 1), right = evaluate(expr.right, depth + 1);
    const numeric = typeof left.value === "number" && typeof right.value === "number";
    const text = typeof left.value === "string" && typeof right.value === "string";
    let value: unknown;
    if (expr.op === "+" && numeric) value = (left.value as number) + (right.value as number);
    else if (expr.op === "+" && text) value = (left.value as string) + (right.value as string);
    else if (expr.op === "-" && numeric) value = (left.value as number) - (right.value as number);
    else if (expr.op === "*" && numeric) value = (left.value as number) * (right.value as number);
    else return empty();
    const operation = text ? "concat" : expr.op!;
    // Sensibilidad local de +, - y *: una cuenta anulada por cero o a-a no
    // acredita que las dos cantidades influyan en el resultado mostrado.
    const influence = new Map<string, number>();
    for (const key of new Set([...left.influence.keys(), ...right.influence.keys()])) {
      const a = left.influence.get(key) ?? 0, b = right.influence.get(key) ?? 0;
      const coefficient = operation === "*" ? a * (right.value as number) + b * (left.value as number) : a + (operation === "-" ? -b : b);
      if (coefficient) influence.set(key, coefficient);
    }
    const leftOps = operation === "*" && right.value === 0 ? [] : left.ops;
    const rightOps = operation === "*" && left.value === 0 ? [] : right.ops;
    return { value, reads: new Set([...left.reads, ...right.reads]), influence, ops: new Set([...leftOps, ...rightOps, operation]), variable: left.variable || right.variable,
      updated: left.updated || right.updated, grouped: (left.grouped && !(operation === "*" && right.value === 0)) || (right.grouped && !(operation === "*" && left.value === 0)) || (operation === "*" && left.value !== 0 && right.value !== 0 && (left.ops.has("+") || right.ops.has("+"))), boolean: false };
  };
  for (const statement of program as Statement[]) {
    if (!statement || typeof statement !== "object") return false;
    const result = evaluate(statement.expr);
    if (statement.kind === "assign" && typeof statement.name === "string") {
      const name = statement.name;
      if (!initial.has(name)) {
        initial.set(name, result.value);
        if (!result.reads.size && !result.ops.size && typeof result.value === "number") result.influence.set(name, 1);
      }
      env.set(name, { ...result, updated: result.updated || (env.has(name) && result.reads.has(name) && result.ops.size > 0), origin: result.origin ?? name });
    } else if (statement.kind === "print") outputs.push({ name: statement.expr?.kind === "name" ? statement.expr.name : undefined, result });
    else return false; // El alcance de estas reglas es secuencial, sin funciones ni ramas.
  }
  const results = outputs.map(output => output.result);
  if (rule === "variable") return results.some(value => value.variable && value.value !== undefined);
  if (rule === "update") return results.some(value => value.updated);
  if (rule === "boolean") return results.some(value => value.variable && value.boolean && [true, "true"].includes(value.value as boolean | string));
  if (rule === "number-text") return results.some(value => value.ops.has("+")) && results.some(value => value.ops.has("concat"));
  if (rule === "expression") return results.some(value => value.ops.has("+") && typeof value.value === "number");
  if (rule === "grouping") return results.some(value => value.grouped);
  if (rule === "swap") {
    const [first, second] = outputs;
    return !!first?.name && !!second?.name && first.name !== second.name && first.result.origin === second.name && second.result.origin === first.name
      && first.result.value === initial.get(second.name) && second.result.value === initial.get(first.name);
  }
  const operation = { addition: "+", subtraction: "-", multiplication: "*" }[rule];
  return results.some(value => value.ops.has(operation) && value.influence.size >= 2 && typeof value.value === "number");
}
