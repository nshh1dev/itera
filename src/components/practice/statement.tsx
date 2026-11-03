// Conserva el texto editorial. Solo convierte las etiquetas de sección conocidas
// en encabezados y, por opción, marcas explícitas de código en línea.
// No interpreta HTML ni cambia el contrato de ningún lenguaje.
function inlineText(text: string, enabled: boolean) {
  if (!enabled) return text;
  return text.split(/(`+[^`\n]*`+)/g).map((part, index) => {
    const code = /^`([^`\n]+)`$/.exec(part);
    return code && code[1].trim()
      ? <code key={index} className="font-mono text-[0.95em]">{code[1]}</code>
      : part;
  });
}

export function Statement({ text, editorialHeadings = false, inlineCode = false }: { text: string; editorialHeadings?: boolean; inlineCode?: boolean }) {
  const headings = editorialHeadings
    ? /^(Entrada|Salida|Resultado esperado|Tu tarea|Qué debes hacer|Antes de resolver|Entrada y resultado):?\n([\s\S]+)$/
    : /^(Entrada|Salida|Resultado esperado|Tu tarea|Qué debes hacer):?\n([\s\S]+)$/;
  return <div id="exercise-statement" className="learning-copy mt-3 space-y-4">{text.split(/\n\s*\n/).map((block, index) => {
    const section = headings.exec(block.trim());
    return section ? <section key={index}><h3 className="mb-2 text-sm font-semibold">{section[1]}</h3><p className="whitespace-pre-line">{inlineText(section[2], inlineCode)}</p></section> : <p key={index} className="whitespace-pre-line">{inlineText(block, inlineCode)}</p>;
  })}</div>;
}
