import { FileText, Shield, AlertTriangle, Edit, Users, CheckCircle } from 'lucide-react';

export const steps = [
  {
    id: 1,
    titleKey: 'step1',
    icon: FileText,
    color: '#3b82f6',
    required: true,
  },
  {
    id: 2,
    titleKey: 'step2',
    icon: Shield,
    color: '#10b981',
    required: true,
  },
  {
    id: 3,
    titleKey: 'step3',
    icon: AlertTriangle,
    color: '#f59e0b',
    required: true,
  },
  {
    id: 4,
    titleKey: 'step4',
    icon: Edit,
    color: '#8b5cf6',
    required: false,
  },
  {
    id: 5,
    titleKey: 'step5',
    icon: Users,
    color: '#06b6d4',
    required: false,
  },
  {
    id: 6,
    titleKey: 'step6',
    icon: CheckCircle,
    color: '#10b981',
    required: false,
  },
];
