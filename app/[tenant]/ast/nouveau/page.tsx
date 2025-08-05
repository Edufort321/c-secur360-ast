'use client';
import ASTForm from '@/components/ASTForm';

export default function NouveauASTPage({ params }: { params: { tenant: string } }) {
  return <ASTForm tenant={params.tenant} />
}
