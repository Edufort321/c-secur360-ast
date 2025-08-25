'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Car,
  Plus,
  Save,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Settings,
  Download
} from 'lucide-react';

interface GanttTask {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  duration: number; // en heures
  assignedUsers: string[];
  assignedVehicles: string[];
  projectId: string;
  clientId: string;
  billingCode: string;
  estimatedHours: number;
  actualHours: number;
  progress: number; // 0-100%
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  dependencies: string[]; // IDs des tâches dépendantes
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRecurring: boolean;
  recurrencePattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endAfter?: number;
  };
  timesheetPreCreated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GanttResource {
  id: string;
  name: string;
  type: 'user' | 'vehicle' | 'equipment';
  availability: {
    [date: string]: {
      available: boolean;
      allocatedHours: number;
      maxHours: number;
    };
  };
  hourlyRate?: number;
  skills: string[];
  location: string;
}

interface GanttProject {
  id: string;
  name: string;
  clientId: string;
  startDate: Date;
  endDate: Date;
  tasks: GanttTask[];
  totalBudget: number;
  usedBudget: number;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
}

export default function GanttPlanner() {
  const [projects, setProjects] = useState<GanttProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [resources, setResources] = useState<GanttResource[]>([]);
  const [viewMode, setViewMode] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [loading, setLoading] = useState(false);

  // Référence pour le canvas Gantt
  const ganttCanvasRef = useRef<HTMLCanvasElement>(null);

  // Charger les projets et ressources
  useEffect(() => {
    loadProjects();
    loadResources();
  }, []);

  // Charger les tâches quand un projet est sélectionné
  useEffect(() => {
    if (selectedProject) {
      loadProjectTasks(selectedProject);
    }
  }, [selectedProject]);

  // Redessiner le Gantt quand les données changent
  useEffect(() => {
    if (tasks.length > 0) {
      drawGanttChart();
    }
  }, [tasks, viewMode, startDate, endDate]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/gantt/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    }
  };

  const loadResources = async () => {
    try {
      const response = await fetch('/api/gantt/resources');
      const data = await response.json();
      setResources(data.resources || []);
    } catch (error) {
      console.error('Erreur chargement ressources:', error);
    }
  };

  const loadProjectTasks = async (projectId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gantt/tasks?projectId=${projectId}`);
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTimesheetEntries = async (task: GanttTask) => {
    try {
      const response = await fetch('/api/gantt/create-timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          projectId: task.projectId,
          clientId: task.clientId,
          assignedUsers: task.assignedUsers,
          startDate: task.startDate,
          endDate: task.endDate,
          estimatedHours: task.estimatedHours,
          billingCode: task.billingCode
        })
      });

      if (!response.ok) {
        throw new Error('Erreur création timesheets');
      }

      const data = await response.json();
      console.log('✅ Timesheets pré-créés:', data.timesheetCount);
      
      // Marquer la tâche comme ayant des timesheets pré-créés
      updateTask(task.id, { timesheetPreCreated: true });
      
    } catch (error) {
      console.error('❌ Erreur pré-création timesheets:', error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<GanttTask>) => {
    try {
      const response = await fetch(`/api/gantt/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        ));
      }
    } catch (error) {
      console.error('Erreur mise à jour tâche:', error);
    }
  };

  const drawGanttChart = () => {
    const canvas = ganttCanvasRef.current;
    if (!canvas || tasks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du canvas
    const canvasWidth = 1200;
    const canvasHeight = tasks.length * 40 + 100;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Couleurs
    const colors = {
      background: '#1e293b',
      gridLine: '#334155',
      taskBar: {
        planned: '#10b981',
        in_progress: '#f59e0b',
        completed: '#06b6d4',
        delayed: '#ef4444'
      },
      text: '#f1f5f9',
      textSecondary: '#94a3b8'
    };

    // Nettoyer le canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculer l'échelle temporelle
    const timeSpan = endDate.getTime() - startDate.getTime();
    const pixelsPerDay = (canvasWidth - 200) / (timeSpan / (24 * 60 * 60 * 1000));

    // Dessiner l'en-tête temporel
    ctx.fillStyle = colors.text;
    ctx.font = '12px Inter, sans-serif';
    
    // Grille et dates
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
      const x = 200 + (d.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000) * pixelsPerDay;
      
      // Ligne verticale
      ctx.strokeStyle = colors.gridLine;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
      
      // Date
      const dateStr = d.toLocaleDateString('fr-CA', { 
        month: 'short', 
        day: 'numeric' 
      });
      ctx.fillStyle = colors.textSecondary;
      ctx.fillText(dateStr, x + 5, 20);
    }

    // Dessiner les tâches
    tasks.forEach((task, index) => {
      const y = 50 + index * 40;
      
      // Nom de la tâche
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(task.name.substring(0, 25), 10, y + 20);
      
      // Barre de tâche
      const taskStartX = 200 + (task.startDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000) * pixelsPerDay;
      const taskWidth = (task.endDate.getTime() - task.startDate.getTime()) / (24 * 60 * 60 * 1000) * pixelsPerDay;
      
      // Couleur selon le statut
      ctx.fillStyle = colors.taskBar[task.status];
      ctx.fillRect(taskStartX, y + 5, taskWidth, 25);
      
      // Barre de progression
      if (task.progress > 0) {
        ctx.fillStyle = colors.taskBar.completed;
        ctx.fillRect(taskStartX, y + 5, taskWidth * (task.progress / 100), 25);
      }
      
      // Bordure
      ctx.strokeStyle = colors.gridLine;
      ctx.strokeRect(taskStartX, y + 5, taskWidth, 25);
      
      // Indicateurs
      if (task.timesheetPreCreated) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(taskStartX - 10, y + 17, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Priorité
      if (task.priority === 'critical') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(taskStartX - 5, y + 5, 3, 25);
      }
    });

    // Légende
    ctx.fillStyle = colors.text;
    ctx.font = '11px Inter, sans-serif';
    const legendY = canvasHeight - 30;
    
    ctx.fillText('● Timesheets pré-créés', 10, legendY);
    ctx.fillText('Planifié', 200, legendY);
    ctx.fillText('En cours', 280, legendY); 
    ctx.fillText('Terminé', 360, legendY);
    ctx.fillText('Retard', 440, legendY);
  };

  const saveProject = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/gantt/projects/${selectedProject}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasks.map(task => ({
            ...task,
            startDate: task.startDate.toISOString(),
            endDate: task.endDate.toISOString()
          }))
        })
      });

      if (response.ok) {
        // Créer les timesheets pour toutes les tâches qui n'en ont pas
        const tasksNeedingTimesheets = tasks.filter(task => 
          !task.timesheetPreCreated && task.status === 'planned'
        );
        
        for (const task of tasksNeedingTimesheets) {
          await createTimesheetEntries(task);
        }
        
        alert(`✅ Projet sauvegardé avec ${tasksNeedingTimesheets.length} séries de timesheets pré-créées`);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 text-white p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            📊 Planification Gantt
          </h1>
          <p className="text-slate-400">
            Planification avancée avec pré-création automatique des timesheets
          </p>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded px-3 py-2"
          >
            <option value="">Sélectionner un projet</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Tâche
          </button>
          
          <button
            onClick={saveProject}
            disabled={loading || !selectedProject}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-4 py-2 rounded flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Sauvegarder & Créer Timesheets
          </button>
        </div>
      </div>

      {/* Contrôles de vue */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {(['days', 'weeks', 'months'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === mode 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {mode === 'days' ? 'Jours' : mode === 'weeks' ? 'Semaines' : 'Mois'}
            </button>
          ))}
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm"
            />
            <span className="text-slate-400">à</span>
            <input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm"
            />
          </div>
          
          <div className="text-sm text-slate-400">
            {tasks.filter(t => t.timesheetPreCreated).length} / {tasks.length} timesheets pré-créés
          </div>
        </div>
      </div>

      {/* Graphique Gantt */}
      <div className="bg-slate-800 rounded-lg p-4 overflow-auto">
        <canvas
          ref={ganttCanvasRef}
          className="max-w-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Statistiques du projet */}
      {selectedProject && (
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">Tâches Total</span>
            </div>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-400">Heures Planifiées</span>
            </div>
            <div className="text-2xl font-bold">
              {tasks.reduce((sum, task) => sum + task.estimatedHours, 0)}h
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-slate-400">Progression</span>
            </div>
            <div className="text-2xl font-bold">
              {tasks.length > 0 ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length) : 0}%
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Timesheets Créés</span>
            </div>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.timesheetPreCreated).length}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            <span>Traitement en cours...</span>
          </div>
        </div>
      )}
    </div>
  );
}