'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  Target,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  RefreshCw
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

interface ProjectWIP {
  id: string;
  project_id: string;
  project_name: string;
  client_name: string;
  estimated_hours: number;
  estimated_labor_cost: number;
  estimated_billable_amount: number;
  estimated_gross_margin: number;
  actual_hours_worked: number;
  actual_labor_cost: number;
  actual_billable_amount: number;
  actual_gross_margin: number;
  completion_percentage: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProjectEstimate {
  id: string;
  project_id: string;
  task_name: string;
  estimated_hours: number;
  hourly_rate: number;
  estimated_cost: number;
  actual_hours?: number;
  actual_cost?: number;
  assigned_employee_id?: string;
  employee_name?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface DragDropColumns {
  estimates: ProjectEstimate[];
  inProgress: ProjectEstimate[];
  completed: ProjectEstimate[];
}

export default function WIPCalculator() {
  const [projects, setProjects] = useState<ProjectWIP[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWIP | null>(null);
  const [estimates, setEstimates] = useState<ProjectEstimate[]>([]);
  const [columns, setColumns] = useState<DragDropColumns>({
    estimates: [],
    inProgress: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectEstimates(selectedProject.project_id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('project_wip')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets WIP:', error);
    }
  };

  const loadProjectEstimates = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_estimates')
        .select(`
          *,
          employees!project_estimates_assigned_employee_id_fkey (
            full_name
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      const formattedEstimates = (data || []).map(est => ({
        ...est,
        employee_name: est.employees?.full_name || 'Non assigné'
      }));

      setEstimates(formattedEstimates);

      // Organiser par colonnes
      setColumns({
        estimates: formattedEstimates.filter(est => est.status === 'pending'),
        inProgress: formattedEstimates.filter(est => est.status === 'in_progress'),
        completed: formattedEstimates.filter(est => est.status === 'completed')
      });

    } catch (error) {
      console.error('Erreur lors du chargement des estimations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Trouver l'item qui a été déplacé
    const estimate = estimates.find(est => est.id === draggableId);
    if (!estimate) return;

    // Déterminer le nouveau statut
    let newStatus: 'pending' | 'in_progress' | 'completed';
    switch (destination.droppableId) {
      case 'estimates':
        newStatus = 'pending';
        break;
      case 'inProgress':
        newStatus = 'in_progress';
        break;
      case 'completed':
        newStatus = 'completed';
        break;
      default:
        return;
    }

    // Mettre à jour localement
    const newColumns = { ...columns };
    const sourceColumn = newColumns[source.droppableId as keyof DragDropColumns];
    const destColumn = newColumns[destination.droppableId as keyof DragDropColumns];

    // Retirer de la colonne source
    sourceColumn.splice(source.index, 1);

    // Ajouter à la colonne destination
    const updatedEstimate = { ...estimate, status: newStatus };
    destColumn.splice(destination.index, 0, updatedEstimate);

    setColumns(newColumns);

    // Mettre à jour dans la base de données
    try {
      const { error } = await supabase
        .from('project_estimates')
        .update({ status: newStatus })
        .eq('id', draggableId);

      if (error) throw error;

      // Recalculer le WIP du projet
      await recalculateWIP();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      // Revenir à l'état précédent en cas d'erreur
      loadProjectEstimates(selectedProject!.project_id);
    }
  };

  const recalculateWIP = async () => {
    if (!selectedProject) return;

    setCalculating(true);
    
    try {
      // Calculer les totaux réels basés sur les tâches complétées et en cours
      const completedTasks = columns.completed;
      const inProgressTasks = columns.inProgress;
      
      const actualHours = completedTasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);
      const actualLaborCost = completedTasks.reduce((sum, task) => sum + (task.actual_cost || 0), 0);
      
      // Estimation pour les tâches en cours (50% de progression moyenne)
      const inProgressHours = inProgressTasks.reduce((sum, task) => sum + (task.estimated_hours * 0.5), 0);
      const inProgressCost = inProgressTasks.reduce((sum, task) => sum + (task.estimated_cost * 0.5), 0);

      const totalActualHours = actualHours + inProgressHours;
      const totalActualCost = actualLaborCost + inProgressCost;

      // Calculer le pourcentage de completion
      const totalEstimatedHours = estimates.reduce((sum, est) => sum + est.estimated_hours, 0);
      const completionPercentage = totalEstimatedHours > 0 ? (totalActualHours / totalEstimatedHours) * 100 : 0;

      // Calculer le montant facturable réel (basé sur le taux de facturation)
      const actualBillableAmount = totalActualHours * (selectedProject.estimated_billable_amount / selectedProject.estimated_hours);
      
      const actualGrossMargin = actualBillableAmount - totalActualCost;

      // Mettre à jour le projet WIP
      const { error } = await supabase
        .from('project_wip')
        .update({
          actual_hours_worked: totalActualHours,
          actual_labor_cost: totalActualCost,
          actual_billable_amount: actualBillableAmount,
          actual_gross_margin: actualGrossMargin,
          completion_percentage: Math.min(completionPercentage, 100),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProject.id);

      if (error) throw error;

      // Recharger les données
      await loadProjects();
      
    } catch (error) {
      console.error('Erreur lors du recalcul WIP:', error);
    } finally {
      setCalculating(false);
    }
  };

  const updateActualHours = async (estimateId: string, actualHours: number, actualCost: number) => {
    try {
      const { error } = await supabase
        .from('project_estimates')
        .update({ 
          actual_hours: actualHours,
          actual_cost: actualCost 
        })
        .eq('id', estimateId);

      if (error) throw error;

      // Recharger les estimations
      if (selectedProject) {
        await loadProjectEstimates(selectedProject.project_id);
        await recalculateWIP();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des heures réelles:', error);
    }
  };

  const getVarianceColor = (estimated: number, actual: number) => {
    const variance = ((actual - estimated) / estimated) * 100;
    if (variance <= -10) return 'text-emerald-600'; // Sous budget
    if (variance <= 10) return 'text-slate-600'; // Dans la marge
    return 'text-red-600'; // Dépassement
  };

  const getVarianceIcon = (estimated: number, actual: number) => {
    const variance = ((actual - estimated) / estimated) * 100;
    if (variance <= -10) return <TrendingDown className="h-4 w-4 text-emerald-600" />;
    if (variance <= 10) return <Target className="h-4 w-4 text-slate-600" />;
    return <TrendingUp className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement du calculateur WIP...</p>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Calculateur WIP</h1>
          <p className="text-slate-600">Aucun projet disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Calculateur WIP</h1>
            <p className="text-slate-600">Gestion du Work In Progress avec drag & drop</p>
          </div>
          
          <Button 
            onClick={recalculateWIP}
            disabled={calculating}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {calculating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            Recalculer WIP
          </Button>
        </div>

        {/* Sélecteur de projet et métriques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" />
                Projet: {selectedProject.project_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Client:</span>
                    <span className="font-medium">{selectedProject.client_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Progression:</span>
                    <span className="font-medium">{selectedProject.completion_percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={selectedProject.completion_percentage} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Heures estimées:</span>
                    <span className="font-medium">{selectedProject.estimated_hours}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Heures réelles:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getVarianceColor(selectedProject.estimated_hours, selectedProject.actual_hours_worked)}`}>
                        {selectedProject.actual_hours_worked}h
                      </span>
                      {getVarianceIcon(selectedProject.estimated_hours, selectedProject.actual_hours_worked)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Marges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Marge estimée:</span>
                  <span className="font-bold text-emerald-600">
                    ${selectedProject.estimated_gross_margin.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Marge réelle:</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getVarianceColor(selectedProject.estimated_gross_margin, selectedProject.actual_gross_margin)}`}>
                      ${selectedProject.actual_gross_margin.toLocaleString()}
                    </span>
                    {getVarianceIcon(selectedProject.estimated_gross_margin, selectedProject.actual_gross_margin)}
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Variance:</span>
                    <span className={`font-bold ${getVarianceColor(selectedProject.estimated_gross_margin, selectedProject.actual_gross_margin)}`}>
                      ${(selectedProject.actual_gross_margin - selectedProject.estimated_gross_margin).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonnes Drag & Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne Estimations */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Estimations ({columns.estimates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="estimates">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-96 space-y-3 ${snapshot.isDraggingOver ? 'bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-300' : ''}`}
                    >
                      {columns.estimates.map((estimate, index) => (
                        <Draggable key={estimate.id} draggableId={estimate.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 border rounded-lg bg-white shadow-sm ${snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'}`}
                            >
                              <div className="space-y-2">
                                <h4 className="font-medium text-slate-900">{estimate.task_name}</h4>
                                <div className="text-sm text-slate-600">
                                  <div>Estimé: {estimate.estimated_hours}h - ${estimate.estimated_cost}</div>
                                  <div>Assigné: {estimate.employee_name}</div>
                                </div>
                                <Badge variant="secondary">En attente</Badge>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>

            {/* Colonne En Cours */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  En Cours ({columns.inProgress.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="inProgress">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-96 space-y-3 ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg border-2 border-dashed border-blue-300' : ''}`}
                    >
                      {columns.inProgress.map((estimate, index) => (
                        <Draggable key={estimate.id} draggableId={estimate.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 border rounded-lg bg-white shadow-sm ${snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'}`}
                            >
                              <div className="space-y-2">
                                <h4 className="font-medium text-slate-900">{estimate.task_name}</h4>
                                <div className="text-sm text-slate-600">
                                  <div>Estimé: {estimate.estimated_hours}h - ${estimate.estimated_cost}</div>
                                  <div>Assigné: {estimate.employee_name}</div>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <Input
                                    type="number"
                                    placeholder="Heures réelles"
                                    step="0.5"
                                    value={estimate.actual_hours || ''}
                                    onChange={(e) => {
                                      const hours = parseFloat(e.target.value) || 0;
                                      const cost = hours * estimate.hourly_rate;
                                      updateActualHours(estimate.id, hours, cost);
                                    }}
                                    className="text-xs"
                                  />
                                  <div className="text-xs text-slate-500 flex items-center">
                                    ${((estimate.actual_hours || 0) * estimate.hourly_rate).toFixed(0)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>

            {/* Colonne Complétées */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  Complétées ({columns.completed.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="completed">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-96 space-y-3 ${snapshot.isDraggingOver ? 'bg-emerald-50 rounded-lg border-2 border-dashed border-emerald-300' : ''}`}
                    >
                      {columns.completed.map((estimate, index) => (
                        <Draggable key={estimate.id} draggableId={estimate.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 border rounded-lg bg-white shadow-sm ${snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'}`}
                            >
                              <div className="space-y-2">
                                <h4 className="font-medium text-slate-900">{estimate.task_name}</h4>
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Estimé:</span>
                                    <span>{estimate.estimated_hours}h - ${estimate.estimated_cost}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Réel:</span>
                                    <div className="flex items-center gap-1">
                                      <span className={getVarianceColor(estimate.estimated_cost, estimate.actual_cost || 0)}>
                                        {estimate.actual_hours}h - ${estimate.actual_cost}
                                      </span>
                                      {getVarianceIcon(estimate.estimated_cost, estimate.actual_cost || 0)}
                                    </div>
                                  </div>
                                  <div>Assigné: {estimate.employee_name}</div>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-800">Complétée</Badge>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}