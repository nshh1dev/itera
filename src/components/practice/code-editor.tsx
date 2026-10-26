"use client";
import { useEffect, useRef } from "react";
import Editor, { loader, type Monaco } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import type { Language } from "@/lib/types";
import type { ProjectFile } from "@/lib/project";
import { languageNames } from "@/lib/types";

loader.config({ paths: { vs: "/monaco/vs" } });

function applyTheme(monaco: Monaco, dark: boolean) {
  const style = getComputedStyle(document.documentElement);
  // El optimizador CSS abrevia #FFFFFF a #fff; Monaco necesita seis dígitos.
  const color = (name: string) => style.getPropertyValue(`--${name}`).trim().replace(/^#([\da-f])([\da-f])([\da-f])$/i, "#$1$1$2$2$3$3");
  const token = (name: string) => color(name).replace("#", "");
  monaco.editor.defineTheme("itera", {
    base: dark ? "vs-dark" : "vs", inherit: false,
    rules: [
      { token: "", foreground: token("foreground") },
      { token: "comment", foreground: token("muted-foreground"), fontStyle: "italic" },
      { token: "keyword", foreground: token("primary-text") },
      { token: "string", foreground: token("foreground") },
      { token: "number", foreground: token("muted-foreground") },
      { token: "delimiter", foreground: token("muted-foreground") },
    ],
    colors: {
      "editor.background": color("editor-background"), "editor.foreground": color("foreground"),
      "editorLineNumber.foreground": color("muted-foreground"), "editorLineNumber.activeForeground": color("foreground"),
      "editor.lineHighlightBackground": color("editor-line"), "editorCursor.foreground": color("primary"),
      "editor.selectionBackground": `${color("primary")}30`, "editor.inactiveSelectionBackground": `${color("primary")}20`,
      "editorIndentGuide.background1": color("border"), "editorError.foreground": color("destructive"),
      "editorWarning.foreground": color("warning"), "editorWidget.background": color("surface"),
      "editorBracketMatch.background": color("surface"), "editorBracketMatch.border": color("border"),
      "editorBracketHighlight.foreground1": color("muted-foreground"),
      "editorBracketHighlight.foreground2": color("muted-foreground"),
      "editorBracketHighlight.foreground3": color("muted-foreground"),
      "editorBracketHighlight.foreground4": color("muted-foreground"),
      "editorBracketHighlight.foreground5": color("muted-foreground"),
      "editorBracketHighlight.foreground6": color("muted-foreground"),
      "editorBracketHighlight.unexpectedBracket.foreground": color("destructive"),
    },
  });
  monaco.editor.setTheme("itera");
}

export default function CodeEditor({ code, onChange, language, fontSize, onRun, onSubmit, readOnly = false, modelPath, projectFiles = [] }: { code: string; onChange: (value: string) => void; language: Language; fontSize: number; onRun: () => void; onSubmit: () => void; readOnly?: boolean; modelPath?: string; projectFiles?: ProjectFile[] }) {
  const { resolvedTheme } = useTheme();
  const monacoRef = useRef<Monaco | null>(null);
  const projectLibs = useRef<{ dispose(): void }[]>([]);
  const callbacks = useRef({ onRun, onSubmit });
  useEffect(() => { callbacks.current = { onRun, onSubmit }; }, [onRun, onSubmit]);
  useEffect(() => { if (monacoRef.current) applyTheme(monacoRef.current, resolvedTheme === "dark"); }, [resolvedTheme]);
  useEffect(() => {
    if (!monacoRef.current || language !== "typescript" || !modelPath) return;
    projectLibs.current.forEach(lib => lib.dispose());
    projectLibs.current = projectFiles.filter(file => file.path !== modelPath && file.path.toLowerCase().endsWith(".ts")).map(file =>
      monacoRef.current!.typescript.typescriptDefaults.addExtraLib(file.content, `file:///itera/${modelPath.split("/")[0]}/${file.path}`),
    );
    return () => { projectLibs.current.forEach(lib => lib.dispose()); projectLibs.current = []; };
  }, [language, modelPath, projectFiles]);
  useEffect(() => {
    // next-themes puede aplicar la clase después de los efectos de React.
    // Observamos el cambio real de tokens para mantener editor e interfaz sincronizados.
    const observer = new MutationObserver(() => {
      if (monacoRef.current) applyTheme(monacoRef.current, document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return <Editor height="100%" language={language} value={code} path={modelPath ? `file:///itera/${modelPath.split("/").map(encodeURIComponent).join("/")}` : undefined} theme="itera" loading={<div className="flex h-full items-center justify-center text-sm text-muted-foreground">Preparando tu editor local…</div>}
    beforeMount={monaco => {
      monacoRef.current = monaco;
      applyTheme(monaco, resolvedTheme === "dark");
      monaco.typescript.typescriptDefaults.setCompilerOptions({ strict: true, target: monaco.typescript.ScriptTarget.ES2022, module: monaco.typescript.ModuleKind.CommonJS, moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs, noEmit: true, allowNonTsExtensions: true });
      monaco.typescript.typescriptDefaults.addExtraLib('declare module "fs" { export function readFileSync(path: string | number, encoding: "utf8"): string; export function writeFileSync(path: string, data: string, encoding?: "utf8"): void; export function existsSync(path: string): boolean; export function unlinkSync(path: string): void; export function readdirSync(path: string): string[]; } declare module "node:assert/strict" { export function equal(actual: unknown, expected: unknown, message?: string): void; export function deepEqual(actual: unknown, expected: unknown, message?: string): void; export function ok(value: unknown, message?: string): asserts value; } declare function require(name: string): any;', "file:///itera-node-fs.d.ts");
    }}
    onMount={(editor, monaco) => {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => callbacks.current.onRun());
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => callbacks.current.onSubmit());
    }}
    onChange={value => onChange(value ?? "")}
    options={{ readOnly, fontFamily: "Geist Mono, monospace", fontSize, lineHeight: Math.round(fontSize * 1.8), minimap: { enabled: false }, padding: { top: 20, bottom: 20 }, scrollBeyondLastLine: false, automaticLayout: true, tabSize: language === "python" ? 4 : 2, insertSpaces: true, wordWrap: "on", bracketPairColorization: { enabled: false }, renderLineHighlight: "line", overviewRulerLanes: 0, hideCursorInOverviewRuler: true, lineNumbersMinChars: 3, folding: false, glyphMargin: false, contextmenu: false, ariaLabel: `Editor de código ${languageNames[language]}`, accessibilitySupport: "auto", scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 }, quickSuggestions: false }} />;
}
