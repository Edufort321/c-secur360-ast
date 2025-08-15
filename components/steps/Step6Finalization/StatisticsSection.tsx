'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { ASTStatistics, Translations } from '../Step6Finalization';

interface StatisticsSectionProps {
  stats: ASTStatistics;
  t: Translations;
  language: 'fr' | 'en';
  isMobile: boolean;
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({ stats, t, language, isMobile }) => (
  <div className="ast-section">
    <h2 className="section-title">
      <BarChart3 size={24} />
      {t.statistics}
    </h2>

    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-number">{stats.completedSections}/{stats.totalSections}</div>
        <div className="stat-label">{t.sectionsComplete}</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.identifiedHazards}</div>
        <div className="stat-label">{t.identifiedHazards}</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.selectedEquipment}</div>
        <div className="stat-label">{t.selectedEquipment}</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.requiredPermits}</div>
        <div className="stat-label">{t.requiredPermits}</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.teamMembers}</div>
        <div className="stat-label">{t.teamMembers}</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.photosCount}</div>
        <div className="stat-label">{t.documentsPhotos}</div>
      </div>
    </div>

    <div className="info-grid">
      <div className="info-box">
        <h3>🏢 {language === 'fr' ? 'Informations Projet' : 'Project Information'}</h3>
        <div className="info-row">
          <span className="info-label">{language === 'fr' ? 'N° AST:' : 'JSA #:'}</span>
          <span className="info-value">{stats.astNumber}</span>
        </div>
        <div className="info-row">
          <span className="info-label">{language === 'fr' ? 'Client:' : 'Client:'}</span>
          <span className="info-value">{stats.client}</span>
        </div>
        <div className="info-row">
          <span className="info-label">{language === 'fr' ? 'Projet:' : 'Project:'}</span>
          <span className="info-value">{stats.projectNumber}</span>
        </div>
        <div className="info-row">
          <span className="info-label">{language === 'fr' ? 'Lieu:' : 'Location:'}</span>
          <span className="info-value">{stats.workLocation}</span>
        </div>
        <div className="info-row">
          <span className="info-label">{language === 'fr' ? 'Industrie:' : 'Industry:'}</span>
          <span className="info-value">{t.industries[stats.industry as keyof typeof t.industries] || stats.industry}</span>
        </div>
        <div className="info-row">
          <span className="info-label">{language === 'fr' ? 'Travailleurs:' : 'Workers:'}</span>
          <span className="info-value">{stats.workerCount}</span>
        </div>
      </div>

      <div className="info-box">
        <h3>⏱️ {language === 'fr' ? 'Suivi Temporel' : 'Time Tracking'}</h3>
        <div className="info-row">
          <span className="info-label">{t.creationDate}:</span>
          <span className="info-value">{new Date(stats.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="info-row">
          <span className="info-label">{t.lastActivity}:</span>
          <span className="info-value">{new Date(stats.lastModified).toLocaleDateString()}</span>
        </div>
        <div className="info-row">
          <span className="info-label">{language === 'fr' ? 'Dernière sauvegarde:' : 'Last saved:'}</span>
          <span className="info-value" style={{ fontSize: isMobile ? '10px' : '12px' }}>
            {stats.lastSaved !== 'Jamais' && stats.lastSaved !== 'Never'
              ? new Date(stats.lastSaved).toLocaleString()
              : stats.lastSaved}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">{language === 'fr' ? 'Statut:' : 'Status:'}</span>
          <span className={`status-badge ${stats.isLocked ? 'status-error' : 'status-warning'}`}>
            {stats.isLocked ? t.locked : (language === 'fr' ? '🔓 EN COURS' : '🔓 IN PROGRESS')}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">{language === 'fr' ? 'QR Code:' : 'QR Code:'}</span>
          <span className="info-value">
            {stats.hasQRCode ? '✅' : '❌'} {stats.hasQRCode ? (language === 'fr' ? 'Généré' : 'Generated') : (language === 'fr' ? 'Non généré' : 'Not generated')}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">{language === 'fr' ? 'Lien partage:' : 'Share link:'}</span>
          <span className="info-value">
            {stats.hasShareableLink ? '✅' : '❌'} {stats.hasShareableLink ? (language === 'fr' ? 'Disponible' : 'Available') : (language === 'fr' ? 'Non disponible' : 'Not available')}
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StatisticsSection;
