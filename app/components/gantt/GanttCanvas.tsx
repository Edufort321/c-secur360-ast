'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle2,
  Circle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  Download,
  Filter
} from 'lucide-react';

// Types pour le Gantt
interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  status: 'planned' | 'active' | 'completed' | 'delayed' | 'critical';
  assignedResources: string[];
  dependencies: string[];
  parentId?: string;
  level: number; // Niveau hiérarchique WBS
  
  // SST spécifique
  safetyLevel: number; // 1-5
  epiRequired: string[];
  certificationRequired: string[];
  astFormId?: string;
  
  // Coûts
  plannedCost: number;
  actualCost: number;
  
  // Baseline
  baselineStart?: Date;
  baselineEnd?: Date;
}

interface GanttConfig {
  rowHeight: number;
  columnWidth: number;
  timeScale: 'hours' | 'days' | 'weeks' | 'months';
  showBaseline: boolean;
  showCriticalPath: boolean;
  showProgress: boolean;
  showResources: boolean;
  showSST: boolean;
  colorTheme: 'light' | 'dark' | 'safety';
}

interface ViewportState {
  offsetX: number;
  offsetY: number;
  zoom: number;
  startDate: Date;
  endDate: Date;
}

const GANTT_COLORS = {
  dark: {
    background: '#0f172a',
    gridLine: '#334155',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    taskBar: {
      planned: '#10b981',
      active: '#f59e0b',
      completed: '#06b6d4', 
      delayed: '#ef4444',
      critical: '#dc2626'
    },
    baseline: '#64748b',
    dependency: '#8b5cf6',
    milestone: '#f97316',
    progress: '#22c55e',
    safety: {
      low: '#10b981',
      medium: '#f59e0b', 
      high: '#ef4444',
      critical: '#dc2626'
    }
  }
};

