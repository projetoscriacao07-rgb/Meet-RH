import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { BLOCOS_DISC } from '@/lib/disc';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const snap = await adminDb.collection('vagas').where('slug', '==', params.slug).limit(1).get();
  if (snap.empty) return NextResponse.json({ erro: 'Vaga nao encontrada' }, { status: 404 });

  const doc = snap.docs[0];
  const v = doc.data();
  const encerrada = v.status !== 'aberta' || (v.dataFim && v.dataFim.toDate() < new Date());

  if (encerrada) {
    return NextResponse.json({
      encerrada: true,
      vaga: { titulo: v.titulo, slug: v.slug },
    });
  }

  const pSnap = await adminDb.collection('vagas').doc(doc.id).collection('perguntas').orderBy('ordem').get();

  // Monta campo a campo de proposito: pontos, elimina e criterios NUNCA saem daqui.
  const perguntas = pSnap.docs.map((p) => {
    const d = p.data();
    return {
      id: p.id,
      ordem: d.ordem,
      tipo: d.tipo === 'discursiva' ? 'discursiva' : 'objetiva',
      enunciado: d.enunciado,
      opcoes: (d.opcoes || []).map((o) => ({ id: o.id, texto: o.texto })),
    };
  });

  const blocos = BLOCOS_DISC.map((b) => ({
    id: b.id,
    ordem: b.ordem,
    alternativas: b.alternativas.map((a) => ({ id: a.id, texto: a.texto })),
  }));

  return NextResponse.json({
    encerrada: false,
    vaga: {
      id: doc.id,
      titulo: v.titulo,
      slug: v.slug,
      resumo: v.resumo,
      escopo: v.escopo,
      requisitos: v.requisitos || [],
      cidade: v.cidade,
      regiao: v.regiao || '',
      dataFim: v.dataFim ? v.dataFim.toDate().toISOString() : null,
    },
    perguntas,
    blocos,
  });
}
