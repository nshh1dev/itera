"use client";
import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Upload, Loader2, EyeOff } from "lucide-react";
import { saveExercise, publishExerciseVersion, hideExercise } from "@/server/admin-actions";
import { Button } from "./ui/button";
import { Tabs,TabsList,TabsTrigger,TabsContent } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { categories, languages, languageNames, levelNames, type Level } from "@/lib/types";
import { activityNames, type ActivityType, runtimeModeNames, type RuntimeMode } from "@/lib/types";

type EditorialVariant = { starter: string; solution: string; explanation: string; statement?: string; typeContract?: string };
export type EditorialData = { id?:string; versionId?:string; published?:boolean; slug:string;title:string;description:string;statement:string;objective:string;prerequisites:string[];practiceGoals:string[];prerequisiteSlugs:string[];complexity:string;commonErrors:string[];activityType:ActivityType;runtimeMode:RuntimeMode;category:string;level:Level;minutes:number;hints:string[];constraints:string[];python:EditorialVariant;javascript:EditorialVariant;typescript:EditorialVariant;tests:string };

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function AdminEditor({initial}: {initial:EditorialData}) {
  const hydrated = useSyncExternalStore(subscribe, clientReady, serverReady);
  const router=useRouter();
  const [data,setData]=useState(initial);
  const [busy,setBusy]=useState("");
  const [message,setMessage]=useState("");
  const [confirm,setConfirm]=useState<"publish"|"hide"|null>(null);
  const [pending]=useTransition();
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
  async function publish() {
    setBusy("publish"); setMessage("");
    try {
      const result = await publishExerciseVersion(initial.versionId!);
      setMessage(result.error ?? "Versión validada y publicada.");
    } catch { setMessage("No se pudo publicar."); }
    finally { setBusy(""); setConfirm(null); }
  }
  async function hide() {
    setBusy("hide"); setMessage("");
    try { await hideExercise(initial.id!); setMessage("Ejercicio oculto del catálogo."); }
    catch { setMessage("No se pudo ocultar."); }
    finally { setBusy(""); setConfirm(null); }
  }
  // No aceptar cambios antes de que los controles tengan sus manejadores React.
  return <fieldset disabled={!hydrated || pending} className="min-w-0"><form action={save} className="mt-8">
    <div role="group" className="surface-panel mb-7 rounded-xl bg-surface p-5" aria-label="Proceso de publicación">
      <h2 className="section-title">{initial.versionId ? initial.published ? "Versión publicada" : "Versión guardada en borrador" : "Nuevo ejercicio"}</h2>
      <p className="mt-2 max-w-[70ch] text-sm leading-7 text-muted-foreground">Completa el contenido y guarda una nueva versión. Después, valida la versión guardada en los tres lenguajes para publicarla. Guardar no cambia lo que ven los estudiantes.</p>
    </div>
    <div className="editorial-workspace"><fieldset className="editorial-section">
      <legend className="px-2 text-sm font-medium">Guía de aprendizaje de esta versión</legend>
      <div><label className="field-label" htmlFor="objective">Objetivo de aprendizaje</label><textarea id="objective" className="field min-h-24" value={data.objective} onChange={event => field("objective", event.target.value)} required minLength={10} maxLength={500} aria-describedby="objective-help" /><p id="objective-help" className="mt-2 text-xs leading-6 text-muted-foreground">Describe qué podrá practicar la persona. Es obligatorio para guardar una versión nueva; no modifica las anteriores.</p></div>
      <div><label className="field-label" htmlFor="prerequisites">Conocimientos previos recomendados</label><textarea id="prerequisites" className="field min-h-24" value={data.prerequisites.join("\n")} onChange={event => field("prerequisites", event.target.value.split("\n"))} aria-describedby="prerequisites-help" /><p id="prerequisites-help" className="mt-2 text-xs leading-6 text-muted-foreground">Un concepto por línea, hasta ocho. Déjalo vacío solo si no hace falta experiencia previa. Estas recomendaciones no bloquean el ejercicio.</p></div>
      <div><label className="field-label" htmlFor="practice-goals">Qué vas a practicar</label><textarea id="practice-goals" className="field min-h-24" value={data.practiceGoals.join("\n")} onChange={event => field("practiceGoals", event.target.value.split("\n"))} aria-describedby="practice-help" /><p id="practice-help" className="mt-2 text-xs leading-6 text-muted-foreground">De uno a cuatro objetivos concretos, uno por línea. Obligatorios para publicar.</p></div>
      <div><label className="field-label" htmlFor="prerequisite-slugs">Ejercicios previos (slugs)</label><textarea id="prerequisite-slugs" className="field min-h-24" value={data.prerequisiteSlugs.join("\n")} onChange={event => field("prerequisiteSlugs", event.target.value.split("\n"))} aria-describedby="previous-help" /><p id="previous-help" className="mt-2 text-xs leading-6 text-muted-foreground">Un slug por línea, hasta ocho. Deben estar publicados y aparecer antes en la progresión. Se mostrarán enlaces con sus títulos.</p></div>
      <div><label className="field-label" htmlFor="complexity">Coste (complejidad)</label><input id="complexity" className="field" value={data.complexity} onChange={event => field("complexity", event.target.value)} maxLength={200} aria-describedby="complexity-help" /><p id="complexity-help" className="mt-2 text-xs leading-6 text-muted-foreground">Tiempo y espacio, por ejemplo «Tiempo O(n), espacio O(1)». Opcional.</p></div>
      <div><label className="field-label" htmlFor="common-errors">Errores comunes</label><textarea id="common-errors" className="field min-h-24" value={data.commonErrors.join("\n")} onChange={event => field("commonErrors", event.target.value.split("\n"))} aria-describedby="errors-help" /><p id="errors-help" className="mt-2 text-xs leading-6 text-muted-foreground">Un error frecuente por línea, hasta seis. Opcional.</p></div>
      <div><label className="field-label" htmlFor="activity-type">Tipo de actividad</label><select id="activity-type" className="field" value={data.activityType} onChange={event => field("activityType", event.target.value)}>{Object.entries(activityNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div><label className="field-label" htmlFor="runtime-mode">Modo de ejecución</label><select id="runtime-mode" className="field" value={data.runtimeMode} onChange={event => field("runtimeMode", event.target.value)}>{Object.entries(runtimeModeNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><p className="mt-2 text-xs leading-6 text-muted-foreground">En un programa, los casos son texto: la entrada se envía al programa y se compara lo que imprime. En una función, la entrada y el resultado son JSON.</p></div>
    </fieldset>
    <Tabs defaultValue="content">
      <TabsList className="max-w-full flex-wrap"><TabsTrigger value="content">Contenido</TabsTrigger><TabsTrigger value="tests">Pruebas</TabsTrigger>{languages.map(language => <TabsTrigger key={language} value={language}>{languageNames[language]}</TabsTrigger>)}</TabsList>
      <TabsContent value="content" forceMount className="editorial-section mt-6 flex flex-col gap-5 data-[state=inactive]:hidden">
        <div className="grid gap-5 sm:grid-cols-2"><div><label className="field-label" htmlFor="title">Título</label><input className="field" id="title" value={data.title} onChange={e=>field("title",e.target.value)} required maxLength={100}/></div><div><label className="field-label" htmlFor="slug">Identificador URL</label><input className="field" id="slug" value={data.slug} onChange={e=>field("slug",e.target.value)} readOnly={!!initial.id} required pattern="[a-z0-9]+(-[a-z0-9]+)*"/></div></div>
        <div><label className="field-label" htmlFor="description">Descripción breve</label><input className="field" id="description" value={data.description} onChange={e=>field("description",e.target.value)} required maxLength={300}/></div>
        <div><label className="field-label" htmlFor="statement">Enunciado</label><textarea className="field min-h-32" id="statement" value={data.statement} onChange={e=>field("statement",e.target.value)} required /></div>
        <div className="grid gap-5 sm:grid-cols-3"><div><label className="field-label" htmlFor="category">Categoría</label><select id="category" className="field" value={data.category} disabled={initial.published} onChange={e=>field("category",e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div><div><label className="field-label" htmlFor="level">Nivel</label><select id="level" className="field" value={data.level} onChange={e=>field("level",e.target.value)}>{Object.entries(levelNames).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div><div><label className="field-label" htmlFor="minutes">Minutos estimados</label><input id="minutes" className="field" type="number" min={1} max={180} value={data.minutes} onChange={e=>field("minutes",Number(e.target.value))}/></div></div>
        <div><label className="field-label" htmlFor="hints">Pistas progresivas · una por línea</label><textarea className="field min-h-28" id="hints" value={data.hints.join("\n")} onChange={e=>field("hints",e.target.value.split("\n"))}/></div>
        <div><label className="field-label" htmlFor="constraints">Restricciones · una por línea</label><textarea className="field min-h-24" id="constraints" value={data.constraints.join("\n")} onChange={e=>field("constraints",e.target.value.split("\n"))}/></div>
      </TabsContent>
      <TabsContent value="tests" forceMount className="mt-6 data-[state=inactive]:hidden"><label className="field-label" htmlFor="tests">Casos de prueba en JSON</label><p className="mb-4 text-sm leading-7 text-muted-foreground">Entre 3 y 10 casos compartidos por los tres lenguajes. Cada caso contiene input, expected y visible. Incluye al menos un ejemplo visible y una prueba oculta.</p><textarea id="tests" className="field min-h-80 font-mono text-xs leading-6" value={data.tests} onChange={e=>field("tests",e.target.value)} spellCheck={false}/></TabsContent>
      {languages.map(language => <TabsContent forceMount key={language} value={language} className="mt-6 flex flex-col gap-5 data-[state=inactive]:hidden">
        {(["statement", "starter", "solution", "explanation", "typeContract"] as const).filter(key => key !== "typeContract" || language === "typescript").map(key => <div key={key}><label className="field-label" htmlFor={`${language}-${key}`}>{key === "statement" ? "Enunciado adaptado (vacío usa el común)" : key === "starter" ? "Plantilla inicial" : key === "solution" ? "Solución de referencia" : key === "typeContract" ? "Contrato de tipos (obligatorio en funciones TypeScript)" : "Explicación y complejidad"}</label><textarea id={`${language}-${key}`} className="field min-h-40 font-mono text-xs leading-6" value={data[language][key] ?? ""} onChange={event=>field(language,{...data[language],[key]:event.target.value})} spellCheck={false}/></div>)}
      </TabsContent>)}
    </Tabs></div><div className="editorial-save"><p className="text-sm text-muted-foreground">Guarda primero. La publicación es un paso independiente.</p><Button disabled={!!busy} type="submit">{busy==="save"?<Loader2 className="animate-spin"/>:<Save/>}Guardar nueva versión</Button></div></form>
    {initial.versionId && <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-6"><Button variant="secondary" disabled={!!busy} onClick={()=>setConfirm("publish")}>{busy==="publish"?<Loader2 className="animate-spin"/>:<Upload/>}Validar y publicar versión guardada</Button>{initial.published && <Button variant="ghost" disabled={!!busy} onClick={()=>setConfirm("hide")}><EyeOff/>Ocultar del catálogo</Button>}<p className="w-full text-xs text-muted-foreground">La publicación ejecuta las tres soluciones de referencia en Piston. TypeScript debe compilar sin errores. Guarda tus cambios antes de publicar.</p></div>}
    <Dialog open={confirm !== null} onOpenChange={open => { if (!open && !busy) setConfirm(null); }}>
      <DialogContent className="max-w-md">
        <DialogTitle className="pr-6 text-xl font-semibold tracking-tight">{confirm === "hide" ? "Ocultar del catálogo" : "Validar y publicar"}</DialogTitle>
        <DialogDescription className="mt-2 text-base leading-7 text-muted-foreground">{confirm === "hide" ? "El ejercicio dejará de aparecer en el catálogo y en las rutas. Los intentos y borradores de las personas se conservan." : "Se ejecutarán las tres soluciones de referencia y esta versión pasará a ser la que ve el catálogo. Las versiones anteriores se conservan para los envíos históricos."}</DialogDescription>
        <div className="mt-6 flex flex-wrap justify-end gap-2"><Button variant="ghost" disabled={!!busy} onClick={()=>setConfirm(null)}>Cancelar</Button><Button variant={confirm === "hide" ? "destructive" : "default"} disabled={!!busy} onClick={()=>confirm === "hide" ? hide() : publish()}>{busy ? <Loader2 className="animate-spin"/> : confirm === "hide" ? <EyeOff/> : <Upload/>}{confirm === "hide" ? "Ocultar ejercicio" : "Validar y publicar"}</Button></div>
      </DialogContent>
    </Dialog>
    {message&&<p role="status" className="mt-5 rounded-lg bg-surface p-4 text-sm leading-7">{message}</p>}
  </fieldset>;
}
