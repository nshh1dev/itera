import { createHash } from "node:crypto";
import { catalogRevisionFingerprint } from "./editorial-revision";

export function pythonReleaseFingerprint(entries: readonly { slug: string; content: Parameters<typeof catalogRevisionFingerprint>[0] }[]) {
  const revisions = entries.map(entry => [entry.slug, catalogRevisionFingerprint(entry.content)]).sort(([a], [b]) => a.localeCompare(b));
  return createHash("sha256").update(JSON.stringify(revisions)).digest("hex");
}

// Huellas de fuentes ya publicadas y verificadas. Permiten revisar nuestro lote
// sin confundirlo con contenido local distinto ni sobrepasar borradores ajenos.
export const knownPythonReleases: readonly string[] = [
  "a64d5e9ffde482605295def1c7740daef36787a1c7ce6a3706c4ec4f276245b4",
  // Entrega anterior conservada para poder revisar instalaciones que la publicaron.
  "49335ee4acfc5e699bd2bcdd1e3a793847daf7ea5500a80ad035a79f6ed74c5f",
  // Reordenación, contratos prioritarios y modelo de árboles (octubre de 2026).
  "e2cd539e00a8cacad4bc7d5619b3f9c7445d704d666928236d0e03ef1833c29e",
  // Explicaciones de todos los ejemplos públicos del recorrido Python.
  "158b71f24f4c58e7094e02005764008b2726c611a1e48cb7e24a145b9c13bcd0",
  // Coste concreto u omisión explícita en actividades propias y proyectos Python.
  "0aadf92e9a9d76acc7ccb74e749b8444720b4ac17458bb212cc4a34d0897e4e5",
  // Aclaraciones de enunciado tras la auditoría individual de iniciación.
  "525bb2fd44a0485e8474c0aa7ae87c05ba7c64ef7a8fab51b9dca9bbbfd0d550",
  // Auditoría de principiante: conversiones Python y casos discriminantes.
  "a076fff6c27b83d86483946b95d5b9dd347a2c692ac2c0953647a563626fd407",
  // Auditoría intermedia de colecciones: conservación, orden y selección.
  "e59cbd277aa70f38b783ccdfa346e4b730c100bf46cee4dacfac7b9ea9f13b02",
  // Auditoría de proyectos y registros anidados: conservación y validación.
  "78e7420aa7ce987b8091aa4187c921fd69083a996c5380d227e47c7d92a0ab46",
  // Auditoría de algoritmos intermedios: desempate, ventanas y límites locales.
  "314b074743f5fac57aeb6ebd979893d93d2b542ba814345a6416044e9ce93d7d",
  // Auditoría avanzada de árboles, montículos y selección voraz.
  "b91fdc75b85b194b17b93eb57f9c504bbfadd71e304e983e167f6b307616147d",
  // Auditoría avanzada de combinatoria y programación dinámica; salida acotada.
  "7c89dd30c5f3b99da03d19766021debaa54de6a68c80460a4ff1b922d9c1c359",
  // Cierre de la auditoría individual: grafos, recorridos y optimización.
  "edbd51807108ca247f9b072cc3d815eccbaa77c44fe012b79c7e618e3ad0430a",
  // Primer lote editorial: 24 enunciados con estructura y vocabulario Python.
  "7df05db75ed75ec16cff3771d1a3a530cf5840dcc47b2d7594c1cc1f064960e6",
  // Segundo lote editorial: 24 prácticas avanzadas, con evaluación conservada.
  "b16e5f2cda967e1483898a046472cb55e5652a5a0d9cc98f2d9117a8f8dac4a8",
  // Tercer lote editorial: doce prácticas de grafos y optimización.
  "6d7ca69cce0a63d6517931bb43d30986ff597f8e5399f35853b495616139b81b",
  // Cuarto lote editorial: retorno, cálculos, condiciones y primeros bucles.
  "4fa39e0b364efbc4e2d3d12c8f365c92488889b2f833841e288dfd39c48d1ba9",
  // Quinto lote editorial: listas, textos y funciones auxiliares de principiante.
  "c69c06fa65d18b7608bac0bd2b982fea01d18d8ff08bd1b6dc5c360a22cd7e34",
  // Sexto lote editorial: alias, copias, validación, errores y pruebas.
  "6b51d6ac7847a8c3072752fa224b44a0c38fad7a146c0866ecc1821f96381ac2",
  // Séptimo lote editorial: conjuntos, conteos, comprensiones e iteradores.
  "10ca72157eaa7448a2329199d28cd21f7677b3c565843aa3f0755e74b93f3b1e",
  // Octavo lote editorial: registros anidados, búsquedas y matrices.
  "bd1d23a9655f7846214c9511b983997874552840c78f13d658b44a1885c31e3d",
  // Noveno lote editorial: cuatro funciones y los 22 programas completos.
  "e210c5aaa0da5d16f6fbca0f1da9e3691ddf8fda90783bf149d6a9aa00cd6d0c",
  // Décimo lote editorial: los 18 proyectos completan los 224 enunciados.
  "bcf406df5e6d37068e7e85c6f07f3e2cf17cf37964e27ff5b9b0d2abf3ee53a4",
  // Vocabulario Python en descripciones, objetivos, restricciones y ayudas.
  "64197867bfcd9bc043a55f704fdb41ed435e3971e312450e4bf81f973961dfc2",
  // Diez explicaciones de solución: vocabulario y razonamiento de la referencia.
  "a1a31447dba2f99772dd5d541ab3bbc513098141f2c2b5a3666f1dd51fdf7419",
  // Explicaciones individuales de los 18 proyectos, sin cambiar sus contratos.
  "f9837a6f57e136fb496bed5892f9173ea9e5de2f4d70fd80096dcc09f27ad9b3",
  // Tiempos orientativos: 54 ajustes explícitos, 170 estimaciones conservadas.
  "361d08526dac58c1dadfac4d939509e75a6f225b8f5355780a488f0a840eb480",
  // Fundamentos propios: 15 explicaciones sin repetir la teoría del enunciado.
  "3a713639f6d74074a72e133e105598a4df11a0b0f7367ab39dc7f91aedd14e8e",
];
