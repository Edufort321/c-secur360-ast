import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Section « Lien AST » du formulaire Mandat (extraite de JobModal pour alléger le mégafichier).
// Auto-gérée : vérifie l'entitlement AST du tenant ; si activé, charge les 50 dernières AST
// (rattachement) et permet de créer une AST préremplie. Ne rend rien si le module AST est inactif.
// Props : formData (lecture), setFormData (écriture de astId), addNotification (toasts).
export function AstLinkSection({ formData, setFormData, addNotification }) {
    const [astEnabled, setAstEnabled] = useState(false);
    const [astList, setAstList] = useState([]); // [{ permit_number, label }]

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const tenant = window.location.pathname.split('/')[1] || 'cerdia';
                let enabled = tenant === 'cerdia' || tenant === 'demo';
                if (!enabled) {
                    const { data } = await supabase.from('tenant_modules')
                        .select('enabled').eq('tenant_id', tenant).eq('module_key', 'ast').maybeSingle();
                    enabled = !!data?.enabled;
                }
                if (cancelled) return;
                setAstEnabled(enabled);
                if (enabled) {
                    const { data: rows } = await supabase.from('ast_permits')
                        .select('permit_number, data, updated_at').eq('tenant_id', tenant)
                        .order('updated_at', { ascending: false }).limit(50);
                    if (!cancelled && Array.isArray(rows)) {
                        setAstList(rows.map(r => {
                            const ti = r?.data?.taskInfo || {};
                            const desc = ti.projectName || ti.workLocation || ti.taskDescription || '';
                            return { permit_number: r.permit_number, label: desc ? `${r.permit_number} — ${desc}` : r.permit_number };
                        }));
                    }
                }
            } catch { /* module AST indisponible : on garde le lien masqué */ }
        })();
        return () => { cancelled = true; };
    }, []);

    // Ouvre l'AST de création préremplie avec les infos du mandat (avant travaux).
    const openPrefilledAst = () => {
        const tenant = window.location.pathname.split('/')[1] || 'cerdia';
        const workerCount = Array.isArray(formData.personnel) ? formData.personnel.length : (Number(formData.nombrePersonnes) || 1);
        const qs = new URLSearchParams();
        if (formData.numeroJob) qs.set('projectNumber', formData.numeroJob);
        if (formData.nom) qs.set('projectName', formData.nom);
        if (formData.lieu) qs.set('workLocation', formData.lieu);
        if (formData.client) qs.set('contractor', formData.client);
        if (formData.dateDebut) qs.set('taskDate', formData.dateDebut);
        if (workerCount) qs.set('workerCount', String(workerCount));
        if (formData.id) qs.set('mandatId', String(formData.id));
        window.open(`/${tenant}/ast/nouveau?${qs.toString()}`, '_blank', 'noopener');
        addNotification?.('AST ouverte dans un nouvel onglet (infos préremplies). Notez son numéro pour la rattacher ici.', 'info');
    };

    if (!astEnabled) return null;

    return (
        <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-800">
                🛡️ Analyse sécurité (AST)
            </div>
            <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[220px] flex-1">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Rattacher une AST existante</label>
                    <select
                        value={formData.astId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, astId: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">— Aucune —</option>
                        {astList.map(a => (
                            <option key={a.permit_number} value={a.permit_number}>{a.label}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="button"
                    onClick={openPrefilledAst}
                    className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                    title="Créer une AST préremplie avec les infos du mandat (lieu, client, dates, personnel)"
                >
                    ➕ Créer une AST préremplie
                </button>
                {formData.astId && (
                    <a
                        href={`/${(typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'cerdia')}/ast`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-teal-300 px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-100"
                    >
                        ↗ Ouvrir l'AST liée
                    </a>
                )}
            </div>
            <p className="mt-2 text-[11px] leading-tight text-teal-700/80">
                L'AST préremplit le lieu, le client, la date et le nombre de travailleurs avant les travaux. Rattachez-la au mandat via son numéro.
            </p>
        </div>
    );
}
