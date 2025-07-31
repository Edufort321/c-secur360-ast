{/* Conditions environnementales */}
            <div style={{ marginTop: '32px', marginBottom: '24px' }}>
              <h5 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Droplets size={18} color="#06b6d4" />
                {language === 'fr' ? 'Conditions Environnementales' : 'Environmental Conditions'}
              </h5>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '16px'
              }}>
                
                {/* Ventilation requise */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Wind size={16} />
                    {language === 'fr' ? 'Ventilation requise' : 'Ventilation required'}
                  </label>
                  <select
                    value={formData.environmentalConditions.ventilationRequired ? 'yes' : 'no'}
                    onChange={(e) => {
                      updateFormData('environmentalConditions', 'ventilationRequired', e.target.value === 'yes');
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="no">❌ {language === 'fr' ? 'Non' : 'No'}</option>
                    <option value="yes">✅ {language === 'fr' ? 'Oui' : 'Yes'}</option>
                  </select>
                </div>

                {/* Type de ventilation */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Flame size={16} />
                    {language === 'fr' ? 'Type de ventilation' : 'Ventilation type'}
                  </label>
                  <select
                    value={formData.environmentalConditions.ventilationType}
                    onChange={(e) => {
                      updateFormData('environmentalConditions', 'ventilationType', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="natural">🌬️ {language === 'fr' ? 'Naturelle' : 'Natural'}</option>
                    <option value="mechanical">⚙️ {language === 'fr' ? 'Mécanique' : 'Mechanical'}</option>
                    <option value="forced">💨 {language === 'fr' ? 'Forcée' : 'Forced'}</option>
                    <option value="none">🚫 {language === 'fr' ? 'Aucune' : 'None'}</option>
                  </select>
                </div>

                {/* Conditions d'éclairage */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Eye size={16} />
                    {language === 'fr' ? 'Conditions d\'éclairage' : 'Lighting conditions'}
                  </label>
                  <select
                    value={formData.environmentalConditions.lightingConditions}
                    onChange={(e) => {
                      updateFormData('environmentalConditions', 'lightingConditions', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="excellent">☀️ {language === 'fr' ? 'Excellentes' : 'Excellent'}</option>
                    <option value="good">💡 {language === 'fr' ? 'Bonnes' : 'Good'}</option>
                    <option value="poor">🔦 {language === 'fr' ? 'Mauvaises' : 'Poor'}</option>
                    <option value="dark">🌑 {language === 'fr' ? 'Obscurité' : 'Dark'}</option>
                  </select>
                </div>

                {/* Plage de température */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Thermometer size={16} />
                    {language === 'fr' ? 'Plage de température (°C)' : 'Temperature range (°C)'}
                  </label>
                  <input
                    type="text"
                    value={formData.environmentalConditions.temperatureRange}
                    onChange={(e) => {
                      updateFormData('environmentalConditions', 'temperatureRange', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                    placeholder="15°C - 25°C"
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Champs pleine largeur */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                
                {/* Niveau d'humidité */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Droplets size={16} />
                    {language === 'fr' ? 'Niveau d\'humidité' : 'Moisture level'}
                  </label>
                  <select
                    value={formData.environmentalConditions.moistureLevel}
                    onChange={(e) => {
                      updateFormData('environmentalConditions', 'moistureLevel', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="dry">🏜️ {language === 'fr' ? 'Sec' : 'Dry'}</option>
                    <option value="normal">💧 {language === 'fr' ? 'Normal' : 'Normal'}</option>
                    <option value="humid">🌧️ {language === 'fr' ? 'Humide' : 'Humid'}</option>
                    <option value="wet">🌊 {language === 'fr' ? 'Mouillé' : 'Wet'}</option>
                  </select>
                </div>

                {/* Niveau de bruit */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Activity size={16} />
                    {language === 'fr' ? 'Niveau de bruit' : 'Noise level'}
                  </label>
                  <select
                    value={formData.environmentalConditions.noiseLevel}
                    onChange={(e) => {
                      updateFormData('environmentalConditions', 'noiseLevel', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="quiet">🔇 {language === 'fr' ? 'Silencieux' : 'Quiet'}</option>
                    <option value="normal">🔉 {language === 'fr' ? 'Normal' : 'Normal'}</option>
                    <option value="loud">🔊 {language === 'fr' ? 'Fort' : 'Loud'}</option>
                    <option value="extreme">📢 {language === 'fr' ? 'Extrême' : 'Extreme'}</option>
                  </select>
                </div>
              </div>

              {/* Conditions météorologiques */}
              <div style={{ marginTop: '16px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <Globe size={16} />
                  {language === 'fr' ? 'Conditions météorologiques' : 'Weather conditions'}
                </label>
                <textarea
                  value={formData.environmentalConditions.weatherConditions}
                  onChange={(e) => {
                    updateFormData('environmentalConditions', 'weatherConditions', e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    minHeight: isMobile ? '80px' : '100px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder={language === 'fr' ? 
                    'Ex: Ensoleillé, vent léger, température 22°C...' : 
                    'Ex: Sunny, light wind, temperature 22°C...'}
                  maxLength={300}
                  rows={3}
                />
              </div>
            </div>

            {/* Contenu de l'espace */}
            <div style={{ marginTop: '32px', marginBottom: '24px' }}>
              <h5 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Settings size={18} color="#8b5cf6" />
                {language === 'fr' ? 'Contenu de l\'Espace' : 'Space Content'}
              </h5>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '16px'
              }}>
                
                {/* Équipements */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Wrench size={16} />
                    {language === 'fr' ? 'Équipements' : 'Equipment'}
                  </label>
                  <textarea
                    value={formData.spaceContent.equipment}
                    onChange={(e) => {
                      updateFormData('spaceContent', 'equipment', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '80px' : '100px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder={language === 'fr' ? 
                      'Pompes, valves, tuyauterie...' : 
                      'Pumps, valves, piping...'}
                    maxLength={300}
                    rows={3}
                  />
                </div>

                {/* Matériaux */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Layers size={16} />
                    {language === 'fr' ? 'Matériaux' : 'Materials'}
                  </label>
                  <textarea
                    value={formData.spaceContent.materials}
                    onChange={(e) => {
                      updateFormData('spaceContent', 'materials', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '80px' : '100px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder={language === 'fr' ? 
                      'Sable, gravier, isolant...' : 
                      'Sand, gravel, insulation...'}
                    maxLength={300}
                    rows={3}
                  />
                </div>

                {/* Produits chimiques */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Flame size={16} />
                    {language === 'fr' ? 'Produits chimiques' : 'Chemicals'}
                  </label>
                  <textarea
                    value={formData.spaceContent.chemicals}
                    onChange={(e) => {
                      updateFormData('spaceContent', 'chemicals', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '80px' : '100px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder={language === 'fr' ? 
                      'Solvants, huiles, acides...' : 
                      'Solvents, oils, acids...'}
                    maxLength={300}
                    rows={3}
                  />
                </div>

                {/* Résidus */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <AlertTriangle size={16} />
                    {language === 'fr' ? 'Résidus/Substances' : 'Residues/Substances'}
                  </label>
                  <textarea
                    value={formData.spaceContent.residues}
                    onChange={(e) => {
                      updateFormData('spaceContent', 'residues', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '80px' : '100px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder={language === 'fr' ? 
                      'Boues, dépôts, contamination...' : 
                      'Sludge, deposits, contamination...'}
                    maxLength={300}
                    rows={3}
                  />
                </div>
              </div>

              {/* Champs pleine largeur */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                
                {/* Usage antérieur */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Clock size={16} />
                    {language === 'fr' ? 'Usage antérieur' : 'Previous use'}
                  </label>
                  <input
                    type="text"
                    value={formData.spaceContent.previousUse}
                    onChange={(e) => {
                      updateFormData('spaceContent', 'previousUse', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                    placeholder={language === 'fr' ? 'Stockage fuel, production...' : 'Fuel storage, production...'}
                    maxLength={100}
                  />
                </div>

                {/* État de nettoyage */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Check size={16} />
                    {language === 'fr' ? 'État de nettoyage' : 'Cleaning status'}
                  </label>
                  <select
                    value={formData.spaceContent.cleaningStatus}
                    onChange={(e) => {
                      updateFormData('spaceContent', 'cleaningStatus', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="clean">✅ {language === 'fr' ? 'Propre' : 'Clean'}</option>
                    <option value="partial">🧹 {language === 'fr' ? 'Partiellement nettoyé' : 'Partially cleaned'}</option>
                    <option value="dirty">❌ {language === 'fr' ? 'Sale' : 'Dirty'}</option>
                    <option value="contaminated">⚠️ {language === 'fr' ? 'Contaminé' : 'Contaminated'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mesures de sécurité */}
            <div style={{ marginTop: '32px', marginBottom: '24px' }}>
              <h5 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Shield size={18} color="#10b981" />
                {language === 'fr' ? 'Mesures de Sécurité' : 'Safety Measures'}
              </h5>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '16px'
              }}>
                
                {/* EPI requis */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Shield size={16} />
                    {language === 'fr' ? 'EPI requis' : 'Required PPE'}
                  </label>
                  <textarea
                    value={formData.safetyMeasures.requiredPPE}
                    onChange={(e) => {
                      updateFormData('safetyMeasures', 'requiredPPE', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '80px' : '100px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder={language === 'fr' ? 
                      'Casque, gants, appareil respiratoire...' : 
                      'Helmet, gloves, respirator...'}
                    maxLength={300}
                    rows={3}
                  />
                </div>

                {/* Communication */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <MessageSquare size={16} />
                    {language === 'fr' ? 'Méthode de communication' : 'Communication method'}
                  </label>
                  <textarea
                    value={formData.safetyMeasures.communicationMethod}
                    onChange={(e) => {
                      updateFormData('safetyMeasures', 'communicationMethod', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '80px' : '100px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder={language === 'fr' ? 
                      'Radio, signaux, ligne de vie...' : 
                      'Radio, signals, lifeline...'}
                    maxLength={300}
                    rows={3}
                  />
                </div>

                {/* Plan de sauvetage */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Users size={16} />
                    {language === 'fr' ? 'Plan de sauvetage' : 'Rescue plan'}
                  </label>
                  <textarea
                    value={formData.safetyMeasures.rescuePlan}
                    onChange={(e) => {
                      updateFormData('safetyMeasures', 'rescuePlan', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '80px' : '100px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder={language === 'fr' ? 
                      'Équipe de sauvetage, procédures...' : 
                      'Rescue team, procedures...'}
                    maxLength={300}
                    rows={3}
                  />
                </div>

                {/* Contacts d'urgence */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Phone size={16} />
                    {language === 'fr' ? 'Contacts d\'urgence' : 'Emergency contacts'}
                  </label>
                  <textarea
                    value={formData.safetyMeasures.emergencyContacts}
                    onChange={(e) => {
                      updateFormData('safetyMeasures', 'emergencyContacts', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '80px' : '100px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder={language === 'fr' ? 
                      '911, Sécurité: 555-0123...' : 
                      '911, Security: 555-0123...'}
                    maxLength={300}
                    rows={3}
                  />
                </div>
              </div>

              {/* Équipements de sécurité */}
              <div style={{ marginTop: '16px' }}>
                <h6 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#d1d5db',
                  marginBottom: '12px'
                }}>
                  {language === 'fr' ? 'Équipements de sécurité requis' : 'Required safety equipment'}
                </h6>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: '12px'
                }}>
                  {[
                    'gas_detector', 'ventilation_fan', 'rescue_harness', 
                    'emergency_light', 'first_aid_kit', 'fire_extinguisher',
                    'communication_radio', 'safety_rope', 'eye_wash_station'
                  ].map(equipment => (
                    <button
                      key={equipment}
                      type="button"
                      onClick={() => {
                        const currentEquipment = formData.safetyMeasures.monitoringEquipment;
                        const updatedEquipment = currentEquipment.includes(equipment)
                          ? currentEquipment.filter(e => e !== equipment)
                          : [...currentEquipment, equipment];
                        
                        updateFormData('safetyMeasures', 'monitoringEquipment', updatedEquipment);
                      }}
                      style={{
                        padding: '12px',
                        border: `2px solid ${formData.safetyMeasures.monitoringEquipment.includes(equipment) ? '#10b981' : 'rgba(75, 85, 99, 0.5)'}`,
                        borderRadius: '8px',
                        background: formData.safetyMeasures.monitoringEquipment.includes(equipment) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.8)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                        fontSize: isMobile ? '12px' : '13px',
                        fontWeight: '600'
                      }}
                    >
                      {formData.safetyMeasures.monitoringEquipment.includes(equipment) ? '✅' : '⬜'} {
                        equipment === 'gas_detector' ? (language === 'fr' ? 'Détecteur gaz' : 'Gas detector') :
                        equipment === 'ventilation_fan' ? (language === 'fr' ? 'Ventilateur' : 'Ventilation fan') :
                        equipment === 'rescue_harness' ? (language === 'fr' ? 'Harnais' : 'Rescue harness') :
                        equipment === 'emergency_light' ? (language === 'fr' ? 'Éclairage urgence' : 'Emergency light') :
                        equipment === 'first_aid_kit' ? (language === 'fr' ? 'Trousse premiers soins' : 'First aid kit') :
                        equipment === 'fire_extinguisher' ? (language === 'fr' ? 'Extincteur' : 'Fire extinguisher') :
                        equipment === 'communication_radio' ? (language === 'fr' ? 'Radio' : 'Communication radio') :
                        equipment === 'safety_rope' ? (language === 'fr' ? 'Corde sécurité' : 'Safety rope') :
                        equipment === 'eye_wash_station' ? (language === 'fr' ? 'Lave-œil' : 'Eye wash station') :
                        equipment
                      }
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistiques et recommandations */}
            <div style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <Info size={16} color="#06b6d4" />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#67e8f9' }}>
                  {language === 'fr' ? 'Résumé de la documentation' : 'Documentation summary'}
                </span>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '12px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#06b6d4' }}>
                    {formData.spacePhotos.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a5f3fc' }}>
                    {language === 'fr' ? 'Photos' : 'Photos'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#06b6d4' }}>
                    {formData.entryPoints.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a5f3fc' }}>
                    {language === 'fr' ? 'Entrées' : 'Entries'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#06b6d4' }}>
                    {formData.atmosphericHazards.length + formData.physicalHazards.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a5f3fc' }}>
                    {language === 'fr' ? 'Dangers' : 'Hazards'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#06b6d4' }}>
                    {formData.dimensions.volume.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a5f3fc' }}>
                    {formData.unitSystem === 'metric' ? 'm³' : 'ft³'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#a5f3fc', lineHeight: 1.4 }}>
                {language === 'fr' ? 
                  '📝 Documentation complète requise pour la conformité réglementaire et la sécurité des travailleurs.' :
                  '📝 Complete documentation required for regulatory compliance and worker safety.'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [
    formData.spacePhotos,
    formData.environmentalConditions,
    formData.spaceContent,
    formData.safetyMeasures,
    formData.entryPoints.length,
    formData.atmosphericHazards.length,
    formData.physicalHazards.length,
    formData.dimensions.volume,
    formData.unitSystem,
    collapsedSections,
    currentPhotoIndex,
    isMobile,
    t,
    language,
    updateFormData
  ]);

  // =================== COMPOSANT MODAL ASSISTANT CLASSIFICATION CSA ===================
  const CSAClassificationWizard = useMemo(() => {
    if (!showClassificationWizard) return null;

    const [currentQuestionIndex, setCurrentQuestionIndexLocal] = useState(0);
    const [wizardAnswers, setWizardAnswers] = useState<Record<string, any>>({});
    const questions = getClassificationQuestions(language)[language];
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleAnswer = (questionId: string, answer: any) => {
      setWizardAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const nextQuestion = () => {
      if (isLastQuestion) {
        const classification = calculateCSAClass(wizardAnswers);
        updateFormData('csaClass', null, classification);
        setShowClassificationWizard(false);
        setNotification({
          type: 'success',
          message: `✅ Classification ${classification} déterminée par l'assistant`
        });
      } else {
        setCurrentQuestionIndexLocal(prev => prev + 1);
      }
    };

    const prevQuestion = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndexLocal(prev => prev - 1);
      }
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '20px',
          maxWidth: isMobile ? '95vw' : '600px',
          width: '100%',
          maxHeight: isMobile ? '90vh' : '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Header */}
          <div style={{
            padding: isMobile ? '16px' : '20px',
            borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1, marginRight: '16px' }}>
              <h2 style={{
                margin: '0 0 12px 0',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#ffffff'
              }}>
                🎯 {language === 'fr' ? 'Assistant de Classification CSA' : 'CSA Classification Wizard'}
              </h2>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '8px'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary-color), var(--success-color))',
                  transition: 'width 0.3s ease',
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                }} />
              </div>
              <span style={{
                fontSize: isMobile ? '12px' : '14px',
                color: '#94a3b8',
                fontWeight: '600'
              }}>
                {language === 'fr' ? 'Question' : 'Question'} {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <button
              onClick={() => setShowClassificationWizard(false)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Question */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '16px' : '24px'
          }}>
            <h3 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              lineHeight: 1.4
            }}>
              {currentQuestion.critical && (
                <AlertTriangle color="#ef4444" size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              )}
              <span>{currentQuestion.question}</span>
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {currentQuestion.options.map((option) => (
                <label key={option.value} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: isMobile ? '12px' : '16px',
                  background: wizardAnswers[currentQuestion.id] === option.value ? 
                              'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  border: `2px solid ${wizardAnswers[currentQuestion.id] === option.value ? 
                                      '#3b82f6' : 'rgba(100, 116, 139, 0.3)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: isMobile ? '14px' : '15px'
                }}>
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    checked={wizardAnswers[currentQuestion.id] === option.value}
                    onChange={() => handleAnswer(currentQuestion.id, option.value)}
                    style={{ 
                      margin: 0, 
                      flexShrink: 0,
                      width: '16px',
                      height: '16px',
                      accentColor: '#3b82f6'
                    }}
                  />
                  <span style={{
                    flex: 1,
                    color: '#ffffff',
                    fontWeight: '500'
                  }}>
                    {option.label}
                  </span>
                  <span style={{
                    fontSize: isMobile ? '11px' : '12px',
                    color: '#94a3b8',
                    background: option.weight > 50 ? 'rgba(239, 68, 68, 0.2)' : 
                                option.weight > 20 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    border: `1px solid ${option.weight > 50 ? 'rgba(239, 68, 68, 0.3)' : 
                                        option.weight > 20 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontWeight: '600'
                  }}>
                    {option.weight}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div style={{
            padding: isMobile ? '16px' : '20px',
            borderTop: '1px solid rgba(100, 116, 139, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              style={{
                padding: isMobile ? '12px 16px' : '12px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                minHeight: '44px',
                background: currentQuestionIndex === 0 ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.6)',
                color: currentQuestionIndex === 0 ? '#64748b' : '#ffffff',
                border: 'none',
                opacity: currentQuestionIndex === 0 ? 0.5 : 1
              }}
            >
              <ArrowLeft size={16} />
              {language === 'fr' ? 'Précédent' : 'Previous'}
            </button>

            <button
              onClick={nextQuestion}
              disabled={!wizardAnswers[currentQuestion.id]}
              style={{
                padding: isMobile ? '12px 16px' : '12px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: !wizardAnswers[currentQuestion.id] ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                minHeight: '44px',
                background: !wizardAnswers[currentQuestion.id] ? 
                           'rgba(59, 130, 246, 0.3)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                opacity: !wizardAnswers[currentQuestion.id] ? 0.6 : 1
              }}
            >
              {isLastQuestion ? (language === 'fr' ? 'Terminer' : 'Finish') : (language === 'fr' ? 'Suivant' : 'Next')}
              {isLastQuestion ? <CheckCircle size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    );
  }, [showClassificationWizard, language, getClassificationQuestions, calculateCSAClass, updateFormData, isMobile]);

  // =================== COMPOSANT MODAL BASE DE DONNÉES ===================
  const DatabaseModal = useMemo(() => {
    if (!showPermitDatabase) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '20px',
          maxWidth: isMobile ? '95vw' : '800px',
          width: '100%',
          maxHeight: isMobile ? '90vh' : '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Header */}
          <div style={{
            padding: isMobile ? '16px' : '20px',
            borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              🗄️ {language === 'fr' ? 'Base de Données des Permis' : 'Permit Database'}
            </h2>
            <button
              onClick={() => setShowPermitDatabase(false)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Recherche */}
          <div style={{ padding: isMobile ? '16px' : '20px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'fr' ? 'Rechercher par numéro, projet, lieu...' : 'Search by number, project, location...'}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '2px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '15px'
                }}
              />
              <button
                onClick={() => searchPermitsDatabase(searchQuery)}
                disabled={isSearching}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isSearching ? 0.7 : 1
                }}
              >
                {isSearching ? <div className="spinner" /> : <Search size={16} />}
                {language === 'fr' ? 'Rechercher' : 'Search'}
              </button>
            </div>
          </div>

          {/* Résultats */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '0 16px 16px' : '0 20px 20px'
          }}>
            {searchResults.length > 0 ? (
              searchResults.map((permit) => (
                <div
                  key={permit.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => loadPermitFromHistory(permit.permitNumber)}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>
                      {permit.permitNumber}
                    </h4>
                    <span style={{
                      background: permit.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      color: permit.status === 'active' ? '#86efac' : '#94a3b8',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {permit.status}
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#d1d5db'
                  }}>
                    <div>📋 {permit.projectNumber}</div>
                    <div>📍 {permit.workLocation}</div>
                    <div>🏗️ {permit.contractor}</div>
                    <div>🛡️ {permit.csaClass}</div>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    <span>⚠️ {permit.hazardCount} dangers</span>
                    <span>📸 {permit.photoCount} photos</span>
                    <span>📅 {new Date(permit.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#9ca3af'
              }}>
                <Database size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                <p style={{ margin: 0 }}>
                  {isSearching ? 
                    (language === 'fr' ? 'Recherche en cours...' : 'Searching...') :
                    (language === 'fr' ? 'Aucun résultat trouvé' : 'No results found')
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [showPermitDatabase, searchQuery, searchResults, isSearching, language, isMobile, searchPermitsDatabase, loadPermitFromHistory]);

  // =================== COMPOSANT MODAL QR CODE ===================
  const QRCodeModal = useMemo(() => {
    if (!showQRCode) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '20px',
          maxWidth: isMobile ? '95vw' : '500px',
          width: '100%',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              📱 {language === 'fr' ? 'Code QR Généré' : 'Generated QR Code'}
            </h2>
            <button
              onClick={() => setShowQRCode(false)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px'
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'inline-block'
          }}>
            {generatedQRCode && (
              <img 
                src={generatedQRCode} 
                alt="QR Code"
                style={{
                  width: isMobile ? '200px' : '250px',
                  height: isMobile ? '200px' : '250px'
                }}
              />
            )}
          </div>

          <p style={{
            color: '#d1d5db',
            fontSize: '14px',
            margin: '0 0 16px 0'
          }}>
            {language === 'fr' ? 
              'Scanner ce code pour accéder au permis sur mobile' :
              'Scan this code to access the permit on mobile'}
          </p>

          <button
            onClick={() => {
              if (navigator.clipboard && generatedQRCode) {
                navigator.clipboard.writeText(generatedQRCode);
                setNotification({
                  type: 'success',
                  message: '✅ QR Code copié'
                });
              }
            }}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <Copy size={16} />
            {language === 'fr' ? 'Copier' : 'Copy'}
          </button>
        </div>
      </div>
    );
  }, [showQRCode, generatedQRCode, language, isMobile]);

  // =================== COMPOSANT BOUTONS D'ACTIONS RAPIDES ===================
  const QuickActionsPanel = useMemo(() => {
    return (
      <div style={{
        position: isMobile ? 'fixed' : 'sticky',
        ...(isMobile ? { 
          bottom: '20px', 
          right: '20px',
          zIndex: 1000
        } : { 
          top: '20px', 
          zIndex: 100,
          marginBottom: '20px'
        }),
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '16px',
        ...(isMobile ? {} : { justifyContent: 'center', flexWrap: 'wrap' })
      }}>
        
        {/* Base de données */}
        <button
          onClick={() => setShowPermitDatabase(true)}
          style={{
            ...(isMobile ? {
              width: '56px',
              height: '56px',
              borderRadius: '50%'
            } : {
              padding: '12px 20px',
              borderRadius: '8px'
            }),
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            touchAction: 'manipulation',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white'
          }}
          title={language === 'fr' ? 'Base de données' : 'Database'}
        >
          <Database size={16} />
          {!isMobile && <span>{language === 'fr' ? 'Base de données' : 'Database'}</span>}
        </button>

        {/* Assistant CSA */}
        <button
          onClick={() => setShowClassificationWizard(true)}
          style={{
            ...(isMobile ? {
              width: '56px',
              height: '56px',
              borderRadius: '50%'
            } : {
              padding: '12px 20px',
              borderRadius: '8px'
            }),
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            touchAction: 'manipulation',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white'
          }}
          title={language === 'fr' ? 'Assistant CSA' : 'CSA Wizard'}
        >
          <Star size={16} />
          {!isMobile && <span>{language === 'fr' ? 'Assistant CSA' : 'CSA Wizard'}</span>}
        </button>

        {/* Générer QR */}
        <button
          onClick={generateQRCode}
          style={{
            ...(isMobile ? {
              width: '56px',
              height: '56px',
              borderRadius: '50%'
            } : {
              padding: '12px 20px',
              borderRadius: '8px'
            }),
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            touchAction: 'manipulation',
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            color: 'white'
          }}
          title={language === 'fr' ? 'Générer QR' : 'Generate QR'}
        >
          <QrCode size={16} />
          {!isMobile && <span>{language === 'fr' ? 'Générer QR' : 'Generate QR'}</span>}
        </button>

        {/* Email */}
        <button
          onClick={handleEmailPermit}
          style={{
            ...(isMobile ? {
              width: '56px',
              height: '56px',
              borderRadius: '50%'
            } : {
              padding: '12px 20px',
              borderRadius: '8px'
            }),
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            touchAction: 'manipulation',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white'
          }}
          title={language === 'fr' ? 'Envoyer Email' : 'Send Email'}
        >
          <Mail size={16} />
          {!isMobile && <span>{language === 'fr' ? 'Email' : 'Email'}</span>}
        </button>

        {/* Partager */}
        <button
          onClick={handleSharePermit}
          style={{
            ...(isMobile ? {
              width: '56px',
              height: '56px',
              borderRadius: '50%'
            } : {
              padding: '12px 20px',
              borderRadius: '8px'
            }),
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            touchAction: 'manipulation',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white'
          }}
          title={language === 'fr' ? 'Partager' : 'Share'}
        >
          <Share size={16} />
          {!isMobile && <span>{language === 'fr' ? 'Partager' : 'Share'}</span>}
        </button>

        {/* Menu export pour mobile */}
        {isMobile && (
          <button
            onClick={() => {
              const choice = window.prompt(
                `${language === 'fr' ? 'Exporter les données' : 'Export data'}:\n1. JSON\n2. CSV\n\n${language === 'fr' ? 'Choisissez (1-2):' : 'Choose (1-2):'}`
              );
              
              if (choice === '1') exportPermitData('json');
              if (choice === '2') exportPermitData('csv');
            }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              touchAction: 'manipulation',
              background: 'linear-gradient(135deg, #64748b, #475569)',
              color: 'white'
            }}
            title={language === 'fr' ? 'Exporter' : 'Export'}
          >
            <Download size={16} />
          </button>
        )}
      </div>
    );
  }, [
    isMobile, 
    language, 
    generateQRCode, 
    handleEmailPermit, 
    handleSharePermit, 
    exportPermitData
  ]);

  // =================== SECTION 5: COMPOSANT ÉVALUATION DES DANGERS ==================="use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, Briefcase, 
  Copy, Check, AlertTriangle, Camera, Upload, X, Settings, Wrench, Droplets, 
  Wind, Flame, Eye, Trash2, Plus, ArrowLeft, ArrowRight, Home, Layers, 
  Ruler, Gauge, Thermometer, Activity, Shield, Zap, Save, Download, 
  Mail, MessageSquare, Share, Printer, CheckCircle, Search, Database, QrCode,
  Menu, ChevronDown, ChevronUp, Info, Star, Globe, Wifi, Navigation
} from 'lucide-react';

// =================== TYPES ET INTERFACES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
type Language = 'fr' | 'en';
type UnitSystem = 'metric' | 'imperial';

interface SpacePhoto {
  id: string;
  url: string;
  category: string;
  caption: string;
  timestamp: string;
  location: string;
  measurements?: string;
  gpsCoords?: { lat: number; lng: number };
}

interface Dimensions {
  length: number;
  width: number;
  height: number;
  diameter: number;
  volume: number;
  spaceShape: 'rectangular' | 'cylindrical' | 'spherical' | 'irregular';
}

interface EntryPoint {
  id: string;
  type: string;
  dimensions: string;
  location: string;
  condition: string;
  accessibility: string;
  photos: string[];
}

interface ConfinedSpaceDetails {
  // Section 1: Informations du projet
  projectNumber: string;
  workLocation: string;
  contractor: string;
  supervisor: string;
  entryDate: string;
  duration: string;
  workerCount: number;
  workDescription: string;

  // Section 2: Identification de l'espace
  spaceType: string;
  csaClass: string;
  entryMethod: string;
  accessType: string;
  spaceLocation: string;
  spaceDescription: string;

  // Section 3: Dimensions
  dimensions: Dimensions;
  unitSystem: UnitSystem;

  // Section 4: Points d'entrée
  entryPoints: EntryPoint[];

  // Section 5: Dangers
  atmosphericHazards: string[];
  physicalHazards: string[];

  // Section 6: Documentation
  spacePhotos: SpacePhoto[];
  environmentalConditions: {
    ventilationRequired: boolean;
    ventilationType: string;
    lightingConditions: string;
    temperatureRange: string;
    moistureLevel: string;
    noiseLevel: string;
    weatherConditions: string;
  };
  spaceContent: {
    contents: string;
    residues: string;
    previousUse: string;
    lastEntry: string;
    cleaningStatus: string;
  };
  safetyMeasures: {
    emergencyEgress: string;
    communicationMethod: string;
    monitoringEquipment: string[];
    ventilationEquipment: string[];
    emergencyEquipment: string[];
  };
}

interface SiteInformationProps {
  permitData: any;
  updatePermitData: (updates: any) => void;
  selectedProvince: ProvinceCode;
  PROVINCIAL_REGULATIONS: Record<ProvinceCode, any>;
  isMobile: boolean;
  language: Language;
  updateParentData: (section: string, data: any) => void;
}

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    // Navigation
    title: "Informations du Site - Espace Clos",
    subtitle: "Identification et évaluation complète de l'espace de travail confiné",
    
    // Section 1: Informations du projet
    projectInfo: "Informations du Projet",
    projectNumber: "Numéro de projet",
    workLocation: "Lieu des travaux",
    contractor: "Entrepreneur",
    supervisor: "Superviseur",
    entryDate: "Date d'entrée prévue",
    duration: "Durée estimée",
    workerCount: "Nombre de travailleurs",
    workDescription: "Description des travaux",
    
    // Section 2: Identification
    spaceIdentification: "Identification de l'Espace",
    spaceType: "Type d'espace",
    csaClass: "Classification CSA",
    entryMethod: "Méthode d'entrée",
    accessType: "Type d'accès",
    spaceLocation: "Localisation de l'espace",
    spaceDescription: "Description de l'espace",
    
    // Section 3: Dimensions
    spaceDimensions: "Dimensions et Volume",
    dimensions: "Dimensions",
    unitSystem: "Système d'unités",
    metric: "Métrique (m)",
    imperial: "Impérial (ft)",
    length: "Longueur",
    width: "Largeur",
    height: "Hauteur",
    diameter: "Diamètre",
    volume: "Volume calculé",
    calculateVolume: "Calculer Volume",
    spaceShape: "Forme de l'espace",
    rectangular: "Rectangulaire",
    cylindrical: "Cylindrique",
    spherical: "Sphérique",
    irregular: "Irrégulier",
    
    // Section 4: Points d'entrée
    entryPoints: "Points d'Entrée et Accès",
    addEntryPoint: "Ajouter point d'entrée",
    entryPoint: "Point d'entrée",
    entryType: "Type d'entrée",
    entryDimensions: "Dimensions",
    entryLocation: "Localisation",
    entryCondition: "État",
    entryAccessibility: "Accessibilité",
    
    // Section 5: Dangers
    hazardAssessment: "Évaluation des Dangers",
    atmosphericHazards: "Dangers Atmosphériques",
    physicalHazards: "Dangers Physiques",
    selectHazards: "Sélectionnez tous les dangers présents",
    
    // Section 6: Documentation
    photoDocumentation: "Documentation Photographique",
    addPhoto: "Ajouter photo",
    takePhoto: "Prendre photo",
    noPhotos: "Aucune photo",
    
    // Actions
    save: "Sauvegarder",
    cancel: "Annuler",
    required: "Requis",
    optional: "Optionnel",
    
    // Types d'espaces
    spaceTypes: {
      tank: "Réservoir",
      vessel: "Cuve/Récipient", 
      silo: "Silo",
      pit: "Fosse",
      vault: "Voûte",
      tunnel: "Tunnel",
      trench: "Tranchée",
      manhole: "Regard d'égout",
      storage: "Espace de stockage",
      boiler: "Chaudière",
      duct: "Conduit",
      chamber: "Chambre",
      other: "Autre"
    },
    
    // Classifications CSA
    csaClasses: {
      class1: "Classe 1 - Danger immédiat pour la vie",
      class2: "Classe 2 - Risque potentiel",
      class3: "Classe 3 - Risque minimal"
    }
  },
  en: {
    // Navigation
    title: "Site Information - Confined Space",
    subtitle: "Complete identification and assessment of the confined workspace",
    
    // Section 1: Project information
    projectInfo: "Project Information",
    projectNumber: "Project number",
    workLocation: "Work location",
    contractor: "Contractor",
    supervisor: "Supervisor",
    entryDate: "Planned entry date",
    duration: "Estimated duration",
    workerCount: "Number of workers",
    workDescription: "Work description",
    
    // Section 2: Identification
    spaceIdentification: "Space Identification",
    spaceType: "Space type",
    csaClass: "CSA Classification",
    entryMethod: "Entry method",
    accessType: "Access type",
    spaceLocation: "Space location",
    spaceDescription: "Space description",
    
    // Section 3: Dimensions
    spaceDimensions: "Dimensions and Volume",
    dimensions: "Dimensions",
    unitSystem: "Unit system",
    metric: "Metric (m)",
    imperial: "Imperial (ft)",
    length: "Length",
    width: "Width",
    height: "Height",
    diameter: "Diameter",
    volume: "Calculated volume",
    calculateVolume: "Calculate Volume",
    spaceShape: "Space shape",
    rectangular: "Rectangular",
    cylindrical: "Cylindrical",
    spherical: "Spherical",
    irregular: "Irregular",
    
    // Section 4: Entry points
    entryPoints: "Entry Points and Access",
    addEntryPoint: "Add entry point",
    entryPoint: "Entry point",
    entryType: "Entry type",
    entryDimensions: "Dimensions",
    entryLocation: "Location",
    entryCondition: "Condition",
    entryAccessibility: "Accessibility",
    
    // Section 5: Hazards
    hazardAssessment: "Hazard Assessment",
    atmosphericHazards: "Atmospheric Hazards",
    physicalHazards: "Physical Hazards",
    selectHazards: "Select all present hazards",
    
    // Section 6: Documentation
    photoDocumentation: "Photo Documentation",
    addPhoto: "Add photo",
    takePhoto: "Take photo",
    noPhotos: "No photos",
    
    // Actions
    save: "Save",
    cancel: "Cancel",
    required: "Required",
    optional: "Optional",
    
    // Space types
    spaceTypes: {
      tank: "Tank",
      vessel: "Vessel/Container",
      silo: "Silo", 
      pit: "Pit",
      vault: "Vault",
      tunnel: "Tunnel",
      trench: "Trench",
      manhole: "Manhole",
      storage: "Storage space",
      boiler: "Boiler",
      duct: "Duct",
      chamber: "Chamber",
      other: "Other"
    },
    
    // CSA Classifications
    csaClasses: {
      class1: "Class 1 - Immediate danger to life",
      class2: "Class 2 - Potential risk",
      class3: "Class 3 - Minimal risk"
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const SiteInformation: React.FC<SiteInformationProps> = ({
  permitData,
  updatePermitData,
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile,
  language,
  updateParentData
}) => {

  // =================== ASSISTANT CLASSIFICATION CSA AVEC QUESTIONNAIRE ===================
  const [showClassificationWizard, setShowClassificationWizard] = useState(false);
  const [showPermitDatabase, setShowPermitDatabase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [generatedQRCode, setGeneratedQRCode] = useState('');

  // Classifications CSA par province
  const getCSAClassifications = useCallback((province: ProvinceCode, language: Language) => {
    const baseClassifications = {
      fr: {
        class1: {
          title: "Classe 1 - Danger immédiat pour la vie",
          description: "Atmosphère dangereuse ou risque immédiat de mort",
          criteria: [
            "Oxygène < 19,5% ou > 23%",
            "Gaz inflammables > 10% LIE",
            "H2S > 10 ppm",
            "CO > 35 ppm",
            "Substances toxiques au-dessus des VLEP"
          ],
          examples: ["Réservoirs de produits chimiques", "Espaces avec historique de contamination"],
          monitoring: "Continue obligatoire",
          permits: "Superviseur certifié requis"
        },
        class2: {
          title: "Classe 2 - Risque potentiel",
          description: "Conditions dangereuses possibles nécessitant précautions",
          criteria: [
            "Risque d'atmosphère dangereuse",
            "Configuration pouvant piéger",
            "Dangers mécaniques/électriques"
          ],
          examples: ["Regards d'égout", "Réservoirs nettoyés"],
          monitoring: "Tests initiaux + périodiques",
          permits: "Personne compétente requise"
        },
        class3: {
          title: "Classe 3 - Risque minimal",
          description: "Espace avec configuration d'espace clos mais risques minimes",
          criteria: [
            "Pas d'atmosphère dangereuse",
            "Accès et sortie sécuritaires"
          ],
          examples: ["Réservoirs d'eau potable", "Tunnels ventilés"],
          monitoring: "Tests d'entrée seulement",
          permits: "Formation de base suffisante"
        }
      },
      en: {
        class1: {
          title: "Class 1 - Immediate danger to life",
          description: "Hazardous atmosphere or immediate risk of death",
          criteria: [
            "Oxygen < 19.5% or > 23%",
            "Flammable gases > 10% LEL",
            "H2S > 10 ppm",
            "CO > 35 ppm",
            "Toxic substances above OELs"
          ],
          examples: ["Chemical storage tanks", "Spaces with contamination history"],
          monitoring: "Continuous monitoring required",
          permits: "Certified supervisor required"
        },
        class2: {
          title: "Class 2 - Potential risk",
          description: "Potentially hazardous conditions requiring precautions",
          criteria: [
            "Risk of hazardous atmosphere",
            "Configuration that could trap",
            "Mechanical/electrical hazards"
          ],
          examples: ["Manholes", "Cleaned tanks"],
          monitoring: "Initial + periodic testing",
          permits: "Competent person required"
        },
        class3: {
          title: "Class 3 - Minimal risk",
          description: "Confined space configuration but minimal hazards",
          criteria: [
            "No hazardous atmosphere",
            "Safe access and egress"
          ],
          examples: ["Potable water tanks", "Ventilated tunnels"],
          monitoring: "Entry testing only",
          permits: "Basic training sufficient"
        }
      }
    };

    return baseClassifications[language];
  }, []);

  // Questions pour classification automatique
  const getClassificationQuestions = useCallback((language: Language) => {
    return {
      fr: [
        {
          id: 'atmosphere_current',
          question: "L'espace contient-il actuellement une atmosphère dangereuse?",
          type: 'radio',
          options: [
            { value: 'class1', label: "Oui - Atmosphère dangereuse confirmée", weight: 100 },
            { value: 'unknown', label: "Inconnu - Tests requis", weight: 50 },
            { value: 'safe', label: "Non - Atmosphère sécuritaire confirmée", weight: 0 }
          ],
          critical: true
        },
        {
          id: 'atmosphere_history',
          question: "L'espace a-t-il un historique de contamination?",
          type: 'radio',
          options: [
            { value: 'yes', label: "Oui - Historique de contamination", weight: 80 },
            { value: 'possible', label: "Possiblement - Usage industriel antérieur", weight: 40 },
            { value: 'no', label: "Non - Jamais utilisé pour substances dangereuses", weight: 0 }
          ]
        },
        {
          id: 'access_egress',
          question: "Comment évaluez-vous l'accès et la sortie?",
          type: 'radio',
          options: [
            { value: 'difficult', label: "Difficile - Sortie compliquée/limitée", weight: 60 },
            { value: 'restricted', label: "Restreint - Une seule voie d'accès", weight: 30 },
            { value: 'good', label: "Bon - Accès et sortie multiples/faciles", weight: 0 }
          ]
        },
        {
          id: 'ventilation',
          question: "Quelle est la situation de ventilation?",
          type: 'radio',
          options: [
            { value: 'none', label: "Aucune - Espace fermé/étanche", weight: 70 },
            { value: 'poor', label: "Faible - Ventilation naturelle limitée", weight: 35 },
            { value: 'good', label: "Bonne - Ventilation naturelle adéquate", weight: 0 }
          ]
        },
        {
          id: 'work_type',
          question: "Quel type de travail sera effectué?",
          type: 'radio',
          options: [
            { value: 'hot_work', label: "Travail à chaud (soudage, coupage)", weight: 50 },
            { value: 'chemical', label: "Manipulation de produits chimiques", weight: 60 },
            { value: 'maintenance', label: "Maintenance générale", weight: 20 },
            { value: 'inspection', label: "Inspection visuelle seulement", weight: 5 }
          ]
        }
      ],
      en: [
        {
          id: 'atmosphere_current',
          question: "Does the space currently contain a hazardous atmosphere?",
          type: 'radio',
          options: [
            { value: 'class1', label: "Yes - Hazardous atmosphere confirmed", weight: 100 },
            { value: 'unknown', label: "Unknown - Testing required", weight: 50 },
            { value: 'safe', label: "No - Safe atmosphere confirmed", weight: 0 }
          ],
          critical: true
        },
        {
          id: 'atmosphere_history',
          question: "Does the space have a history of contamination?",
          type: 'radio',
          options: [
            { value: 'yes', label: "Yes - History of contamination", weight: 80 },
            { value: 'possible', label: "Possibly - Previous industrial use", weight: 40 },
            { value: 'no', label: "No - Never used for hazardous substances", weight: 0 }
          ]
        },
        {
          id: 'access_egress',
          question: "How would you rate access and egress?",
          type: 'radio',
          options: [
            { value: 'difficult', label: "Difficult - Complicated/limited exit", weight: 60 },
            { value: 'restricted', label: "Restricted - Single access route", weight: 30 },
            { value: 'good', label: "Good - Multiple/easy access and exit", weight: 0 }
          ]
        },
        {
          id: 'ventilation',
          question: "What is the ventilation situation?",
          type: 'radio',
          options: [
            { value: 'none', label: "None - Closed/sealed space", weight: 70 },
            { value: 'poor', label: "Poor - Limited natural ventilation", weight: 35 },
            { value: 'good', label: "Good - Adequate natural ventilation", weight: 0 }
          ]
        },
        {
          id: 'work_type',
          question: "What type of work will be performed?",
          type: 'radio',
          options: [
            { value: 'hot_work', label: "Hot work (welding, cutting)", weight: 50 },
            { value: 'chemical', label: "Chemical handling", weight: 60 },
            { value: 'maintenance', label: "General maintenance", weight: 20 },
            { value: 'inspection', label: "Visual inspection only", weight: 5 }
          ]
        }
      ]
    };
  }, []);

  // Calcul automatique de classification
  const calculateCSAClass = useCallback((answers: Record<string, any>) => {
    let totalWeight = 0;
    const questions = getClassificationQuestions(language);

    questions[language].forEach(question => {
      const answer = answers[question.id];
      if (!answer) return;

      if (question.type === 'radio') {
        const option = question.options.find(opt => opt.value === answer);
        if (option) totalWeight += option.weight;
      }
    });

    if (totalWeight >= 150) return 'class1';
    if (totalWeight >= 50) return 'class2';
    return 'class3';
  }, [language, getClassificationQuestions]);

  // =================== GESTION BASE DE DONNÉES ===================
  const searchPermitsDatabase = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      // Simulation de recherche en base
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults = [
        {
          id: '1',
          permitNumber: 'CS-QC-20241201-ABC123',
          projectNumber: 'P2024-001',
          workLocation: 'Usine ABC, Réservoir #3',
          contractor: 'Entreprise XYZ Inc.',
          spaceType: 'tank',
          csaClass: 'class2',
          entryDate: '2024-12-15T09:00',
          status: 'active',
          createdAt: '2024-12-01T10:00',
          hazardCount: 3,
          photoCount: 5
        },
        {
          id: '2',
          permitNumber: 'CS-QC-20241202-DEF456',
          projectNumber: 'P2024-002',
          workLocation: 'Site DEF, Fosse #1',
          contractor: 'Construction 123 Ltée',
          spaceType: 'pit',
          csaClass: 'class1',
          entryDate: '2024-12-20T08:00',
          status: 'completed',
          createdAt: '2024-12-02T14:30',
          hazardCount: 7,
          photoCount: 12
        }
      ];

      const filtered = query ? 
        mockResults.filter(r => 
          r.permitNumber.toLowerCase().includes(query.toLowerCase()) ||
          r.projectNumber.toLowerCase().includes(query.toLowerCase()) ||
          r.workLocation.toLowerCase().includes(query.toLowerCase()) ||
          r.contractor.toLowerCase().includes(query.toLowerCase())
        ) : mockResults;

      setSearchResults(filtered);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const loadPermitFromHistory = useCallback(async (permitNumber: string) => {
    try {
      // Simulation du chargement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Données mockées pour démonstration
      const loadedData = {
        projectNumber: 'P2024-001',
        workLocation: 'Usine ABC, Réservoir #3',
        contractor: 'Entreprise XYZ Inc.',
        supervisor: 'Jean Dupont',
        entryDate: '2024-12-15T09:00',
        duration: '4 heures',
        workerCount: 2,
        workDescription: 'Inspection et nettoyage du réservoir',
        spaceType: 'tank',
        csaClass: 'class2',
        dimensions: {
          length: 5,
          width: 3,
          height: 4,
          diameter: 0,
          volume: 60,
          spaceShape: 'rectangular'
        },
        atmosphericHazards: ['oxygen_deficiency', 'toxic_gases'],
        physicalHazards: ['confined_space_hazard']
      };

      // Chargement direct dans le state local
      setFormData(prev => ({ ...prev, ...loadedData }));
      setShowPermitDatabase(false);
      
      setNotification({
        type: 'success',
        message: `✅ Permis ${permitNumber} chargé avec succès`
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: '❌ Erreur lors du chargement du permis'
      });
    }
  }, []);

  // =================== GÉNÉRATION QR CODE ===================
  const generateQRCode = useCallback(async () => {
    try {
      const permitNumber = `CS-${selectedProvince}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const qrData = {
        permitNumber,
        type: 'confined_space',
        province: selectedProvince,
        projectNumber: formData.projectNumber,
        location: formData.workLocation,
        contractor: formData.contractor,
        spaceType: formData.spaceType,
        csaClass: formData.csaClass,
        hazardCount: formData.atmosphericHazards.length + formData.physicalHazards.length,
        volume: formData.dimensions.volume,
        unitSystem: formData.unitSystem,
        issueDate: new Date().toISOString()
      };

      // Simulation génération QR (en production, utiliser une vraie librairie QR)
      const qrCodeDataUrl = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <rect x="20" y="20" width="160" height="160" fill="none" stroke="black" stroke-width="2"/>
          <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
            QR Code
          </text>
          <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="8" fill="black">
            ${permitNumber}
          </text>
        </svg>
      `)}`;

      setGeneratedQRCode(qrCodeDataUrl);
      setShowQRCode(true);
      
      setNotification({
        type: 'success',
        message: `✅ QR Code généré: ${permitNumber}`
      });

      return permitNumber;
    } catch (error) {
      setNotification({
        type: 'error',
        message: '❌ Erreur génération QR Code'
      });
      return null;
    }
  }, [selectedProvince, formData]);

  // =================== ACTIONS RAPIDES ===================
  const handleEmailPermit = useCallback(() => {
    const subject = `${language === 'fr' ? 'Permis d\'Espace Clos' : 'Confined Space Permit'} - ${formData.projectNumber}`;
    const body = `${language === 'fr' ? 'Permis d\'entrée en espace clos' : 'Confined space entry permit'}:
    
📋 ${language === 'fr' ? 'Projet' : 'Project'}: ${formData.projectNumber}
📍 ${language === 'fr' ? 'Lieu' : 'Location'}: ${formData.workLocation}
🏗️ ${language === 'fr' ? 'Entrepreneur' : 'Contractor'}: ${formData.contractor}
👷 ${language === 'fr' ? 'Superviseur' : 'Supervisor'}: ${formData.supervisor}
📅 ${language === 'fr' ? 'Date d\'entrée' : 'Entry Date'}: ${formData.entryDate}
🏷️ ${language === 'fr' ? 'Type' : 'Type'}: ${t.spaceTypes[formData.spaceType as keyof typeof t.spaceTypes] || formData.spaceType}
🛡️ ${language === 'fr' ? 'Classification' : 'Classification'}: ${t.csaClasses[formData.csaClass as keyof typeof t.csaClasses] || formData.csaClass}
📐 ${language === 'fr' ? 'Volume' : 'Volume'}: ${formData.dimensions.volume} ${formData.unitSystem === 'metric' ? 'm³' : 'ft³'}
⚠️ ${language === 'fr' ? 'Dangers' : 'Hazards'}: ${formData.atmosphericHazards.length + formData.physicalHazards.length}

${language === 'fr' ? 'Document généré par C-SECUR360' : 'Document generated by C-SECUR360'}`;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  }, [language, formData, t]);

  const handleSharePermit = useCallback(async () => {
    const shareData = {
      title: `${language === 'fr' ? 'Permis Espace Clos' : 'Confined Space Permit'}`,
      text: `📋 ${formData.projectNumber}
📍 ${formData.workLocation}
🏗️ ${formData.contractor}
🛡️ ${t.csaClasses[formData.csaClass as keyof typeof t.csaClasses] || formData.csaClass}`,
      url: window.location.href
    };
    
    if (navigator.share && isMobile) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Partage annulé');
      }
    } else if (navigator.clipboard) {
      const textToShare = `${shareData.title}\n\n${shareData.text}\n\n🔗 ${shareData.url}`;
      await navigator.clipboard.writeText(textToShare);
      setNotification({
        type: 'success',
        message: '✅ Copié dans le presse-papiers'
      });
    }
  }, [language, formData, t, isMobile]);

  const exportPermitData = useCallback(async (format: 'json' | 'csv') => {
    try {
      const dataToExport = {
        ...formData,
        metadata: {
          exportDate: new Date().toISOString(),
          province: selectedProvince,
          language,
          version: '2.0'
        }
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `permit-${formData.projectNumber || 'new'}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const csvData = [
          ['Champ', 'Valeur'],
          ['Numéro de projet', formData.projectNumber],
          ['Lieu', formData.workLocation],
          ['Entrepreneur', formData.contractor],
          ['Superviseur', formData.supervisor],
          ['Classification CSA', formData.csaClass],
          ['Volume', `${formData.dimensions.volume} ${formData.unitSystem === 'metric' ? 'm³' : 'ft³'}`],
          ['Dangers', formData.atmosphericHazards.length + formData.physicalHazards.length]
        ];
        
        const csvContent = csvData.map(row => 
          row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `permit-${formData.projectNumber || 'new'}-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      setNotification({
        type: 'success',
        message: `✅ Données exportées (${format.toUpperCase()})`
      });
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: '❌ Erreur lors de l\'exportation'
      });
    }
  }, [formData, selectedProvince, language]);

  // =================== ÉTATS LOCAUX STABLES (PAS DE RE-RENDER) ===================
  const [formData, setFormData] = useState<ConfinedSpaceDetails>(() => ({
    // Section 1: Informations du projet
    projectNumber: permitData.projectNumber || '',
    workLocation: permitData.workLocation || '',
    contractor: permitData.contractor || '',
    supervisor: permitData.supervisor || '',
    entryDate: permitData.entryDate || '',
    duration: permitData.duration || '',
    workerCount: permitData.workerCount || 1,
    workDescription: permitData.workDescription || '',

    // Section 2: Identification
    spaceType: permitData.spaceType || '',
    csaClass: permitData.csaClass || '',
    entryMethod: permitData.entryMethod || '',
    accessType: permitData.accessType || '',
    spaceLocation: permitData.spaceLocation || '',
    spaceDescription: permitData.spaceDescription || '',

    // Section 3: Dimensions
    dimensions: permitData.dimensions || {
      length: 0,
      width: 0,
      height: 0,
      diameter: 0,
      volume: 0,
      spaceShape: 'rectangular'
    },
    unitSystem: permitData.unitSystem || 'metric',

    // Section 4: Points d'entrée
    entryPoints: permitData.entryPoints || [{
      id: 'entry-1',
      type: 'circular',
      dimensions: '',
      location: '',
      condition: 'good',
      accessibility: 'normal',
      photos: []
    }],

    // Section 5: Dangers
    atmosphericHazards: permitData.atmosphericHazards || [],
    physicalHazards: permitData.physicalHazards || [],

    // Section 6: Documentation + Mesures de sécurité + Contenu espace
    spacePhotos: permitData.spacePhotos || [],
    environmentalConditions: permitData.environmentalConditions || {
      ventilationRequired: false,
      ventilationType: '',
      lightingConditions: '',
      temperatureRange: '',
      moistureLevel: '',
      noiseLevel: '',
      weatherConditions: ''
    },
    spaceContent: permitData.spaceContent || {
      contents: '',
      residues: '',
      previousUse: '',
      lastEntry: '',
      cleaningStatus: '',
      equipment: '',
      materials: '',
      chemicals: ''
    },
    safetyMeasures: permitData.safetyMeasures || {
      emergencyEgress: '',
      communicationMethod: '',
      monitoringEquipment: [],
      ventilationEquipment: [],
      emergencyEquipment: [],
      requiredPPE: '',
      rescuePlan: '',
      emergencyContacts: ''
    }
  }));

  // États UI seulement (pas de propagation)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Réfs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Traductions
  const t = translations[language];

  // =================== HANDLERS OPTIMISÉS (PAS DE RE-RENDER PARENT) ===================
  
  // Handler générique pour éviter les re-renders
  const updateFormData = useCallback((section: keyof ConfinedSpaceDetails, field: string | null, value: any) => {
    setFormData(prev => {
      if (field === null) {
        // Mise à jour de toute la section
        return { ...prev, [section]: value };
      } else if (typeof prev[section] === 'object' && prev[section] !== null && !Array.isArray(prev[section])) {
        // Mise à jour d'un champ dans un objet
        return {
          ...prev,
          [section]: {
            ...(prev[section] as object),
            [field]: value
          }
        };
      } else {
        // Mise à jour d'un champ primitif
        return { ...prev, [section]: value };
      }
    });
  }, []);

  // Handlers spécifiques pour chaque section
  const updateProjectInfo = useCallback((field: string, value: any) => {
    updateFormData(field as keyof ConfinedSpaceDetails, null, value);
  }, [updateFormData]);

  // =================== SECTION 6: COMPOSANT DOCUMENTATION ET PHOTOS ===================
  const DocumentationSection = useMemo(() => {
    return (
      <div style={{
        background: 'rgba(31, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '12px',
        marginBottom: isMobile ? '16px' : '24px',
        overflow: 'hidden'
      }}>
        {/* Header de section */}
        <button 
          className="section-toggle"
          onClick={() => {
            setCollapsedSections(prev => {
              const newSet = new Set(prev);
              if (newSet.has('documentation')) {
                newSet.delete('documentation');
              } else {
                newSet.add('documentation');
              }
              return newSet;
            });
          }}
          style={{
            width: '100%',
            padding: isMobile ? '16px' : '20px',
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            minHeight: isMobile ? '60px' : '70px',
            touchAction: 'manipulation'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '12px' : '16px',
            flex: 1
          }}>
            <Camera style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', color: '#06b6d4' }} />
            <h3 style={{
              margin: 0,
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              {t.photoDocumentation}
            </h3>
            <div style={{
              background: '#06b6d4',
              color: 'white',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {formData.spacePhotos.length}
            </div>
          </div>
          <ChevronDown 
            size={20} 
            style={{
              transition: 'transform 0.2s ease',
              transform: collapsedSections.has('documentation') ? 'rotate(0deg)' : 'rotate(180deg)'
            }}
          />
        </button>
        
        {/* Contenu de la section */}
        {!collapsedSections.has('documentation') && (
          <div style={{
            padding: isMobile ? '16px' : '24px',
            borderTop: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            
            {/* Boutons de capture photo par catégorie */}
            <div style={{ marginBottom: '24px' }}>
              <h5 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#d1d5db',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Camera size={16} />
                {language === 'fr' ? 'Capture par catégorie' : 'Capture by category'}
              </h5>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
                gap: '8px'
              }}>
                <button 
                  type="button"
                  onClick={() => handlePhotoCapture('exterior')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: '600',
                    minHeight: isMobile ? '36px' : '40px'
                  }}
                >
                  <Camera size={14} />
                  🏢 {language === 'fr' ? 'Extérieur' : 'Exterior'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => handlePhotoCapture('interior')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    color: '#6ee7b7',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: '600',
                    minHeight: isMobile ? '36px' : '40px'
                  }}
                >
                  <Camera size={14} />
                  🏠 {language === 'fr' ? 'Intérieur' : 'Interior'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => handlePhotoCapture('entry')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    color: '#fbbf24',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: '600',
                    minHeight: isMobile ? '36px' : '40px'
                  }}
                >
                  <Camera size={14} />
                  🚪 {language === 'fr' ? 'Entrées' : 'Entry'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => handlePhotoCapture('hazards')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#fca5a5',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: '600',
                    minHeight: isMobile ? '36px' : '40px'
                  }}
                >
                  <Camera size={14} />
                  ⚠️ {language === 'fr' ? 'Dangers' : 'Hazards'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => handlePhotoCapture('equipment')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#c4b5fd',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: '600',
                    minHeight: isMobile ? '36px' : '40px'
                  }}
                >
                  <Camera size={14} />
                  🔧 {language === 'fr' ? 'Équipement' : 'Equipment'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => handlePhotoCapture('safety')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    color: '#86efac',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: '600',
                    minHeight: isMobile ? '36px' : '40px'
                  }}
                >
                  <Camera size={14} />
                  🛡️ {language === 'fr' ? 'Sécurité' : 'Safety'}
                </button>
              </div>
            </div>

            {/* Carrousel de photos ou placeholder */}
            {formData.spacePhotos.length > 0 ? (
              <PhotoCarousel 
                photos={formData.spacePhotos} 
                onAddPhoto={() => handlePhotoCapture('general')}
                onRemovePhoto={removePhoto}
                onUpdateCaption={updatePhotoCaption}
                currentIndex={currentPhotoIndex}
                setCurrentIndex={setCurrentPhotoIndex}
                isMobile={isMobile}
                language={language}
              />
            ) : (
              <div style={{
                textAlign: 'center',
                padding: isMobile ? '40px 20px' : '60px 20px',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '2px dashed rgba(6, 182, 212, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handlePhotoCapture('general')}
              >
                <Camera size={isMobile ? 48 : 64} color="#06b6d4" style={{ opacity: 0.7, marginBottom: '16px' }} />
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: isMobile ? '16px' : '18px',
                  color: '#67e8f9',
                  fontWeight: '600'
                }}>
                  {t.noPhotos}
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: isMobile ? '14px' : '15px', 
                  color: '#a5f3fc',
                  opacity: 0.8
                }}>
                  {language === 'fr' ? 
                    'Cliquez ici ou utilisez les boutons de catégorie pour ajouter des photos' : 
                    'Click here or use category buttons to add photos'}
                </p>
              </div>
            )}

            {/* Conditions environnementales */}
            <div style={{ marginTop: '32px', marginBottom: '24px' }}>
              <h5 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Droplets size={18} color="#06b6d4" />
                {language === 'fr' ? 'Conditions Environnementales' : 'Environmental Conditions'}
              </h5>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '16px'
              }}>
                
                {/* Ventilation requise */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Wind size={16} />
                    {language === 'fr' ? 'Ventilation requise' : 'Ventilation required'}
                  </label>
                  <select
                    value={formData.environmentalConditions.ventilationRequired ? 'yes' : 'no'}
                    onChange={(e) => {
                      updateFormData('environmentalConditions', 'ventilationRequired', e.target.value === 'yes');
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="no">❌ {language === 'fr' ? 'Non' : 'No'}</option>
                    <option value="yes">✅ {language === 'fr' ? 'Oui' : 'Yes'}</option>
                  </select>
                </div>

                {/* Type de ventilation */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Flame size={16} />
                    {language === 'fr' ? 'Type de ventilation' : 'Ventilation type'}
                  </label>
                  <select
                    value={formData.environmentalConditions.ventilationType}
                    onChange={(e) => {
                      updateFormData('environmentalConditions', 'ventilationType', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="natural">🌬️ {language === 'fr' ? 'Naturelle' : 'Natural'}</option>
                    <option value="mechanical">⚙️ {language === 'fr' ? 'Mécanique' : 'Mechanical'}</option>
                    <option value="forced">💨 {language === 'fr' ? 'Forcée' : 'Forced'}</option>
                    <option value="none">🚫 {language === 'fr' ? 'Aucune' : 'None'}</option>
                  </select>
                </div>

                {/* Conditions d'éclairage */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Eye size={16} />
                    {language === 'fr' ? 'Conditions d\'éclairage' : 'Lighting conditions'}
                  </label>
                  <select
                    value={formData.environmentalConditions.lightingConditions}
                    onChange={(e) => {
                      updateFormData('environmentalConditions', 'lightingConditions', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="excellent">☀️ {language === 'fr' ? 'Excellentes' : 'Excellent'}</option>
                    <option value="good">💡 {language === 'fr' ? 'Bonnes' : 'Good'}</option>
                    <option value="poor">🔦 {language === 'fr' ? 'Mauvaises' : 'Poor'}</option>
                    <option value="dark">🌑 {language === 'fr' ? 'Obscurité' : 'Dark'}</option>
                  </select>
                </div>

                {/* Plage de température */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Thermometer size={16} />
                    {language === 'fr' ? 'Plage de température (°C)' : 'Temperature range (°C)'}
                  </label>
                  <input
                    type="text"
                    value={formData.environmentalConditions.temperatureRange}
                    onChange={(e) => {
                      updateFormData('environmentalConditions', 'temperatureRange', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                    placeholder="15°C - 25°C"
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Champs pleine largeur */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                
                {/* Niveau d'humidité */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Droplets size={16} />
                    {language === 'fr' ? 'Niveau d\'humidité' : 'Moisture level'}
                  </label>
                  <select
                    value={formData.environmentalConditions.moistureLevel}
                    onChange={(e) => {
                      updateFormData('environmentalConditions', 'moistureLevel', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="dry">🏜️ {language === 'fr' ? 'Sec' : 'Dry'}</option>
                    <option value="normal">💧 {language === 'fr' ? 'Normal' : 'Normal'}</option>
                    <option value="humid">🌧️ {language === 'fr' ? 'Humide' : 'Humid'}</option>
                    <option value="wet">🌊 {language === 'fr' ? 'Mouillé' : 'Wet'}</option>
                  </select>
                </div>

                {/* Niveau de bruit */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    <Activity size={16} />
                    {language === 'fr' ? 'Niveau de bruit' : 'Noise level'}
                  </label>
                  <select
                    value={formData.environmentalConditions.noiseLevel}
                    onChange={(e) => {
                      updateFormData('environmentalConditions', 'noiseLevel', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '16px' : '15px',
                      fontWeight: '500',
                      minHeight: isMobile ? '48px' : '50px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="quiet">🔇 {language === 'fr' ? 'Silencieux' : 'Quiet'}</option>
                    <option value="normal">🔉 {language === 'fr' ? 'Normal' : 'Normal'}</option>
                    <option value="loud">🔊 {language === 'fr' ? 'Fort' : 'Loud'}</option>
                    <option value="extreme">📢 {language === 'fr' ? 'Extrême' : 'Extreme'}</option>
                  </select>
                </div>
              </div>

              {/* Conditions météorologiques */}
              <div style={{ marginTop: '16px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <Globe size={16} />
                  {language === 'fr' ? 'Conditions météorologiques' : 'Weather conditions'}
                </label>
                <textarea
                  value={formData.environmentalConditions.weatherConditions}
                  onChange={(e) => {
                    updateFormData('environmentalConditions', 'weatherConditions', e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    minHeight: isMobile ? '80px' : '100px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder={language === 'fr' ? 
                    'Ex: Ensoleillé, vent léger, température 22°C...' : 
                    'Ex: Sunny, light wind, temperature 22°C...'}
                  maxLength={300}
                  rows={3}
                />
              </div>
            </div>

            {/* Statistiques et recommandations */}
            <div style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <Info size={16} color="#06b6d4" />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#67e8f9' }}>
                  {language === 'fr' ? 'Résumé de la documentation' : 'Documentation summary'}
                </span>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '12px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#06b6d4' }}>
                    {formData.spacePhotos.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a5f3fc' }}>
                    {language === 'fr' ? 'Photos' : 'Photos'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#06b6d4' }}>
                    {formData.entryPoints.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a5f3fc' }}>
                    {language === 'fr' ? 'Entrées' : 'Entries'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#06b6d4' }}>
                    {formData.atmosphericHazards.length + formData.physicalHazards.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a5f3fc' }}>
                    {language === 'fr' ? 'Dangers' : 'Hazards'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#06b6d4' }}>
                    {formData.dimensions.volume.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a5f3fc' }}>
                    {formData.unitSystem === 'metric' ? 'm³' : 'ft³'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#a5f3fc', lineHeight: 1.4 }}>
                {language === 'fr' ? 
                  '📝 Documentation complète requise pour la conformité réglementaire et la sécurité des travailleurs.' :
                  '📝 Complete documentation required for regulatory compliance and worker safety.'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [
    formData.spacePhotos,
    formData.environmentalConditions,
    formData.entryPoints.length,
    formData.atmosphericHazards.length,
    formData.physicalHazards.length,
    formData.dimensions.volume,
    formData.unitSystem,
    collapsedSections,
    currentPhotoIndex,
    isMobile,
    t,
    language,
    updateFormData
  ]);

  // =================== HANDLERS PHOTO OPTIMISÉS ===================
  const handlePhotoCapture = useCallback(async (category: string) => {
    if (photoInputRef.current) {
      photoInputRef.current.accept = "image/*";
      photoInputRef.current.capture = "environment";
      photoInputRef.current.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const newPhoto: SpacePhoto = {
              id: `photo-${Date.now()}`,
              url: event.target?.result as string,
              category,
              caption: `${getCategoryName(category)} - ${new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}`,
              timestamp: new Date().toISOString(),
              location: 'Géolocalisation en cours...'
            };

            // Géolocalisation
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  newPhoto.location = `GPS: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
                  newPhoto.gpsCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  };
                  updateFormData('spacePhotos', null, [...formData.spacePhotos, newPhoto]);
                }, 
                () => {
                  newPhoto.location = 'Localisation non disponible';
                  updateFormData('spacePhotos', null, [...formData.spacePhotos, newPhoto]);
                }
              );
            } else {
              newPhoto.location = 'Géolocalisation non supportée';
              updateFormData('spacePhotos', null, [...formData.spacePhotos, newPhoto]);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      photoInputRef.current.click();
    }
  }, [formData.spacePhotos, language, updateFormData]);

  const removePhoto = useCallback((photoId: string) => {
    const updatedPhotos = formData.spacePhotos.filter(photo => photo.id !== photoId);
    updateFormData('spacePhotos', null, updatedPhotos);
  }, [formData.spacePhotos, updateFormData]);

  const updatePhotoCaption = useCallback((photoId: string, newCaption: string) => {
    const updatedPhotos = formData.spacePhotos.map(photo => 
      photo.id === photoId ? { ...photo, caption: newCaption } : photo
    );
    updateFormData('spacePhotos', null, updatedPhotos);
  }, [formData.spacePhotos, updateFormData]);

  const getCategoryName = useCallback((category: string) => {
    const categories = {
      exterior: language === 'fr' ? 'Extérieur' : 'Exterior',
      interior: language === 'fr' ? 'Intérieur' : 'Interior',
      entry: language === 'fr' ? 'Points d\'entrée' : 'Entry points',
      hazards: language === 'fr' ? 'Dangers' : 'Hazards',
      equipment: language === 'fr' ? 'Équipement' : 'Equipment',
      safety: language === 'fr' ? 'Sécurité' : 'Safety',
      general: language === 'fr' ? 'Général' : 'General'
    };
    return categories[category as keyof typeof categories] || category;
  }, [language]);

  // États pour le carrousel
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // =================== COMPOSANT CARROUSEL PHOTO COMPLET ===================
  const PhotoCarousel = ({ 
    photos, 
    onAddPhoto, 
    onRemovePhoto, 
    onUpdateCaption,
    currentIndex,
    setCurrentIndex,
    isMobile,
    language 
  }: {
    photos: SpacePhoto[];
    onAddPhoto: () => void;
    onRemovePhoto: (id: string) => void;
    onUpdateCaption: (id: string, caption: string) => void;
    currentIndex: number;
    setCurrentIndex: (index: number) => void;
    isMobile: boolean;
    language: Language;
  }) => {
    const totalSlides = photos.length + 1; // +1 pour le bouton "Ajouter"

    const nextSlide = useCallback(() => {
      setCurrentIndex((currentIndex + 1) % totalSlides);
    }, [currentIndex, totalSlides, setCurrentIndex]);

    const prevSlide = useCallback(() => {
      setCurrentIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
    }, [currentIndex, totalSlides, setCurrentIndex]);

    const goToSlide = useCallback((index: number) => {
      setCurrentIndex(index);
    }, [setCurrentIndex]);

    return (
      <div style={{
        position: 'relative',
        margin: '20px 0',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '300px' : '400px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            transition: 'transform 0.3s ease',
            height: '100%',
            transform: `translateX(-${currentIndex * 100}%)`
          }}>
            {photos.map((photo: SpacePhoto) => (
              <div key={photo.id} style={{
                minWidth: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={photo.url} 
                  alt={photo.caption} 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
                  color: 'white',
                  padding: isMobile ? '15px 12px 12px' : '20px 16px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ flex: 1, marginRight: '12px' }}>
                    <h4 style={{
                      margin: '0 0 4px',
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '600'
                    }}>
                      {getCategoryName(photo.category)}
                    </h4>
                    <p style={{
                      margin: '0 0 2px',
                      fontSize: isMobile ? '11px' : '12px',
                      opacity: 0.8
                    }}>
                      {new Date(photo.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                    </p>
                    {photo.gpsCoords && (
                      <p style={{
                        margin: '0 0 2px',
                        fontSize: isMobile ? '10px' : '11px',
                        opacity: 0.7
                      }}>
                        📍 GPS: {photo.gpsCoords.lat.toFixed(6)}, {photo.gpsCoords.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => {
                        const newCaption = prompt(
                          language === 'fr' ? 'Nouvelle légende:' : 'New caption:', 
                          photo.caption
                        );
                        if (newCaption) {
                          onUpdateCaption(photo.id, newCaption);
                        }
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '28px',
                        minHeight: '28px'
                      }}
                    >
                      <Settings size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(language === 'fr' ? 'Supprimer cette photo?' : 'Delete this photo?')) {
                          onRemovePhoto(photo.id);
                        }
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '28px',
                        minHeight: '28px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Slide pour ajouter une photo */}
            <div style={{
              minWidth: '100%',
              height: '100%',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '2px dashed rgba(6, 182, 212, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }} onClick={onAddPhoto}>
              <div style={{
                width: isMobile ? '48px' : '56px',
                height: isMobile ? '48px' : '56px',
                background: 'rgba(6, 182, 212, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Camera size={isMobile ? 24 : 28} color="#06b6d4" />
              </div>
              <h4 style={{
                margin: 0,
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                color: '#06b6d4'
              }}>
                {t.addPhoto}
              </h4>
              <p style={{
                margin: 0,
                fontSize: isMobile ? '14px' : '15px',
                color: '#67e8f9'
              }}>
                {t.takePhoto}
              </p>
            </div>
          </div>

          {/* Navigation arrows */}
          {totalSlides > 1 && (
            <>
              <button 
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: isMobile ? '12px' : '16px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  color: 'white',
                  width: isMobile ? '36px' : '44px',
                  height: isMobile ? '36px' : '44px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                <ArrowLeft size={isMobile ? 16 : 20} />
              </button>
              <button 
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: isMobile ? '12px' : '16px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  color: 'white',
                  width: isMobile ? '36px' : '44px',
                  height: isMobile ? '36px' : '44px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                <ArrowRight size={isMobile ? 16 : 20} />
              </button>
            </>
          )}

          {/* Indicators */}
          {totalSlides > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              zIndex: 10
            }}>
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    width: isMobile ? '8px' : '10px',
                    height: isMobile ? '8px' : '10px',
                    borderRadius: '50%',
                    background: index === currentIndex ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // =================== SECTION 5: COMPOSANT ÉVALUATION DES DANGERS ===================
  const HazardAssessmentSection = useMemo(() => {
    // Types de dangers atmosphériques
    const atmosphericHazardTypes = {
      oxygen_deficiency: language === 'fr' ? 'Déficience en oxygène (<19.5%)' : 'Oxygen deficiency (<19.5%)',
      oxygen_enrichment: language === 'fr' ? 'Enrichissement en oxygène (>23%)' : 'Oxygen enrichment (>23%)',
      flammable_gases: language === 'fr' ? 'Gaz inflammables/combustibles' : 'Flammable/combustible gases',
      toxic_gases: language === 'fr' ? 'Gaz toxiques' : 'Toxic gases',
      hydrogen_sulfide: language === 'fr' ? 'Sulfure d\'hydrogène (H2S)' : 'Hydrogen sulfide (H2S)',
      carbon_monoxide: language === 'fr' ? 'Monoxyde de carbone (CO)' : 'Carbon monoxide (CO)',
      carbon_dioxide: language === 'fr' ? 'Dioxyde de carbone (CO2)' : 'Carbon dioxide (CO2)',
      methane: language === 'fr' ? 'Méthane (CH4)' : 'Methane (CH4)',
      ammonia: language === 'fr' ? 'Ammoniac (NH3)' : 'Ammonia (NH3)',
      chlorine: language === 'fr' ? 'Chlore (Cl2)' : 'Chlorine (Cl2)',
      nitrogen: language === 'fr' ? 'Azote (N2)' : 'Nitrogen (N2)',
      argon: language === 'fr' ? 'Argon (Ar)' : 'Argon (Ar)',
      welding_fumes: language === 'fr' ? 'Fumées de soudage' : 'Welding fumes',
      chemical_vapors: language === 'fr' ? 'Vapeurs chimiques' : 'Chemical vapors'
    };

    // Types de dangers physiques
    const physicalHazardTypes = {
      engulfment: language === 'fr' ? 'Ensevelissement/Engloutissement' : 'Engulfment',
      crushing: language === 'fr' ? 'Écrasement par équipement' : 'Crushing by equipment',
      electrical: language === 'fr' ? 'Dangers électriques' : 'Electrical hazards',
      mechanical: language === 'fr' ? 'Dangers mécaniques' : 'Mechanical hazards',
      structural_collapse: language === 'fr' ? 'Effondrement structural' : 'Structural collapse',
      falls: language === 'fr' ? 'Chutes de hauteur' : 'Falls from height',
      temperature_extreme: language === 'fr' ? 'Températures extrêmes' : 'Extreme temperatures',
      noise: language === 'fr' ? 'Bruit excessif' : 'Excessive noise',
      vibration: language === 'fr' ? 'Vibrations' : 'Vibrations',
      radiation: language === 'fr' ? 'Radiation' : 'Radiation',
      chemical_exposure: language === 'fr' ? 'Exposition chimique' : 'Chemical exposure',
      biological: language === 'fr' ? 'Dangers biologiques' : 'Biological hazards',
      confined_space_hazard: language === 'fr' ? 'Configuration de l\'espace' : 'Space configuration',
      traffic: language === 'fr' ? 'Circulation/Trafic' : 'Traffic/Circulation',
      slip_trip: language === 'fr' ? 'Glissades et trébuchements' : 'Slips and trips'
    };

    return (
      <div style={{
        background: 'rgba(31, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '12px',
        marginBottom: isMobile ? '16px' : '24px',
        overflow: 'hidden'
      }}>
        {/* Header de section */}
        <button 
          className="section-toggle"
          onClick={() => {
            setCollapsedSections(prev => {
              const newSet = new Set(prev);
              if (newSet.has('hazardAssessment')) {
                newSet.delete('hazardAssessment');
              } else {
                newSet.add('hazardAssessment');
              }
              return newSet;
            });
          }}
          style={{
            width: '100%',
            padding: isMobile ? '16px' : '20px',
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            minHeight: isMobile ? '60px' : '70px',
            touchAction: 'manipulation'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '12px' : '16px',
            flex: 1
          }}>
            <AlertTriangle style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', color: '#ef4444' }} />
            <h3 style={{
              margin: 0,
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              {t.hazardAssessment}
            </h3>
            <div style={{
              background: '#ef4444',
              color: 'white',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {formData.atmosphericHazards.length + formData.physicalHazards.length}
            </div>
          </div>
          <ChevronDown 
            size={20} 
            style={{
              transition: 'transform 0.2s ease',
              transform: collapsedSections.has('hazardAssessment') ? 'rotate(0deg)' : 'rotate(180deg)'
            }}
          />
        </button>
        
        {/* Contenu de la section */}
        {!collapsedSections.has('hazardAssessment') && (
          <div style={{
            padding: isMobile ? '16px' : '24px',
            borderTop: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            
            {/* Instructions */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Info size={16} color="#60a5fa" />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#93c5fd' }}>
                  {t.selectHazards}
                </span>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '13px', 
                color: '#bfdbfe', 
                lineHeight: 1.4 
              }}>
                {language === 'fr' ? 
                  'Identifiez tous les dangers présents ou potentiels dans l\'espace. Cette évaluation est cruciale pour la classification CSA.' :
                  'Identify all present or potential hazards in the space. This assessment is crucial for CSA classification.'}
              </p>
            </div>

            {/* Section Dangers Atmosphériques */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Wind size={20} color="#f59e0b" />
                {t.atmosphericHazards}
                <div style={{
                  background: '#f59e0b',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {formData.atmosphericHazards.length}
                </div>
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px'
              }}>
                {Object.entries(atmosphericHazardTypes).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      const currentHazards = formData.atmosphericHazards;
                      const updatedHazards = currentHazards.includes(key)
                        ? currentHazards.filter(h => h !== key)
                        : [...currentHazards, key];
                      
                      updateFormData('atmosphericHazards', null, updatedHazards);
                    }}
                    style={{
                      padding: '12px',
                      border: `2px solid ${formData.atmosphericHazards.includes(key) ? '#f59e0b' : 'rgba(75, 85, 99, 0.5)'}`,
                      borderRadius: '8px',
                      background: formData.atmosphericHazards.includes(key) ? 'rgba(245, 158, 11, 0.1)' : 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      minHeight: '60px'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: `2px solid ${formData.atmosphericHazards.includes(key) ? '#f59e0b' : 'rgba(75, 85, 99, 0.5)'}`,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      background: formData.atmosphericHazards.includes(key) ? '#f59e0b' : 'transparent'
                    }}>
                      {formData.atmosphericHazards.includes(key) && (
                        <Check size={14} color="white" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: isMobile ? '13px' : '14px',
                        fontWeight: '600',
                        marginBottom: '4px',
                        color: formData.atmosphericHazards.includes(key) ? '#fbbf24' : '#ffffff'
                      }}>
                        🌪️ {label}
                      </div>
                      {formData.atmosphericHazards.includes(key) && (
                        <div style={{
                          fontSize: '11px',
                          color: '#fde68a',
                          fontStyle: 'italic'
                        }}>
                          {language === 'fr' ? 'Danger identifié' : 'Hazard identified'}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section Dangers Physiques */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Wrench size={20} color="#ef4444" />
                {t.physicalHazards}
                <div style={{
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {formData.physicalHazards.length}
                </div>
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px'
              }}>
                {Object.entries(physicalHazardTypes).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      const currentHazards = formData.physicalHazards;
                      const updatedHazards = currentHazards.includes(key)
                        ? currentHazards.filter(h => h !== key)
                        : [...currentHazards, key];
                      
                      updateFormData('physicalHazards', null, updatedHazards);
                    }}
                    style={{
                      padding: '12px',
                      border: `2px solid ${formData.physicalHazards.includes(key) ? '#ef4444' : 'rgba(75, 85, 99, 0.5)'}`,
                      borderRadius: '8px',
                      background: formData.physicalHazards.includes(key) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      minHeight: '60px'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: `2px solid ${formData.physicalHazards.includes(key) ? '#ef4444' : 'rgba(75, 85, 99, 0.5)'}`,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      background: formData.physicalHazards.includes(key) ? '#ef4444' : 'transparent'
                    }}>
                      {formData.physicalHazards.includes(key) && (
                        <Check size={14} color="white" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: isMobile ? '13px' : '14px',
                        fontWeight: '600',
                        marginBottom: '4px',
                        color: formData.physicalHazards.includes(key) ? '#fca5a5' : '#ffffff'
                      }}>
                        ⚡ {label}
                      </div>
                      {formData.physicalHazards.includes(key) && (
                        <div style={{
                          fontSize: '11px',
                          color: '#fecaca',
                          fontStyle: 'italic'
                        }}>
                          {language === 'fr' ? 'Danger identifié' : 'Hazard identified'}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Résumé des dangers identifiés */}
            {(formData.atmosphericHazards.length > 0 || formData.physicalHazards.length > 0) && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <h5 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#fca5a5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={18} />
                  {language === 'fr' ? `${formData.atmosphericHazards.length + formData.physicalHazards.length} Dangers Identifiés` : `${formData.atmosphericHazards.length + formData.physicalHazards.length} Hazards Identified`}
                </h5>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '20px'
                }}>
                  {/* Dangers atmosphériques */}
                  <div>
                    <h6 style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#fbbf24'
                    }}>
                      🌪️ {t.atmosphericHazards} ({formData.atmosphericHazards.length})
                    </h6>
                    {formData.atmosphericHazards.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#fde68a' }}>
                        {formData.atmosphericHazards.map(hazard => (
                          <li key={hazard} style={{ fontSize: '12px', marginBottom: '2px' }}>
                            {atmosphericHazardTypes[hazard as keyof typeof atmosphericHazardTypes]}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ margin: 0, fontSize: '12px', color: '#86efac', fontStyle: 'italic' }}>
                        {language === 'fr' ? 'Aucun danger atmosphérique identifié' : 'No atmospheric hazards identified'}
                      </p>
                    )}
                  </div>

                  {/* Dangers physiques */}
                  <div>
                    <h6 style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#fca5a5'
                    }}>
                      ⚡ {t.physicalHazards} ({formData.physicalHazards.length})
                    </h6>
                    {formData.physicalHazards.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#fecaca' }}>
                        {formData.physicalHazards.map(hazard => (
                          <li key={hazard} style={{ fontSize: '12px', marginBottom: '2px' }}>
                            {physicalHazardTypes[hazard as keyof typeof physicalHazardTypes]}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ margin: 0, fontSize: '12px', color: '#86efac', fontStyle: 'italic' }}>
                        {language === 'fr' ? 'Aucun danger physique identifié' : 'No physical hazards identified'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Impact sur la classification CSA */}
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#93c5fd',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    📊 {language === 'fr' ? 'Impact sur la classification CSA:' : 'Impact on CSA classification:'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#bfdbfe' }}>
                    {(() => {
                      const totalHazards = formData.atmosphericHazards.length + formData.physicalHazards.length;
                      if (totalHazards >= 5) {
                        return language === 'fr' ? 
                          '🔴 Forte probabilité de Classe 1 (Danger immédiat)' : 
                          '🔴 High probability of Class 1 (Immediate danger)';
                      } else if (totalHazards >= 2) {
                        return language === 'fr' ? 
                          '🟡 Probable Classe 2 (Risque potentiel)' : 
                          '🟡 Likely Class 2 (Potential risk)';
                      } else if (totalHazards === 1) {
                        return language === 'fr' ? 
                          '🟡 Possible Classe 2 ou 3 selon la gravité' : 
                          '🟡 Possible Class 2 or 3 depending on severity';
                      } else {
                        return language === 'fr' ? 
                          '🟢 Probable Classe 3 (Risque minimal)' : 
                          '🟢 Likely Class 3 (Minimal risk)';
                      }
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Message si aucun danger */}
            {formData.atmosphericHazards.length === 0 && formData.physicalHazards.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '2px dashed rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                color: '#86efac'
              }}>
                <Shield size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                  {language === 'fr' ? 'Aucun danger identifié' : 'No hazards identified'}
                </h4>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  {language === 'fr' ? 
                    'Sélectionnez tous les dangers présents ou potentiels dans l\'espace' : 
                    'Select all present or potential hazards in the space'}
                </p>
              </div>
            )}

            {/* Recommandations de sécurité */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Shield size={16} color="#10b981" />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#6ee7b7' }}>
                  {language === 'fr' ? 'Recommandations de sécurité' : 'Safety recommendations'}
                </span>
              </div>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '20px', 
                color: '#86efac', 
                fontSize: '13px', 
                lineHeight: 1.4 
              }}>
                <li>{language === 'fr' ? 'Effectuez des tests atmosphériques avant l\'entrée' : 'Perform atmospheric testing before entry'}</li>
                <li>{language === 'fr' ? 'Documentez tous les dangers identifiés' : 'Document all identified hazards'}</li>
                <li>{language === 'fr' ? 'Établissez des mesures de contrôle appropriées' : 'Establish appropriate control measures'}</li>
                <li>{language === 'fr' ? 'Formez les travailleurs sur les dangers spécifiques' : 'Train workers on specific hazards'}</li>
                <li>{language === 'fr' ? 'Réévaluez périodiquement les conditions' : 'Periodically reassess conditions'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }, [
    formData.atmosphericHazards,
    formData.physicalHazards,
    collapsedSections,
    isMobile,
    t,
    language,
    updateFormData
  ]);

  // =================== SECTION 4: COMPOSANT POINTS D'ENTRÉE ===================
  const EntryPointsSection = useMemo(() => {
    return (
      <div style={{
        background: 'rgba(31, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '12px',
        marginBottom: isMobile ? '16px' : '24px',
        overflow: 'hidden'
      }}>
        {/* Header de section */}
        <button 
          className="section-toggle"
          onClick={() => {
            setCollapsedSections(prev => {
              const newSet = new Set(prev);
              if (newSet.has('entryPoints')) {
                newSet.delete('entryPoints');
              } else {
                newSet.add('entryPoints');
              }
              return newSet;
            });
          }}
          style={{
            width: '100%',
            padding: isMobile ? '16px' : '20px',
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            minHeight: isMobile ? '60px' : '70px',
            touchAction: 'manipulation'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '12px' : '16px',
            flex: 1
          }}>
            <ArrowRight style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', color: '#8b5cf6' }} />
            <h3 style={{
              margin: 0,
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              {t.entryPoints}
            </h3>
            <div style={{
              background: '#8b5cf6',
              color: 'white',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {formData.entryPoints.length}
            </div>
          </div>
          <ChevronDown 
            size={20} 
            style={{
              transition: 'transform 0.2s ease',
              transform: collapsedSections.has('entryPoints') ? 'rotate(0deg)' : 'rotate(180deg)'
            }}
          />
        </button>
        
        {/* Contenu de la section */}
        {!collapsedSections.has('entryPoints') && (
          <div style={{
            padding: isMobile ? '16px' : '24px',
            borderTop: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            
            {/* Bouton d'ajout de point d'entrée */}
            <div style={{ marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  const newEntry: EntryPoint = {
                    id: `entry-${Date.now()}`,
                    type: 'circular',
                    dimensions: '',
                    location: '',
                    condition: 'good',
                    accessibility: 'normal',
                    photos: []
                  };
                  
                  updateFormData('entryPoints', null, [...formData.entryPoints, newEntry]);
                }}
                style={{
                  padding: isMobile ? '12px 20px' : '14px 24px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '48px',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Plus size={16} />
                {t.addEntryPoint}
              </button>
            </div>

            {/* Liste des points d'entrée */}
            {formData.entryPoints.map((entry, index) => (
              <div 
                key={entry.id} 
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  overflow: 'hidden'
                }}
              >
                {/* Header du point d'entrée */}
                <div style={{
                  padding: '16px',
                  borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(139, 92, 246, 0.1)'
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: isMobile ? '15px' : '16px',
                    fontWeight: '600',
                    color: '#c4b5fd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ 
                      background: '#8b5cf6', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: '24px', 
                      height: '24px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {index + 1}
                    </span>
                    {t.entryPoint} {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.entryPoints.length <= 1) {
                        alert(language === 'fr' ? 'Au moins un point d\'entrée est requis' : 'At least one entry point is required');
                        return;
                      }
                      
                      const updatedEntries = formData.entryPoints.filter(e => e.id !== entry.id);
                      updateFormData('entryPoints', null, updatedEntries);
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    title={language === 'fr' ? 'Supprimer ce point d\'entrée' : 'Delete this entry point'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Contenu du point d'entrée */}
                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    
                    {/* Type d'entrée */}
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#d1d5db',
                        fontSize: isMobile ? '14px' : '15px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        <Home size={16} />
                        {t.entryType}<span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={entry.type}
                        onChange={(e) => {
                          const updatedEntries = formData.entryPoints.map(ep =>
                            ep.id === entry.id ? { ...ep, type: e.target.value } : ep
                          );
                          updateFormData('entryPoints', null, updatedEntries);
                        }}
                        style={{
                          width: '100%',
                          padding: isMobile ? '12px 16px' : '14px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(75, 85, 99, 0.5)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: isMobile ? '16px' : '15px',
                          fontWeight: '500',
                          minHeight: isMobile ? '48px' : '50px',
                          fontFamily: 'inherit'
                        }}
                      >
                        <option value="circular">🔵 Circulaire</option>
                        <option value="rectangular">📐 Rectangulaire</option>
                        <option value="square">⬜ Carré</option>
                        <option value="oval">⭕ Ovale</option>
                        <option value="hatch">🚪 Trappe</option>
                        <option value="door">🚪 Porte</option>
                        <option value="window">🪟 Fenêtre</option>
                        <option value="opening">🕳️ Ouverture</option>
                        <option value="other">❓ Autre</option>
                      </select>
                    </div>

                    {/* Accessibilité */}
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#d1d5db',
                        fontSize: isMobile ? '14px' : '15px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        <Settings size={16} />
                        {t.entryAccessibility}
                      </label>
                      <select
                        value={entry.accessibility}
                        onChange={(e) => {
                          const updatedEntries = formData.entryPoints.map(ep =>
                            ep.id === entry.id ? { ...ep, accessibility: e.target.value } : ep
                          );
                          updateFormData('entryPoints', null, updatedEntries);
                        }}
                        style={{
                          width: '100%',
                          padding: isMobile ? '12px 16px' : '14px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(75, 85, 99, 0.5)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: isMobile ? '16px' : '15px',
                          fontWeight: '500',
                          minHeight: isMobile ? '48px' : '50px',
                          fontFamily: 'inherit'
                        }}
                      >
                        <option value="easy">🟢 Facile</option>
                        <option value="normal">🟡 Normal</option>
                        <option value="difficult">🟠 Difficile</option>
                        <option value="restricted">🔴 Restreint</option>
                      </select>
                    </div>

                    {/* Dimensions */}
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#d1d5db',
                        fontSize: isMobile ? '14px' : '15px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        <Ruler size={16} />
                        {t.entryDimensions} ({formData.unitSystem === 'metric' ? 'm' : 'ft'})<span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={entry.dimensions}
                        onChange={(e) => {
                          const updatedEntries = formData.entryPoints.map(ep =>
                            ep.id === entry.id ? { ...ep, dimensions: e.target.value } : ep
                          );
                          updateFormData('entryPoints', null, updatedEntries);
                        }}
                        style={{
                          width: '100%',
                          padding: isMobile ? '12px 16px' : '14px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(75, 85, 99, 0.5)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: isMobile ? '16px' : '15px',
                          fontWeight: '500',
                          minHeight: isMobile ? '48px' : '50px',
                          fontFamily: 'inherit'
                        }}
                        placeholder={entry.type === 'circular' ? '⌀ 0.6m' : '0.6m × 0.8m'}
                        maxLength={50}
                      />
                    </div>

                    {/* Condition */}
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#d1d5db',
                        fontSize: isMobile ? '14px' : '15px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        <Activity size={16} />
                        {t.entryCondition}
                      </label>
                      <select
                        value={entry.condition}
                        onChange={(e) => {
                          const updatedEntries = formData.entryPoints.map(ep =>
                            ep.id === entry.id ? { ...ep, condition: e.target.value } : ep
                          );
                          updateFormData('entryPoints', null, updatedEntries);
                        }}
                        style={{
                          width: '100%',
                          padding: isMobile ? '12px 16px' : '14px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(75, 85, 99, 0.5)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: isMobile ? '16px' : '15px',
                          fontWeight: '500',
                          minHeight: isMobile ? '48px' : '50px',
                          fontFamily: 'inherit'
                        }}
                      >
                        <option value="excellent">🟢 Excellent</option>
                        <option value="good">🟡 Bon</option>
                        <option value="fair">🟠 Acceptable</option>
                        <option value="poor">🔴 Mauvais</option>
                        <option value="damaged">💥 Endommagé</option>
                      </select>
                    </div>
                  </div>

                  {/* Localisation - pleine largeur */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#d1d5db',
                      fontSize: isMobile ? '14px' : '15px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      <MapPin size={16} />
                      {t.entryLocation}<span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={entry.location}
                      onChange={(e) => {
                        const updatedEntries = formData.entryPoints.map(ep =>
                          ep.id === entry.id ? { ...ep, location: e.target.value } : ep
                        );
                        updateFormData('entryPoints', null, updatedEntries);
                      }}
                      style={{
                        width: '100%',
                        padding: isMobile ? '12px 16px' : '14px 16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(75, 85, 99, 0.5)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: isMobile ? '16px' : '15px',
                        fontWeight: '500',
                        minHeight: isMobile ? '48px' : '50px',
                        fontFamily: 'inherit'
                      }}
                      placeholder="Face nord, côté équipement principal"
                      maxLength={100}
                    />
                  </div>

                  {/* Résumé visuel du point d'entrée */}
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '16px'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#c4b5fd'
                    }}>
                      <div>
                        <strong>Type:</strong><br />
                        {entry.type === 'circular' && '🔵 Circulaire'}
                        {entry.type === 'rectangular' && '📐 Rectangulaire'}
                        {entry.type === 'square' && '⬜ Carré'}
                        {entry.type === 'oval' && '⭕ Ovale'}
                        {entry.type === 'hatch' && '🚪 Trappe'}
                        {entry.type === 'door' && '🚪 Porte'}
                        {entry.type === 'window' && '🪟 Fenêtre'}
                        {entry.type === 'opening' && '🕳️ Ouverture'}
                        {entry.type === 'other' && '❓ Autre'}
                      </div>
                      <div>
                        <strong>Taille:</strong><br />
                        {entry.dimensions || 'Non spécifiée'}
                      </div>
                      <div>
                        <strong>Accès:</strong><br />
                        {entry.accessibility === 'easy' && '🟢 Facile'}
                        {entry.accessibility === 'normal' && '🟡 Normal'}
                        {entry.accessibility === 'difficult' && '🟠 Difficile'}
                        {entry.accessibility === 'restricted' && '🔴 Restreint'}
                      </div>
                      <div>
                        <strong>État:</strong><br />
                        {entry.condition === 'excellent' && '🟢 Excellent'}
                        {entry.condition === 'good' && '🟡 Bon'}
                        {entry.condition === 'fair' && '🟠 Acceptable'}
                        {entry.condition === 'poor' && '🔴 Mauvais'}
                        {entry.condition === 'damaged' && '💥 Endommagé'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Message si aucun point d'entrée */}
            {formData.entryPoints.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '2px dashed rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                color: '#c4b5fd'
              }}>
                <ArrowRight size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                  {language === 'fr' ? 'Aucun point d\'entrée défini' : 'No entry points defined'}
                </h4>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  {language === 'fr' ? 
                    'Cliquez sur "Ajouter point d\'entrée" pour commencer' : 
                    'Click "Add entry point" to get started'}
                </p>
              </div>
            )}

            {/* Aide et recommandations */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Info size={16} color="#60a5fa" />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#93c5fd' }}>
                  {language === 'fr' ? 'Recommandations' : 'Recommendations'}
                </span>
              </div>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '20px', 
                color: '#bfdbfe', 
                fontSize: '13px', 
                lineHeight: 1.4 
              }}>
                <li>{language === 'fr' ? 'Documentez tous les points d\'entrée possibles' : 'Document all possible entry points'}</li>
                <li>{language === 'fr' ? 'Mesurez précisément les dimensions' : 'Measure dimensions accurately'}</li>
                <li>{language === 'fr' ? 'Évaluez l\'accessibilité pour l\'équipement d\'urgence' : 'Assess accessibility for emergency equipment'}</li>
                <li>{language === 'fr' ? 'Notez l\'état structurel de chaque ouverture' : 'Note structural condition of each opening'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }, [
    formData.entryPoints,
    formData.unitSystem,
    collapsedSections,
    isMobile,
    t,
    language,
    updateFormData
  ]);

  // =================== SECTION 3: COMPOSANT DIMENSIONS ET VOLUME ===================
  const DimensionsSection = useMemo(() => {
    return (
      <div style={{
        background: 'rgba(31, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '12px',
        marginBottom: isMobile ? '16px' : '24px',
        overflow: 'hidden'
      }}>
        {/* Header de section */}
        <button 
          className="section-toggle"
          onClick={() => {
            setCollapsedSections(prev => {
              const newSet = new Set(prev);
              if (newSet.has('dimensions')) {
                newSet.delete('dimensions');
              } else {
                newSet.add('dimensions');
              }
              return newSet;
            });
          }}
          style={{
            width: '100%',
            padding: isMobile ? '16px' : '20px',
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            minHeight: isMobile ? '60px' : '70px',
            touchAction: 'manipulation'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '12px' : '16px',
            flex: 1
          }}>
            <Layers style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', color: '#10b981' }} />
            <h3 style={{
              margin: 0,
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              {t.spaceDimensions}
            </h3>
          </div>
          <ChevronDown 
            size={20} 
            style={{
              transition: 'transform 0.2s ease',
              transform: collapsedSections.has('dimensions') ? 'rotate(0deg)' : 'rotate(180deg)'
            }}
          />
        </button>
        
        {/* Contenu de la section */}
        {!collapsedSections.has('dimensions') && (
          <div style={{
            padding: isMobile ? '16px' : '24px',
            borderTop: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            
            {/* Sélecteurs de forme et unités */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
              marginBottom: '24px',
              padding: '20px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px'
            }}>
              
              {/* Forme de l'espace */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <Layers size={16} />
                  {t.spaceShape}<span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.dimensions.spaceShape}
                  onChange={(e) => {
                    updateFormData('dimensions', null, {
                      ...formData.dimensions,
                      spaceShape: e.target.value,
                      volume: 0 // Reset volume when shape changes
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    minHeight: isMobile ? '48px' : '50px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="rectangular">📐 {t.rectangular}</option>
                  <option value="cylindrical">🔵 {t.cylindrical}</option>
                  <option value="spherical">⚪ {t.spherical}</option>
                  <option value="irregular">🔷 {t.irregular}</option>
                </select>
              </div>

              {/* Système d'unités */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <Ruler size={16} />
                  {t.unitSystem}
                </label>
                <select
                  value={formData.unitSystem}
                  onChange={(e) => {
                    const newSystem = e.target.value as UnitSystem;
                    const oldSystem = formData.unitSystem;
                    
                    // Conversion des unités
                    let conversionFactor = 1;
                    if (oldSystem === 'metric' && newSystem === 'imperial') {
                      conversionFactor = 3.28084;
                    } else if (oldSystem === 'imperial' && newSystem === 'metric') {
                      conversionFactor = 0.3048;
                    }
                    
                    if (conversionFactor !== 1) {
                      const convertedDimensions = {
                        ...formData.dimensions,
                        length: Math.round(formData.dimensions.length * conversionFactor * 100) / 100,
                        width: Math.round(formData.dimensions.width * conversionFactor * 100) / 100,
                        height: Math.round(formData.dimensions.height * conversionFactor * 100) / 100,
                        diameter: Math.round(formData.dimensions.diameter * conversionFactor * 100) / 100,
                        volume: 0 // Reset volume when units change
                      };
                      updateFormData('dimensions', null, convertedDimensions);
                    }
                    
                    updateFormData('unitSystem', null, newSystem);
                  }}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    minHeight: isMobile ? '48px' : '50px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="metric">📏 {t.metric}</option>
                  <option value="imperial">📐 {t.imperial}</option>
                </select>
              </div>
            </div>

            {/* Champs de dimensions adaptatifs selon la forme */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: isMobile ? '12px' : '16px',
              marginBottom: '24px'
            }}>
              
              {/* Longueur - visible sauf pour sphérique */}
              {formData.dimensions.spaceShape !== 'spherical' && (
                <div>
                  <label style={{
                    color: '#d1d5db',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    display: 'block'
                  }}>
                    {t.length} ({formData.unitSystem === 'metric' ? 'm' : 'ft'})
                    {(formData.dimensions.spaceShape === 'rectangular' || formData.dimensions.spaceShape === 'irregular') && 
                     <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.dimensions.length || ''}
                    onChange={(e) => updateFormData('dimensions', null, {
                      ...formData.dimensions,
                      length: parseFloat(e.target.value) || 0
                    })}
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px 12px' : '12px 14px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '15px' : '14px',
                      fontWeight: '500',
                      minHeight: isMobile ? '44px' : '46px',
                      fontFamily: 'inherit'
                    }}
                    placeholder="0.0"
                  />
                </div>
              )}

              {/* Largeur - seulement pour rectangulaire et irrégulier */}
              {(formData.dimensions.spaceShape === 'rectangular' || 
                formData.dimensions.spaceShape === 'irregular') && (
                <div>
                  <label style={{
                    color: '#d1d5db',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    display: 'block'
                  }}>
                    {t.width} ({formData.unitSystem === 'metric' ? 'm' : 'ft'})<span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.dimensions.width || ''}
                    onChange={(e) => updateFormData('dimensions', null, {
                      ...formData.dimensions,
                      width: parseFloat(e.target.value) || 0
                    })}
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px 12px' : '12px 14px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '15px' : '14px',
                      fontWeight: '500',
                      minHeight: isMobile ? '44px' : '46px',
                      fontFamily: 'inherit'
                    }}
                    placeholder="0.0"
                  />
                </div>
              )}

              {/* Hauteur - pour toutes les formes sauf sphérique */}
              {formData.dimensions.spaceShape !== 'spherical' && (
                <div>
                  <label style={{
                    color: '#d1d5db',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    display: 'block'
                  }}>
                    {t.height} ({formData.unitSystem === 'metric' ? 'm' : 'ft'})<span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.dimensions.height || ''}
                    onChange={(e) => updateFormData('dimensions', null, {
                      ...formData.dimensions,
                      height: parseFloat(e.target.value) || 0
                    })}
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px 12px' : '12px 14px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '15px' : '14px',
                      fontWeight: '500',
                      minHeight: isMobile ? '44px' : '46px',
                      fontFamily: 'inherit'
                    }}
                    placeholder="0.0"
                  />
                </div>
              )}

              {/* Diamètre - pour cylindrique et sphérique */}
              {(formData.dimensions.spaceShape === 'cylindrical' || 
                formData.dimensions.spaceShape === 'spherical') && (
                <div>
                  <label style={{
                    color: '#d1d5db',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    display: 'block'
                  }}>
                    {t.diameter} ({formData.unitSystem === 'metric' ? 'm' : 'ft'})<span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.dimensions.diameter || ''}
                    onChange={(e) => updateFormData('dimensions', null, {
                      ...formData.dimensions,
                      diameter: parseFloat(e.target.value) || 0
                    })}
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px 12px' : '12px 14px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: isMobile ? '15px' : '14px',
                      fontWeight: '500',
                      minHeight: isMobile ? '44px' : '46px',
                      fontFamily: 'inherit'
                    }}
                    placeholder="0.0"
                  />
                </div>
              )}
            </div>

            {/* Bouton de calcul du volume */}
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <button 
                type="button"
                onClick={() => {
                  const { length, width, height, diameter, spaceShape } = formData.dimensions;
                  let volume = 0;
                  
                  switch (spaceShape) {
                    case 'rectangular':
                      if (length > 0 && width > 0 && height > 0) {
                        volume = length * width * height;
                      }
                      break;
                    case 'cylindrical':
                      if (diameter > 0 && height > 0) {
                        const radius = diameter / 2;
                        volume = Math.PI * Math.pow(radius, 2) * height;
                      } else if (diameter > 0 && length > 0) {
                        const radius = diameter / 2;
                        volume = Math.PI * Math.pow(radius, 2) * length;
                      }
                      break;
                    case 'spherical':
                      if (diameter > 0) {
                        const radius = diameter / 2;
                        volume = (4/3) * Math.PI * Math.pow(radius, 3);
                      }
                      break;
                    case 'irregular':
                      if (length > 0 && width > 0 && height > 0) {
                        volume = length * width * height * 0.85; // Facteur d'approximation
                      }
                      break;
                  }
                  
                  const roundedVolume = Math.round(volume * 100) / 100;
                  updateFormData('dimensions', null, {
                    ...formData.dimensions,
                    volume: roundedVolume
                  });
                }}
                style={{
                  padding: isMobile ? '12px 20px' : '14px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minHeight: isMobile ? '48px' : '50px',
                  fontSize: isMobile ? '14px' : '15px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  margin: '0 auto'
                }}
              >
                <Gauge size={20} />
                {t.calculateVolume}
              </button>
            </div>

            {/* Affichage du volume calculé */}
            {formData.dimensions.volume > 0 && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                marginTop: '20px'
              }}>
                <div style={{ 
                  fontSize: isMobile ? '28px' : '32px', 
                  fontWeight: '700', 
                  color: '#10b981', 
                  marginBottom: '8px'
                }}>
                  {formData.dimensions.volume}
                </div>
                <div style={{ 
                  fontSize: isMobile ? '16px' : '18px', 
                  color: '#6ee7b7',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {formData.unitSystem === 'metric' ? 'm³' : 'ft³'} - {t.volume}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#86efac',
                  fontStyle: 'italic'
                }}>
                  {language === 'fr' ? 'Forme' : 'Shape'}: {t[formData.dimensions.spaceShape as keyof typeof t] || formData.dimensions.spaceShape}
                </div>
              </div>
            )}

            {/* Aide visuelle selon la forme */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Info size={16} color="#60a5fa" />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#93c5fd' }}>
                  {language === 'fr' ? 'Aide pour' : 'Help for'} {t[formData.dimensions.spaceShape as keyof typeof t]}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#bfdbfe', lineHeight: 1.4 }}>
                {formData.dimensions.spaceShape === 'rectangular' && (
                  language === 'fr' ? 
                  'Volume = Longueur × Largeur × Hauteur. Tous les champs sont requis.' :
                  'Volume = Length × Width × Height. All fields are required.'
                )}
                {formData.dimensions.spaceShape === 'cylindrical' && (
                  language === 'fr' ? 
                  'Volume = π × (Diamètre/2)² × Hauteur. Diamètre et hauteur requis.' :
                  'Volume = π × (Diameter/2)² × Height. Diameter and height required.'
                )}
                {formData.dimensions.spaceShape === 'spherical' && (
                  language === 'fr' ? 
                  'Volume = (4/3) × π × (Diamètre/2)³. Seul le diamètre est requis.' :
                  'Volume = (4/3) × π × (Diameter/2)³. Only diameter is required.'
                )}
                {formData.dimensions.spaceShape === 'irregular' && (
                  language === 'fr' ? 
                  'Volume approximatif = Longueur × Largeur × Hauteur × 0.85 (facteur de forme).' :
                  'Approximate volume = Length × Width × Height × 0.85 (shape factor).'
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [
    formData.dimensions, 
    formData.unitSystem,
    collapsedSections,
    isMobile,
    t,
    language,
    updateFormData
  ]);

  // =================== SECTION 2: COMPOSANT IDENTIFICATION ESPACE ===================
  const SpaceIdentificationSection = useMemo(() => {
    return (
      <div style={{
        background: 'rgba(31, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '12px',
        marginBottom: isMobile ? '16px' : '24px',
        overflow: 'hidden'
      }}>
        {/* Header de section */}
        <button 
          className="section-toggle"
          onClick={() => {
            setCollapsedSections(prev => {
              const newSet = new Set(prev);
              if (newSet.has('spaceIdentification')) {
                newSet.delete('spaceIdentification');
              } else {
                newSet.add('spaceIdentification');
              }
              return newSet;
            });
          }}
          style={{
            width: '100%',
            padding: isMobile ? '16px' : '20px',
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            minHeight: isMobile ? '60px' : '70px',
            touchAction: 'manipulation'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '12px' : '16px',
            flex: 1
          }}>
            <Shield style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', color: '#f59e0b' }} />
            <h3 style={{
              margin: 0,
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              {t.spaceIdentification}
            </h3>
          </div>
          <ChevronDown 
            size={20} 
            style={{
              transition: 'transform 0.2s ease',
              transform: collapsedSections.has('spaceIdentification') ? 'rotate(0deg)' : 'rotate(180deg)'
            }}
          />
        </button>
        
        {/* Contenu de la section */}
        {!collapsedSections.has('spaceIdentification') && (
          <div style={{
            padding: isMobile ? '16px' : '24px',
            borderTop: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            
            {/* Sélecteur de type d'espace */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#d1d5db',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                <Building size={16} />
                {t.spaceType}<span style={{ color: '#ef4444' }}>*</span>
              </label>
              
              {/* Grille des types d'espaces */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '16px'
              }}>
                {Object.entries(t.spaceTypes).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateProjectInfo('spaceType', key)}
                    style={{
                      padding: '16px 12px',
                      border: `2px solid ${formData.spaceType === key ? '#3b82f6' : 'rgba(75, 85, 99, 0.5)'}`,
                      borderRadius: '8px',
                      background: formData.spaceType === key ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: isMobile ? '12px' : '13px',
                      fontWeight: '600'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                      {key === 'tank' && '🛢️'}
                      {key === 'vessel' && '⚗️'}
                      {key === 'silo' && '🏗️'}
                      {key === 'pit' && '🕳️'}
                      {key === 'vault' && '🏛️'}
                      {key === 'tunnel' && '🚇'}
                      {key === 'trench' && '⛏️'}
                      {key === 'manhole' && '🔘'}
                      {key === 'storage' && '📦'}
                      {key === 'boiler' && '🔥'}
                      {key === 'duct' && '🌀'}
                      {key === 'chamber' && '🏠'}
                      {key === 'other' && '❓'}
                    </div>
                    <span style={{ wordWrap: 'break-word', hyphens: 'auto' }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Classification CSA */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#d1d5db',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                <Shield size={16} />
                {t.csaClass}<span style={{ color: '#ef4444' }}>*</span>
              </label>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                {Object.entries(t.csaClasses).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateProjectInfo('csaClass', key)}
                    style={{
                      padding: '16px',
                      border: `2px solid ${formData.csaClass === key ? 
                        (key === 'class1' ? '#ef4444' : key === 'class2' ? '#f59e0b' : '#10b981') : 
                        'rgba(75, 85, 99, 0.5)'}`,
                      borderRadius: '8px',
                      background: formData.csaClass === key ? 
                        (key === 'class1' ? 'rgba(239, 68, 68, 0.1)' : 
                         key === 'class2' ? 'rgba(245, 158, 11, 0.1)' : 
                         'rgba(16, 185, 129, 0.1)') : 
                        'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: isMobile ? '14px' : '15px',
                      fontWeight: '700',
                      color: formData.csaClass === key ? 
                        (key === 'class1' ? '#fca5a5' : key === 'class2' ? '#fbbf24' : '#86efac') : 
                        '#ffffff'
                    }}>
                      <span style={{ fontSize: '18px' }}>
                        {key === 'class1' ? '🔴' : key === 'class2' ? '🟡' : '🟢'}
                      </span>
                      {label.split(' - ')[0]}
                    </div>
                    <div style={{
                      fontSize: isMobile ? '11px' : '12px',
                      color: formData.csaClass === key ? 
                        (key === 'class1' ? '#fecaca' : key === 'class2' ? '#fde68a' : '#bbf7d0') : 
                        '#9ca3af',
                      lineHeight: 1.3
                    }}>
                      {label.split(' - ')[1]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Autres champs d'identification */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '20px'
            }}>
              
              {/* Méthode d'entrée */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <ArrowRight size={16} />
                  {t.entryMethod}
                </label>
                <select
                  value={formData.entryMethod}
                  onChange={(e) => updateProjectInfo('entryMethod', e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    minHeight: isMobile ? '48px' : '50px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="">Sélectionner...</option>
                  <option value="top">Entrée par le haut</option>
                  <option value="side">Entrée latérale</option>
                  <option value="bottom">Entrée par le bas</option>
                  <option value="multiple">Entrées multiples</option>
                </select>
              </div>

              {/* Type d'accès */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <MapPin size={16} />
                  {t.accessType}
                </label>
                <select
                  value={formData.accessType}
                  onChange={(e) => updateProjectInfo('accessType', e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    minHeight: isMobile ? '48px' : '50px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="">Sélectionner...</option>
                  <option value="easy">Accès facile</option>
                  <option value="moderate">Accès modéré</option>
                  <option value="difficult">Accès difficile</option>
                  <option value="restricted">Accès restreint</option>
                </select>
              </div>

              {/* Localisation de l'espace */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <Navigation size={16} />
                  {t.spaceLocation}
                </label>
                <input
                  type="text"
                  value={formData.spaceLocation}
                  onChange={(e) => updateProjectInfo('spaceLocation', e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    minHeight: isMobile ? '48px' : '50px',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Bâtiment A, Niveau -1"
                  maxLength={100}
                />
              </div>

              {/* Champ vide pour équilibrer la grille */}
              <div></div>
              
              {/* Description de l'espace - pleine largeur */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <FileText size={16} />
                  {t.spaceDescription}
                </label>
                <textarea
                  value={formData.spaceDescription}
                  onChange={(e) => updateProjectInfo('spaceDescription', e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    minHeight: isMobile ? '100px' : '120px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder="Description détaillée de l'espace confiné..."
                  maxLength={500}
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [
    formData.spaceType, 
    formData.csaClass, 
    formData.entryMethod, 
    formData.accessType, 
    formData.spaceLocation, 
    formData.spaceDescription,
    collapsedSections,
    isMobile,
    t,
    updateProjectInfo
  ]);

  // =================== SECTION 1: COMPOSANT INFORMATIONS PROJET ===================
  const ProjectInformationSection = useMemo(() => {
    return (
      <div style={{
        background: 'rgba(31, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '12px',
        marginBottom: isMobile ? '16px' : '24px',
        overflow: 'hidden'
      }}>
        {/* Header de section */}
        <button 
          className="section-toggle"
          onClick={() => {
            setCollapsedSections(prev => {
              const newSet = new Set(prev);
              if (newSet.has('projectInfo')) {
                newSet.delete('projectInfo');
              } else {
                newSet.add('projectInfo');
              }
              return newSet;
            });
          }}
          style={{
            width: '100%',
            padding: isMobile ? '16px' : '20px',
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            minHeight: isMobile ? '60px' : '70px',
            touchAction: 'manipulation'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '12px' : '16px',
            flex: 1
          }}>
            <Building style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', color: '#3b82f6' }} />
            <h3 style={{
              margin: 0,
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              {t.projectInfo}
            </h3>
          </div>
          <ChevronDown 
            size={20} 
            style={{
              transition: 'transform 0.2s ease',
              transform: collapsedSections.has('projectInfo') ? 'rotate(0deg)' : 'rotate(180deg)'
            }}
          />
        </button>
        
        {/* Contenu de la section */}
        {!collapsedSections.has('projectInfo') && (
          <div style={{
            padding: isMobile ? '16px' : '24px',
            borderTop: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            {/* Grille responsive des champs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: isMobile ? '16px' : '20px'
            }}>
              
              {/* Numéro de projet */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <FileText size={16} />
                  {t.projectNumber}<span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.projectNumber}
                  onChange={(e) => updateProjectInfo('projectNumber', e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    minHeight: isMobile ? '48px' : '50px',
                    fontFamily: 'inherit'
                  }}
                  placeholder="P2024-001"
                  maxLength={50}
                />
              </div>

              {/* Lieu des travaux */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <MapPin size={16} />
                  {t.workLocation}<span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.workLocation}
                  onChange={(e) => updateProjectInfo('workLocation', e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    minHeight: isMobile ? '48px' : '50px',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Usine ABC, Réservoir #3"
                  maxLength={100}
                />
              </div>

              {/* Entrepreneur */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <Briefcase size={16} />
                  {t.contractor}<span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.contractor}
                  onChange={(e) => updateProjectInfo('contractor', e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    minHeight: isMobile ? '48px' : '50px',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Entreprise XYZ Inc."
                  maxLength={100}
                />
              </div>

              {/* Superviseur */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <User size={16} />
                  {t.supervisor}<span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.supervisor}
                  onChange={(e) => updateProjectInfo('supervisor', e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    minHeight: isMobile ? '48px' : '50px',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Jean Dupont"
                  maxLength={100}
                />
              </div>

              {/* Date d'entrée */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <Calendar size={16} />
                  {t.entryDate}<span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.entryDate}
                  onChange={(e) => updateProjectInfo('entryDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    minHeight: isMobile ? '48px' : '50px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Durée */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <Clock size={16} />
                  {t.duration}
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => updateProjectInfo('duration', e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    minHeight: isMobile ? '48px' : '50px',
                    fontFamily: 'inherit'
                  }}
                  placeholder="4 heures"
                  maxLength={50}
                />
              </div>

              {/* Nombre de travailleurs */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <Users size={16} />
                  {t.workerCount}
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.workerCount}
                  onChange={(e) => updateProjectInfo('workerCount', parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    minHeight: isMobile ? '48px' : '50px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Description des travaux - pleine largeur */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  <FileText size={16} />
                  {t.workDescription}
                </label>
                <textarea
                  value={formData.workDescription}
                  onChange={(e) => updateProjectInfo('workDescription', e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 16px' : '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    minHeight: isMobile ? '100px' : '120px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder="Inspection et nettoyage du réservoir..."
                  maxLength={500}
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [
    formData.projectNumber, 
    formData.workLocation, 
    formData.contractor, 
    formData.supervisor, 
    formData.entryDate, 
    formData.duration, 
    formData.workerCount, 
    formData.workDescription,
    collapsedSections,
    isMobile,
    t,
    updateProjectInfo
  ]);

  // =================== VALIDATION SECTIONS 1 + 2 + 3 + 4 + 5 ===================
  const validateSection1 = useMemo(() => {
    const errors: string[] = [];
    if (!formData.projectNumber.trim()) errors.push(language === 'fr' ? 'Numéro de projet requis' : 'Project number required');
    if (!formData.workLocation.trim()) errors.push(language === 'fr' ? 'Lieu des travaux requis' : 'Work location required');
    if (!formData.contractor.trim()) errors.push(language === 'fr' ? 'Entrepreneur requis' : 'Contractor required');
    if (!formData.supervisor.trim()) errors.push(language === 'fr' ? 'Superviseur requis' : 'Supervisor required');
    if (!formData.entryDate) errors.push(language === 'fr' ? 'Date d\'entrée requise' : 'Entry date required');
    return errors;
  }, [formData.projectNumber, formData.workLocation, formData.contractor, formData.supervisor, formData.entryDate, language]);

  const validateSection2 = useMemo(() => {
    const errors: string[] = [];
    if (!formData.spaceType) errors.push(language === 'fr' ? 'Type d\'espace requis' : 'Space type required');
    if (!formData.csaClass) errors.push(language === 'fr' ? 'Classification CSA requise' : 'CSA classification required');
    return errors;
  }, [formData.spaceType, formData.csaClass, language]);

  const validateSection3 = useMemo(() => {
    const errors: string[] = [];
    const { dimensions } = formData;
    
    // Validation selon la forme
    switch (dimensions.spaceShape) {
      case 'rectangular':
      case 'irregular':
        if (dimensions.length <= 0 || dimensions.width <= 0 || dimensions.height <= 0) {
          errors.push(language === 'fr' ? 'Longueur, largeur et hauteur requises pour forme rectangulaire' : 'Length, width and height required for rectangular shape');
        }
        break;
      case 'cylindrical':
        if (dimensions.diameter <= 0 || (dimensions.height <= 0 && dimensions.length <= 0)) {
          errors.push(language === 'fr' ? 'Diamètre et hauteur (ou longueur) requis pour forme cylindrique' : 'Diameter and height (or length) required for cylindrical shape');
        }
        break;
      case 'spherical':
        if (dimensions.diameter <= 0) {
          errors.push(language === 'fr' ? 'Diamètre requis pour forme sphérique' : 'Diameter required for spherical shape');
        }
        break;
    }
    
    // Validation du volume
    if (dimensions.volume === 0) {
      errors.push(language === 'fr' ? 'Volume doit être calculé' : 'Volume must be calculated');
    }
    
    return errors;
  }, [formData.dimensions, language]);

  const validateSection4 = useMemo(() => {
    const errors: string[] = [];
    
    // Validation des points d'entrée
    if (formData.entryPoints.length === 0) {
      errors.push(language === 'fr' ? 'Au moins un point d\'entrée requis' : 'At least one entry point required');
    } else {
      formData.entryPoints.forEach((entry, index) => {
        if (!entry.dimensions.trim()) {
          errors.push(language === 'fr' ? `Dimensions manquantes pour le point d'entrée ${index + 1}` : `Missing dimensions for entry point ${index + 1}`);
        }
        if (!entry.location.trim()) {
          errors.push(language === 'fr' ? `Localisation manquante pour le point d'entrée ${index + 1}` : `Missing location for entry point ${index + 1}`);
        }
      });
    }
    
    return errors;
  }, [formData.entryPoints, language]);

  const validateSection5 = useMemo(() => {
    const errors: string[] = [];
    
    // Validation des dangers selon la classification CSA
    if ((formData.csaClass === 'class1' || formData.csaClass === 'class2') && 
        formData.atmosphericHazards.length === 0 && formData.physicalHazards.length === 0) {
      errors.push(language === 'fr' ? 'Au moins un danger doit être identifié pour cette classification CSA' : 'At least one hazard must be identified for this CSA classification');
    }
    
    return errors;
  }, [formData.csaClass, formData.atmosphericHazards, formData.physicalHazards, language]);

  const allValidationErrors = useMemo(() => {
    return [...validateSection1, ...validateSection2, ...validateSection3, ...validateSection4, ...validateSection5];
  }, [validateSection1, validateSection2, validateSection3, validateSection4, validateSection5]);

  // =================== SAUVEGARDE ===================
  const handleSave = useCallback(async () => {
    if (allValidationErrors.length > 0) {
      setNotification({
        type: 'error',
        message: `${language === 'fr' ? 'Erreurs de validation' : 'Validation errors'}: ${allValidationErrors.join(', ')}`
      });
      return;
    }

    setIsSaving(true);
    try {
      // Synchronisation avec le parent SEULEMENT lors de la sauvegarde
      updatePermitData(formData);
      updateParentData('siteInformation', formData);
      
      setNotification({
        type: 'success',
        message: language === 'fr' ? 'Informations sauvegardées avec succès!' : 'Information saved successfully!'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving data'
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, allValidationErrors, language, updatePermitData, updateParentData]);

  // Masquer la notification après 3 secondes
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // =================== RENDU PRINCIPAL ===================
  return (
    <div 
      ref={containerRef}
      style={{
        padding: isMobile ? '8px' : '24px',
        maxWidth: '100%',
        margin: '0 auto',
        background: '#111827',
        minHeight: '100vh',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: isMobile ? '24px' : '32px'
      }}>
        <h1 style={{
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 8px 0'
        }}>
          {t.title}
        </h1>
        <p style={{
          fontSize: isMobile ? '14px' : '16px',
          color: '#9ca3af',
          margin: 0
        }}>
          {t.subtitle}
        </p>
      </div>

      {/* Indicateur de validation */}
      {allValidationErrors.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <AlertTriangle size={20} color="#ef4444" />
            <h4 style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '600',
              color: '#fca5a5'
            }}>
              {language === 'fr' ? 'Informations incomplètes' : 'Incomplete information'} ({allValidationErrors.length})
            </h4>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#fca5a5' }}>
            {allValidationErrors.map((error, index) => (
              <li key={index} style={{ fontSize: '13px' }}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 1: Informations du Projet */}
      {ProjectInformationSection}

      {/* Section 2: Identification de l'Espace */}
      {SpaceIdentificationSection}

      {/* Section 3: Dimensions et Volume */}
      {DimensionsSection}

      {/* Section 4: Points d'Entrée et Accès */}
      {EntryPointsSection}

      {/* Section 5: Évaluation des Dangers */}
      {HazardAssessmentSection}

      {/* Section 6: Documentation et Photos */}
      {DocumentationSection}

      {/* Boutons d'action */}
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        marginTop: '32px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: isMobile ? '12px 24px' : '14px 28px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '15px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '48px',
            opacity: isSaving ? 0.7 : 1,
            transition: 'all 0.3s ease'
          }}
        >
          {isSaving ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              {language === 'fr' ? 'Sauvegarde...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save size={16} />
              {t.save}
            </>
          )}
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: '300px'
        }}>
          {notification.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{notification.message}</span>
        </div>
      )}

      {/* Input caché pour les photos */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        .section-toggle:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }
        
        .section-toggle:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default SiteInformation;
