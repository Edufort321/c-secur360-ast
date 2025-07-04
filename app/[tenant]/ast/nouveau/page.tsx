import ASTFormUltraPremium from './ASTFormUltraPremium'

export default function NouveauASTPage({ params }: { params: { tenant: string } }) {
  const tenant = {
    id: '1',
    subdomain: params.tenant,
    companyName: params.tenant === 'demo' ? 'Version Démo' : 'Client'
  }
  
  return <ASTFormUltraPremium tenant={tenant} />
}
