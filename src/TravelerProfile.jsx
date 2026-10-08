import { useMemo, useState } from 'react'
import { Accessibility, BedDouble, Check, Heart, MapPin, Save, Sparkles, Utensils } from 'lucide-react'
import { demoProfiles } from './data.js'
import './travelerProfile.css'

const cuisines = [
  ['Tunisienne traditionnelle', 'tunisienne'], ['Méditerranéenne', 'méditerranéenne'],
  ['Fruits de mer / poisson', 'fruits de mer'], ['Street food', 'street food'],
  ['Végétarienne', 'végétarienne'], ['Végane', 'végane'], ['Italienne', 'italienne'],
  ['Asiatique', 'asiatique'], ['Pâtisseries orientales', 'pâtisseries orientales'],
  ['Cuisine internationale', 'internationale'],
]
const activities = [
  'Culture', 'Sites historiques', 'Plage', 'Sports nautiques', 'Nature', 'Randonnée',
  'Désert et dunes', 'Shopping et souks', 'Artisanat', 'Vie nocturne', 'Bien-être / spa',
  'Photographie', 'Festivals', 'Activités en famille',
]
const diets = ['halal', 'sans gluten', 'végétarien', 'végane', 'aucune restriction']
const transportModes = ['Voiture de location', 'Taxi', 'Transport en commun', 'À pied', 'Vélo']
const stays = ['Hôtel', 'Maison d’hôtes', 'Riad', 'Résidence', 'Camping']

const toggleValue = (values = [], value) => values.includes(value) ? values.filter((item) => item !== value) : [...values, value]

