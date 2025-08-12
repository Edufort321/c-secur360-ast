import { useState, useEffect, useCallback } from 'react';
import { AST } from '@/types/ast';

const createInitialData = (tenant: string): Partial<AST> => ({
  id: '',
  tenant: tenant || '',
  projectInfo: {
    workType: '',
    workTypeDetails: {
      category: '',
      subcategory: '',
      complexity: 'simple',
      frequency: 'routine',
      criticality: 'low'
    },
    location: {
      site: '',
      building: '',
      floor: '',
      room: '',
      specificArea: ''
    },
    estimatedDuration: '',
    actualDuration: '',
    equipmentRequired: [],
    environmentalConditions: {
      temperature: { min: 20, max: 25, units: 'celsius' },
      humidity: 50,
      lighting: {
        type: 'artificial',
        adequacy: 'good',
        requiresSupplemental: false
      },
      noise: { level: 0, requiresProtection: false },
      airQuality: {
        quality: 'good',
        requiresVentilation: false,
        requiresRespiratory: false
      },
      weather: {
        condition: 'clear',
        impactsWork: false
      }
    }
  },
  status: 'draft'
});

export function useAstForm(tenant: string) {
  const [formData, setFormData] = useState<Partial<AST>>(createInitialData(tenant));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(createInitialData(tenant));
  }, [tenant]);

  useEffect(() => {
    if (!tenant) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const userResponse = await fetch(`/api/${tenant}/user`);
        if (userResponse.ok) {
          await userResponse.json();
        }

        const urlParams = new URLSearchParams(window.location.search);
        const astId = urlParams.get('id');

        if (astId) {
          const astResponse = await fetch(`/api/${tenant}/ast/${astId}`);
          if (astResponse.ok) {
            const astData = await astResponse.json();
            setFormData(astData);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenant]);

  const handleDataChange = useCallback(
    async (section: string, data: any) => {
      setSaving(true);
      setFormData(prev => {
        const newData = {
          ...prev,
          [section]: data,
          updatedAt: new Date()
        };

        setTimeout(async () => {
          try {
            await fetch(`/api/${tenant}/ast/save`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newData)
            });
          } catch (err) {
            console.error('Erreur sauvegarde:', err);
          } finally {
            setSaving(false);
          }
        }, 500);

        return newData;
      });
    },
    [tenant]
  );

  return { formData, loading, error, saving, handleDataChange };
}

export default useAstForm;
