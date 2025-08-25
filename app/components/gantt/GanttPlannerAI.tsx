'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  AlertTriangle,
  BarChart3,
  Settings,
  Download,
  Bot,
  MessageSquare,
  Zap,
  Shield,
  FileText,
  Camera,
  MapPin,
  Filter,
  RefreshCw,
  Target
} from 'lucide-react';

import GanttCanvas from './GanttCanvas';
import { useAuth } from '@/app/hooks/useAuth';

// Types étendus pour IA et SST
interface GanttTaskAI {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number;
  status: 'planned' | 'active' | 'completed' | 'delayed' | 'critical';
  
  // Assignations
  assignedUsers: string[];
  assignedVehicles: string[];
  assignedEquipment: string[];
  
  // Hiérarchie et dépendances
  parentId?: string;
  level: number;
  dependencies: string[];
  dependencyType: 'FS' | 'SS' | 'FF' | 'SF';
  
  // SST et sécurité
  safetyLevel: number; // 1-5
  epiRequired: string[];
  certificationRequired: string[];
  astFormId?: string;
  permits: string[];
  minTeamSize: number;
  maxTeamSize: number;
  
  // Coûts et EVM
  plannedCost: number;
  actualCost: number;
  baselineStart?: Date;
  baselineEnd?: Date;
  earnedValue: number;
  
  // IA
  aiGenerated: boolean;
  aiConfidence: number;
  autoSchedule: boolean;
  
  // Journal terrain
  workJournals: WorkJournal[];
}

interface WorkJournal {
  id: string;
  date: Date;
  description: string; // Texte libre
  hoursWorked: number;
  photos: string[];
  location?: { lat: number; lng: number; name: string };
  aiSummary?: string; // Résumé structuré par IA
  tags: string[];
  validated: boolean;
}

interface GanttResource {
  id: string;
  name: string;
  type: 'person' | 'vehicle' | 'equipment' | 'epi';
  skills: string[];
  certifications: string[];
  availability: { [date: string]: number }; // % disponible par jour
  location: string;
  hourlyRate: number;
  safetyLevel: number;
  
  // Statut temps réel
  isAvailable: boolean;
  currentLocation?: string;
  lastSeen?: Date;
}

