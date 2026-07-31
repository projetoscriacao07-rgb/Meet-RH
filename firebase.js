import { NextResponse } from 'next/server';
import { adminDb, exigirAdmin } from '@/lib/firebaseAdmin';
import { VAGA_INICIAL, PERGUNTAS_INICIAIS } from '@/lib/dadosIniciais';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  const admin = await exigirAdmin(request);
  if (!admin) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 });

  const existe = await adminDb.collection('vagas').where('slug', '==', VAGA_INICIAL.slug).limit(1).get();
  if (!existe.empty) {
    return NextResponse.json({ erro: 'A vaga inicial ja foi carregada' }, { status: 409 });
  }

  const inicio = new Date();
  const fim = new Date();
  fim.setDate(fim.getDate() + 30);

  const vagaRef = await adminDb.collection('vagas').add({
    ...VAGA_INICIAL,
    status: 'aberta',
    dataInicio: inicio,
    dataFim: fim,
    encerradaEm: null,
    totalInscricoes: 0,
    totalEliminadas: 0,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  });

  const lote = adminDb.batch();
  for (const pergunta of PERGUNTAS_INICIAIS) {
    const ref = vagaRef.collection('perguntas').doc();
    lote.set(ref, pergunta);
  }
  await lote.commit();

  return NextResponse.json({ ok: true, vagaId: vagaRef.id, perguntas: PERGUNTAS_INICIAIS.length });
}
