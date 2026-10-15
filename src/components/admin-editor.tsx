"use client";
import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Upload, Loader2, EyeOff } from "lucide-react";
import { saveExercise, publishExerciseVersion, hideExercise } from "@/server/admin-actions";
import { Button } from "./ui/button";
import { Tabs,TabsList,TabsTrigger,TabsContent } from "./ui/tabs";
import { levelNames, type Level } from "@/lib/types";
import { activityNames, type ActivityType } from "@/lib/types";

export type EditorialData = { id?:string; versionId?:string; published?:boolean; slug:string;title:string;description:string;statement:string;objective:string;prerequisites:string[];practiceGoals:string[];prerequisiteSlugs:string[];complexity:string;commonErrors:string[];activityType:ActivityType;category:string;level:Level;minutes:number;hints:string[];constraints:string[];python:{starter:string;solution:string;explanation:string};javascript:{starter:string;solution:string;explanation:string};tests:string };

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function AdminEditor({initial}: {initial:EditorialData}) {
  const hydrated = useSyncExternalStore(subscribe, clientReady, serverReady);
  const router=useRouter();
  const [data,setData]=useState(initial);
  const [busy,setBusy]=useState("");
  const [message,setMessage]=useState("");
  const [pending,startTransition]=useTransition();
  function field(key:keyof EditorialData,value:unknown){setData(old=>({...old,[key]:value}));}
  async function save() {
    setBusy("save"); setMessage("");
    try {
      let tests;
      try { tests = JSON.parse(data.tests); }
      catch { setMessage("Los casos de prueba no tienen un JSON válido."); return; }
      const lines = (items: string[]) => items.map(item => item.trim()).filter(Boolean);
      const result = await saveExercise({ ...data, prerequisites: lines(data.prerequisites), practiceGoals: lines(data.practiceGoals), prerequisiteSlugs: lines(data.prerequisiteSlugs), commonErrors: lines(data.commonErrors), tests });
      if (result.error) setMessage(result.error);
      else {
        setMessage("Nueva versión guardada. Valídala para publicarla.");
        // revalidatePath ya devuelve la ficha actualizada en la respuesta de la
        // acción. Navegar/refrescar otra vez cancela ese mismo stream.
        if (initial.slug !== result.slug) router.push(`/admin/ejercicios/${result.slug}`);
      }
    } catch { setMessage("No se pudieron guardar los cambios."); }
    finally { setBusy(""); }
  }
  // No aceptar cambios antes de que los controles tengan sus manejadores React.
  return <fieldset disabled={!hydrated || pending} className="min-w-0"><form action={save} className="mt-8">
    <fieldset className="mb-7 space-y-4 rounded-xl border p-5">
      <legend className="px-2 text-sm font-medium">Guía de aprendizaje de esta versión</legend>
      <div><label className="field-label" htmlFor="objective">Objetivo de aprendizaje</label><textarea id="objective" className="field min-h-24" value={data.objective} onChange={event => field("objective", event.target.value)} required minLength={10} maxLength={500} aria-describedby="objective-help" /><p id="objective-help" className="mt-2 text-xs leading-6 text-muted-foreground">Describe qué podrá practicar la persona. Es obligatorio para guardar una versión nueva; no modifica las anteriores.</p></div>
      <div><label className="field-label" htmlFor="prerequisites">Conocimientos previos recomendados</label><textarea id="prerequisites" className="field min-h-24" value={data.prerequisites.join("\n")} onChange={event => field("prerequisites", event.target.value.split("\n"))} aria-describedby="prerequisites-help" /><p id="prerequisites-help" className="mt-2 text-xs leading-6 text-muted-foreground">Un concepto por línea, hasta ocho. Déjalo vacío solo si no hace falta experiencia previa. Estas recomendaciones no bloquean el ejercicio.</p></div>
      <div><label className="field-label" htmlFor="practice-goals">Qué vas a practicar</label><textarea id="practice-goals" className="field min-h-24" value={data.practiceGoals.join("\n")} onChange={event => field("practiceGoals", event.target.value.split("\n"))} aria-describedby="practice-help" /><p id="practice-help" className="mt-2 text-xs leading-6 text-muted-foreground">De uno a cuatro objetivos concretos, uno por línea. Obligatorios para publicar.</p></div>
      <div><label className="field-label" htmlFor="prerequisite-slugs">Ejercicios previos (slugs)</label><textarea id="prerequisite-slugs" className="field min-h-24" value={data.prerequisiteSlugs.join("\n")} onChange={event => field("prerequisiteSlugs", event.target.value.split("\n"))} aria-describedby="previous-help" /><p id="previous-help" className="mt-2 text-xs leading-6 text-muted-foreground">Un slug por línea, hasta ocho. Deben estar publicados y aparecer antes en la progresión. Se mostrarán enlaces con sus títulos.</p></div>
      <div><label className="field-label" htmlFor="complexity">Coste (complejidad)</label><input id="complexity" className="field" value={data.complexity} onChange={event => field("complexity", event.target.value)} maxLength={200} aria-describedby="complexity-help" /><p id="complexity-help" className="mt-2 text-xs leading-6 text-muted-foreground">Tiempo y espacio, por ejemplo «Tiempo O(n), espacio O(1)». Opcional.</p></div>
      <div><label className="field-label" htmlFor="common-errors">Errores comunes</label><textarea id="common-errors" className="field min-h-24" value={data.commonErrors.join("\n")} onChange={event => field("commonErrors", event.target.value.split("\n"))} aria-describedby="errors-help" /><p id="errors-help" className="mt-2 text-xs leading-6 text-muted-foreground">Un error frecuente por línea, hasta seis. Opcional.</p></div>
      <div><label className="field-label" htmlFor="activity-type">Tipo de actividad</label><select id="activity-type" className="field" value={data.activityType} onChange={event => field("activityType", event.target.value)}>{Object.entries(activityNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    </fieldset>
    <Tabs defaultValue="content"><TabsList className="max-w-full flex-wrap"><TabsTrigger value="content">Contenido</TabsTrigger><TabsTrigger value="tests">Pruebas</TabsTrigger><TabsTrigger value="python">Python</TabsTrigger><TabsTrigger value="javascript">JavaScript</TabsTrigger></TabsList><TabsContent value="content" forceMount className="mt-6 space-y-5 data-[state=inactive]:hidden"><div className="grid gap-5 sm:grid-cols-2"><div><label className="field-label" htmlFor="title">Título</label><input className="field" id="title" value={data.title} onChange={e=>field("title",e.target.value)} required maxLength={100}/></div><div><label className="field-label" htmlFor="slug">Identificador URL</label><input className="field" id="slug" value={data.slug} onChange={e=>field("slug",e.target.value)} readOnly={!!initial.id} required pattern="[a-z0-9]+(-[a-z0-9]+)*"/></div></div><div><label className="field-label" htmlFor="description">Descripción breve</label><input className="field" id="description" value={data.description} onChange={e=>field("description",e.target.value)} required maxLength={300}/></div><div><label className="field-label" htmlFor="statement">Enunciado</label><textarea className="field min-h-32" id="statement" value={data.statement} onChange={e=>field("statement",e.target.value)} required /></div><div className="grid gap-5 sm:grid-cols-3"><div><label className="field-label" htmlFor="category">Categoría</label><select id="category" className="field" value={data.category} disabled={initial.published} onChange={e=>field("category",e.target.value)}>{["Fundamentos","Cadenas","Arreglos","Algoritmos"].map(c=><option key={c}>{c}</option>)}</select></div><div><label className="field-label" htmlFor="level">Nivel</label><select id="level" className="field" value={data.level} onChange={e=>field("level",e.target.value)}>{Object.entries(levelNames).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div><div><label className="field-label" htmlFor="minutes">Minutos estimados</label><input id="minutes" className="field" type="number" min={1} max={180} value={data.minutes} onChange={e=>field("minutes",Number(e.target.value))}/></div></div><div><label className="field-label" htmlFor="hints">Pistas progresivas · una por línea</label><textarea className="field min-h-28" id="hints" value={data.hints.join("\n")} onChange={e=>field("hints",e.target.value.split("\n"))}/></div><div><label className="field-label" htmlFor="constraints">Restricciones · una por línea</label><textarea className="field min-h-24" id="constraints" value={data.constraints.join("\n")} onChange={e=>field("constraints",e.target.value.split("\n"))}/></div></TabsContent><TabsContent value="tests" forceMount className="mt-6 data-[state=inactive]:hidden"><label className="field-label" htmlFor="tests">Casos de prueba en JSON</label><p className="mb-4 text-sm leading-7 text-muted-foreground">Entre 3 y 10 casos compartidos por ambos lenguajes. Cada caso contiene input, expected y visible. Incluye al menos un ejemplo visible y una prueba oculta.</p><textarea id="tests" className="field min-h-80 font-mono text-xs leading-6" value={data.tests} onChange={e=>field("tests",e.target.value)} spellCheck={false}/></TabsContent>{(["python","javascript"] as const).map(language=><TabsContent forceMount key={language} value={language} className="mt-6 space-y-5 data-[state=inactive]:hidden">{(["starter","solution","explanation"] as const).map(key=><div key={key}><label className="field-label" htmlFor={`${language}-${key}`}>{key==="starter"?"Plantilla inicial":key==="solution"?"Solución de referencia":"Explicación y complejidad"}</label><textarea id={`${language}-${key}`} className="field min-h-40 font-mono text-xs leading-6" value={data[language][key]} onChange={e=>field(language,{...data[language],[key]:e.target.value})} spellCheck={false}/></div>)}</TabsContent>)}</Tabs><Button disabled={!!busy} className="mt-7" type="submit">{busy==="save"?<Loader2 className="animate-spin"/>:<Save/>}Guardar nueva versión</Button></form>
    {initial.versionId && <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-6"><Button variant="secondary" disabled={!!busy} onClick={()=>startTransition(async()=>{setBusy("publish");setMessage("");try{const result=await publishExerciseVersion(initial.versionId!);setMessage(result.error??"Versión validada y publicada.");}catch{setMessage("No se pudo publicar.");}finally{setBusy("");}})}>{busy==="publish"?<Loader2 className="animate-spin"/>:<Upload/>}Validar y publicar versión guardada</Button>{initial.published && <Button variant="ghost" disabled={!!busy} onClick={()=>startTransition(async()=>{setBusy("hide");try{await hideExercise(initial.id!);setMessage("Ejercicio oculto del catálogo.");}catch{setMessage("No se pudo ocultar.");}finally{setBusy("");}})}><EyeOff/>Ocultar del catálogo</Button>}<p className="w-full text-xs text-muted-foreground">La publicación ejecuta ambas soluciones de referencia en Piston. Guarda tus cambios antes de publicar.</p></div>}
    {message&&<p role="status" className="mt-5 rounded-lg bg-surface p-4 text-sm leading-7">{message}</p>}
  </fieldset>;
}
