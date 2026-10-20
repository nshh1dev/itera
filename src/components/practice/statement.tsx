// Conserva el texto editorial. Solo convierte las etiquetas de sección conocidas
// en encabezados; no interpreta HTML ni cambia el contrato de ningún lenguaje.
export function Statement({ text }: { text: string }) {
  return <div id="exercise-statement" className="learning-copy mt-3 space-y-4">{text.split(/\n\s*\n/).map((block, index) => {
    const section = /^(Entrada|Salida|Resultado esperado|Tu tarea|Qué debes hacer):?\n([\s\S]+)$/.exec(block.trim());
    return section ? <section key={index}><h3 className="mb-2 text-sm font-semibold">{section[1]}</h3><p className="whitespace-pre-line">{section[2]}</p></section> : <p key={index} className="whitespace-pre-line">{block}</p>;
  })}</div>;
}
