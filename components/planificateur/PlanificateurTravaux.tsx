'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  AlertTriangle,
  Clock,
  MapPin,
  Plus,
  Filter,
  Download,
  Trash2,
  Edit,
  Save,
  X,
  ChevronDown,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Maximize2,
  Home,
  CalendarDays
} from 'lucide-react';

interface Employee {
  id: number;
  nom: string;
  poste: string;
  succursale: string;
  division: string;
  disponible: boolean;
}

interface Job {
  id: number;
  numero: string;
  nom: string;
  description?: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  technicien: number;
  priorite: 'urgent' | 'haute' | 'normale' | 'faible';
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  lieu: string;
  client?: string;
}

interface Filters {
  division: string;
  poste: string;
  search: string;
}

interface PlanificateurTravauxProps {
  tenant: string;
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

const PlanificateurTravaux: React.FC<PlanificateurTravauxProps> = ({ tenant, user }) => {
  const [activeView, setActiveView] = useState<'calendrier' | 'analytics' | 'equipe' | 'personnel' | 'equipements'>('calendrier');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: string}>>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState('');
  const [showQuickFilters, setShowQuickFilters] = useState(false);
  
  const gridRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<Filters>({
    division: 'toutes',
    poste: 'tous',
    search: ''
  });

  const [personnel, setPersonnel] = useState<Employee[]>([]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [equipements, setEquipements] = useState<Array<{id: number, nom: string, type: string, disponible: boolean}>>([]);

  useEffect(() => {
    const savedJobs = localStorage.getItem('planificateur-jobs');
    const savedPersonnel = localStorage.getItem('planificateur-personnel');
    const savedEquipements = localStorage.getItem('planificateur-equipements');
    
    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs));
      } catch (e) {
        console.error('Erreur chargement jobs');
      }
    }
    
    if (savedPersonnel) {
      try {
        setPersonnel(JSON.parse(savedPersonnel));
      } catch (e) {
        console.error('Erreur chargement personnel');
      }
    }
    
    if (savedEquipements) {
      try {
        setEquipements(JSON.parse(savedEquipements));
      } catch (e) {
        console.error('Erreur chargement équipements');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('planificateur-jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('planificateur-personnel', JSON.stringify(personnel));
  }, [personnel]);

  useEffect(() => {
    localStorage.setItem('planificateur-equipements', JSON.stringify(equipements));
  }, [equipements]);

  const addNotification = (message: string, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const getDatesInPeriod = () => {
    const dates = [];
    
    if (viewMode === 'week') {
      // Vue semaine : 7 jours à partir du lundi de la semaine courante
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour commencer le lundi
      start.setDate(diff);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(date);
      }
    } else {
      // Vue mois : tous les jours du mois courant
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    }
    
    return dates;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getPersonnelFiltre = () => {
    return personnel.filter(p => {
      if (filters.division !== 'toutes' && p.division !== filters.division) return false;
      if (filters.poste !== 'tous' && !p.poste.toLowerCase().includes(filters.poste.toLowerCase())) return false;
      if (filters.search && !p.nom.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (quickFilter && !p.nom.toLowerCase().includes(quickFilter.toLowerCase()) && 
          !p.poste.toLowerCase().includes(quickFilter.toLowerCase()) &&
          !p.succursale.toLowerCase().includes(quickFilter.toLowerCase())) return false;
      return true;
    });
  };

  const getDateDisplayText = () => {
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      
      return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
  };

  const handleCellClick = (date: Date, employee: Employee) => {
    const dateStr = date.toISOString().split('T')[0];
    const existingJob = jobs.find(j => 
      j.date === dateStr && j.technicien === employee.id
    );

    if (existingJob) {
      setSelectedJob(existingJob);
    } else {
      setSelectedJob({
        id: 0,
        numero: `G25-${Date.now().toString().slice(-4)}`,
        nom: '',
        description: '',
        date: dateStr,
        heureDebut: '08:00',
        heureFin: '16:00',
        technicien: employee.id,
        priorite: 'normale',
        statut: 'planifie',
        lieu: employee.succursale,
        client: ''
      });
      setSelectedEmployee(employee);
      setSelectedDate(dateStr);
    }
    setShowModal(true);
  };

  const saveJob = (jobData: Job) => {
    if (jobData.id) {
      setJobs(prev => prev.map(j => j.id === jobData.id ? jobData : j));
      addNotification(`Job ${jobData.numero} modifié`);
    } else {
      const newJob = { ...jobData, id: Date.now() };
      setJobs(prev => [...prev, newJob]);
      addNotification(`Job ${jobData.numero} créé`);
    }
    setShowModal(false);
  };

  const deleteJob = (jobId: number) => {
    if (window.confirm('Supprimer ce job ?')) {
      const job = jobs.find(j => j.id === jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      addNotification(`Job ${job?.numero} supprimé`);
      setShowModal(false);
    }
  };

  const exportData = () => {
    const data = JSON.stringify({ jobs, personnel, equipements }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'planificateur-backup.json';
    a.click();
    addNotification('Export réussi');
  };

  const addPersonnel = (personnelData: Employee) => {
    const newPersonnel = { ...personnelData, id: Date.now() };
    setPersonnel(prev => [...prev, newPersonnel]);
    addNotification(`${personnelData.nom} ajouté à l'équipe`);
  };

  const addEquipement = (equipementData: { nom: string; type: string; disponible: boolean }) => {
    const newEquipement = { ...equipementData, id: Date.now() };
    setEquipements(prev => [...prev, newEquipement]);
    addNotification(`Équipement ${equipementData.nom} ajouté`);
  };

  const getDivisionColor = (division: string) => {
    switch(division) {
      case 'transformateurs': return 'bg-gradient-to-r from-blue-600 to-blue-800';
      case 'terrebonne': return 'bg-gradient-to-r from-green-600 to-green-800';
      case 'quebec': return 'bg-gradient-to-r from-purple-600 to-purple-800';
      case 'dual': return 'bg-gradient-to-r from-red-600 to-red-800';
      case 'cfm': return 'bg-gradient-to-r from-indigo-600 to-indigo-800';
      case 'external': return 'bg-gradient-to-r from-orange-600 to-orange-800';
      default: return 'bg-slate-600';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500';
      case 'haute': return 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500';
      case 'normale': return 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500';
      case 'faible': return 'bg-gray-100 dark:bg-gray-900/30 border-l-4 border-gray-500';
      default: return '';
    }
  };

  const personnelFiltre = getPersonnelFiltre();
  const dates = getDatesInPeriod();

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Notifications */}
      {notifications.map(notif => (
        <div key={notif.id} className={`fixed top-4 right-4 ${
          notif.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-3 rounded-lg shadow-lg z-50`}>
          {notif.message}
        </div>
      ))}

      {/* Header principal fixe */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-40">
        <div className="px-6 py-4">
          {/* Ligne 1: Navigation et titre */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/${tenant}/dashboard`}
                className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-blue-500" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Planificateur de Travaux
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Filtre rapide */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Recherche rapide..."
                  value={quickFilter}
                  onChange={(e) => setQuickFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm w-64"
                />
              </div>
              
              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Ligne 2: Navigation calendrier et vues */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Navigation date */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 min-w-[200px] text-center">
                  {getDateDisplayText()}
                </div>
                
                <button
                  onClick={() => navigateDate('next')}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Aujourd'hui
                </button>
              </div>
              
              {/* Vue semaine/mois */}
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'week'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'month'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Mois
                </button>
              </div>
            </div>

            {/* Onglets de vue */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveView('calendrier')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  activeView === 'calendrier' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendrier</span>
              </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                activeView === 'analytics' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveView('equipe')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                activeView === 'equipe' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Équipe</span>
            </button>
            <button
              onClick={() => setActiveView('personnel')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                activeView === 'personnel' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Personnel</span>
            </button>
            <button
              onClick={() => setActiveView('equipements')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                activeView === 'equipements' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Équipements</span>
            </button>
          </div>
          
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Filtres */}
        {activeView === 'calendrier' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                Division
              </label>
              <select 
                value={filters.division}
                onChange={(e) => setFilters(prev => ({...prev, division: e.target.value}))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="toutes">Toutes</option>
                <option value="transformateurs">Transformateurs</option>
                <option value="terrebonne">MDL-Terrebonne</option>
                <option value="quebec">MDL-Québec</option>
                <option value="dual">DUAL-Sherbrooke</option>
                <option value="cfm">CFM St-Jean</option>
                <option value="external">Externe</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                Poste
              </label>
              <select 
                value={filters.poste}
                onChange={(e) => setFilters(prev => ({...prev, poste: e.target.value}))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="tous">Tous</option>
                <option value="TECH">TECH</option>
                <option value="ING">ING</option>
                <option value="COORD">COORD</option>
                <option value="CPI">CPI</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                Recherche
              </label>
              <input 
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                placeholder="Nom..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={() => setFilters({ division: 'toutes', poste: 'tous', search: '' })}
                className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vue Calendrier */}
      {activeView === 'calendrier' && (
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-auto">
          <div className="grid" style={{
            gridTemplateColumns: '200px 120px 180px repeat(14, 100px)',
            gap: '1px',
            backgroundColor: 'rgb(226 232 240)',
            minHeight: '500px',
            padding: '4px'
          }}>
            {/* Headers */}
            <div className="bg-slate-100 dark:bg-slate-700 p-2 font-bold text-xs">Employé</div>
            <div className="bg-slate-100 dark:bg-slate-700 p-2 font-bold text-xs">Statut</div>
            <div className="bg-slate-100 dark:bg-slate-700 p-2 font-bold text-xs">Succursale</div>
            
            {dates.map(date => (
              <div key={date.toISOString()} className="bg-slate-100 dark:bg-slate-700 p-2 font-bold text-xs text-center">
                <div>{date.toLocaleDateString('fr', { weekday: 'short' })}</div>
                <div>{date.getDate()}</div>
              </div>
            ))}

            {/* Rows */}
            {personnelFiltre.map(person => (
              <React.Fragment key={person.id}>
                <div className={`p-2 text-white text-xs font-bold ${getDivisionColor(person.division)} rounded`}>
                  {person.nom}
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    person.disponible 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {person.disponible ? '✓' : '✗'}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 text-xs text-slate-600 dark:text-slate-400">
                  {person.succursale}
                </div>
                
                {dates.map(date => {
                  const dateStr = date.toISOString().split('T')[0];
                  const job = jobs.find(j => 
                    j.date === dateStr && j.technicien === person.id
                  );
                  
                  return (
                    <div 
                      key={dateStr}
                      className={`bg-white dark:bg-slate-800 p-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                        job ? getPriorityClass(job.priorite) : ''
                      }`}
                      onClick={() => handleCellClick(date, person)}
                    >
                      {job ? (
                        <div className="text-center">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {job.numero}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {job.nom}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            {job.heureDebut}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 hover:text-blue-500 text-2xl">
                          +
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Vue Analytics */}
      {activeView === 'analytics' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6">Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Jobs Total</h3>
              <div className="text-3xl font-bold">{jobs.length}</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Personnel Actif</h3>
              <div className="text-3xl font-bold">
                {personnel.filter(p => p.disponible).length}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Jobs Urgents</h3>
              <div className="text-3xl font-bold">
                {jobs.filter(j => j.priorite === 'urgent').length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue Équipe */}
      {activeView === 'equipe' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6">Gestion d'Équipe</h2>
          {personnel.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Aucun personnel ajouté
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Utilisez l'onglet "Personnel" pour ajouter des membres à votre équipe
              </p>
              <button
                onClick={() => setActiveView('personnel')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Ajouter du personnel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personnel.map(p => (
                <div key={p.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{p.nom}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{p.poste}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">{p.succursale}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.disponible 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {p.disponible ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vue Personnel - Ajout */}
      {activeView === 'personnel' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6">Ajouter du Personnel</h2>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const personnelData: Employee = {
              id: 0,
              nom: formData.get('nom') as string,
              poste: formData.get('poste') as string,
              succursale: formData.get('succursale') as string,
              division: formData.get('division') as string,
              disponible: true
            };
            addPersonnel(personnelData);
            (e.target as HTMLFormElement).reset();
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nom complet</label>
                <input 
                  type="text" 
                  name="nom" 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Poste</label>
                <select 
                  name="poste" 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  required
                >
                  <option value="">Sélectionner un poste</option>
                  <option value="TECH">Technicien</option>
                  <option value="ING">Ingénieur</option>
                  <option value="COORD">Coordinateur</option>
                  <option value="CPI">CPI</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="Stagiaire">Stagiaire</option>
                  <option value="Sous-traitance">Sous-traitance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Succursale</label>
                <input 
                  type="text" 
                  name="succursale" 
                  placeholder="Ex: MDL - Sherbrooke"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Division</label>
                <select 
                  name="division" 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  required
                >
                  <option value="">Sélectionner une division</option>
                  <option value="transformateurs">Transformateurs</option>
                  <option value="terrebonne">MDL-Terrebonne</option>
                  <option value="quebec">MDL-Québec</option>
                  <option value="dual">DUAL-Sherbrooke</option>
                  <option value="cfm">CFM St-Jean</option>
                  <option value="external">Externe</option>
                </select>
              </div>
            </div>
            
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter à l'équipe</span>
            </button>
          </form>

          {personnel.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Personnel existant ({personnel.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personnel.map(p => (
                  <div key={p.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                    <h4 className="font-medium">{p.nom}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{p.poste} - {p.succursale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue Équipements - Ajout */}
      {activeView === 'equipements' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6">Ajouter des Équipements</h2>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const equipementData = {
              nom: formData.get('nom') as string,
              type: formData.get('type') as string,
              disponible: true
            };
            addEquipement(equipementData);
            (e.target as HTMLFormElement).reset();
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nom de l'équipement</label>
                <input 
                  type="text" 
                  name="nom" 
                  placeholder="Ex: Grue mobile 50T"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type d'équipement</label>
                <select 
                  name="type" 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  required
                >
                  <option value="">Sélectionner un type</option>
                  <option value="Grue">Grue</option>
                  <option value="Nacelle">Nacelle</option>
                  <option value="Camion">Camion</option>
                  <option value="Outillage">Outillage</option>
                  <option value="Sécurité">Équipement de sécurité</option>
                  <option value="Mesure">Instrument de mesure</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
            
            <button 
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter équipement</span>
            </button>
          </form>

          {equipements.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Équipements disponibles ({equipements.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipements.map(e => (
                  <div key={e.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{e.nom}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{e.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        e.disponible 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {e.disponible ? 'Disponible' : 'En cours'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Job */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {selectedJob?.id ? 'Modifier Job' : 'Nouveau Job'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const jobData: Job = {
                id: selectedJob?.id || 0,
                numero: formData.get('numero') as string,
                nom: formData.get('nom') as string,
                description: formData.get('description') as string,
                date: formData.get('date') as string,
                heureDebut: formData.get('heureDebut') as string,
                heureFin: formData.get('heureFin') as string,
                technicien: selectedJob?.technicien || 0,
                lieu: formData.get('lieu') as string,
                client: formData.get('client') as string,
                priorite: formData.get('priorite') as Job['priorite'],
                statut: formData.get('statut') as Job['statut']
              };
              saveJob(jobData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Numéro de Job</label>
                  <input 
                    type="text" 
                    name="numero" 
                    defaultValue={selectedJob?.numero}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nom du Projet</label>
                  <input 
                    type="text" 
                    name="nom" 
                    defaultValue={selectedJob?.nom}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input 
                    type="text" 
                    name="description" 
                    defaultValue={selectedJob?.description}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    defaultValue={selectedJob?.date}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Heure Début</label>
                  <input 
                    type="time" 
                    name="heureDebut" 
                    defaultValue={selectedJob?.heureDebut}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Heure Fin</label>
                  <input 
                    type="time" 
                    name="heureFin" 
                    defaultValue={selectedJob?.heureFin}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lieu</label>
                  <input 
                    type="text" 
                    name="lieu" 
                    defaultValue={selectedJob?.lieu}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Client</label>
                  <input 
                    type="text" 
                    name="client" 
                    defaultValue={selectedJob?.client}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Priorité</label>
                  <select 
                    name="priorite" 
                    defaultValue={selectedJob?.priorite}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  >
                    <option value="faible">Faible</option>
                    <option value="normale">Normale</option>
                    <option value="haute">Haute</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Statut</label>
                  <select 
                    name="statut" 
                    defaultValue={selectedJob?.statut}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  >
                    <option value="planifie">Planifié</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between">
                <div>
                  {selectedJob?.id && (
                    <button 
                      type="button" 
                      onClick={() => selectedJob.id && deleteJob(selectedJob.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer</span>
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanificateurTravaux;