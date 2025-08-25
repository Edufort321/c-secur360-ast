'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Target,
  Award,
  Calendar
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

interface Employee {
  id: string;
  full_name: string;
  position: string;
  department: string;
  hourly_rate_base: number;
  billable_rate: number;
  employment_status: string;
  hire_date: string;
  performance?: {
    jobs_completed: number;
    safety_score: number;
    efficiency_ratio: number;
    punctuality_score: number;
    last_evaluation_date?: string;
  };
}

interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  avgSafetyScore: number;
  avgEfficiencyRatio: number;
  totalJobsCompleted: number;
  avgPunctualityScore: number;
  totalPayrollCost: number;
  totalBillableRevenue: number;
}

export default function HRDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    avgSafetyScore: 0,
    avgEfficiencyRatio: 0,
    totalJobsCompleted: 0,
    avgPunctualityScore: 0,
    totalPayrollCost: 0,
    totalBillableRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Charger les employés avec leurs performances
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          *,
          employee_performance (
            jobs_completed,
            safety_score,
            efficiency_ratio,
            punctuality_score,
            last_evaluation_date
          )
        `)
        .eq('employment_status', 'active');

      if (employeesError) throw employeesError;

      const formattedEmployees = employeesData.map(emp => ({
        id: emp.id,
        full_name: emp.full_name,
        position: emp.position,
        department: emp.department,
        hourly_rate_base: emp.hourly_rate_base,
        billable_rate: emp.billable_rate,
        employment_status: emp.employment_status,
        hire_date: emp.hire_date,
        performance: emp.employee_performance?.[0]
      }));

      setEmployees(formattedEmployees);

      // Calculer les métriques
      const totalEmployees = formattedEmployees.length;
      const activeEmployees = formattedEmployees.filter(e => e.employment_status === 'active').length;
      
      const avgSafetyScore = formattedEmployees.reduce((sum, emp) => 
        sum + (emp.performance?.safety_score || 0), 0) / totalEmployees;
      
      const avgEfficiencyRatio = formattedEmployees.reduce((sum, emp) => 
        sum + (emp.performance?.efficiency_ratio || 100), 0) / totalEmployees;
      
      const totalJobsCompleted = formattedEmployees.reduce((sum, emp) => 
        sum + (emp.performance?.jobs_completed || 0), 0);
      
      const avgPunctualityScore = formattedEmployees.reduce((sum, emp) => 
        sum + (emp.performance?.punctuality_score || 85), 0) / totalEmployees;

      const totalPayrollCost = formattedEmployees.reduce((sum, emp) => 
        sum + (emp.hourly_rate_base * 40 * 52), 0); // Estimation annuelle

      const totalBillableRevenue = formattedEmployees.reduce((sum, emp) => 
        sum + (emp.billable_rate * 40 * 52), 0); // Estimation annuelle

      setMetrics({
        totalEmployees,
        activeEmployees,
        avgSafetyScore,
        avgEfficiencyRatio,
        totalJobsCompleted,
        avgPunctualityScore,
        totalPayrollCost,
        totalBillableRevenue
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données RH:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, threshold = 85) => {
    if (score >= threshold) return 'text-emerald-600';
    if (score >= threshold - 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number, threshold = 85): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= threshold) return 'default';
    if (score >= threshold - 15) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement du tableau de bord RH...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tableau de Bord RH</h1>
          <p className="text-slate-600">Vue d'ensemble des performances et de la gestion des employés</p>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Employés Actifs</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {metrics.activeEmployees} / {metrics.totalEmployees}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Score Sécurité Moyen</p>
                  <p className={`text-2xl font-bold ${getScoreColor(metrics.avgSafetyScore)}`}>
                    {metrics.avgSafetyScore.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Efficacité Moyenne</p>
                  <p className={`text-2xl font-bold ${getScoreColor(metrics.avgEfficiencyRatio, 100)}`}>
                    {metrics.avgEfficiencyRatio.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Tâches Complétées</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.totalJobsCompleted}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Target className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métriques financières */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Coûts vs Revenus (Estimation Annuelle)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Coûts de paie totaux:</span>
                  <span className="text-lg font-bold text-red-600">
                    ${metrics.totalPayrollCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Revenus facturables totaux:</span>
                  <span className="text-lg font-bold text-emerald-600">
                    ${metrics.totalBillableRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Marge brute estimée:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ${(metrics.totalBillableRevenue - metrics.totalPayrollCost).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-slate-500">
                      Ratio: {((metrics.totalBillableRevenue - metrics.totalPayrollCost) / metrics.totalBillableRevenue * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Ponctualité Moyenne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(metrics.avgPunctualityScore)}`}>
                    {metrics.avgPunctualityScore.toFixed(1)}%
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Score global de ponctualité</p>
                </div>
                <Progress 
                  value={metrics.avgPunctualityScore} 
                  className="h-3"
                />
                <div className="text-xs text-slate-500 text-center">
                  Basé sur l'arrivée à temps et les absences
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des employés avec performances */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-600" />
              Performances des Employés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-slate-600">Employé</th>
                    <th className="text-left p-3 font-medium text-slate-600">Département</th>
                    <th className="text-center p-3 font-medium text-slate-600">Tâches</th>
                    <th className="text-center p-3 font-medium text-slate-600">Sécurité</th>
                    <th className="text-center p-3 font-medium text-slate-600">Efficacité</th>
                    <th className="text-center p-3 font-medium text-slate-600">Ponctualité</th>
                    <th className="text-right p-3 font-medium text-slate-600">Taux/h</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-slate-900">{employee.full_name}</div>
                          <div className="text-sm text-slate-600">{employee.position}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{employee.department}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <div className="font-medium text-slate-900">
                          {employee.performance?.jobs_completed || 0}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={getScoreBadgeVariant(employee.performance?.safety_score || 85)}>
                          {(employee.performance?.safety_score || 85).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={getScoreBadgeVariant(employee.performance?.efficiency_ratio || 100, 100)}>
                          {(employee.performance?.efficiency_ratio || 100).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={getScoreBadgeVariant(employee.performance?.punctuality_score || 85)}>
                          {(employee.performance?.punctuality_score || 85).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="text-sm">
                          <div className="font-medium text-slate-900">${employee.hourly_rate_base}/h</div>
                          <div className="text-slate-600">${employee.billable_rate}/h fact.</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Award className="h-4 w-4 mr-2" />
            Nouvelle Évaluation
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Planifier Formation
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Rapport Performance
          </Button>
        </div>
      </div>
    </div>
  );
}