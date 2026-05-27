'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, Image as ImageIcon } from 'lucide-react'

const MODULE_KEYS = [
  { key: 'ast',        label: 'AST / Securite' },
  { key: 'permits',    label: 'Permis de travail' },
  { key: 'accidents',  label: 'Accidents' },
  { key: 'presque',    label: 'Presque-accidents' },
  { key: 'inventaire', label: 'Inventaire' },
  { key: 'equip',      label: 'Fiches equipements' },
  { key: 'inspect',    label: 'Inspections' },
  { key: 'temps',      label: 'Feuilles de temps' },
  { key: 'logbook',    label: 'Logbook vehicules' },
  { key: 'todo',       label: 'To-Do / Taches' },
  { key: 'admin',      label: 'Administration' },
  { key: 'projets',    label: 'Projets' },
  { key: 'planner',    label: 'Planificateur' },
]

interface ModuleSlide {
  id: string
  module_key: string
  image_url: string
  sort_order: number
}

export default function ModuleSlidesTab({
  toast,
}: {
  toast?: (t: { msg: string; type: 'success' | 'error' }) => void
}) {
  const [selectedKey, setSelectedKey] = useState(MODULE_KEYS[0].key)
  const [slides, setSlides] = useState<ModuleSlide[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const notify = (msg: string, ok = true) => toast?.({ msg, type: ok ? 'success' : 'error' })

  const load = async (key: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('module_slides')
      .select('*')
      .eq('module_key', key)
      .order('sort_order')
    setSlides(data || [])
    setLoading(false)
  }

  useEffect(() => { load(selectedKey) }, [selectedKey])

  const handleUpload = async (file: File) => {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `module-slides/${selectedKey}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('csecur360').upload(path, file, { upsert: true })
    if (error) { notify('Erreur upload: ' + error.message, false); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('csecur360').getPublicUrl(path)
    const maxOrder = slides.length ? Math.max(...slides.map(s => s.sort_order)) + 1 : 0
    const { error: insErr } = await supabase.from('module_slides').insert({
      module_key: selectedKey, image_url: publicUrl, sort_order: maxOrder
    })
    if (insErr) { notify('Erreur DB: ' + insErr.message, false) }
    else { notify('Capture ajoutee') }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    load(selectedKey)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette capture ?')) return
    await supabase.from('module_slides').delete().eq('id', id)
    notify('Capture supprimee')
    load(selectedKey)
  }

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= slides.length) return
    const a = slides[idx]; const b = slides[target]
    await supabase.from('module_slides').update({ sort_order: b.sort_order }).eq('id', a.id)
    await supabase.from('module_slides').update({ sort_order: a.sort_order }).eq('id', b.id)
    load(selectedKey)
  }

  const selectedLabel = MODULE_KEYS.find(m => m.key === selectedKey)?.label || selectedKey

  return (
    <div className="space-y-6">
      <div className="bg-[#1a2744] rounded-2xl border border-white/10 p-6">
        <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
          <ImageIcon size={15} className="text-orange-400" />
          Captures d'ecran par module
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Ces images s'affichent au survol de chaque carte module sur la page d'accueil.
        </p>

        {/* Module selector */}
        <div className="flex flex-wrap gap-2 mb-5">
          {MODULE_KEYS.map(m => (
            <button key={m.key} onClick={() => setSelectedKey(m.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${selectedKey === m.key ? 'bg-orange-500 border-orange-500 text-white' : 'border-white/10 text-slate-300 hover:border-orange-400/50 hover:text-white'}`}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Upload zone */}
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full h-28 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-orange-400 transition text-slate-400 hover:text-orange-400">
          {uploading
            ? <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            : <><Upload size={20} /><span className="text-sm">Ajouter une capture — {selectedLabel}</span></>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]) }} />
      </div>

      <div className="bg-[#1a2744] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="font-semibold text-white">
            {selectedLabel} — {slides.length} capture{slides.length !== 1 ? 's' : ''}
          </h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Chargement...</div>
        ) : slides.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Aucune capture — uploadez-en une ci-dessus.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {slides.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-24 h-14 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                  <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-xs">Capture {idx + 1}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => move(idx, -1)} disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-25 transition rounded">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => move(idx, 1)} disabled={idx === slides.length - 1}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-25 transition rounded">
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