interface AIAssistantState {
  isActive: boolean;
  conversation: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    data?: any;
  }>;
  isProcessing: boolean;
  suggestions: Array<{
    type: 'reschedule' | 'assign_resource' | 'optimize' | 'safety_alert';
    title: string;
    description: string;
    action: () => void;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

interface ProjectMetrics {
  spi: number; // Schedule Performance Index
  cpi: number; // Cost Performance Index
  progressPercent: number;
  criticalPathDays: number;
  safetyScore: number;
  resourceUtilization: number;
  
  // Alertes
  activeAlerts: Array<{
    type: 'schedule' | 'cost' | 'safety' | 'resource';
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    taskId?: string;
  }>;
}

export default function GanttPlannerAI() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [tasks, setTasks] = useState<GanttTaskAI[]>([]);
  const [resources, setResources] = useState<GanttResource[]>([]);
  const [loading, setLoading] = useState(false);
  
  // États IA
  const [aiAssistant, setAiAssistant] = useState<AIAssistantState>({
    isActive: false,
    conversation: [],
    isProcessing: false,
    suggestions: []
  });
  const [aiPrompt, setAiPrompt] = useState('');
  
  // États de vue et filtres
  const [viewMode, setViewMode] = useState<'gantt' | 'kanban' | 'calendar'>('gantt');
  const [timeScale, setTimeScale] = useState<'hours' | 'days' | 'weeks' | 'months'>('days');
  const [filters, setFilters] = useState({
    showCriticalPath: true,
    showBaseline: true,
    showSST: true,
    showResources: true,
    safetyLevelMin: 1,
    statusFilter: 'all'
  });
  
  // Métriques projet
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    spi: 1.0,
    cpi: 1.0,
    progressPercent: 0,
    criticalPathDays: 0,
    safetyScore: 85,
    resourceUtilization: 75,
    activeAlerts: []
  });

  // Ref pour le chat IA
  const chatRef = useRef<HTMLDivElement>(null);

  // Charger les données
  useEffect(() => {
    loadProjects();
    loadResources();
    initializeAI();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectTasks(selectedProject);
      updateProjectMetrics(selectedProject);
    }
  }, [selectedProject]);

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
      
      // Transformer les données pour le composant
      const formattedTasks: GanttTaskAI[] = data.tasks.map((task: any) => ({
        id: task.id,
        name: task.name,
        description: task.description || '',
        startDate: new Date(task.startDate),
        endDate: new Date(task.endDate),
        duration: task.estimatedHours,
        progress: task.progress,
        status: task.status,
        assignedUsers: task.assignedUsers || [],
        assignedVehicles: task.assignedVehicles || [],
        assignedEquipment: [],
        parentId: task.parentId,
        level: task.level || 0,
        dependencies: task.dependencies || [],
        dependencyType: 'FS',
        safetyLevel: task.safetyLevel || 2,
        epiRequired: task.epiRequired || [],
        certificationRequired: task.certificationRequired || [],
        astFormId: task.astFormId,
        permits: task.permits || [],
        minTeamSize: task.minTeamSize || 1,
        maxTeamSize: task.maxTeamSize || 10,
        plannedCost: task.plannedCost || 0,
        actualCost: task.actualCost || 0,
        baselineStart: task.baselineStart ? new Date(task.baselineStart) : undefined,
        baselineEnd: task.baselineEnd ? new Date(task.baselineEnd) : undefined,
        earnedValue: task.plannedCost * (task.progress / 100),
        aiGenerated: task.aiGenerated || false,
        aiConfidence: task.aiConfidence || 0,
        autoSchedule: task.autoSchedule !== false,
        workJournals: task.workJournals || []
      }));
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProjectMetrics = async (projectId: string) => {
    try {
      const response = await fetch(`/api/gantt/metrics?projectId=${projectId}`);
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Erreur chargement métriques:', error);
    }
  };

  const initializeAI = () => {
    setAiAssistant(prev => ({
      ...prev,
      conversation: [{
        role: 'assistant',
        content: '👋 Bonjour ! Je suis votre assistant IA pour la planification Gantt. Je peux vous aider à :\n\n• Créer automatiquement des tâches avec ressources\n• Replanifier en cas d\'imprévu\n• Optimiser l\'allocation des ressources\n• Analyser vos journaux de terrain\n• Alerter sur les risques SST\n\nQue puis-je faire pour vous ?',
        timestamp: new Date()
      }],
      suggestions: [
        {
          type: 'optimize',
          title: 'Optimiser les ressources',
          description: 'Redistribuer automatiquement les ressources sous-utilisées',
          action: () => optimizeResources(),
          priority: 'medium'
        },
        {
          type: 'safety_alert',
          title: 'Vérifier la sécurité',
          description: '3 tâches nécessitent une validation EPI',
          action: () => validateSafety(),
          priority: 'high'
        }
      ]
    }));
  };

  // IA Chat Handler
  const handleAIChat = async (prompt: string) => {
    if (!prompt.trim()) return;

    setAiAssistant(prev => ({
      ...prev,
      isProcessing: true,
      conversation: [
        ...prev.conversation,
        {
          role: 'user',
          content: prompt,
          timestamp: new Date()
        }
      ]
    }));

    try {
      const response = await fetch('/api/gantt/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          projectId: selectedProject,
          tasks,
          resources,
          context: 'gantt_planning'
        })
      });

      const data = await response.json();

      setAiAssistant(prev => ({
        ...prev,
        isProcessing: false,
        conversation: [
          ...prev.conversation,
          {
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
            data: data.actionData
          }
        ]
      }));

      // Appliquer les actions suggérées
      if (data.actions) {
        applyAIActions(data.actions);
      }

    } catch (error) {
      console.error('Erreur IA:', error);
      setAiAssistant(prev => ({
        ...prev,
        isProcessing: false,
        conversation: [
          ...prev.conversation,
          {
            role: 'assistant',
            content: 'Désolé, une erreur est survenue. Pouvez-vous reformuler votre demande ?',
            timestamp: new Date()
          }
        ]
      }));
    }

    setAiPrompt('');
  };

  const applyAIActions = (actions: any[]) => {
    actions.forEach(action => {
      switch (action.type) {
        case 'create_tasks':
          action.tasks.forEach((taskData: any) => createTaskFromAI(taskData));
          break;
        case 'reschedule':
          rescheduleTask(action.taskId, new Date(action.newStart), new Date(action.newEnd));
          break;
        case 'assign_resource':
          assignResourceToTask(action.taskId, action.resourceId);
          break;
        case 'create_ast':
          generateASTForTask(action.taskId);
          break;
      }
    });
  };

  const createTaskFromAI = (taskData: any) => {
    const newTask: GanttTaskAI = {
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: taskData.name,
      description: taskData.description,
      startDate: new Date(taskData.startDate),
      endDate: new Date(taskData.endDate),
      duration: taskData.duration,
      progress: 0,
      status: 'planned',
      assignedUsers: taskData.assignedUsers || [],
      assignedVehicles: taskData.assignedVehicles || [],
      assignedEquipment: taskData.assignedEquipment || [],
      level: 0,
      dependencies: taskData.dependencies || [],
      dependencyType: 'FS',
      safetyLevel: taskData.safetyLevel || 2,
      epiRequired: taskData.epiRequired || [],
      certificationRequired: taskData.certificationRequired || [],
      permits: taskData.permits || [],
      minTeamSize: taskData.minTeamSize || 1,
      maxTeamSize: taskData.maxTeamSize || 10,
      plannedCost: taskData.plannedCost || 0,
      actualCost: 0,
      earnedValue: 0,
      aiGenerated: true,
      aiConfidence: taskData.confidence || 0.8,
      autoSchedule: true,
      workJournals: []
    };

    setTasks(prev => [...prev, newTask]);
  };

  const rescheduleTask = (taskId: string, newStart: Date, newEnd: Date) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, startDate: newStart, endDate: newEnd }
        : task
    ));
  };

  const assignResourceToTask = (taskId: string, resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task };
        
        if (resource.type === 'person' && !task.assignedUsers.includes(resourceId)) {
          updatedTask.assignedUsers = [...task.assignedUsers, resourceId];
        } else if (resource.type === 'vehicle' && !task.assignedVehicles.includes(resourceId)) {
          updatedTask.assignedVehicles = [...task.assignedVehicles, resourceId];
        } else if (resource.type === 'equipment' && !task.assignedEquipment.includes(resourceId)) {
          updatedTask.assignedEquipment = [...task.assignedEquipment, resourceId];
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const generateASTForTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/ast/generate-from-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });

      const data = await response.json();
      
      // Mettre à jour la tâche avec l'ID AST
      setTasks(prev => prev.map(task =>
        task.id === taskId 
          ? { ...task, astFormId: data.astId }
          : task
      ));

    } catch (error) {
      console.error('Erreur génération AST:', error);
    }
  };

  const optimizeResources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gantt/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: selectedProject,
          tasks,
          resources 
        })
      });

      const data = await response.json();
      
      if (data.optimizedTasks) {
        setTasks(data.optimizedTasks);
      }

    } catch (error) {
      console.error('Erreur optimisation:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateSafety = () => {
    const safetyIssues = tasks.filter(task => 
      task.safetyLevel >= 3 && (!task.astFormId || task.epiRequired.length === 0)
    );
    
    if (safetyIssues.length > 0) {
      setAiAssistant(prev => ({
        ...prev,
        conversation: [
          ...prev.conversation,
          {
            role: 'assistant',
            content: `⚠️ Problèmes de sécurité détectés :\n\n${safetyIssues.map(task => 
              `• ${task.name} - Niveau ${task.safetyLevel} ${!task.astFormId ? '(AST manquante)' : ''} ${task.epiRequired.length === 0 ? '(EPI non définis)' : ''}`
            ).join('\n')}\n\nVoulez-vous que je génère automatiquement les AST et définisse les EPI requis ?`,
            timestamp: new Date()
          }
        ]
      }));
    }
  };

  const handleTaskClick = (task: GanttTaskAI) => {
    console.log('Tâche sélectionnée:', task);
  };

  const handleTaskDoubleClick = (task: GanttTaskAI) => {
    // Ouvrir le modal d'édition
    console.log('Éditer tâche:', task);
  };

  const saveProject = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      
      // Sauvegarder les tâches
      const response = await fetch(`/api/gantt/projects/${selectedProject}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });

      if (response.ok) {
        // Créer les timesheets automatiquement
        await createTimesheetsForAllTasks();
        
        alert('✅ Projet sauvegardé avec succès !');
      }
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const createTimesheetsForAllTasks = async () => {
    const tasksNeedingTimesheets = tasks.filter(task => 
      task.status === 'planned' && task.assignedUsers.length > 0
    );
    
    for (const task of tasksNeedingTimesheets) {
      try {
        await fetch('/api/gantt/create-timesheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: task.id,
            projectId: selectedProject,
            assignedUsers: task.assignedUsers,
            startDate: task.startDate.toISOString(),
            endDate: task.endDate.toISOString(),
            estimatedHours: task.duration
          })
        });
      } catch (error) {
        console.error('Erreur création timesheet:', error);
      }
    }
  };

  // Auto-scroll du chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [aiAssistant.conversation]);

  return (
    <div className="w-full h-full flex bg-slate-900 text-white">
      {/* Panneau principal Gantt */}
      <div className="flex-1 flex flex-col">
        {/* En-tête avec contrôles */}
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2"
              >
                <option value="">Sélectionner un projet</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              
              <div className="flex gap-2">
                {(['gantt', 'kanban', 'calendar'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 rounded text-sm ${
                      viewMode === mode 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {mode === 'gantt' ? '📊' : mode === 'kanban' ? '📋' : '📅'} {mode}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Métriques rapides */}
              <div className="flex items-center gap-4 text-sm">
                <span className={`px-2 py-1 rounded ${metrics.spi >= 1 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  SPI: {metrics.spi.toFixed(2)}
                </span>
                <span className={`px-2 py-1 rounded ${metrics.cpi >= 1 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  CPI: {metrics.cpi.toFixed(2)}
                </span>
                <span className={`px-2 py-1 rounded ${metrics.safetyScore >= 80 ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
                  🛡️ {metrics.safetyScore}%
                </span>
              </div>
              
              <button
                onClick={() => setAiAssistant(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`p-2 rounded-lg ${
                  aiAssistant.isActive 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <Bot className="w-4 h-4" />
              </button>
              
              <button
                onClick={saveProject}
                disabled={loading || !selectedProject}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-4 py-2 rounded flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>

        {/* Zone de rendu Gantt */}
        <div className="flex-1">
          {viewMode === 'gantt' ? (
            <GanttCanvas
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onTaskDoubleClick={handleTaskDoubleClick}
              config={{
                timeScale,
                showBaseline: filters.showBaseline,
                showCriticalPath: filters.showCriticalPath,
                showSST: filters.showSST,
                showResources: filters.showResources,
                colorTheme: 'dark'
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              Vue {viewMode} en développement...
            </div>
          )}
        </div>

        {/* Barre de statut */}
        <div className="bg-slate-800 border-t border-slate-700 p-2 flex justify-between items-center text-xs text-slate-400">
          <div>
            Projet: {projects.find(p => p.id === selectedProject)?.name} | 
            Tâches: {tasks.length} | 
            Terminées: {tasks.filter(t => t.status === 'completed').length} |
            Progression: {Math.round(metrics.progressPercent)}%
          </div>
          
          {metrics.activeAlerts.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span>{metrics.activeAlerts.length} alerte(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* Panneau Assistant IA */}
      {aiAssistant.isActive && (
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold">Assistant IA Planification</h3>
            </div>
          </div>
          
          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div ref={chatRef} className="flex-1 p-4 overflow-y-auto space-y-3">
              {aiAssistant.conversation.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-700 text-slate-100'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div className="text-xs opacity-75 mt-1">
                      {msg.timestamp.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {aiAssistant.isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400"></div>
                      <span className="text-sm text-slate-300">L'IA réfléchit...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Suggestions rapides */}
            {aiAssistant.suggestions.length > 0 && (
              <div className="p-3 border-t border-slate-700">
                <h4 className="text-xs text-slate-400 mb-2">Suggestions IA</h4>
                <div className="space-y-2">
                  {aiAssistant.suggestions.slice(0, 3).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={suggestion.action}
                      className={`w-full text-left p-2 rounded text-xs ${
                        suggestion.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                        suggestion.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                        'bg-slate-600 text-slate-300'
                      } hover:opacity-80`}
                    >
                      <div className="font-medium">{suggestion.title}</div>
                      <div className="opacity-75">{suggestion.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input chat */}
            <div className="p-3 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIChat(aiPrompt)}
                  placeholder="Décrivez ce que vous voulez planifier..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
                  disabled={aiAssistant.isProcessing}
                />
                <button
                  onClick={() => handleAIChat(aiPrompt)}
                  disabled={aiAssistant.isProcessing || !aiPrompt.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-3 py-2 rounded"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            <span className="text-white">Traitement en cours...</span>
          </div>
        </div>
      )}
    </div>
  );
}