'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PlanificateurFullscreen from '../../../components/planificateur/PlanificateurFullscreen';

export default function PlanificateurPage() {
  const params = useParams();
  const tenant = params.tenant as string;

  // Mock user data - replace with real authentication
  const user = {
    name: 'Utilisateur Demo',
    email: 'demo@c-secur360.com',
    role: 'Manager',
    avatar: undefined
  };

  return <PlanificateurFullscreen tenant={tenant} user={user} />;
}