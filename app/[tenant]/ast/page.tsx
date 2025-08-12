'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import TenantAstPage from '@/components/TenantAstPage';

export default function ASTPage() {
  const params = useParams();
  const tenant = params?.tenant as string;
  return <TenantAstPage tenant={tenant} />;
}
