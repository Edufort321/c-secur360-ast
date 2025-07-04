import ASTForm from '@/components/ASTForm'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface NewASTPageProps {
  params: { tenant: string }
}

export default async function NewASTPage({ params }: NewASTPageProps) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: params.tenant }
  })

  if (!tenant) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <ASTForm tenant={tenant} />
    </div>
  )
}
