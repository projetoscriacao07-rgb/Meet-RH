import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const agora = new Date();
  const snap = await adminDb.collection('vagas').where('status', '==', 'aberta').get();

  const vagas = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((v) => !v.dataFim || v.dataFim.toDate() >= agora)
    .map((v) => ({
      id: v.id,
      titulo: v.titulo,
      slug: v.slug,
      resumo: v.resumo,
      cidade: v.cidade,
      regiao: v.regiao || '',
      dataFim: v.dataFim ? v.dataFim.toDate().toISOString() : null,
    }))
    .sort((a, b) => (a.dataFim || '').localeCompare(b.dataFim || ''));

  return NextResponse.json({ vagas });
}
