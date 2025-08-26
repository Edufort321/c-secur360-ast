'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Clock,
  Car,
  Settings,
  Star,
  Building
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

interface BillingProfile {
  id: string;
  client_id?: string;
  profile_name: string;
  is_default: boolean;
  rate_normal: number;
  rate_overtime_1_5: number;
  rate_overtime_2_0: number;
  per_diem_rate: number;
  vehicle_rate_light: number;
  vehicle_rate_trailer: number;
  custom_rates: Record<string, number>;
  effective_date: string;
  expiry_date?: string;
  client_name?: string;
  created_at: string;
}

interface BillingProfileFormData {
  client_id?: string;
  profile_name: string;
  is_default: boolean;
  rate_normal: number;
  rate_overtime_1_5: number;
  rate_overtime_2_0: number;
  per_diem_rate: number;
  vehicle_rate_light: number;
  vehicle_rate_trailer: number;
  custom_rates: Record<string, number>;
  effective_date: string;
  expiry_date?: string;
}

interface Client {
  id: string;
  name: string;
}

interface CustomRate {
  key: string;
  value: number;
}

const DEFAULT_CUSTOM_RATES = [
  { key: 'engin_lourd', label: 'Engin lourd', defaultValue: 350 },
  { key: 'supervision', label: 'Supervision', defaultValue: 160 },
  { key: 'formation', label: 'Formation', defaultValue: 120 },
  { key: 'urgence_weekend', label: 'Urgence weekend', defaultValue: 200 },
  { key: 'deplacement', label: 'Déplacement', defaultValue: 100 },
  { key: 'standby', label: 'Standby/Attente', defaultValue: 50 }
];

