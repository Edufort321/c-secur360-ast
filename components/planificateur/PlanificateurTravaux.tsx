'use client';

import React, { useState, useEffect } from 'react';
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
  Settings
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

const PlanificateurTravaux: React.FC = () => {
  const [activeView, setActiveView] = useState<'calendrier' | 'analytics' | 'equipe'>('calendrier');
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: string}>>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    division: 'toutes',
    poste: 'tous',
    search: ''
  });

  const [personnel] = useState<Employee[]>([
    { id: 1, nom: 'Éric Dufort', poste: 'TECH', succursale: 'MDL - Sherbrooke', division: 'transformateurs', disponible: true },
    { id: 2, nom: 'Carl Lévesque', poste: 'ING', succursale: 'MDL - Terrebonne', division: 'transformateurs', disponible: true },
    { id: 3, nom: 'Miguel Morin', poste: 'CPI', succursale: 'MDL - Québec', division: 'quebec', disponible: true },
    { id: 4, nom: 'Chad Rodrigue', poste: 'COORD', succursale: 'DUAL - Sherbrooke', division: 'dual', disponible: true },
    { id: 5, nom: 'Alexandre Gariépy-Gauvin', poste: 'D.T.', succursale: 'CFM - St-Jean', division: 'cfm', disponible: true },
    { id: 6, nom: 'Guillaume Guay-Fortier', poste: 'ADMIN', succursale: 'MDL - Sherbrooke', division: 'transformateurs', disponible: true },
    { id: 7, nom: 'Étienne Walczack', poste: 'Stagiaire TECH', succursale: 'MDL - Terrebonne', division: 'terrebonne', disponible: true },
    { id: 8, nom: 'Guillaume Buisson', poste: 'Stagiaire ING', succursale: 'MDL - Québec', division: 'quebec', disponible: true },
    { id: 9, nom: 'Léo Mercier', poste: 'Sous-traitance', succursale: 'Externe', division: 'external', disponible: true },
    { id: 10, nom: 'Nicolas Girard', poste: 'Instrument', succursale: 'MDL - Sherbrooke', division: 'transformateurs', disponible: true },
  ]);

  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 1,
      numero: 'G25-1164',
      nom: 'DUAL LABRADOR IOC',
      description: 'ASSEMBLAGE',
      date: '2025-01-15',
      heureDebut: '08:00',
      heureFin: '16:00',
      technicien: 4,
      priorite: 'haute',
      statut: 'planifie',
      lieu: 'DUAL - Sherbrooke',
      client: 'Labrador IOC'
    },
    {
      id: 2,
      numero: 'G25-1171',
      nom: 'DUAL RTFT',
      description: 'ASSEMBLAGE',
      date: '2025-01-16',
      heureDebut: '09:00',
      heureFin: '17:00',
      technicien: 1,
      priorite: 'normale',
      statut: 'en_cours',
      lieu: 'MDL - Sherbrooke',
      client: 'RTFT'
    }
  ]);

  useEffect(() => {
    const savedJobs = localStorage.getItem('planificateur-jobs');
    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs));
      } catch (e) {
        console.error('Erreur chargement jobs');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('planificateur-jobs', JSON.stringify(jobs));
  }, [jobs]);

  const addNotification = (message: string, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const getDatesInPeriod = () => {
    const dates = [];
    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getPersonnelFiltre = () => {
    return personnel.filter(p => {
      if (filters.division !== 'toutes' && p.division !== filters.division) return false;
      if (filters.poste !== 'tous' && !p.poste.toLowerCase().includes(filters.poste.toLowerCase())) return false;
      if (filters.search && !p.nom.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
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
    const data = JSON.stringify(jobs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobs-backup.json';
    a.click();
    addNotification('Export réussi');
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
    <div className="flex flex-col h-full">
      {/* Notifications */}
      {notifications.map(notif => (
        <div key={notif.id} className={`fixed top-4 right-4 ${
          notif.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right`}>
          {notif.message}
        </div>
      ))}

      {/* Header avec boutons de vue */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
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