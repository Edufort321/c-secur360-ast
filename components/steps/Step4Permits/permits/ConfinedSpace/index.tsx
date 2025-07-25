// =================== COMPOSANT PRINCIPAL ===================
const ConfinedSpacePermit: React.FC<ConfinedSpacePermitProps> = ({
  province = 'QC',
  language = 'fr',
  onSave,
  onSubmit,
  onCancel,
  initialData
}) => {
  const texts = getTexts(language);
  const regulations = PROVINCIAL_REGULATIONS[province];

  // =================== HANDLERS ===================
  const handleInputChange = (field: string, value: any) => {
    setPermitData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePersonnelChange = (personnel: PersonnelEntry[]) => {
    setPermitData(prev => ({
      ...prev,
      personnel
    }));
  };

  const connectBluetoothDevice = async () => {
    setBluetoothDevice({
      id: 'BW-GasAlert-001',
      name: 'BW GasAlert Quattro',
      connected: true,
      battery: 85,
      signal: 95
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  // Timer effet principal
  useEffect(() => {
    if (!timerState.isRunning) return;

    const interval = setInterval(() => {
      setTimerState(prev => ({ ...prev, elapsed: prev.elapsed + 1 }));
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isRunning]);

  // Timer reprise test effet
  useEffect(() => {
    if (!retestActive || retestTimer <= 0) return;

    const interval = setInterval(() => {
      setRetestTimer(prev => {
        if (prev <= 1) {
          setRetestActive(false);
          alert('⏰ Temps écoulé ! Veuillez effectuer un nouveau test atmosphérique.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [retestActive, retestTimer]);

  // =================== RENDU ===================
  return (
    <>
      {/* CSS PREMIUM */}
      <style jsx>{`
        .premium-container {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .glass-effect {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .premium-card {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(100, 116, 139, 0.3);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }
        
        .premium-card:hover {
          transform: translateY(-2px);
          border-color: rgba(251, 191, 36, 0.5);
          box-shadow: 0 12px 40px rgba(251, 191, 36, 0.15);
        }
        
        .premium-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(15, 23, 42, 0.8);
          border: 2px solid rgba(100, 116, 139, 0.3);
          border-radius: 12px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .premium-input:focus {
          outline: none;
          border-color: #f59e0b;
          background: rgba(15, 23, 42, 0.9);
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }
        
        .premium-input.danger {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        
        .premium-button {
          padding: 10px 20px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .premium-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4);
        }
        
        .premium-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .premium-button-secondary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #64748b, #475569);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .premium-button-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(100, 116, 139, 0.4);
        }
        
        .section-title {
          color: #f59e0b;
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .timer-display {
          font-family: 'Courier New', monospace;
          font-size: 28px;
          font-weight: bold;
          color: #22c55e;
          text-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }
        
        .status-safe { color: #22c55e; }
        .status-warning { color: #f59e0b; }
        .status-danger { color: #ef4444; }
        
        @media (max-width: 768px) {
          .premium-container { padding: 12px; }
          .premium-card { padding: 16px; margin-bottom: 16px; }
          .timer-display { font-size: 20px; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div className="premium-container">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER LÉGAL */}
          <div className="glass-effect p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{texts.title}</h1>
                <p className="text-slate-300">{regulations.name} - {regulations.code}</p>
              </div>
              <div className="text-right">
                <div className="timer-display">{formatTime(timerState.elapsed)}</div>
                <div className="text-sm text-slate-400">Temps permis actif</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="premium-card">
                <label className="block text-sm text-slate-300 mb-2">{texts.permitNumber}</label>
                <input
                  type="text"
                  value={permitData.permit_number}
                  onChange={(e) => handleInputChange('permit_number', e.target.value)}
                  className="premium-input"
                  style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace' }}
                />
              </div>
              
              <div className="premium-card">
                <label className="block text-sm text-slate-300 mb-2">Date d'émission</label>
                <input
                  type="date"
                  value={permitData.issue_date}
                  onChange={(e) => handleInputChange('issue_date', e.target.value)}
                  className="premium-input"
                />
              </div>
              
              <div className="premium-card">
                <label className="block text-sm text-slate-300 mb-2">Heure d'émission</label>
                <input
                  type="time"
                  value={permitData.issue_time}
                  onChange={(e) => handleInputChange('issue_time', e.target.value)}
                  className="premium-input"
                />
              </div>
              
              <div className="premium-card">
                <label className="block text-sm text-slate-300 mb-2">Valide jusqu'à</label>
                <input
                  type="datetime-local"
                  value={permitData.expiry_date + 'T' + (permitData.expiry_time || '23:59')}
                  onChange={(e) => {
                    const [date, time] = e.target.value.split('T');
                    handleInputChange('expiry_date', date);
                    handleInputChange('expiry_time', time);
                  }}
                  className="premium-input"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLONNE GAUCHE */}
            <div className="space-y-6">
              
              {/* IDENTIFICATION DU SITE */}
              <div className="premium-card">
                <h2 className="section-title mb-4">
                  <MapPin className="w-5 h-5" />
                  Identification du Site
                </h2>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nom du site/projet *"
                    value={permitData.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    className="premium-input"
                    required
                  />
                  
                  <textarea
                    placeholder="Adresse complète du site *"
                    value={permitData.site_address}
                    onChange={(e) => handleInputChange('site_address', e.target.value)}
                    className="premium-input"
                    rows={2}
                    required
                  />
                  
                  <input
                    type="text"
                    placeholder="Coordonnées GPS (optionnel)"
                    value={permitData.gps_coordinates}
                    onChange={(e) => handleInputChange('gps_coordinates', e.target.value)}
                    className="premium-input"
                  />
                </div>
              </div>

              {/* DESCRIPTION DE L'ESPACE */}
              <div className="premium-card">
                <h2 className="section-title mb-4">
                  <Home className="w-5 h-5" />
                  Description de l'Espace Clos
                </h2>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Localisation exacte de l'espace *"
                    value={permitData.space_location}
                    onChange={(e) => handleInputChange('space_location', e.target.value)}
                    className="premium-input"
                    required
                  />
                  
                  <textarea
                    placeholder="Description détaillée de l'espace clos *"
                    value={permitData.space_description}
                    onChange={(e) => handleInputChange('space_description', e.target.value)}
                    className="premium-input"
                    rows={3}
                    required
                  />
                  
                  <input
                    type="text"
                    placeholder="Dimensions approximatives"
                    value={permitData.space_dimensions}
                    onChange={(e) => handleInputChange('space_dimensions', e.target.value)}
                    className="premium-input"
                  />
                  
                  <input
                    type="text"
                    placeholder="Points d'accès/sorties"
                    value={permitData.access_points}
                    onChange={(e) => handleInputChange('access_points', e.target.value)}
                    className="premium-input"
                  />
                </div>
              </div>

              {/* TRAVAIL À EFFECTUER */}
              <div className="premium-card">
                <h2 className="section-title mb-4">
                  <FileText className="w-5 h-5" />
                  Travail à Effectuer
                </h2>
                
                <div className="space-y-4">
                  <textarea
                    placeholder="Description détaillée du travail *"
                    value={permitData.work_description}
                    onChange={(e) => handleInputChange('work_description', e.target.value)}
                    className="premium-input"
                    rows={3}
                    required
                  />
                  
                  <input
                    type="text"
                    placeholder="Compagnie contracteur"
                    value={permitData.contractor_company}
                    onChange={(e) => handleInputChange('contractor_company', e.target.value)}
                    className="premium-input"
                  />
                  
                  <input
                    type="text"
                    placeholder="Superviseur des travaux"
                    value={permitData.work_supervisor}
                    onChange={(e) => handleInputChange('work_supervisor', e.target.value)}
                    className="premium-input"
                  />
                  
                  <input
                    type="text"
                    placeholder="Durée estimée"
                    value={permitData.estimated_duration}
                    onChange={(e) => handleInputChange('estimated_duration', e.target.value)}
                    className="premium-input"
                  />
                </div>
              </div>
            </div>

            {/* COLONNE DROITE */}
            <div className="space-y-6">
              
              {/* SECTION TESTS ATMOSPHÉRIQUES MANUELS */}
              <div className="premium-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title">
                    <Wind className="w-5 h-5" />
                    Tests Atmosphériques Manuels
                  </h2>
                  
                  <div className="flex gap-2">
                    {!bluetoothDevice ? (
                      <button
                        onClick={connectBluetoothDevice}
                        className="premium-button text-sm"
                      >
                        <Bluetooth className="w-3 h-3 mr-1" />
                        Connecter 4-Gaz
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                        <Bluetooth className="w-3 h-3" />
                        <span>{bluetoothDevice.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* TIMER REPRISE SI DANGER */}
                {retestActive && (
                  <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-red-300 font-semibold">⚠️ RETEST OBLIGATOIRE</div>
                        <div className="text-red-200 text-sm">Valeurs dangereuses détectées</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-mono text-red-400">
                          {Math.floor(retestTimer / 60)}:{(retestTimer % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-red-300">Retest dans</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SAISIE MANUELLE */}
                <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                  <h3 className="text-white font-medium mb-3">Saisie Manuelle des Mesures</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Oxygène (O₂) % *
                        <span className="text-xs text-slate-500 block">19.5-23.0%</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="21.0"
                        value={manualReading.oxygen}
                        onChange={(e) => setManualReading(prev => ({ ...prev, oxygen: e.target.value }))}
                        className={`premium-input text-sm ${
                          manualReading.oxygen && 
                          (parseFloat(manualReading.oxygen) < regulations.atmospheric_testing.limits.oxygen.min || 
                           parseFloat(manualReading.oxygen) > regulations.atmospheric_testing.limits.oxygen.max)
                            ? 'danger' : ''
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        LEL % *
                        <span className="text-xs text-slate-500 block">&lt;10%</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={manualReading.lel}
                        onChange={(e) => setManualReading(prev => ({ ...prev, lel: e.target.value }))}
                        className={`premium-input text-sm ${
                          manualReading.lel && parseFloat(manualReading.lel) > regulations.atmospheric_testing.limits.lel.max
                            ? 'danger' : ''
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        H₂S (ppm) *
                        <span className="text-xs text-slate-500 block">&lt;10ppm</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={manualReading.h2s}
                        onChange={(e) => setManualReading(prev => ({ ...prev, h2s: e.target.value }))}
                        className={`premium-input text-sm ${
                          manualReading.h2s && parseFloat(manualReading.h2s) > regulations.atmospheric_testing.limits.h2s.max
                            ? 'danger' : ''
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        CO (ppm) *
                        <span className="text-xs text-slate-500 block">&lt;35ppm</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={manualReading.co}
                        onChange={(e) => setManualReading(prev => ({ ...prev, co: e.target.value }))}
                        className={`premium-input text-sm ${
                          manualReading.co && parseFloat(manualReading.co) > regulations.atmospheric_testing.limits.co.max
                            ? 'danger' : ''
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Température (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="20.0"
                        value={manualReading.temperature}
                        onChange={(e) => setManualReading(prev => ({ ...prev, temperature: e.target.value }))}
                        className="premium-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Humidité (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="50.0"
                        value={manualReading.humidity}
                        onChange={(e) => setManualReading(prev => ({ ...prev, humidity: e.target.value }))}
                        className="premium-input text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={addManualReading}
                    className="premium-button w-full"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Enregistrer Mesure
                  </button>
                </div>

                {/* Lecture actuelle */}
                {currentReading && (
                  <div className="premium-card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-white">Lecture Actuelle</span>
                      <span className={`text-sm font-bold status-${currentReading.status}`}>
                        {currentReading.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-cyan-400">
                          {currentReading.oxygen.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">Oxygène (O₂)</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-400">
                          {currentReading.lel.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">LEL</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-400">
                          {currentReading.h2s.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-400">H₂S (ppm)</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-400">
                          {currentReading.co.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-400">CO (ppm)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Historique */}
                <div className="max-h-40 overflow-y-auto">
                  <h4 className="text-sm font-medium text-white mb-2">Historique ({permitData.atmospheric_readings.length})</h4>
                  <div className="space-y-1">
                    {permitData.atmospheric_readings.slice(-5).reverse().map((reading: AtmosphericReading) => (
                      <div key={reading.id} className="flex items-center justify-between text-xs p-2 bg-slate-900/50 rounded">
                        <span className="text-slate-400">
                          {new Date(reading.timestamp).toLocaleTimeString()}
                        </span>
                        <div className="flex gap-2">
                          <span>O₂:{reading.oxygen.toFixed(1)}</span>
                          <span>LEL:{reading.lel.toFixed(1)}</span>
                          <span>H₂S:{reading.h2s.toFixed(1)}</span>
                          <span>CO:{reading.co.toFixed(1)}</span>
                        </div>
                        <span className={`status-${reading.status} font-medium`}>
                          {reading.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CONDITIONS SPÉCIALES */}
              <div className="premium-card">
                <h2 className="section-title mb-4">
                  <AlertTriangle className="w-5 h-5" />
                  Conditions Spéciales & Sécurité
                </h2>
                
                <div className="space-y-4">
                  <textarea
                    placeholder="Conditions spéciales, restrictions, précautions particulières..."
                    value={permitData.special_conditions}
                    onChange={(e) => handleInputChange('special_conditions', e.target.value)}
                    className="premium-input"
                    rows={3}
                  />
                  
                  <textarea
                    placeholder="Plan de sauvetage d'urgence..."
                    value={permitData.rescue_plan}
                    onChange={(e) => handleInputChange('rescue_plan', e.target.value)}
                    className="premium-input"
                    rows={3}
                  />
                  
                  <textarea
                    placeholder="Procédures d'urgence spécifiques..."
                    value={permitData.emergency_procedures}
                    onChange={(e) => handleInputChange('emergency_procedures', e.target.value)}
                    className="premium-input"
                    rows={2}
                  />
                </div>
              </div>

              {/* CONTACTS D'URGENCE */}
              <div className="premium-card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <h2 className="section-title mb-4" style={{ color: '#ef4444' }}>
                  <Phone className="w-5 h-5" />
                  Contacts d'Urgence
                </h2>
                
                <div className="space-y-3">
                  {regulations.emergency_contacts?.map((contact: EmergencyContact, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-800/20 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{contact.name}</div>
                        <div className="text-sm text-red-200">{contact.role}</div>
                      </div>
                      <a 
                        href={`tel:${contact.phone}`} 
                        className="text-lg font-bold text-red-400 hover:text-red-300"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION PERSONNEL */}
          <div className="mt-6">
            <PersonnelManager
              personnel={permitData.personnel}
              onPersonnelChange={handlePersonnelChange}
              texts={texts}
            />
          </div>

          {/* GALERIE PHOTOS */}
          <div className="mt-6">
            <PhotoGallery
              photos={permitData.photos}
              onPhotoAdd={(photo) => setPermitData(prev => ({
                ...prev,
                photos: [...prev.photos, photo]
              }))}
              onPhotoRemove={(photoId) => setPermitData(prev => ({
                ...prev,
                photos: prev.photos.filter(p => p.id !== photoId)
              }))}
            />
          </div>

          {/* AUTORISATION FINALE */}
          <div className="premium-card mt-6">
            <h2 className="section-title mb-4">
              <Shield className="w-5 h-5" />
              Autorisation Finale
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Autorisé par (nom complet) *"
                value={permitData.authorized_by}
                onChange={(e) => handleInputChange('authorized_by', e.target.value)}
                className="premium-input"
                required
              />
              <input
                type="datetime-local"
                value={permitData.authorization_timestamp}
                onChange={(e) => handleInputChange('authorization_timestamp', e.target.value)}
                className="premium-input"
              />
            </div>

            <SignatureCanvas
              label="Signature d'autorisation finale"
              required
              onSignature={(sig) => handleInputChange('final_signature', sig)}
            />
          </div>

          {/* ACTIONS FINALES */}
          <div className="premium-card">
            <div className="flex flex-wrap gap-4 justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setTimerState(prev => ({ ...prev, isRunning: !prev.isRunning }));
                  }}
                  className={`premium-button ${timerState.isRunning ? 'bg-red-600' : 'bg-green-600'}`}
                  style={{ 
                    background: timerState.isRunning 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                      : 'linear-gradient(135deg, #22c55e, #16a34a)' 
                  }}
                >
                  {timerState.isRunning ? (
                    <><Pause className="w-4 h-4 mr-2" /> Suspendre Permis</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Activer Permis</>
                  )}
                </button>
                
                <button
                  onClick={() => onSave?.(permitData)}
                  className="premium-button"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {texts.savePermit}
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => alert('🚨 ÉVACUATION D\'URGENCE ACTIVÉE')}
                  className="premium-button"
                  style={{ 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                    animation: 'pulse 2s infinite',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {texts.emergencyEvacuation}
                </button>
                
                <button
                  onClick={() => onSubmit?.(permitData)}
                  className="premium-button"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {texts.submitPermit}
                </button>
                
                <button
                  onClick={onCancel}
                  className="premium-button-secondary"
                >
                  {texts.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfinedSpacePermit; ÉTAT PRINCIPAL ===================
  const [permitData, setPermitData] = useState({
    // En-tête légal
    permit_number: initialData?.permit_number || `CS-${province}-${Date.now().toString().slice(-6)}`,
    issue_date: initialData?.issue_date || new Date().toISOString().split('T')[0],
    issue_time: initialData?.issue_time || new Date().toTimeString().slice(0, 5),
    expiry_date: initialData?.expiry_date || '',
    expiry_time: initialData?.expiry_time || '',
    
    // Identification du site
    site_name: initialData?.site_name || '',
    site_address: initialData?.site_address || '',
    gps_coordinates: initialData?.gps_coordinates || '',
    
    // Description de l'espace
    space_location: initialData?.space_location || '',
    space_description: initialData?.space_description || '',
    space_dimensions: initialData?.space_dimensions || '',
    access_points: initialData?.access_points || '',
    
    // Travail à effectuer
    work_description: initialData?.work_description || '',
    contractor_company: initialData?.contractor_company || '',
    work_supervisor: initialData?.work_supervisor || '',
    estimated_duration: initialData?.estimated_duration || '',
    
    // Évaluation des dangers
    hazards_identified: initialData?.hazards_identified || [] as HazardAssessment[],
    
    // Personnel
    personnel: initialData?.personnel || [] as PersonnelEntry[],
    
    // Tests atmosphériques
    atmospheric_readings: initialData?.atmospheric_readings || [] as AtmosphericReading[],
    
    // Vérification équipements
    equipment_checks: initialData?.equipment_checks || [] as EquipmentCheck[],
    
    // Documentation
    photos: initialData?.photos || [] as PhotoRecord[],
    
    // Conditions spéciales
    special_conditions: initialData?.special_conditions || '',
    rescue_plan: initialData?.rescue_plan || '',
    emergency_procedures: initialData?.emergency_procedures || '',
    
    // Autorisation finale
    authorized_by: initialData?.authorized_by || '',
    authorization_timestamp: initialData?.authorization_timestamp || '',
    final_signature: initialData?.final_signature || ''
  });

  // =================== TIMER ET MONITORING ===================
  const [timerState, setTimerState] = useState({
    elapsed: 0,
    isRunning: false
  });

  // Timer reprise test atmosphérique (15 min si danger)
  const [retestTimer, setRetestTimer] = useState(0);
  const [retestActive, setRetestActive] = useState(false);

  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [currentReading, setCurrentReading] = useState<AtmosphericReading | null>(null);

  // =================== SAISIE MANUELLE MESURES ATMOSPHÉRIQUES ===================
  const [manualReading, setManualReading] = useState({
    oxygen: '',
    lel: '',
    h2s: '',
    co: '',
    temperature: '',
    humidity: ''
  });

  const addManualReading = () => {
    if (!manualReading.oxygen || !manualReading.lel || !manualReading.h2s || !manualReading.co) {
      alert('⚠️ Veuillez saisir toutes les valeurs obligatoires (O₂, LEL, H₂S, CO)');
      return;
    }

    const reading: AtmosphericReading = {
      id: `reading_${Date.now()}`,
      timestamp: new Date().toISOString(),
      oxygen: parseFloat(manualReading.oxygen),
      lel: parseFloat(manualReading.lel),
      h2s: parseFloat(manualReading.h2s),
      co: parseFloat(manualReading.co),
      temperature: parseFloat(manualReading.temperature) || 20,
      humidity: parseFloat(manualReading.humidity) || 50,
      status: 'safe',
      device_id: 'Mesure manuelle',
      location: permitData.space_location,
      taken_by: 'Opérateur'
    };

    // Déterminer le statut selon les limites RÉGLEMENTAIRES
    const limits = regulations.atmospheric_testing.limits;
    if (reading.oxygen < limits.oxygen.critical || 
        reading.lel > limits.lel.critical ||
        reading.h2s > limits.h2s.critical ||
        reading.co > limits.co.critical) {
      reading.status = 'danger';
      // Déclencher timer 15 min si danger
      setRetestTimer(15 * 60); // 15 minutes en secondes
      setRetestActive(true);
      alert('🚨 DANGER DÉTECTÉ ! Valeurs critiques dépassées. Retest obligatoire dans 15 minutes.');
    } else if (reading.oxygen < limits.oxygen.min ||
               reading.lel > limits.lel.max ||
               reading.h2s > limits.h2s.max ||
               reading.co > limits.co.max) {
      reading.status = 'warning';
      alert('⚠️ ATTENTION ! Valeurs en dehors des limites acceptables.');
    }

    setCurrentReading(reading);
    setPermitData(prev => ({
      ...prev,
      atmospheric_readings: [...prev.atmospheric_readings, reading]
    }));

    // Reset form
    setManualReading({
      oxygen: '',
      lel: '',
      h2s: '',
      co: '',
      temperature: '',
      humidity: ''
    });
  };

  // ==================="use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, 
  Bluetooth, Battery, Signal, CheckCircle, XCircle, Play, Pause, 
  RotateCcw, Save, Upload, Download, PenTool, Shield, Eye,
  Thermometer, Activity, Volume2, FileText, Phone, Plus, Trash2,
  User, UserCheck, Timer, LogIn, LogOut, Edit3, Copy, ChevronLeft,
  ChevronRight, X, ImageIcon, Calendar
} from 'lucide-react';

// =================== TYPES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface ConfinedSpacePermitProps {
  province?: ProvinceCode;
  language?: 'fr' | 'en';
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

interface AtmosphericReading {
  id: string;
  timestamp: string;
  oxygen: number;
  lel: number;
  h2s: number;
  co: number;
  temperature: number;
  humidity: number;
  status: 'safe' | 'warning' | 'danger';
  device_id?: string;
  location?: string;
  taken_by: string;
}

interface PersonnelEntry {
  id: string;
  name: string;
  role: 'entrant' | 'attendant' | 'supervisor' | 'rescue';
  employee_id: string;
  company: string;
  certification: string;
  certification_expiry: string;
  phone: string;
  emergency_contact: string;
  emergency_phone: string;
  signature?: string;
  signature_timestamp?: string;
  entry_time?: string;
  exit_time?: string;
  is_inside: boolean;
  training_records: string[];
  // Formations
  training_up_to_date: boolean;
  training_declaration: boolean;
  training_verification_date: string;
  training_verified_by: string;
  formation_espace_clos: boolean;
  formation_sauvetage: boolean;
  formation_premiers_soins: boolean;
  formation_expiry_dates: {
    [key: string]: string | undefined;
    espace_clos?: string;
    sauvetage?: string;
    premiers_soins?: string;
  };
}

interface PhotoRecord {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  category: 'before' | 'during' | 'after' | 'equipment' | 'hazard' | 'documentation';
  gps_location?: { lat: number; lng: number };
  taken_by: string;
}

interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  available_24h: boolean;
}

interface EquipmentCheck {
  id: string;
  equipment_name: string;
  serial_number: string;
  last_inspection: string;
  condition: 'good' | 'fair' | 'poor' | 'defective';
  notes: string;
  checked_by: string;
  check_timestamp: string;
}

interface HazardAssessment {
  id: string;
  hazard_type: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  control_measures: string[];
  responsible