export default function ClientBillingProfiles() {
  const [profiles, setProfiles] = useState<BillingProfile[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BillingProfile | null>(null);
  const [customRates, setCustomRates] = useState<CustomRate[]>([]);
  const [formData, setFormData] = useState<BillingProfileFormData>({
    profile_name: '',
    is_default: false,
    rate_normal: 140.00,
    rate_overtime_1_5: 210.00,
    rate_overtime_2_0: 280.00,
    per_diem_rate: 75.00,
    vehicle_rate_light: 0.450,
    vehicle_rate_trailer: 0.650,
    custom_rates: {},
    effective_date: new Date().toISOString().split('T')[0]
  });

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    loadProfiles();
    loadClients();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('client_billing_profiles')
        .select(`
          *,
          clients (
            name
          )
        `)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProfiles = (data || []).map(profile => ({
        ...profile,
        client_name: profile.clients?.name,
        custom_rates: profile.custom_rates || {}
      }));

      setProfiles(formattedProfiles);
    } catch (error) {
      console.error('Erreur lors du chargement des profils:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Construire l'objet custom_rates à partir du tableau
      const customRatesObj = customRates.reduce((acc, rate) => {
        if (rate.key.trim() && rate.value > 0) {
          acc[rate.key.trim()] = rate.value;
        }
        return acc;
      }, {} as Record<string, number>);

      const profileData = {
        ...formData,
        custom_rates: customRatesObj,
        client_id: formData.client_id || null,
        expiry_date: formData.expiry_date || null
      };

      if (editingProfile) {
        const { error } = await supabase
          .from('client_billing_profiles')
          .update(profileData)
          .eq('id', editingProfile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('client_billing_profiles')
          .insert(profileData);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditingProfile(null);
      resetForm();
      loadProfiles();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (profile: BillingProfile) => {
    setEditingProfile(profile);
    
    // Convertir custom_rates en tableau pour l'édition
    const customRatesArray = Object.entries(profile.custom_rates || {}).map(([key, value]) => ({
      key,
      value: Number(value)
    }));
    setCustomRates(customRatesArray);

    setFormData({
      client_id: profile.client_id || undefined,
      profile_name: profile.profile_name,
      is_default: profile.is_default,
      rate_normal: profile.rate_normal,
      rate_overtime_1_5: profile.rate_overtime_1_5,
      rate_overtime_2_0: profile.rate_overtime_2_0,
      per_diem_rate: profile.per_diem_rate,
      vehicle_rate_light: profile.vehicle_rate_light,
      vehicle_rate_trailer: profile.vehicle_rate_trailer,
      custom_rates: profile.custom_rates || {},
      effective_date: profile.effective_date,
      expiry_date: profile.expiry_date || undefined
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce profil de facturation?')) return;

    try {
      const { error } = await supabase
        .from('client_billing_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadProfiles();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      profile_name: '',
      is_default: false,
      rate_normal: 140.00,
      rate_overtime_1_5: 210.00,
      rate_overtime_2_0: 280.00,
      per_diem_rate: 75.00,
      vehicle_rate_light: 0.450,
      vehicle_rate_trailer: 0.650,
      custom_rates: {},
      effective_date: new Date().toISOString().split('T')[0]
    });
    setCustomRates([]);
  };

  const addCustomRate = () => {
    setCustomRates([...customRates, { key: '', value: 0 }]);
  };

  const updateCustomRate = (index: number, field: 'key' | 'value', value: string | number) => {
    const updated = [...customRates];
    updated[index] = { ...updated[index], [field]: value };
    setCustomRates(updated);
  };

  const removeCustomRate = (index: number) => {
    setCustomRates(customRates.filter((_, i) => i !== index));
  };

  const addDefaultCustomRate = (rateInfo: typeof DEFAULT_CUSTOM_RATES[0]) => {
    if (!customRates.some(rate => rate.key === rateInfo.key)) {
      setCustomRates([...customRates, { key: rateInfo.key, value: rateInfo.defaultValue }]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des profils de facturation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Profils de Facturation Client</h1>
            <p className="text-slate-600">Taux facturables • Per diem • Kilométrage • Taux personnalisés</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setEditingProfile(null);
                  resetForm();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Profil
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  {editingProfile ? 'Modifier Profil' : 'Nouveau Profil de Facturation'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profile_name">Nom du profil *</Label>
                    <Input
                      id="profile_name"
                      value={formData.profile_name}
                      onChange={(e) => setFormData({...formData, profile_name: e.target.value})}
                      placeholder="ex: Profil Standard, Client Spécial..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_id">Client (optionnel)</Label>
                    <Select 
                      value={formData.client_id || ''} 
                      onValueChange={(value) => setFormData({...formData, client_id: value || undefined})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Profil par défaut (tous clients)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Profil par défaut</SelectItem>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                    className="rounded border-slate-300"
                  />
                  <Label htmlFor="is_default" className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Profil par défaut
                  </Label>
                </div>

                {/* Taux horaires */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Taux horaires facturables
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="rate_normal">Taux normal ($/h) *</Label>
                      <Input
                        id="rate_normal"
                        type="number"
                        step="0.01"
                        value={formData.rate_normal}
                        onChange={(e) => setFormData({...formData, rate_normal: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate_overtime_1_5">Temps supp. 1.5x ($/h) *</Label>
                      <Input
                        id="rate_overtime_1_5"
                        type="number"
                        step="0.01"
                        value={formData.rate_overtime_1_5}
                        onChange={(e) => setFormData({...formData, rate_overtime_1_5: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate_overtime_2_0">Temps supp. 2.0x ($/h) *</Label>
                      <Input
                        id="rate_overtime_2_0"
                        type="number"
                        step="0.01"
                        value={formData.rate_overtime_2_0}
                        onChange={(e) => setFormData({...formData, rate_overtime_2_0: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Per diem et véhicules */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Car className="h-4 w-4 text-purple-500" />
                    Per diem et kilométrage
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="per_diem_rate">Per diem ($/jour)</Label>
                      <Input
                        id="per_diem_rate"
                        type="number"
                        step="0.01"
                        value={formData.per_diem_rate}
                        onChange={(e) => setFormData({...formData, per_diem_rate: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicle_rate_light">Véhicule léger ($/km)</Label>
                      <Input
                        id="vehicle_rate_light"
                        type="number"
                        step="0.001"
                        value={formData.vehicle_rate_light}
                        onChange={(e) => setFormData({...formData, vehicle_rate_light: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicle_rate_trailer">Avec remorque ($/km)</Label>
                      <Input
                        id="vehicle_rate_trailer"
                        type="number"
                        step="0.001"
                        value={formData.vehicle_rate_trailer}
                        onChange={(e) => setFormData({...formData, vehicle_rate_trailer: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                {/* Taux personnalisés */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4 text-orange-500" />
                      Taux personnalisés
                    </h4>
                    <div className="flex gap-2">
                      <Select onValueChange={(value) => {
                        const rateInfo = DEFAULT_CUSTOM_RATES.find(r => r.key === value);
                        if (rateInfo) addDefaultCustomRate(rateInfo);
                      }}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Ajouter taux standard" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEFAULT_CUSTOM_RATES.map(rate => (
                            <SelectItem key={rate.key} value={rate.key}>
                              {rate.label} ({rate.defaultValue}$)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" size="sm" onClick={addCustomRate}>
                        <Plus className="h-3 w-3 mr-1" />
                        Custom
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {customRates.map((rate, index) => (
                      <div key={index} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <Label>Type/Description</Label>
                          <Input
                            value={rate.key}
                            onChange={(e) => updateCustomRate(index, 'key', e.target.value)}
                            placeholder="ex: engin_lourd, supervision..."
                          />
                        </div>
                        <div className="w-32">
                          <Label>Taux ($/unité)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.value}
                            onChange={(e) => updateCustomRate(index, 'value', parseFloat(e.target.value))}
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeCustomRate(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {customRates.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-4">
                        Aucun taux personnalisé défini
                      </p>
                    )}
                  </div>
                </div>

                {/* Dates de validité */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Période de validité</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="effective_date">Date d'entrée en vigueur *</Label>
                      <Input
                        id="effective_date"
                        type="date"
                        value={formData.effective_date}
                        onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiry_date">Date d'expiration (optionnelle)</Label>
                      <Input
                        id="expiry_date"
                        type="date"
                        value={formData.expiry_date || ''}
                        onChange={(e) => setFormData({...formData, expiry_date: e.target.value || undefined})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingProfile(null);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    {editingProfile ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Liste des profils */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {profile.is_default && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    <span>{profile.profile_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(profile)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    {!profile.is_default && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(profile.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardTitle>
                {profile.client_name && (
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Building className="h-3 w-3" />
                    {profile.client_name}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Taux horaires */}
                  <div>
                    <h5 className="font-medium text-sm text-slate-700 mb-2">Taux horaires</h5>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-slate-900">${profile.rate_normal}/h</div>
                        <div className="text-slate-500">Normal</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">${profile.rate_overtime_1_5}/h</div>
                        <div className="text-slate-500">1.5x</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-purple-600">${profile.rate_overtime_2_0}/h</div>
                        <div className="text-slate-500">2.0x</div>
                      </div>
                    </div>
                  </div>

                  {/* Per diem et véhicules */}
                  <div>
                    <h5 className="font-medium text-sm text-slate-700 mb-2">Autres taux</h5>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="font-medium text-emerald-600">${profile.per_diem_rate}/jour</div>
                        <div className="text-slate-500">Per diem</div>
                      </div>
                      <div>
                        <div className="font-medium text-orange-600">${profile.vehicle_rate_light}/km</div>
                        <div className="text-slate-500">Véhicule</div>
                      </div>
                      <div>
                        <div className="font-medium text-red-600">${profile.vehicle_rate_trailer}/km</div>
                        <div className="text-slate-500">+ remorque</div>
                      </div>
                    </div>
                  </div>

                  {/* Taux personnalisés */}
                  {Object.keys(profile.custom_rates).length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm text-slate-700 mb-2">Taux personnalisés</h5>
                      <div className="space-y-1">
                        {Object.entries(profile.custom_rates).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-slate-600 capitalize">{key.replace('_', ' ')}</span>
                            <span className="font-medium">${value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Validité */}
                  <div className="text-xs text-slate-500 border-t pt-2">
                    Actif depuis le {new Date(profile.effective_date).toLocaleDateString('fr-CA')}
                    {profile.expiry_date && (
                      <> jusqu'au {new Date(profile.expiry_date).toLocaleDateString('fr-CA')}</>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {profiles.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-8">
              <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">Aucun profil de facturation configuré</p>
              <p className="text-sm text-slate-500">Créez votre premier profil pour définir les taux facturables</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}