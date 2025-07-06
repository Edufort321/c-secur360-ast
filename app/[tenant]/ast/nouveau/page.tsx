import ASTFormUltraPremium from './ASTFormUltraPremium'

export default function NouveauASTPage({ params }: { params: { tenant: string } }) {
  // ASTFormUltraPremium attend une string, pas un objet
  return <ASTFormUltraPremium tenant={params.tenant} />
}