export default function TravelerProfile({ profile, updateProfile, toggleChoice, onSave, onLoadDemo }) {
  const [selectedDemo, setSelectedDemo] = useState('')
  const [saved, setSaved] = useState(false)
  const percent = useMemo(() => {
    const checks = [
      Boolean(profile.firstName), Boolean(profile.ageRange), Boolean(profile.location),
      Boolean(profile.languages?.length), Boolean(profile.cuisines?.length),
      Boolean(profile.activities?.length), Boolean(profile.company), Boolean(profile.transport),
      Boolean(profile.accommodation), Boolean(profile.dailyBudget),
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [profile])
  const setStyle = (key, value) => updateProfile('style', { ...(profile.style || {}), [key]: Number(value) })
  const loadProfile = (id) => {
    setSelectedDemo(id)
    const sample = demoProfiles.find((item) => item.id === id)
    if (sample) onLoadDemo(sample)
  }
  const summary = `Voyageur${profile.firstName ? '·se' : '·se'} ${profile.interests?.length ? `curieux·se, amateur·rice de ${profile.cuisines?.[0] || 'saveurs locales'} et de ${profile.interests.slice(0, 2).join(' et ').toLowerCase()}` : 'en quête de découvertes'}${(profile.style?.calm ?? 50) < 45 ? ', qui préfère le calme' : ', qui aime les ambiances animées'}${profile.constraints?.includes('Marche limitée') ? ' et limite ses déplacements' : ''}.`

  return <>
    <div className="profile-page-heading"><div><span className="eyebrow">VOTRE BOUSSOLE PERSONNELLE</span><h1>Profil & centres d’intérêt</h1><p>Quelques envies suffisent pour dessiner des voyages plus proches de vous.</p></div><label className="demo-profile-select"><span>Charger un profil exemple</span><select value={selectedDemo} onChange={(event) => loadProfile(event.target.value)}><option value="">Choisir un profil…</option>{demoProfiles.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label></div>
    <div className="profile-progress"><div><span>Votre profil est complété à <strong>{percent}%</strong></span><span>{percent < 100 ? 'Continuez à partager vos envies' : 'Votre boussole est prête'}</span></div><span className="profile-progress-track"><i style={{ width: `${percent}%` }} /></span></div>
    <div className="traveler-profile-layout"><div className="traveler-profile-form">
      <section className="traveler-section"><SectionTitle icon={<Heart size={17} />} title="Votre identité" text="Quelques repères pour partir du bon pied." /><div className="traveler-fields three-columns"><label className="field-label">Prénom<input value={profile.firstName || ''} onChange={(event) => updateProfile('firstName', event.target.value)} placeholder="Votre prénom" /></label><label className="field-label">Tranche d’âge<select value={profile.ageRange || ''} onChange={(event) => updateProfile('ageRange', event.target.value)}><option value="">Choisir une tranche</option>{['18–24 ans', '25–34 ans', '35–44 ans', '45–59 ans', '60 ans et +'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Ville / pays de départ<input value={profile.location || ''} onChange={(event) => updateProfile('location', event.target.value)} placeholder="Ex. Tunis, Tunisie" /></label><label className="field-label">Langues parlées<select value={profile.languages?.[0] || 'Français'} onChange={(event) => updateProfile('languages', [event.target.value])}>{['Français', 'Arabe', 'Anglais', 'Italien', 'Allemand'].map((item) => <option key={item}>{item}</option>)}</select></label></div></section>
      <section className="traveler-section"><SectionTitle icon={<Utensils size={17} />} title="À table, à votre goût" text="On prendra soin de vos envies et de vos contraintes alimentaires." /><ChoiceChips options={cuisines} values={profile.cuisines || []} onToggle={(value) => toggleChoice('cuisines', value)} /><div className="profile-subsection"><strong>Régime et restrictions</strong><ChoiceChips options={diets} values={profile.diet || []} onToggle={(value) => toggleChoice('diet', value)} /></div><div className="traveler-fields three-columns"><label className="field-label">Allergies à signaler<input value={profile.allergies || ''} onChange={(event) => updateProfile('allergies', event.target.value)} placeholder="Ex. arachides, crustacés…" /></label><RangeField label="Niveau d’épices" low="Doux" high="Épicé" value={profile.spice ?? 2} min={1} max={5} onChange={(value) => updateProfile('spice', Number(value))} /><RangeField label="Budget repas habituel" low="10 DT" high="100 DT" value={profile.mealBudget ?? 35} min={10} max={100} suffix=" DT" onChange={(value) => updateProfile('mealBudget', Number(value))} /></div></section>
      <section className="traveler-section"><SectionTitle icon={<Sparkles size={17} />} title="Vos envies de voyage" text="Sélectionnez les expériences qui vous attirent." /><ChoiceChips options={activities} values={profile.activities || []} onToggle={(value) => toggleChoice('activities', value)} /></section>
      <section className="traveler-section"><SectionTitle icon={<SlidersHorizontalIcon />} title="Votre style de voyage" text="Ajustez le curseur. Il n’y a pas de mauvais rythme." /><div className="style-ranges"><RangeField label="Rythme" low="Calme" high="Animé" value={profile.style?.calm ?? 50} onChange={(value) => setStyle('calm', value)} /><RangeField label="Énergie" low="Relax" high="Aventure" value={profile.style?.adventure ?? 50} onChange={(value) => setStyle('adventure', value)} /><RangeField label="Ambiance" low="Authentique" high="Confort" value={profile.style?.authentic ?? 50} onChange={(value) => setStyle('authentic', value)} /><RangeField label="Déplacements" low="Tout proche" high="Je veux tout voir" value={profile.style?.mobility ?? 50} onChange={(value) => setStyle('mobility', value)} /></div><div className="traveler-fields three-columns profile-rhythm-fields"><label className="field-label">Votre rythme<select value={profile.pace || 'Normal'} onChange={(event) => updateProfile('pace', event.target.value)}>{['Lève-tôt', 'Normal', 'Couche-tard'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Activités max. par jour<input type="number" min="1" max="5" value={profile.maxActivities ?? 4} onChange={(event) => updateProfile('maxActivities', Number(event.target.value))} /></label><label className="field-label">Type de voyage par défaut<select value={profile.company || 'Famille'} onChange={(event) => updateProfile('company', event.target.value)}>{['Solo', 'Couple', 'Famille', 'Amis'].map((item) => <option key={item}>{item}</option>)}</select></label></div></section>
      <section className="traveler-section"><SectionTitle icon={<Accessibility size={17} />} title="Mobilité & petites attentions" text="Pour que chaque étape soit confortable." /><ChoiceChips options={['Marche limitée', 'Accessibilité PMR', 'Voyage avec enfants', 'Voyage avec personnes âgées', 'Éviter les lieux trop touristiques']} values={profile.constraints || []} onToggle={(value) => toggleChoice('constraints', value)} /><div className="traveler-fields children-ages"><label className="field-label">Âge des enfants <span className="optional">(facultatif)</span><input value={profile.childrenAges || ''} onChange={(event) => updateProfile('childrenAges', event.target.value)} placeholder="Ex. 4 et 8 ans" /></label><label className="field-label">Autre besoin particulier<input value={profile.mobilityNotes || ''} onChange={(event) => updateProfile('mobilityNotes', event.target.value)} placeholder="À partager avec VOYARA" /></label></div></section>
      <section className="traveler-section"><SectionTitle icon={<BedDouble size={17} />} title="Vos habitudes sur la route" text="Le confort et le budget qui vous conviennent." /><div className="traveler-fields three-columns"><label className="field-label">Hébergement préféré<select value={profile.accommodation || 'Maison d’hôtes'} onChange={(event) => updateProfile('accommodation', event.target.value)}>{stays.map((item) => <option key={item}>{item}</option>)}</select></label><RangeField label="Budget hébergement / nuit" low="40 DT" high="300 DT" value={profile.accommodationBudget ?? 100} min={40} max={300} suffix=" DT" onChange={(value) => updateProfile('accommodationBudget', Number(value))} /><label className="field-label">Transport préféré<select value={profile.transport || 'Taxi'} onChange={(event) => updateProfile('transport', event.target.value)}>{transportModes.map((item) => <option key={item}>{item}</option>)}</select></label><RangeField label="Budget habituel par jour" low="40 DT" high="300 DT" value={profile.dailyBudget ?? 100} min={40} max={300} suffix=" DT" onChange={(value) => updateProfile('dailyBudget', Number(value))} /></div></section>
      <button className="button-primary save-profile-button" onClick={() => { onSave(); setSaved(true); window.setTimeout(() => setSaved(false), 2400) }}><Save size={16} /> {saved ? 'Profil enregistré' : 'Enregistrer mon profil'} <Check size={15} /></button>
    </div><aside className="traveler-profile-aside"><div className="traveler-dna-card"><span className="eyebrow">VOTRE ADN DE VOYAGEUR</span><h2>{profile.firstName ? `${profile.firstName}, votre façon de voyager.` : 'Votre façon de voyager.'}</h2><p>{summary}</p><TravelerRadar profile={profile} /></div><div className="profile-context-card"><span className="eyebrow">VOTRE CONTEXTE VOYAGEUR</span><ContextLine icon="🍽" title="Cuisine" value={(profile.cuisines || []).slice(0, 2).join(' · ') || 'À découvrir'} /><ContextLine icon="♡" title="Activités" value={(profile.activities || []).slice(0, 3).join(' · ') || 'À découvrir'} /><ContextLine icon="↗" title="Rythme" value={profile.pace || 'Normal'} /><ContextLine icon="⌖" title="Mobilité" value={(profile.constraints || []).filter((item) => item.includes('Marche') || item.includes('PMR')).join(' · ') || 'Sans contrainte signalée'} /></div><div className="profile-privacy-note"><Sparkles size={15} /><span>Ces préférences serviront à expliquer pourquoi chaque étape est choisie pour vous.</span></div></aside></div>
  </>
}

function SectionTitle({ icon, title, text }) { return <div className="traveler-section-title"><span>{icon}</span><div><h2>{title}</h2><p>{text}</p></div></div> }
function SlidersHorizontalIcon() { return <span className="slider-title-icon">↔</span> }

function ChoiceChips({ options, values, onToggle }) {
  return <div className="traveler-choice-chips">{options.map((item) => { const [label, value] = Array.isArray(item) ? item : [item, item]; const selected = values.includes(value); return <button type="button" aria-pressed={selected} className={selected ? 'traveler-choice-selected' : ''} key={value} onClick={() => onToggle(value)}>{selected && <Check size={12} />}{label}</button> })}</div>
}

function RangeField({ label, low, high, value, min = 0, max = 100, suffix = '', onChange }) {
  return <label className="profile-range"><span>{label}</span><input aria-label={label} type="range" min={min} max={max} value={value} onChange={(event) => onChange(event.target.value)} /><span className="range-labels"><small>{low}</small><strong>{value}{suffix}</strong><small>{high}</small></span></label>
}

function TravelerRadar({ profile }) {
  const axes = [
    ['Culture', profile.activities?.some((item) => item.includes('Culture')) ? 90 : 45],
    ['Plage', profile.activities?.some((item) => item.includes('Plage')) ? 86 : 40],
    ['Nature', profile.activities?.some((item) => item.includes('Nature')) ? 76 : 48],
    ['Cuisine', profile.cuisines?.length ? 83 : 42],
    ['Aventure', profile.style?.adventure ?? 50],
    ['Détente', 100 - (profile.style?.calm ?? 50)],
  ]
  const point = (index, amount) => { const angle = (-Math.PI / 2) + (index * Math.PI * 2 / axes.length); const radius = amount * 0.36; return `${170 + Math.cos(angle) * radius},${156 + Math.sin(angle) * radius}` }
  return <svg className="traveler-radar" viewBox="0 0 340 325" role="img" aria-label="Radar de préférences voyageur"><g fill="none" stroke="#d7e5ed" strokeWidth="1">{[25, 50, 75, 100].map((level) => <polygon key={level} points={axes.map((_, index) => point(index, level)).join(' ')} />)}{axes.map(([label], index) => <line key={label} x1="170" y1="156" x2={point(index, 100).split(',')[0]} y2={point(index, 100).split(',')[1]} />)}</g><polygon points={axes.map(([, value], index) => point(index, value)).join(' ')} fill="#1d6fa533" stroke="#1d6fa5" strokeWidth="2" />{axes.map(([label], index) => { const [x, y] = point(index, 122).split(',').map(Number); return <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle">{label}</text> })}</svg>
}

function ContextLine({ icon, title, value }) { return <div className="context-line"><span>{icon}</span><div><small>{title}</small><strong>{value}</strong></div></div> }