export default function GanttCanvas({ 
  tasks = [], 
  onTaskClick,
  onTaskDoubleClick,
  onTaskDrag,
  onDependencyCreate,
  config = {
    rowHeight: 32,
    columnWidth: 20,
    timeScale: 'days',
    showBaseline: true,
    showCriticalPath: true,
    showProgress: true,
    showResources: true,
    showSST: true,
    colorTheme: 'dark'
  }
}: {
  tasks: GanttTask[];
  onTaskClick?: (task: GanttTask) => void;
  onTaskDoubleClick?: (task: GanttTask) => void;
  onTaskDrag?: (taskId: string, newStart: Date, newEnd: Date) => void;
  onDependencyCreate?: (fromTaskId: string, toTaskId: string) => void;
  config?: Partial<GanttConfig>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<ViewportState>({
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  });
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    taskId?: string;
    startX: number;
    startY: number;
    originalStart?: Date;
    originalEnd?: Date;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0
  });
  
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Configuration fusionnée avec valeurs par défaut
  const fullConfig: GanttConfig = {
    rowHeight: 32,
    columnWidth: 20,
    timeScale: 'days',
    showBaseline: true,
    showCriticalPath: true,
    showProgress: true,
    showResources: true,
    showSST: true,
    colorTheme: 'dark',
    ...config
  };

  const colors = GANTT_COLORS[fullConfig.colorTheme];

  // Calculs de l'échelle temporelle
  const timeSpan = viewport.endDate.getTime() - viewport.startDate.getTime();
  const pixelsPerMillisecond = (fullConfig.columnWidth * viewport.zoom) / (24 * 60 * 60 * 1000); // pixels par jour
  
  const getTaskPosition = useCallback((task: GanttTask, index: number) => {
    const x = (task.startDate.getTime() - viewport.startDate.getTime()) * pixelsPerMillisecond + viewport.offsetX;
    const width = (task.endDate.getTime() - task.startDate.getTime()) * pixelsPerMillisecond;
    const y = index * fullConfig.rowHeight + viewport.offsetY;
    
    return { x, y, width, height: fullConfig.rowHeight - 2 };
  }, [viewport, fullConfig, pixelsPerMillisecond]);

  // Fonction de rendu principal
  const drawGantt = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajuster la taille du canvas
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Nettoyer le canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Dessiner la grille temporelle
    drawTimeGrid(ctx, rect.width, rect.height);
    
    // Dessiner les tâches
    drawTasks(ctx, rect.width, rect.height);
    
    // Dessiner les dépendances
    if (tasks.length > 0) {
      drawDependencies(ctx);
    }
    
    // Dessiner les indicateurs SST
    if (fullConfig.showSST) {
      drawSafetyIndicators(ctx);
    }
    
    // Dessiner les milestones
    drawMilestones(ctx);
    
    // Afficher les informations de hover
    if (hoveredTask) {
      drawHoverInfo(ctx, hoveredTask, rect.width, rect.height);
    }

  }, [viewport, fullConfig, tasks, colors, hoveredTask, selectedTask]);

  // Dessiner la grille temporelle
  const drawTimeGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = colors.gridLine;
    ctx.fillStyle = colors.textSecondary;
    ctx.font = '11px Inter, sans-serif';
    ctx.lineWidth = 0.5;

    const timeUnit = fullConfig.timeScale === 'days' ? 24 * 60 * 60 * 1000 : 
                     fullConfig.timeScale === 'weeks' ? 7 * 24 * 60 * 60 * 1000 :
                     fullConfig.timeScale === 'months' ? 30 * 24 * 60 * 60 * 1000 :
                     60 * 60 * 1000; // hours

    const startTime = Math.floor(viewport.startDate.getTime() / timeUnit) * timeUnit;
    
    for (let time = startTime; time <= viewport.endDate.getTime(); time += timeUnit) {
      const x = (time - viewport.startDate.getTime()) * pixelsPerMillisecond + viewport.offsetX;
      
      if (x >= 0 && x <= width) {
        // Ligne verticale
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        
        // Label de date
        const date = new Date(time);
        const label = fullConfig.timeScale === 'days' ? 
          date.toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' }) :
          fullConfig.timeScale === 'weeks' ? 
          `S${Math.ceil(date.getDate() / 7)}` :
          fullConfig.timeScale === 'months' ?
          date.toLocaleDateString('fr-CA', { month: 'short' }) :
          date.toLocaleTimeString('fr-CA', { hour: '2-digit' });
        
        ctx.fillText(label, x + 4, 16);
      }
    }

    // Lignes horizontales pour les tâches
    for (let i = 0; i <= tasks.length; i++) {
      const y = i * fullConfig.rowHeight + viewport.offsetY;
      if (y >= 0 && y <= height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  };

  // Dessiner les tâches
  const drawTasks = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    tasks.forEach((task, index) => {
      const pos = getTaskPosition(task, index);
      
      // Skip si hors écran
      if (pos.x + pos.width < 0 || pos.x > width || pos.y + pos.height < 0 || pos.y > height) {
        return;
      }
      
      // Couleur de base selon le statut
      let taskColor = colors.taskBar[task.status] || colors.taskBar.planned;
      
      // Modifier selon le niveau de sécurité si SST activé
      if (fullConfig.showSST && task.safetyLevel >= 4) {
        taskColor = colors.safety.high;
      }
      
      // Baseline en arrière-plan
      if (fullConfig.showBaseline && task.baselineStart && task.baselineEnd) {
        const baselineX = (task.baselineStart.getTime() - viewport.startDate.getTime()) * pixelsPerMillisecond + viewport.offsetX;
        const baselineWidth = (task.baselineEnd.getTime() - task.baselineStart.getTime()) * pixelsPerMillisecond;
        
        ctx.fillStyle = colors.baseline + '40'; // Semi-transparent
        ctx.fillRect(baselineX, pos.y + 2, baselineWidth, pos.height - 4);
      }
      
      // Barre principale de tâche
      ctx.fillStyle = taskColor;
      ctx.fillRect(pos.x, pos.y + 2, pos.width, pos.height - 4);
      
      // Barre de progression
      if (fullConfig.showProgress && task.progress > 0) {
        const progressWidth = pos.width * (task.progress / 100);
        ctx.fillStyle = colors.progress;
        ctx.fillRect(pos.x, pos.y + 2, progressWidth, (pos.height - 4) / 2);
      }
      
      // Bordure de sélection
      if (selectedTask === task.id) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(pos.x - 1, pos.y + 1, pos.width + 2, pos.height - 2);
      } else if (hoveredTask === task.id) {
        ctx.strokeStyle = colors.textSecondary;
        ctx.lineWidth = 1;
        ctx.strokeRect(pos.x, pos.y + 2, pos.width, pos.height - 4);
      }
      
      // Nom de la tâche
      ctx.fillStyle = colors.text;
      ctx.font = `${12 * viewport.zoom}px Inter, sans-serif`;
      const textY = pos.y + pos.height / 2 + 4;
      
      // Indentation selon le niveau WBS
      const indentX = pos.x + task.level * 20 + 8;
      const maxTextWidth = pos.width - (task.level * 20) - 16;
      
      if (maxTextWidth > 20) {
        const truncatedName = truncateText(ctx, task.name, maxTextWidth);
        ctx.fillText(truncatedName, indentX, textY);
      }
      
      // Indicateurs SST
      if (fullConfig.showSST) {
        drawTaskSST(ctx, task, pos);
      }
      
      // Indicateurs de ressources
      if (fullConfig.showResources && task.assignedResources.length > 0) {
        drawResourceIndicators(ctx, task, pos);
      }
    });
  };

  // Dessiner les dépendances entre tâches
  const drawDependencies = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = colors.dependency;
    ctx.lineWidth = 2;
    
    tasks.forEach((task, index) => {
      task.dependencies.forEach(depId => {
        const depTask = tasks.find(t => t.id === depId);
        if (!depTask) return;
        
        const depIndex = tasks.indexOf(depTask);
        const fromPos = getTaskPosition(depTask, depIndex);
        const toPos = getTaskPosition(task, index);
        
        // Dessiner la ligne de dépendance (FS par défaut)
        ctx.beginPath();
        ctx.moveTo(fromPos.x + fromPos.width, fromPos.y + fromPos.height / 2);
        ctx.lineTo(toPos.x - 10, fromPos.y + fromPos.height / 2);
        ctx.lineTo(toPos.x - 10, toPos.y + toPos.height / 2);
        ctx.lineTo(toPos.x, toPos.y + toPos.height / 2);
        ctx.stroke();
        
        // Flèche
        drawArrow(ctx, toPos.x, toPos.y + toPos.height / 2, 8);
      });
    });
  };

  // Dessiner les indicateurs de sécurité
  const drawSafetyIndicators = (ctx: CanvasRenderingContext2D) => {
    tasks.forEach((task, index) => {
      if (task.safetyLevel >= 3 || task.epiRequired.length > 0) {
        const pos = getTaskPosition(task, index);
        
        // Icône de sécurité
        const iconSize = 16;
        const iconX = pos.x - iconSize - 4;
        const iconY = pos.y + (pos.height - iconSize) / 2;
        
        ctx.fillStyle = colors.safety[task.safetyLevel >= 4 ? 'critical' : 'medium'];
        ctx.beginPath();
        ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Texte "!"
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', iconX + iconSize/2, iconY + iconSize/2 + 4);
        ctx.textAlign = 'left';
      }
    });
  };

  // Dessiner les milestones
  const drawMilestones = (ctx: CanvasRenderingContext2D) => {
    tasks.filter(task => task.startDate.getTime() === task.endDate.getTime()).forEach((milestone, index) => {
      const pos = getTaskPosition(milestone, tasks.indexOf(milestone));
      
      // Losange pour milestone
      ctx.fillStyle = colors.milestone;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y + pos.height / 2);
      ctx.lineTo(pos.x + 10, pos.y + 2);
      ctx.lineTo(pos.x + 20, pos.y + pos.height / 2);
      ctx.lineTo(pos.x + 10, pos.y + pos.height - 2);
      ctx.closePath();
      ctx.fill();
    });
  };

  // Fonctions utilitaires
  const truncateText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string => {
    if (ctx.measureText(text).width <= maxWidth) return text;
    
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size, y - size/2);
    ctx.lineTo(x - size, y + size/2);
    ctx.closePath();
    ctx.fill();
  };

  const drawTaskSST = (ctx: CanvasRenderingContext2D, task: GanttTask, pos: any) => {
    // Dessiner les indicateurs EPI requis
    if (task.epiRequired.length > 0) {
      const epiX = pos.x + pos.width - 20;
      const epiY = pos.y + 2;
      
      ctx.fillStyle = colors.safety.medium;
      ctx.fillRect(epiX, epiY, 3, 8);
    }
    
    // Indicateur AST
    if (task.astFormId) {
      const astX = pos.x + pos.width - 12;
      const astY = pos.y + 2;
      
      ctx.fillStyle = colors.safety.high;
      ctx.fillRect(astX, astY, 3, 8);
    }
  };

  const drawResourceIndicators = (ctx: CanvasRenderingContext2D, task: GanttTask, pos: any) => {
    const resourceCount = task.assignedResources.length;
    if (resourceCount === 0) return;
    
    const indicatorX = pos.x + pos.width + 4;
    const indicatorY = pos.y + pos.height / 2;
    
    ctx.fillStyle = colors.textSecondary;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(`${resourceCount}👥`, indicatorX, indicatorY + 3);
  };

  const drawHoverInfo = (ctx: CanvasRenderingContext2D, taskId: string, width: number, height: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const mousePos = { x: width / 2, y: height / 2 }; // Position approximative
    
    // Tooltip background
    const tooltipWidth = 200;
    const tooltipHeight = 100;
    const tooltipX = Math.min(mousePos.x + 10, width - tooltipWidth);
    const tooltipY = Math.max(mousePos.y - tooltipHeight - 10, 0);
    
    ctx.fillStyle = colors.background + 'ee';
    ctx.strokeStyle = colors.gridLine;
    ctx.lineWidth = 1;
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    
    // Contenu du tooltip
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(task.name, tooltipX + 8, tooltipY + 18);
    
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(`Durée: ${Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (24 * 60 * 60 * 1000))} jours`, tooltipX + 8, tooltipY + 35);
    ctx.fillText(`Progression: ${task.progress}%`, tooltipX + 8, tooltipY + 50);
    
    if (task.safetyLevel >= 3) {
      ctx.fillStyle = colors.safety.high;
      ctx.fillText(`⚠️ Sécurité niveau ${task.safetyLevel}`, tooltipX + 8, tooltipY + 65);
    }
    
    if (task.epiRequired.length > 0) {
      ctx.fillStyle = colors.safety.medium;
      ctx.fillText(`🦺 EPI: ${task.epiRequired.length} requis`, tooltipX + 8, tooltipY + 80);
    }
  };

  // Gestionnaires d'événements
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Trouver la tâche cliquée
    const clickedTask = tasks.find((task, index) => {
      const pos = getTaskPosition(task, index);
      return x >= pos.x && x <= pos.x + pos.width && 
             y >= pos.y && y <= pos.y + pos.height;
    });
    
    if (clickedTask) {
      setSelectedTask(clickedTask.id);
      onTaskClick?.(clickedTask);
    } else {
      setSelectedTask(null);
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedTask = tasks.find((task, index) => {
      const pos = getTaskPosition(task, index);
      return x >= pos.x && x <= pos.x + pos.width && 
             y >= pos.y && y <= pos.y + pos.height;
    });
    
    if (clickedTask) {
      onTaskDoubleClick?.(clickedTask);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Trouver la tâche survolée
    const hoveredTaskFound = tasks.find((task, index) => {
      const pos = getTaskPosition(task, index);
      return x >= pos.x && x <= pos.x + pos.width && 
             y >= pos.y && y <= pos.y + pos.height;
    });
    
    setHoveredTask(hoveredTaskFound?.id || null);
    
    // Curseur
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hoveredTaskFound ? 'pointer' : 'default';
    }
  };

  // Zoom et pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey) {
      // Zoom
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setViewport(prev => ({
        ...prev,
        zoom: Math.max(0.1, Math.min(5, prev.zoom * zoomFactor))
      }));
    } else {
      // Pan
      setViewport(prev => ({
        ...prev,
        offsetX: prev.offsetX - e.deltaX,
        offsetY: prev.offsetY - e.deltaY
      }));
    }
  };

  // Redessiner quand nécessaire
  useEffect(() => {
    const animationFrame = requestAnimationFrame(drawGantt);
    return () => cancelAnimationFrame(animationFrame);
  }, [drawGantt]);

  // Redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        drawGantt();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawGantt]);

  return (
    <div className="w-full h-full relative bg-slate-900" ref={containerRef}>
      {/* Contrôles de zoom et navigation */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(5, prev.zoom * 1.2) }))}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom * 0.8) }))}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600"
        >
          <ZoomOut className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => setViewport({ offsetX: 0, offsetY: 0, zoom: 1, startDate: viewport.startDate, endDate: viewport.endDate })}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
      </div>
      
      {/* Informations de vue */}
      <div className="absolute bottom-4 left-4 z-10 text-xs text-slate-400 bg-slate-800/80 px-3 py-2 rounded-lg">
        Zoom: {Math.round(viewport.zoom * 100)}% | Tâches: {tasks.length} | 
        {selectedTask && ` Sélectionnée: ${tasks.find(t => t.id === selectedTask)?.name}`}
      </div>
      
      {/* Canvas principal */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}