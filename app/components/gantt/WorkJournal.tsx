'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText,
  Camera,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Bot,
  Mic,
  MicOff,
  Upload,
  Download,
  Save,
  Eye,
  Edit3,
  MessageSquare,
  Zap,
  Shield,
  DollarSign
} from 'lucide-react';

interface WorkJournalEntry {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  date: Date;
  
  // Saisie libre utilisateur
  workDescription: string;
  hoursWorked: number;
  
  // Médias et localisation
  photos: Array<{
    id: string;
    url: string;
    caption: string;
    timestamp: Date;
  }>;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    accuracy: number;
  };
  
  // IA Processing
  aiSummary?: {
    objectives: string[];
    accomplished: string[];
    issues: string[];
    safetyNotes: string[];
    materialsUsed: string[];
    timeBreakdown: Array<{
      activity: string;
      duration: number;
      category: string;
    }>;
    nextSteps: string[];
    tags: string[];
    structuredSummary: string;
    confidence: number;
    processedAt: Date;
  };
  
  // Validation
  isValidated: boolean;
  validatedBy?: string;
  validatedAt?: Date;
  validationNotes?: string;
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}

interface VoiceRecording {
  isRecording: boolean;
  audioBlob?: Blob;
  duration: number;
  transcript?: string;
}

