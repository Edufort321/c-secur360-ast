'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'

interface LandingSlide {
  id: string
  image_url: string
  title_fr: string | null
  title_en: string | null
  subtitle_fr: string | null
  subtitle_en: string | null
  active: boolean
  sort_order: number
}

type FormData = {
  image_url: string
  title_fr: string
  title_en: string
  subtitle_fr: string
  subtitle_en: string
  active: boolean
}

const EMPTY: FormData = {
  image_url: '',
  title_fr: '',
  title_en: '',
  subtitle_fr: '',
  subtitle_en: '',
  active: true,
}

export default function LandingSlidesTab({
  toast,
}: {
  toast?: (t: { msg: string; type: 'success' | 'error' }) => void
}) {
  const [slides, setSlides] = useState<LandingSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const notify = (text: string, ok = true) => {
    toast?.({ msg: text, type: ok ? 'success' : 'error' })
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 4000)
  }

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/landing-slides')
    const data = await res.json()
    setSlides(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fd = new FormData()
    fd.append('file', file)
    fd.append('path', `landing-slides/slide-${Date.now()}.${ext}`)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const json = await res.json()
    if (!res.ok) {
      notify('Erreur upload: ' + json.error, false)
      setUploading(false)
      return
    }
    setForm(f => ({ ...f, image_url: json.url }))
    setUploading(false)
    notify('Image uploadee')
  }

  const handleSave = async () => {
    if (!form.image_url) { notify('Une image est requise', false); return }
    const payload = {
      image_url: form.image_url,
      title_fr: form.title_fr || null,
      title_en: form.title_en || null,
      subtitle_fr: form.subtitle_fr || null,
      subtitle_en: form.subtitle_en || null,
      active: form.active,
    }
    if (editId) {
      const res = await fetch('/api/admin/landing-slides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...payload }),
      })
      const json = await res.json()
      if (!res.ok) { notify('Erreur: ' + json.error, false); return }
      notify('Slide mis a jour')
    } else {
      const maxOrder = slides.length ? Math.max(...slides.map(s => s.sort_order)) + 1 : 0
      const res = await fetch('/api/admin/landing-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, sort_order: maxOrder }),
      })
      const json = await res.json()
      if (!res.ok) { notify('Erreur: ' + json.error, false); return }
      notify('Slide ajoute')
    }
    setForm(EMPTY)
    setEditId(null)
    load()
  }

  const handleEdit = (s: LandingSlide) => {
    setEditId(s.id)
    setForm({
      image_url: s.image_url,
      title_fr: s.title_fr || '',
      title_en: s.title_en || '',
      subtitle_fr: s.subtitle_fr || '',
      subtitle_en: s.subtitle_en || '',
      active: s.active,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce slide ?')) return
    await fetch(`/api/admin/landing-slides?id=${id}`, { method: 'DELETE' })
    notify('Slide supprime')
    load()
  }

  const toggleActive = async (s: LandingSlide) => {
    await fetch('/api/admin/landing-slides', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, active: !s.active }),
    })
    load()
  }

  const moveSlide = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= slides.length) return
    const a = slides[idx]; const b = slides[target]
    await fetch('/api/admin/landing-slides', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, sort_order: b.sort_order }),
    })
    await fetch('/api/admin/landing-slides', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: b.id, sort_order: a.sort_order }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1a2744] rounded-2xl border border-white/10 p-6">
        <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
          <ImageIcon size={15} className="text-orange-400" />
          {editId ? 'Modifier le slide' : 'Ajouter un slide'}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Photos de fond du carrousel principal de la page d'accueil. Titre et sous-titre optionnels.
        </p>

        {msg && (
          <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${msg.ok ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-red-900/50 text-red-300 border border-red-700'}`}>
            {msg.text}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            {form.image_url ? (
              <div className="relative group w-full h-44 rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <button
                    onClick={() => { setForm(f => ({ ...f, image_url: '' })); if (fileRef.current) fileRef.current.value = '' }}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs"
                  >Retirer</button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs"
                  >Changer</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-44 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-orange-400 transition text-slate-400 hover:text-orange-400"
              >
                {uploading
                  ? <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  : <><Upload size={22} /><span className="text-sm">Uploader une photo</span></>}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]) }} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Titre (FR)</label>
            <input
              value={form.title_fr}
              onChange={e => setForm(f => ({ ...f, title_fr: e.target.value }))}
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm bg-slate-800 text-white placeholder-slate-500"
              placeholder="Securite totale sur vos chantiers"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Titre (EN)</label>
            <input
              value={form.title_en}
              onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))}
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm bg-slate-800 text-white placeholder-slate-500"
              placeholder="Total safety on your jobsites"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Sous-titre (FR)</label>
            <input
              value={form.subtitle_fr}
              onChange={e => setForm(f => ({ ...f, subtitle_fr: e.target.value }))}
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm bg-slate-800 text-white placeholder-slate-500"
              placeholder="AST, permis, inspections et plus"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Sous-titre (EN)</label>
            <input
              value={form.subtitle_en}
              onChange={e => setForm(f => ({ ...f, subtitle_en: e.target.value }))}
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm bg-slate-800 text-white placeholder-slate-500"
              placeholder="JSA, permits, inspections and more"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
              <div className="w-10 h-5 bg-slate-600 peer-checked:bg-orange-500 rounded-full transition peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
            <span className="text-sm text-slate-300">Visible</span>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
          >
            <Plus size={15} /> {editId ? 'Mettre a jour' : 'Ajouter'}
          </button>
          {editId && (
            <button
              onClick={() => { setForm(EMPTY); setEditId(null) }}
              className="border border-white/20 text-slate-300 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-white/5 transition"
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#1a2744] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Slides actifs — {slides.length} slide{slides.length !== 1 ? 's' : ''}</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Chargement...</div>
        ) : slides.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Aucun slide — ajoutez-en un ci-dessus.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {slides.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                  <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{s.title_fr || '(sans titre)'}</p>
                  <p className="text-xs text-slate-400 truncate">{s.subtitle_fr || ''}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-25 transition rounded">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => moveSlide(idx, 1)} disabled={idx === slides.length - 1}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-25 transition rounded">
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => toggleActive(s)}
                    className={`p-1.5 rounded transition ${s.active ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-400'}`}>
                    {s.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => handleEdit(s)}
                    className="p-1.5 text-slate-400 hover:text-orange-400 transition rounded text-xs font-medium">
                    Editer
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
