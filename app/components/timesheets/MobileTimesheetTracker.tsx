'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Clock,
  MapPin,
  Camera,
  DollarSign,
  Car,
  Save,
  Calendar,
  User,
  Building,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface TimesheetEntry {
  id?: string;
  user_id: string;
  project_id?: string;
  task_description: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  location_start?: { lat: number; lng: number; address?: string };
  location_end?: { lat: number; lng: number; address?: string };
  kilometers_traveled?: number;
  expense_amount?: number;
  expense_description?: string;
  expense_receipt_url?: string;
  is_billable: boolean;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
}

interface MobileTimesheetTrackerProps {
  userId: string;
  projectId?: string;
}

export default function MobileTimesheetTracker({ 
  userId, 
  projectId 
}: MobileTimesheetTrackerProps) {
  const [activeEntry, setActiveEntry] = useState<TimesheetEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseData, setExpenseData] = useState({
    amount: '',
    description: '',
    photo: null as File | null
  });

  // Timer pour mise à jour du temps en cours
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.log('Géolocalisation indisponible:', error)
      );
    }
  }, []);

  // Charger état actuel
  useEffect(() => {
    loadTimesheetData();
  }, [userId]);

  const loadTimesheetData = async () => {
    try {
      const response = await fetch(`/api/timesheets/mobile?userId=${userId}&active=true`);
      if (!response.ok) throw new Error('Erreur chargement');
      
      const data = await response.json();
      setActiveEntry(data.activeEntry);
      setRecentEntries(data.recentEntries || []);
    } catch (err) {
      setError('Erreur chargement des données');
    }
  };

  const startTimer = async (taskDescription: string, isBillable: boolean = true) => {
    setLoading(true);
    try {
      const entry: Partial<TimesheetEntry> = {
        user_id: userId,
        project_id: projectId,
        task_description: taskDescription,
        start_time: new Date().toISOString(),
        location_start: location ? {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          address: 'À déterminer'
        } : undefined,
        is_billable: isBillable,
        status: 'active'
      };

      const response = await fetch('/api/timesheets/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });

      if (!response.ok) throw new Error('Erreur démarrage');
      
      const createdEntry = await response.json();
      setActiveEntry(createdEntry);
    } catch (err) {
      setError('Erreur lors du démarrage');
    } finally {
      setLoading(false);
    }
  };

  const pauseTimer = async () => {
    if (!activeEntry) return;
    
    setLoading(true);
    try {
      const updatedEntry = {
        ...activeEntry,
        status: 'paused' as const
      };

      const response = await fetch(`/api/timesheets/mobile/${activeEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEntry)
      });

      if (!response.ok) throw new Error('Erreur pause');
      
      setActiveEntry(updatedEntry);
    } catch (err) {
      setError('Erreur lors de la pause');
    } finally {
      setLoading(false);
    }
  };

  const resumeTimer = async () => {
    if (!activeEntry) return;
    
    setLoading(true);
    try {
      const updatedEntry = {
        ...activeEntry,
        status: 'active' as const
      };

      const response = await fetch(`/api/timesheets/mobile/${activeEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEntry)
      });

      if (!response.ok) throw new Error('Erreur reprise');
      
      setActiveEntry(updatedEntry);
    } catch (err) {
      setError('Erreur lors de la reprise');
    } finally {
      setLoading(false);
    }
  };

  const stopTimer = async (kilometers?: number) => {
    if (!activeEntry) return;
    
    setLoading(true);
    try {
      const endTime = new Date();
      const startTime = new Date(activeEntry.start_time);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

      const updatedEntry = {
        ...activeEntry,
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        kilometers_traveled: kilometers,
        location_end: location ? {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          address: 'À déterminer'
        } : undefined,
        status: 'completed' as const
      };

      const response = await fetch(`/api/timesheets/mobile/${activeEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEntry)
      });

      if (!response.ok) throw new Error('Erreur arrêt');
      
      setActiveEntry(null);
      await loadTimesheetData(); // Recharger pour mettre à jour recent entries
    } catch (err) {
      setError('Erreur lors de l\'arrêt');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!expenseData.amount || !expenseData.description) {
      setError('Montant et description requis');
      return;
    }

    setLoading(true);
    try {
      let receiptUrl = '';
      
      // Upload photo si présente
      if (expenseData.photo) {
        const formData = new FormData();
        formData.append('file', expenseData.photo);
        formData.append('type', 'expense_receipt');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          receiptUrl = uploadData.url;
        }
      }

      const expense = {
        user_id: userId,
        project_id: projectId,
        amount: parseFloat(expenseData.amount),
        description: expenseData.description,
        receipt_url: receiptUrl,
        date: new Date().toISOString(),
        category: 'general'
      };

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });

      if (!response.ok) throw new Error('Erreur sauvegarde dépense');

      // Reset form
      setExpenseData({ amount: '', description: '', photo: null });
      setShowExpenseForm(false);
      
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : currentTime;
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const [quickTaskInput, setQuickTaskInput] = useState('');
  const [kilometersInput, setKilometersInput] = useState('');

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Feuille de Temps</h1>
            <p className="text-sm text-blue-100">{new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="text-right">
            <Clock className="w-6 h-6 mx-auto mb-1" />
            <div className="text-sm font-mono">
              {currentTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Timer principal */}
      <div className="p-4">
        {activeEntry ? (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="text-center mb-4">
              <div className={`text-3xl font-mono font-bold ${
                activeEntry.status === 'active' ? 'text-green-600' : 'text-amber-600'
              }`}>
                {formatDuration(activeEntry.start_time)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {activeEntry.task_description}
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              {activeEntry.status === 'active' ? (
                <button
                  onClick={pauseTimer}
                  disabled={loading}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  <Play className="w-4 h-4" />
                  Reprendre
                </button>
              )}
              
              <button
                onClick={() => {
                  const km = kilometersInput ? parseInt(kilometersInput) : undefined;
                  stopTimer(km);
                }}
                disabled={loading}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                <Square className="w-4 h-4" />
                Arrêter
              </button>
            </div>

            {/* Input kilométrage pour l'arrêt */}
            <div className="mt-3">
              <input
                type="number"
                value={kilometersInput}
                onChange={(e) => setKilometersInput(e.target.value)}
                placeholder="Kilomètres parcourus"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <div className="text-center text-gray-500 mb-4">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>Aucune tâche en cours</p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={quickTaskInput}
                onChange={(e) => setQuickTaskInput(e.target.value)}
                placeholder="Description de la tâche..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              
              <button
                onClick={() => startTimer(quickTaskInput || 'Tâche générale')}
                disabled={loading || !quickTaskInput.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Démarrer le temps
              </button>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setShowExpenseForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Dépense
          </button>
          
          <button
            onClick={() => {/* TODO: Vehicle tracking */}}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Car className="w-5 h-5" />
            Véhicule
          </button>
        </div>

        {/* Formulaire dépense */}
        {showExpenseForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-3">Nouvelle dépense</h3>
            
            <div className="space-y-3">
              <input
                type="number"
                step="0.01"
                value={expenseData.amount}
                onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                placeholder="Montant ($)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              
              <input
                type="text"
                value={expenseData.description}
                onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                placeholder="Description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => setExpenseData({ 
                    ...expenseData, 
                    photo: e.target.files?.[0] || null 
                  })}
                  className="hidden"
                  id="expense-photo"
                />
                <label
                  htmlFor="expense-photo"
                  className="flex-1 border border-gray-300 text-gray-700 p-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  {expenseData.photo ? 'Photo ajoutée' : 'Ajouter reçu'}
                </label>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={addExpense}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
                
                <button
                  onClick={() => {
                    setShowExpenseForm(false);
                    setExpenseData({ amount: '', description: '', photo: null });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Entrées récentes */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Aujourd'hui</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentEntries.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Calendar className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">Aucune entrée aujourd'hui</p>
              </div>
            ) : (
              recentEntries.map((entry) => (
                <div key={entry.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {entry.task_description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(entry.start_time).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {entry.end_time && (
                            ` - ${new Date(entry.end_time).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}`
                          )}
                        </span>
                        {entry.kilometers_traveled && (
                          <>
                            <Car className="w-3 h-3 ml-2" />
                            <span>{entry.kilometers_traveled} km</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.duration_minutes 
                          ? `${Math.floor(entry.duration_minutes / 60)}h${entry.duration_minutes % 60}m`
                          : 'En cours'
                        }
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        {entry.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : entry.status === 'active' ? (
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        ) : (
                          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        )}
                        <span className={
                          entry.status === 'completed' ? 'text-green-600' :
                          entry.status === 'active' ? 'text-green-600' : 'text-amber-600'
                        }>
                          {entry.status === 'completed' ? 'Terminé' :
                           entry.status === 'active' ? 'Actif' : 'Pausé'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}