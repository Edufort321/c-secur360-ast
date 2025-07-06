import ASTForm from '@/components/ASTForm';

export default function NouvellASTPage({ 
  params 
}: { 
  params: { tenant: string } 
}) {
  return <ASTForm tenant={params.tenant} />;
}