export default function WorkJournal({ 
  taskId, 
  projectId, 
  onSave,
  existingEntry 
}: {
  taskId: string;
  projectId: string;
  onSave?: (entry: WorkJournalEntry) => void;
  existingEntry?: WorkJournalEntry;
}) {
  const [entry, setEntry] = useState<Partial<WorkJournalEntry>>({
    taskId,
    projectId,
    date: new Date(),
    workDescription: '',
    hoursWorked: 8,
    photos: [],
    ...existingEntry
  });
  
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording>({
    isRecording: false,
    duration: 0
  });
  
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Obtenir la géolocalisation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.warn('Géolocalisation non disponible:', error)
      );
    }
  }, []);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setVoiceRecording(prev => ({ 
          ...prev, 
          isRecording: false, 
          audioBlob,
          duration: 0 
        }));
        
        // Transcrire automatiquement
        transcribeAudio(audioBlob);
        
        // Arrêter le flux
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      
      setVoiceRecording(prev => ({ ...prev, isRecording: true, duration: 0 }));
      
      // Timer pour la durée
      recordingTimerRef.current = setInterval(() => {
        setVoiceRecording(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      
    } catch (error) {
      console.error('Erreur enregistrement audio:', error);
      alert('Impossible d\'accéder au microphone');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && voiceRecording.isRecording) {
      mediaRecorderRef.current.stop();
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-memo.wav');
      
      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.transcript) {
        setEntry(prev => ({
          ...prev,
          workDescription: (prev.workDescription || '') + '\n\n' + data.transcript
        }));
        
        setVoiceRecording(prev => ({ ...prev, transcript: data.transcript }));
      }
      
    } catch (error) {
      console.error('Erreur transcription:', error);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
    
    // Prévisualisation
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photo = {
          id: `temp-${Date.now()}-${Math.random()}`,
          url: event.target?.result as string,
          caption: '',
          timestamp: new Date()
        };
        
        setEntry(prev => ({
          ...prev,
          photos: [...(prev.photos || []), photo]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const processWithAI = async () => {
    if (!entry.workDescription?.trim()) {
      alert('Veuillez saisir une description du travail effectué');
      return;
    }
    
    setIsAIProcessing(true);
    
    try {
      const response = await fetch('/api/ai/process-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: entry.workDescription,
          hoursWorked: entry.hoursWorked,
          taskId: entry.taskId,
          projectId: entry.projectId,
          photos: entry.photos?.map(p => p.caption).filter(Boolean),
          location: location ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy
          } : null
        })
      });
      
      const aiResult = await response.json();
      
      setEntry(prev => ({
        ...prev,
        aiSummary: {
          ...aiResult.summary,
          processedAt: new Date(),
          confidence: aiResult.confidence
        }
      }));
      
      setShowAISummary(true);
      
    } catch (error) {
      console.error('Erreur traitement IA:', error);
      alert('Erreur lors du traitement IA');
    } finally {
      setIsAIProcessing(false);
    }
  };

  const saveJournal = async () => {
    if (!entry.workDescription?.trim()) {
      alert('Description requise');
      return;
    }
    
    setLoading(true);
    
    try {
      // Upload des photos d'abord
      const uploadedPhotos = [];
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const formData = new FormData();
        formData.append('file', photo);
        formData.append('type', 'work_journal');
        formData.append('entityId', entry.taskId || '');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          uploadedPhotos.push({
            id: uploadData.id,
            url: uploadData.url,
            caption: entry.photos?.[i]?.caption || '',
            timestamp: new Date()
          });
        }
      }
      
      // Sauvegarder le journal
      const journalData = {
        ...entry,
        photos: uploadedPhotos,
        location: location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: '', // TODO: Reverse geocoding
          accuracy: location.coords.accuracy
        } : null,
        userId: 'current-user', // TODO: Get from auth context
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const response = await fetch('/api/gantt/work-journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(journalData)
      });
      
      if (response.ok) {
        const savedEntry = await response.json();
        onSave?.(savedEntry);
        alert('✅ Journal sauvegardé avec succès !');
      }
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 text-white">
      <div className="bg-slate-800 p-6 rounded-t-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold">Journal de Terrain</h2>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            {entry.date?.toLocaleDateString('fr-CA')}
            {location && (
              <>
                <MapPin className="w-4 h-4 ml-4" />
                Géolocalisé
              </>
            )}
          </div>
        </div>
        
        {/* Informations de base */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Heures travaillées</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={entry.hoursWorked}
              onChange={(e) => setEntry(prev => ({ ...prev, hoursWorked: parseFloat(e.target.value) }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
            />
          </div>
          
          <div className="flex items-center gap-4">
            {location ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Position: {location.coords.accuracy.toFixed(0)}m</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Position non disponible</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800 p-6">
        {/* Saisie principale */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-400">Description du travail effectué</label>
            <div className="flex gap-2">
              {/* Enregistrement vocal */}
              <button
                onClick={voiceRecording.isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`p-2 rounded-lg ${
                  voiceRecording.isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
                title="Enregistrement vocal"
              >
                {voiceRecording.isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              
              {voiceRecording.isRecording && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-300">{formatDuration(voiceRecording.duration)}</span>
                </div>
              )}
            </div>
          </div>
          
          <textarea
            value={entry.workDescription}
            onChange={(e) => setEntry(prev => ({ ...prev, workDescription: e.target.value }))}
            placeholder="Décrivez librement le travail effectué, les défis rencontrés, les matériaux utilisés, les observations de sécurité, etc..."
            rows={8}
            className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 resize-none"
          />
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">
              {entry.workDescription?.length || 0} caractères
            </span>
            
            {voiceRecording.transcript && (
              <div className="text-xs text-emerald-400">
                ✅ Transcription vocale ajoutée
              </div>
            )}
          </div>
        </div>
        
        {/* Photos */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-slate-400">Photos (équipements, avancement, problèmes)</label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-sm flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Ajouter photo
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          
          {entry.photos && entry.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {entry.photos.map((photo, idx) => (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.url}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Légende..."
                    value={photo.caption}
                    onChange={(e) => {
                      const updatedPhotos = [...(entry.photos || [])];
                      updatedPhotos[idx].caption = e.target.value;
                      setEntry(prev => ({ ...prev, photos: updatedPhotos }));
                    }}
                    className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Actions IA */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={processWithAI}
            disabled={isAIProcessing || !entry.workDescription?.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
          >
            {isAIProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Traitement IA...
              </>
            ) : (
              <>
                <Bot className="w-5 h-5" />
                Structurer avec IA
              </>
            )}
          </button>
          
          {entry.aiSummary && (
            <button
              onClick={() => setShowAISummary(!showAISummary)}
              className="bg-slate-600 hover:bg-slate-500 px-4 py-3 rounded-lg flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showAISummary ? 'Masquer' : 'Voir'} résumé IA
            </button>
          )}
        </div>
        
        {/* Résumé IA */}
        {showAISummary && entry.aiSummary && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-emerald-400">Résumé Structuré IA</h3>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-xs">
                Confiance: {Math.round(entry.aiSummary.confidence * 100)}%
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Objectifs et réalisations */}
              <div>
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  Objectifs
                </h4>
                <ul className="text-sm text-slate-300 space-y-1 mb-4">
                  {entry.aiSummary.objectives.map((obj, idx) => (
                    <li key={idx}>• {obj}</li>
                  ))}
                </ul>
                
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Réalisé
                </h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  {entry.aiSummary.accomplished.map((acc, idx) => (
                    <li key={idx}>✅ {acc}</li>
                  ))}
                </ul>
              </div>
              
              {/* Problèmes et sécurité */}
              <div>
                {entry.aiSummary.issues.length > 0 && (
                  <>
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      Problèmes rencontrés
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-1 mb-4">
                      {entry.aiSummary.issues.map((issue, idx) => (
                        <li key={idx}>⚠️ {issue}</li>
                      ))}
                    </ul>
                  </>
                )}
                
                {entry.aiSummary.safetyNotes.length > 0 && (
                  <>
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      Observations sécurité
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {entry.aiSummary.safetyNotes.map((note, idx) => (
                        <li key={idx}>🛡️ {note}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
            
            {/* Répartition du temps */}
            {entry.aiSummary.timeBreakdown.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Répartition du temps
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {entry.aiSummary.timeBreakdown.map((time, idx) => (
                    <div key={idx} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-lg font-bold text-white">{time.duration}h</div>
                      <div className="text-sm text-slate-300">{time.activity}</div>
                      <div className="text-xs text-slate-500">{time.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Matériaux et prochaines étapes */}
            {(entry.aiSummary.materialsUsed.length > 0 || entry.aiSummary.nextSteps.length > 0) && (
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {entry.aiSummary.materialsUsed.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-yellow-400" />
                      Matériaux utilisés
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {entry.aiSummary.materialsUsed.map((mat, idx) => (
                        <li key={idx}>📦 {mat}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {entry.aiSummary.nextSteps.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Prochaines étapes
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {entry.aiSummary.nextSteps.map((step, idx) => (
                        <li key={idx}>👉 {step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Tags */}
            {entry.aiSummary.tags.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-white mb-2">Tags générés</h4>
                <div className="flex flex-wrap gap-2">
                  {entry.aiSummary.tags.map((tag, idx) => (
                    <span key={idx} className="bg-slate-600 text-slate-200 px-2 py-1 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Actions de sauvegarde */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {entry.aiSummary ? 
              '✅ Journal traité et structuré par IA' : 
              '💡 Conseil: Utilisez l\'IA pour structurer automatiquement votre rapport'
            }
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => console.log('Export PDF')}
              className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter PDF
            </button>
            
            <button
              onClick={saveJournal}
              disabled={loading || !entry.workDescription?.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-6 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}