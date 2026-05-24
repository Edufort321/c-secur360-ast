import { redirect } from 'next/navigation';

interface Props {
  params: { tenant: string };
}

export default function TenantRootPage({ params }: Props) {
  redirect(`/${params.tenant}/dashboard`);
}
