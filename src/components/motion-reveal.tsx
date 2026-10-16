// La altura responde al contenido; no hay medidas ni temporizadores de desmontaje.
export function MotionReveal({ children }: { children: React.ReactNode }) {
  return <div className="motion-reveal"><div className="motion-reveal-clip">{children}</div></div>;
}
