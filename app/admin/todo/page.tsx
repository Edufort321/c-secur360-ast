'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Star,
  CheckCircle,
  Circle,
  Clock,
  Flag,
  User,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Share,
  Bell,
  Sun,
  Home,
  Briefcase,
  Target,
  ArrowLeft,
  SortAsc,
  SortDesc,
  Grid,
  List,
  CalendarDays,
  Archive,
  Settings,
  Download,
  Upload,
  Zap,
  Lightbulb,
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react';

// Types pour le système TODO
interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  important: boolean;
  dueDate?: string;
  reminderDate?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  assignedTo?: string;
  estimatedHours?: number;
  actualHours?: number;
  subtasks: SubTask[];
  attachments: Attachment[];
  notes?: string;
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface TodoCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<TodoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTodo, setSelectedTodo] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created' | 'title'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showNewTodoForm, setShowNewTodoForm] = useState(false);
  
  // État pour le nouveau todo
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    category: 'work',
    priority: 'medium' as const,
    dueDate: '',
    reminderDate: '',
    tags: [] as string[],
    important: false
  });

  // Données démo
  const DEMO_TODOS: TodoItem[] = [
    {
      id: 'todo-001',
      title: 'Finaliser l\'intégration Stripe pour la facturation',
      description: 'Compléter l\'intégration Stripe avec webhooks et gestion des échecs de paiement',
      completed: false,
      important: true,
      dueDate: '2024-08-28',
      reminderDate: '2024-08-27T09:00:00',
      category: 'development',
      priority: 'high',
      tags: ['stripe', 'payment', 'urgent'],
      createdAt: '2024-08-26T10:00:00',
      updatedAt: '2024-08-26T10:00:00',
      estimatedHours: 8,
      actualHours: 6,
      subtasks: [
        { id: 'sub-001', title: 'Configurer webhooks Stripe', completed: true, createdAt: '2024-08-26T10:00:00' },
        { id: 'sub-002', title: 'Tester les échecs de paiement', completed: false, createdAt: '2024-08-26T10:00:00' },
        { id: 'sub-003', title: 'Documentation API', completed: false, createdAt: '2024-08-26T10:00:00' }
      ],
      attachments: [],
      notes: 'Priorité absolue pour la release de demain'
    },
    {
      id: 'todo-002',
      title: 'Révision du module de rapports financiers',
      description: 'Améliorer les graphiques et ajouter l\'export Excel',
      completed: false,
      important: false,
      dueDate: '2024-08-30',
      category: 'enhancement',
      priority: 'medium',
      tags: ['reports', 'excel', 'charts'],
      createdAt: '2024-08-25T14:30:00',
      updatedAt: '2024-08-26T09:15:00',
      estimatedHours: 4,
      subtasks: [
        { id: 'sub-004', title: 'Refactorer les graphiques Chart.js', completed: false, createdAt: '2024-08-25T14:30:00' },
        { id: 'sub-005', title: 'Implémenter export Excel', completed: false, createdAt: '2024-08-25T14:30:00' }
      ],
      attachments: [],
      notes: 'Demande client prioritaire'
    },
    {
      id: 'todo-003',
      title: 'Créer la documentation utilisateur',
      description: 'Guide complet d\'utilisation pour les nouveaux tenants',
      completed: true,
      important: false,
      dueDate: '2024-08-25',
      category: 'documentation',
      priority: 'low',
      tags: ['docs', 'guide', 'onboarding'],
      createdAt: '2024-08-20T08:00:00',
      updatedAt: '2024-08-25T16:00:00',
      completedAt: '2024-08-25T16:00:00',
      estimatedHours: 6,
      actualHours: 8,
      subtasks: [
        { id: 'sub-006', title: 'Guide AST', completed: true, createdAt: '2024-08-20T08:00:00' },
        { id: 'sub-007', title: 'Guide équipements', completed: true, createdAt: '2024-08-20T08:00:00' },
        { id: 'sub-008', title: 'FAQ', completed: true, createdAt: '2024-08-20T08:00:00' }
      ],
      attachments: [
        { id: 'att-001', name: 'user-guide.pdf', type: 'pdf', size: 2048000, url: '#' }
      ]
    },
    {
      id: 'todo-004',
      title: 'Optimiser les performances de l\'API',
      description: 'Réduire les temps de réponse et implémenter la mise en cache',
      completed: false,
      important: true,
      dueDate: '2024-09-02',
      category: 'performance',
      priority: 'urgent',
      tags: ['api', 'performance', 'cache', 'optimization'],
      createdAt: '2024-08-24T11:20:00',
      updatedAt: '2024-08-26T08:30:00',
      estimatedHours: 12,
      actualHours: 3,
      subtasks: [
        { id: 'sub-009', title: 'Analyser les bottlenecks', completed: true, createdAt: '2024-08-24T11:20:00' },
        { id: 'sub-010', title: 'Implémenter Redis cache', completed: false, createdAt: '2024-08-24T11:20:00' },
        { id: 'sub-011', title: 'Optimiser requêtes DB', completed: false, createdAt: '2024-08-24T11:20:00' }
      ],
      attachments: []
    },
    {
      id: 'todo-005',
      title: 'Planifier le meeting équipe développement',
      description: 'Réunion hebdomadaire pour faire le point sur l\'avancement',
      completed: false,
      important: false,
      dueDate: '2024-08-29',
      reminderDate: '2024-08-29T08:00:00',
      category: 'meeting',
      priority: 'medium',
      tags: ['meeting', 'team', 'weekly'],
      createdAt: '2024-08-26T07:45:00',
      updatedAt: '2024-08-26T07:45:00',
      estimatedHours: 1,
      subtasks: [
        { id: 'sub-012', title: 'Préparer agenda', completed: false, createdAt: '2024-08-26T07:45:00' },
        { id: 'sub-013', title: 'Envoyer invitations', completed: false, createdAt: '2024-08-26T07:45:00' }
      ],
      attachments: []
    }
  ];

  // Catégories
  const categories: TodoCategory[] = [
    { id: 'all', name: 'Toutes les tâches', icon: <Home className="w-4 h-4" />, color: 'text-gray-600', count: 0 },
    { id: 'important', name: 'Important', icon: <Star className="w-4 h-4" />, color: 'text-yellow-500', count: 0 },
    { id: 'planned', name: 'Planifiées', icon: <Calendar className="w-4 h-4" />, color: 'text-blue-500', count: 0 },
    { id: 'today', name: 'Aujourd\'hui', icon: <Sun className="w-4 h-4" />, color: 'text-orange-500', count: 0 },
    { id: 'development', name: 'Développement', icon: <Briefcase className="w-4 h-4" />, color: 'text-purple-500', count: 0 },
    { id: 'enhancement', name: 'Améliorations', icon: <Lightbulb className="w-4 h-4" />, color: 'text-green-500', count: 0 },
    { id: 'documentation', name: 'Documentation', icon: <CheckSquare className="w-4 h-4" />, color: 'text-indigo-500', count: 0 },
    { id: 'performance', name: 'Performance', icon: <Zap className="w-4 h-4" />, color: 'text-red-500', count: 0 },
    { id: 'meeting', name: 'Réunions', icon: <User className="w-4 h-4" />, color: 'text-teal-500', count: 0 }
  ];

  // Initialiser les données
  useEffect(() => {
    setTodos(DEMO_TODOS);
  }, []);

  // Filtrer et trier les todos
  useEffect(() => {
    let filtered = todos;

    // Filtrer par catégorie
    if (selectedCategory === 'important') {
      filtered = filtered.filter(todo => todo.important);
    } else if (selectedCategory === 'planned') {
      filtered = filtered.filter(todo => todo.dueDate);
    } else if (selectedCategory === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(todo => todo.dueDate === today);
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(todo => todo.category === selectedCategory);
    }

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrer les complétées
    if (!showCompleted) {
      filtered = filtered.filter(todo => !todo.completed);
    }

    // Trier
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'dueDate':
          aValue = a.dueDate || '9999-12-31';
          bValue = b.dueDate || '9999-12-31';
          break;
        case 'priority':
          const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created':
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredTodos(filtered);
  }, [todos, selectedCategory, searchTerm, showCompleted, sortBy, sortOrder]);

  // Mettre à jour les compteurs des catégories
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    categories.forEach(cat => {
      if (cat.id === 'all') {
        cat.count = todos.length;
      } else if (cat.id === 'important') {
        cat.count = todos.filter(t => t.important).length;
      } else if (cat.id === 'planned') {
        cat.count = todos.filter(t => t.dueDate).length;
      } else if (cat.id === 'today') {
        cat.count = todos.filter(t => t.dueDate === today).length;
      } else {
        cat.count = todos.filter(t => t.category === cat.id).length;
      }
    });
  }, [todos]);

  const toggleTodoComplete = (todoId: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === todoId 
        ? { 
            ...todo, 
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date().toISOString() : undefined
          }
        : todo
    ));
  };

  const toggleImportant = (todoId: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === todoId 
        ? { ...todo, important: !todo.important }
        : todo
    ));
  };

  const createNewTodo = () => {
    if (!newTodo.title.trim()) return;

    const todo: TodoItem = {
      id: `todo-${Date.now()}`,
      title: newTodo.title,
      description: newTodo.description,
      completed: false,
      important: newTodo.important,
      dueDate: newTodo.dueDate || undefined,
      reminderDate: newTodo.reminderDate || undefined,
      category: newTodo.category,
      priority: newTodo.priority,
      tags: newTodo.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      attachments: []
    };

    setTodos(prev => [todo, ...prev]);
    
    // Réinitialiser le formulaire
    setNewTodo({
      title: '',
      description: '',
      category: 'work',
      priority: 'medium',
      dueDate: '',
      reminderDate: '',
      tags: [],
      important: false
    });
    
    setShowNewTodoForm(false);
  };

  const deleteTodo = (todoId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche?')) {
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'high': return <Flag className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Circle className="w-4 h-4 text-yellow-600" />;
      case 'low': return <Clock className="w-4 h-4 text-green-600" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const renderTodoItem = (todo: TodoItem) => (
    <div
      key={todo.id}
      className={`bg-white rounded-lg border transition-all hover:shadow-md ${
        todo.completed ? 'opacity-75' : ''
      } ${selectedTodo === todo.id ? 'ring-2 ring-blue-500' : 'border-gray-200'}`}
      onClick={() => setSelectedTodo(selectedTodo === todo.id ? null : todo.id)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTodoComplete(todo.id);
            }}
            className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              todo.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300 hover:border-green-400'
            }`}
          >
            {todo.completed && <CheckCircle className="w-3 h-3" />}
          </button>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {todo.title}
              </h3>
              
              <div className="flex items-center gap-2 ml-3">
                {/* Bouton important */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleImportant(todo.id);
                  }}
                  className={`p-1 rounded transition-colors ${
                    todo.important ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className={`w-4 h-4 ${todo.important ? 'fill-current' : ''}`} />
                </button>

                {/* Menu actions */}
                <div className="relative">
                  <button 
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            {todo.description && (
              <p className={`text-sm mb-3 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                {todo.description}
              </p>
            )}

            {/* Métadonnées */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Priorité */}
              <div className="flex items-center gap-1">
                {getPriorityIcon(todo.priority)}
                <span className={`px-2 py-1 rounded-full ${getPriorityColor(todo.priority)}`}>
                  {todo.priority}
                </span>
              </div>

              {/* Date d'échéance */}
              {todo.dueDate && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  new Date(todo.dueDate) < new Date() && !todo.completed
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  <Calendar className="w-3 h-3" />
                  {formatDate(todo.dueDate)}
                </div>
              )}

              {/* Tags */}
              {todo.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                  #{tag}
                </span>
              ))}

              {/* Sous-tâches */}
              {todo.subtasks.length > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                  <CheckSquare className="w-3 h-3" />
                  {todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length}
                </div>
              )}

              {/* Temps estimé */}
              {todo.estimatedHours && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                  <Clock className="w-3 h-3" />
                  {todo.actualHours || 0}h/{todo.estimatedHours}h
                </div>
              )}
            </div>

            {/* Sous-tâches (si todo sélectionné) */}
            {selectedTodo === todo.id && todo.subtasks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Sous-tâches:</h4>
                <div className="space-y-2">
                  {todo.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2 text-sm">
                      <button
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          subtask.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300'
                        }`}
                      >
                        {subtask.completed && <CheckCircle className="w-3 h-3" />}
                      </button>
                      <span className={subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes (si todo sélectionné) */}
            {selectedTodo === todo.id && todo.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Notes:</h4>
                <p className="text-sm text-gray-600">{todo.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <Image 
                src="/c-secur360-logo.png" 
                alt="C-SECUR360" 
                width={40} 
                height={40}
                className="rounded-lg shadow-sm"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">C-Secur360 To-Do</h1>
                <p className="text-gray-600 mt-1">Gestionnaire de tâches avancé</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowNewTodoForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouvelle tâche
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-medium text-gray-900 mb-4">Catégories</h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={category.color}>{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Barre d'outils */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Recherche */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      placeholder="Rechercher une tâche..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Options d'affichage */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      showCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {showCompleted ? 'Masquer terminées' : 'Afficher terminées'}
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="created">Date création</option>
                    <option value="dueDate">Date échéance</option>
                    <option value="priority">Priorité</option>
                    <option value="title">Titre</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Terminées</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {todos.filter(t => t.completed).length}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-600">En cours</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {todos.filter(t => !t.completed).length}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">Importantes</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {todos.filter(t => t.important).length}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-600">En retard</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length}
                </p>
              </div>
            </div>

            {/* Liste des tâches */}
            <div className="space-y-3">
              {filteredTodos.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune tâche trouvée
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Aucune tâche ne correspond aux filtres sélectionnés.'
                      : 'Créez votre première tâche pour commencer.'}
                  </p>
                  <button 
                    onClick={() => setShowNewTodoForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle tâche
                  </button>
                </div>
              ) : (
                filteredTodos.map(renderTodoItem)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal nouvelle tâche */}
      {showNewTodoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Nouvelle tâche</h2>
                <button 
                  onClick={() => setShowNewTodoForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                    placeholder="Que devez-vous faire?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                    placeholder="Ajoutez des détails..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={newTodo.category}
                      onChange={(e) => setNewTodo({...newTodo, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.filter(c => c.id !== 'all' && c.id !== 'important' && c.id !== 'planned' && c.id !== 'today').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priorité
                    </label>
                    <select
                      value={newTodo.priority}
                      onChange={(e) => setNewTodo({...newTodo, priority: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Faible</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Élevée</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date d'échéance
                    </label>
                    <input
                      type="date"
                      value={newTodo.dueDate}
                      onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rappel
                    </label>
                    <input
                      type="datetime-local"
                      value={newTodo.reminderDate}
                      onChange={(e) => setNewTodo({...newTodo, reminderDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="important"
                    checked={newTodo.important}
                    onChange={(e) => setNewTodo({...newTodo, important: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="important" className="text-sm text-gray-700">
                    Marquer comme importante
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowNewTodoForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={createNewTodo}
                  disabled={!newTodo.title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer la tâche
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}