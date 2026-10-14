import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth";
import { db } from "@/server/db";
import { expireInterruptedSubmissions } from "@/server/execution/service";

export async function GET(_request: Request, { params }: { params: Promise<{id:string}> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión para consultar este intento." }, { status: 401 });
  const { id } = await params;
  if (id.length > 100) return NextResponse.json({ error: "Intento inválido." }, { status: 400 });
  await expireInterruptedSubmissions();
  const result = await db.submission.findFirst({ where: { id, userId: user.id }, select: { id:true, status:true, mode:true, passedCount:true, totalCount:true, results:true, message:true } });
  if (!result) return NextResponse.json({ error: "No encontramos este intento." }, { status: 404 });
  return NextResponse.json({ ...result, results: result.results ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
