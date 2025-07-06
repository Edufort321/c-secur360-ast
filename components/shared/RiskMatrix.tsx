"use client";

import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  BarChart3, 
  Info,
  Download,
  Printer,
  Eye,
  EyeOff
} from 'lucide-react';

// =================== INTERFACES ===================
interface RiskMatrixProps {
  risks: RiskData[];
  onRiskClick?: (risk: RiskData) => void;
  onCellClick?: (severity: number, probability: number) => void;
  showLegend?: boolean;
  showControls?: boolean;
  showStats?: boolean;
  matrixSize?: 3 | 4 | 5;
  language?: 'fr' | 'en';
  className?: string;
  title?: string;
}

interface RiskData {
  id: string;
  name: string;
  description?: string;
  severity: number; // 1-5
  probability: number; // 1-5
  category?: string;
  controlMeasures?: string[];
  residualRisk?: {
    severity: number;
    probability: number;
  };
}

interface MatrixCell {
  severity: number;
  probability: number;
  risks: RiskData[];
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  score: number;
}

// =================== CONFIGURATION ===================
const riskColors = {
  very_low: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
  low: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
  medium: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
  high: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
  very_high: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800' }
};

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: 'Matrice des Risques',
    severity: 'Gravité',
    probability: 'Probabilité',
    totalRisks: 'Total des risques',
    highRisks: 'Risques élevés',
    averageRisk: 'Score moyen',
    showResidual: 'Risques résiduels',
    export: 'Exporter',
    print: 'Imprimer',
    severityLevels: ['', 'Négligeable', 'Mineur', 'Modéré', 'Majeur', 'Catastrophique'],
    probabilityLevels: ['', 'Très rare', 'Rare', 'Possible', 'Probable', 'Très probable'],
    riskLevels: {
      very_low: 'Très faible',
      low: 'Faible', 
      medium: 'Moyen',
      high: 'Élevé',
      very_high: 'Très élevé'
    }
  },
  en: {
    title: 'Risk Matrix',
    severity: 'Severity',
    probability: 'Probability', 
    totalRisks: 'Total risks',
    highRisks: 'High risks',
    averageRisk: 'Average score',
    showResidual: 'Residual risks',
    export: 'Export',
    print: 'Print',
    severityLevels: ['', 'Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'],
    probabilityLevels: ['', 'Very rare', 'Rare', 'Possible', 'Likely', 'Very likely'],
    riskLevels: {
      very_low: 'Very low',
      low: 'Low',
      medium: 'Medium', 
      high: 'High',
      very_high: 'Very high'
    }
  }
};

// =================== FONCTIONS UTILITAIRES ===================
const calculateRiskLevel = (severity: number, probability: number): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' => {
  const score = severity * probability;
  
  if (score <= 4) return 'very_low';
  if (score <= 8) return 'low';
  if (score <= 12) return 'medium';
  if (score <= 16) return 'high';
  return 'very_high';
};

