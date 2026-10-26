export function PasswordRecoveryHelp() {
  return <div className="mt-4 text-sm leading-6 text-muted-foreground">
    <p>El enlace solo se guarda en esta instalación. No se envía por correo.</p>
    <details className="mt-2">
      <summary className="cursor-pointer py-2 text-foreground">Dónde encontrar el enlace</summary>
      <div className="mt-3 space-y-5">
        <div><p className="font-medium text-foreground">Instalación nativa</p><p className="mt-1">Abre la carpeta <code className="break-all font-mono">.local/mail/</code> del proyecto. Busca el archivo reciente cuya línea «Para:» coincida con tu correo y abre su enlace.</p></div>
        <div><p className="font-medium text-foreground">Instalación con Docker</p><p className="mt-1">Los archivos están en el volumen <code className="font-mono">local-mail</code>, no en la carpeta del proyecto de tu equipo. Con Itera ya iniciada, ejecuta desde la raíz del proyecto:</p>
          <pre className="mt-2 whitespace-pre-wrap break-all font-mono">node scripts/docker.mjs exec -T app ls -t .local/mail</pre>
          <p className="mt-2">Lee un archivo de la lista sustituyendo <code className="font-mono">ARCHIVO.txt</code> por su nombre:</p>
          <pre className="mt-2 whitespace-pre-wrap break-all font-mono">node scripts/docker.mjs exec -T app cat .local/mail/ARCHIVO.txt</pre>
          <p className="mt-2">Comprueba que la línea «Para:» coincida con tu correo antes de abrir el enlace.</p>
        </div>
        <p>Si no tienes acceso a los archivos, pide ayuda a quien mantiene esta instalación. El enlace permite cambiar tu contraseña: no lo compartas ni lo incluyas en capturas.</p>
      </div>
    </details>
  </div>;
}