// =================== COMPOSANT PRINCIPAL ===================
const RiskMatrix: React.FC<RiskMatrixProps> = ({
  risks = [],
  onRiskClick,
  onCellClick,
  showLegend = true,
  showControls = true,
  showStats = true,
  matrixSize = 5,
  language = 'fr',
  className = '',
  title
}) => {
  const t = translations[language];
  
  const [showResidualRisk, setShowResidualRisk] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ severity: number; probability: number } | null>(null);

  // =================== DONNÉES CALCULÉES ===================
  const matrixData: MatrixCell[][] = useMemo(() => {
    const matrix: MatrixCell[][] = [];
    
    for (let severity = matrixSize; severity >= 1; severity--) {
      const row: MatrixCell[] = [];
      for (let probability = 1; probability <= matrixSize; probability++) {
        const cellRisks = risks.filter(risk => {
          const currentRisk = showResidualRisk && risk.residualRisk ? risk.residualRisk : risk;
          return currentRisk.severity === severity && currentRisk.probability === probability;
        });
        
        const score = severity * probability;
        const riskLevel = calculateRiskLevel(severity, probability);
        
        row.push({
          severity,
          probability,
          risks: cellRisks,
          riskLevel,
          score
        });
      }
      matrix.push(row);
    }
    
    return matrix;
  }, [risks, matrixSize, showResidualRisk]);

  const stats = useMemo(() => {
    const totalRisks = risks.length;
    const averageScore = totalRisks > 0 
      ? risks.reduce((sum, risk) => {
          const currentRisk = showResidualRisk && risk.residualRisk ? risk.residualRisk : risk;
          return sum + (currentRisk.severity * currentRisk.probability);
        }, 0) / totalRisks 
      : 0;
    
    const highRisks = risks.filter(risk => {
      const currentRisk = showResidualRisk && risk.residualRisk ? risk.residualRisk : risk;
      const level = calculateRiskLevel(currentRisk.severity, currentRisk.probability);
      return level === 'high' || level === 'very_high';
    }).length;
    
    return {
      totalRisks,
      averageScore: Math.round(averageScore * 100) / 100,
      highRisks
    };
  }, [risks, showResidualRisk]);

  // =================== HANDLERS ===================
  const handleCellClick = (cell: MatrixCell) => {
    if (onCellClick) {
      onCellClick(cell.severity, cell.probability);
    }
  };

  const handleRiskClick = (risk: RiskData, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onRiskClick) {
      onRiskClick(risk);
    }
  };

  const exportMatrix = () => {
    const data = {
      matrix: matrixData,
      stats,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-matrix-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =================== RENDU ===================
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
          {title || t.title}
        </h3>
        
        {showControls && (
          <div className="flex items-center space-x-3">
            {/* Toggle risque résiduel */}
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showResidualRisk}
                onChange={(e) => setShowResidualRisk(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">{t.showResidual}</span>
              {showResidualRisk ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </label>
            
            {/* Actions */}
            <div className="flex space-x-1">
              <button
                onClick={exportMatrix}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title={t.export}
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.print()}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title={t.print}
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {showStats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
            <div className="text-2xl font-bold text-blue-800">{stats.totalRisks}</div>
            <div className="text-sm text-blue-600">{t.totalRisks}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
            <div className="text-2xl font-bold text-orange-800">{stats.highRisks}</div>
            <div className="text-sm text-orange-600">{t.highRisks}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
            <div className="text-2xl font-bold text-purple-800">{stats.averageScore}</div>
            <div className="text-sm text-purple-600">{t.averageRisk}</div>
          </div>
        </div>
      )}

      {/* Matrice principale */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Étiquette Probabilité */}
          <div className="text-center mb-2">
            <span className="text-sm font-semibold text-gray-700">{t.probability}</span>
          </div>
          
          <div className="flex">
            {/* Étiquette Gravité (verticale) */}
            <div className="flex items-center justify-center w-8 mr-4">
              <div className="transform -rotate-90 whitespace-nowrap text-sm font-semibold text-gray-700">
                {t.severity}
              </div>
            </div>
            
            {/* Matrice + étiquettes */}
            <div>
              {/* En-têtes de colonnes (Probabilité) */}
              <div className="flex mb-2">
                {Array.from({ length: matrixSize }, (_, i) => (
                  <div key={i} className="w-24 text-center">
                    <div className="text-sm font-medium text-gray-700">{i + 1}</div>
                    <div className="text-xs text-gray-500 leading-tight">
                      {t.probabilityLevels[i + 1]}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Lignes de la matrice */}
              {matrixData.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {/* Étiquette de ligne (Gravité) */}
                  <div className="w-8 flex flex-col items-center justify-center mr-4 text-right">
                    <div className="text-sm font-medium text-gray-700">
                      {matrixSize - rowIndex}
                    </div>
                    <div className="text-xs text-gray-500 leading-tight text-center">
                      {t.severityLevels[matrixSize - rowIndex]}
                    </div>
                  </div>
                  
                  {/* Cellules de la matrice */}
                  {row.map((cell, colIndex) => {
                    const cellStyle = riskColors[cell.riskLevel];
                    const isHovered = hoveredCell?.severity === cell.severity && 
                                    hoveredCell?.probability === cell.probability;
                    
                    return (
                      <div
                        key={colIndex}
                        className={`
                          w-24 h-20 border-2 cursor-pointer transition-all duration-200 relative
                          ${cellStyle.bg} ${cellStyle.border} 
                          ${isHovered ? 'ring-2 ring-blue-500 ring-opacity-50 transform scale-105' : ''}
                          hover:shadow-lg
                        `}
                        onClick={() => handleCellClick(cell)}
                        onMouseEnter={() => setHoveredCell({ severity: cell.severity, probability: cell.probability })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {/* Score de risque */}
                        <div className={`absolute top-1 left-1 text-xs font-bold ${cellStyle.text}`}>
                          {cell.score}
                        </div>
                        
                        {/* Niveau de risque */}
                        <div className={`absolute top-1 right-1 text-xs ${cellStyle.text}`}>
                          {t.riskLevels[cell.riskLevel]}
                        </div>
                        
                        {/* Nombre de risques */}
                        <div className="absolute bottom-2 left-2">
                          <div className={`text-lg font-bold ${cellStyle.text}`}>
                            {cell.risks.length}
                          </div>
                          <div className={`text-xs ${cellStyle.text}`}>
                            {cell.risks.length === 1 ? 'risque' : 'risques'}
                          </div>
                        </div>
                        
                        {/* Indicateur critique */}
                        {cell.riskLevel === 'very_high' && cell.risks.length > 0 && (
                          <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                            <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                          </div>
                        )}
                        
                        {/* Liste des risques au survol */}
                        {isHovered && cell.risks.length > 0 && (
                          <div className="absolute z-10 top-full left-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                            <div className="text-sm font-medium text-gray-800 mb-2">
                              Risques dans cette cellule:
                            </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {cell.risks.map(risk => (
                                <div
                                  key={risk.id}
                                  onClick={(e) => handleRiskClick(risk, e)}
                                  className="text-xs text-gray-600 hover:text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50"
                                >
                                  • {risk.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      {showLegend && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <Info className="w-4 h-4 mr-1" />
            Légende des niveaux de risque
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(riskColors).map(([level, style]) => (
              <div key={level} className="flex items-center space-x-2">
                <div className={`w-4 h-4 border-2 ${style.bg} ${style.border} rounded`}></div>
                <span className="text-sm text-gray-700">
                  {t.riskLevels[level as keyof typeof t.riskLevels]}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-gray-600">
            <p>• Cliquez sur une cellule pour voir les détails</p>
            <p>• Les chiffres indiquent le nombre de risques par cellule</p>
            <p>• Score = Gravité × Probabilité</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskMatrix;
