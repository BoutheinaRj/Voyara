import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check,
  ChevronDown, Compass, Heart, MapPin, Menu, Plane, Plus, Sparkles,
  Store, Sun, Trash2, Users, X, CalendarDays, Utensils, SlidersHorizontal,
  MessageCircle, BedDouble, Bus, Accessibility, Clock3, Map, HelpCircle, Save,
} from 'lucide-react'
import {
  activityOptions, cuisineOptions, demoProfiles, demoProvider, destinations,
  imageUrl, interestOptions, itineraryDays, mockMessages, mockOffers,
  demoReservations, recommendations,
} from './data.js'
import { rankOffers, scoringWeights } from './scoring.js'
import TravelerProfile from './TravelerProfile.jsx'
import './itineraryDemo.css'
import './demoPages.css'
import {
  createReservation, getStore, publishOffer, removeOffer, saveProfile,
  saveTrip, subscribeStore, updateOffer, updateReservation, updateStore,
} from './store.js'

const initialProfile = {
  firstName: '',
  location: '',
  age: '',
  language: 'Français',
  interests: [],
  activities: [],
  pace: 'Équilibré',
  budget: 'Moyen',
  company: 'Famille',
  goals: [],
  cuisines: [],
  restrictions: '',
  foodStyle: 'Cuisine locale',
  destinations: ['Djerba', 'Sidi Bou Saïd', 'Tozeur'],
}

const initialProviderActivities = [
  { id: 1, title: 'Sortie en mer vers l’île aux flamants', category: 'Excursion en mer', location: 'Djerba, Houmt Souk', duration: '3 heures', price: 45, status: 'En ligne', bookings: 18, image: 'photo-1500375592092-40eb2168fd21' },
  { id: 2, title: 'Atelier de poterie à Guellala', category: 'Artisanat & culture', location: 'Djerba, Guellala', duration: '2 heures', price: 30, status: 'En ligne', bookings: 11, image: 'photo-1516483638261-f4dbaf036963' },
]

const navItems = [
  { id: 'home', label: 'Accueil', icon: Compass },
  { id: 'profile', label: 'Profil & centres d’intérêt', icon: Heart },
  { id: 'planner', label: 'Mon voyage', icon: Plane },
  { id: 'trips', label: 'Mes itinéraires', icon: MapPin },
  { id: 'how', label: 'Comment ça marche', icon: HelpCircle },
]

const preferenceSteps = [
  { title: 'Les voyages qui vous ressemblent', subtitle: 'Qu’est-ce qui vous donne envie de partir ?', options: interestOptions.map((item) => item.label), key: 'interests', type: 'interest' },
  { title: 'Vos petits plaisirs en voyage', subtitle: 'Les activités qui rendent un séjour inoubliable.', options: activityOptions, key: 'activities' },
  { title: 'Votre façon de voyager', subtitle: 'On s’occupe du bon équilibre.', key: 'style', type: 'style' },
  { title: 'À table, à votre façon', subtitle: 'Pour glisser les bonnes adresses dans vos itinéraires.', key: 'food', type: 'food' },
]

function App() {
  const sharedStore = useSyncExternalStore(subscribeStore, getStore, getStore)
  const [profile, setProfile] = useState(() => {
    if (localStorage.getItem('voyara-onboarded') !== 'true') return initialProfile
    try { return { ...initialProfile, ...sharedStore.profile, ...JSON.parse(localStorage.getItem('voyara-profile') || '{}') } }
    catch { return { ...initialProfile, ...sharedStore.profile } }
  })
  const [page, setPage] = useState(() => {
    if (localStorage.getItem('voyara-provider-onboarded') === 'true') return 'provider'
    return localStorage.getItem('voyara-onboarded') === 'true' ? 'home' : 'onboarding'
  })
  const [accountType, setAccountType] = useState(null)
  const [provider, setProvider] = useState(() => {
    try { return JSON.parse(localStorage.getItem('voyara-provider') || 'null') || sharedStore.provider }
    catch { return sharedStore.provider }
  })
  const [step, setStep] = useState(0)
  const [mobileNav, setMobileNav] = useState(false)
  const [tripText, setTripText] = useState('Je veux visiter Djerba pendant 3 jours avec ma famille, avec un budget de 300 DT. J’aime la plage, la culture et la cuisine locale.')
  const [destination, setDestination] = useState('Djerba, Tunisie')
  const [duration, setDuration] = useState('3 jours')
  const [budget, setBudget] = useState('300')
  const [travelers, setTravelers] = useState('4')
  const [tripCompany, setTripCompany] = useState('Famille')
  const [adjusting, setAdjusting] = useState(false)
  const [adaptation, setAdaptation] = useState('')
  const [toast, setToast] = useState('')
  const [lastGenerated, setLastGenerated] = useState(null)
  const [useProfile, setUseProfile] = useState(true)

  useEffect(() => {
    localStorage.setItem('voyara-profile', JSON.stringify(profile))
    saveProfile(profile)
  }, [profile])

  const updateProfile = (key, value) => setProfile((current) => ({ ...current, [key]: value }))
  const toggleChoice = (key, value) => updateProfile(key, (profile[key] || []).includes(value) ? profile[key].filter((item) => item !== value) : [...(profile[key] || []), value])
  const finishOnboarding = () => {
    localStorage.setItem('voyara-account-type', 'traveler')
    localStorage.setItem('voyara-onboarded', 'true')
    setPage('home')
  }
  const finishProviderSignup = (details) => {
    localStorage.setItem('voyara-account-type', 'provider')
    localStorage.setItem('voyara-provider-onboarded', 'true')
    localStorage.setItem('voyara-provider', JSON.stringify(details))
    setProvider(details)
    updateStore((current) => ({ ...current, provider: details }))
    setPage('provider')
  }
  const enterDemoTraveler = () => {
    setProfile({ ...initialProfile, ...demoProfiles[0] })
    localStorage.setItem('voyara-account-type', 'traveler')
    localStorage.setItem('voyara-onboarded', 'true')
    localStorage.removeItem('voyara-provider-onboarded')
    setPage('home')
  }
  const enterDemoProvider = () => {
    setProvider(demoProvider)
    updateStore((current) => ({ ...current, provider: demoProvider }))
    localStorage.setItem('voyara-provider', JSON.stringify(demoProvider))
    localStorage.setItem('voyara-account-type', 'provider')
    localStorage.setItem('voyara-provider-onboarded', 'true')
    setPage('provider')
  }
  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }
  const generateTrip = () => {
    const destinationMatch = destinations.find((item) => tripText.toLocaleLowerCase('fr').includes(item.toLocaleLowerCase('fr')))
    const daysMatch = tripText.match(/\b(\d+)\s*(?:jours?|j)\b/i)
    const budgetMatch = tripText.match(/\b(\d[\d ]*)\s*(?:dt|dinars?)\b/i)
    const travelersMatch = tripText.match(/\b(\d+)\s*(?:voyageurs?|personnes?|adultes?)\b/i)
    const textLower = tripText.toLocaleLowerCase('fr')
    const companyMatch = ['famille', 'couple', 'amis', 'solo'].find((item) => textLower.includes(item))
    const resolvedDestination = destinationMatch || destination.split(',')[0]
    const resolvedDays = Number(daysMatch?.[1]) || Number.parseInt(duration, 10) || 3
    const resolvedBudget = Number((budgetMatch?.[1] || '').replace(/\s/g, '')) || Number(budget)
    const resolvedTravelers = Number(travelersMatch?.[1]) || Number(travelers) || 1
    const resolvedCompany = companyMatch ? companyMatch[0].replace(/^./, (letter) => letter.toUpperCase()) : tripCompany
    setDestination(`${resolvedDestination}, Tunisie`)
    setDuration(`${resolvedDays} ${resolvedDays > 1 ? 'jours' : 'jour'}`)
    setBudget(String(resolvedBudget))
    setTravelers(String(resolvedTravelers))
    setTripCompany(resolvedCompany)
    const request = { text: tripText, destination: resolvedDestination, budget: resolvedBudget, duration: resolvedDays, travelers: resolvedTravelers, company: resolvedCompany, profile: useProfile ? profile : null, createdAt: new Date().toISOString() }
    setLastGenerated(request)
    setPage('itinerary')
    setAdaptation('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const adaptTrip = (suggestion) => {
    setAdjusting(true)
    window.setTimeout(() => {
      setAdaptation(suggestion)
      setAdjusting(false)
    }, 850)
  }

  if (page === 'onboarding') return <Onboarding profile={profile} updateProfile={updateProfile} toggleChoice={toggleChoice} step={step} setStep={setStep} finish={finishOnboarding} accountType={accountType} setAccountType={(role) => { if (role === 'traveler') { setProfile(initialProfile); setStep(0) } setAccountType(role) }} finishProviderSignup={finishProviderSignup} onDemoTraveler={enterDemoTraveler} onDemoProvider={enterDemoProvider} />
  if (page === 'provider') return <ProviderDashboard provider={provider || sharedStore.provider || demoProvider} activities={sharedStore.offers.filter((offer) => offer.provider === (provider?.businessName || sharedStore.provider.businessName))} reservations={sharedStore.reservations} messages={mockMessages} offers={sharedStore.offers} onPublish={(offer) => { publishOffer({ ...offer, provider: provider?.businessName || sharedStore.provider.businessName }); showToast('Offre publiée : elle peut désormais être recommandée aux voyageurs.') }} onDelete={removeOffer} onUpdateOffer={updateOffer} onUpdateReservation={updateReservation} onTravelerSpace={() => { localStorage.removeItem('voyara-provider-onboarded'); localStorage.setItem('voyara-account-type', 'traveler'); setPage('home') }} />

  return (
    <div className="app-shell">
      {mobileNav && <button className="mobile-scrim" aria-label="Fermer le menu" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <button className="brand" onClick={() => setPage('home')} aria-label="Voyara, accueil"><span className="brand-mark"><Sun size={19} strokeWidth={1.8} /></span><span>voyara<span className="brand-dot">.</span></span></button>
        <div className="sidebar-label">VOTRE ESPACE</div>
        <nav className="side-nav" aria-label="Navigation principale">
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-link ${page === id || (id === 'trips' && page === 'itinerary') || (id === 'discover' && page === 'planner') ? 'nav-active' : ''}`} onClick={() => { setPage(id); setMobileNav(false) }}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{id === 'trips' && sharedStore.savedTrips.length > 0 && <span className="nav-count">{sharedStore.savedTrips.length}</span>}</button>)}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-trip" style={{ backgroundImage: `linear-gradient(180deg, transparent 8%, rgba(8,40,43,.83) 100%), url(${imageUrl('photo-1539650116574-75c0c6d73f6e', 480)})` }}>
          <span className="trip-card-kicker">VOTRE PROCHAINE ESCALE</span><strong>Djerba vous attend.</strong><button onClick={() => setPage('planner')}>Imaginer le voyage <ArrowRight size={14} /></button>
        </div>
        <button className="sidebar-profile" onClick={() => setPage('profile')}><span className="avatar">{profile.firstName.slice(0, 1)}</span><span className="user-meta"><strong>{profile.firstName}</strong><small>Voyageuse curieuse</small></span><ChevronDown size={16} /></button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Ouvrir le menu" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
          <div className="breadcrumb">Votre espace <span>/</span> {page === 'home' ? 'Accueil' : page === 'planner' ? 'Planifier un voyage' : page === 'itinerary' ? 'Votre itinéraire' : page === 'profile' ? 'Mon profil' : 'À découvrir'}</div>
          <div className="topbar-right"><span className="shared-indicator" title="Données partagées entre les espaces (simulation)"><i /> Données partagées en temps réel · simulé</span><button className="space-switch" aria-label="Passer à l’espace prestataire" title="Passer à l’espace prestataire" onClick={() => { localStorage.setItem('voyara-account-type', 'provider'); setPage('provider') }}><Store size={14} /> Espace prestataire</button><span className="weather"><Sun size={16} /> 24° à Tunis</span><span className="topbar-divider" /><button className="avatar avatar-small" onClick={() => setPage('profile')} aria-label="Mon profil">{profile.firstName.slice(0, 1)}</button></div>
        </header>
        <div className="page-content">
          {page === 'home' && <Dashboard profile={profile} setPage={setPage} setTripText={setTripText} offers={sharedStore.offers} />}
          {page === 'discover' && <Discover profile={profile} offers={sharedStore.offers} onPlan={(name) => { setDestination(`${name}, Tunisie`); setPage('planner') }} />}
          {page === 'planner' && <Planner destination={destination} setDestination={setDestination} duration={duration} setDuration={setDuration} budget={budget} setBudget={setBudget} travelers={travelers} setTravelers={setTravelers} tripCompany={tripCompany} setTripCompany={setTripCompany} tripText={tripText} setTripText={setTripText} profile={profile} generateTrip={generateTrip} useProfile={useProfile} setUseProfile={setUseProfile} />}
          {page === 'itinerary' && <Itinerary destination={destination} duration={duration} budget={budget} travelers={travelers} adaptation={adaptation} adjusting={adjusting} adaptTrip={adaptTrip} setPage={setPage} offers={sharedStore.offers} request={lastGenerated} profile={profile} useProfile={useProfile} updateProfile={updateProfile} reservations={sharedStore.reservations} onReserve={(offer) => { createReservation({ traveler: profile.firstName, offerId: offer.id, date: new Date().toISOString().slice(0, 10), guests: Number(travelers), amount: Number(offer.price) * Number(travelers) }); showToast('Demande envoyée au prestataire.') }} onSave={() => { const trip = { destination, duration, budget: Number(budget), travelers: Number(travelers), request: lastGenerated, profileName: profile.firstName }; saveTrip(trip); showToast('Itinéraire enregistré dans Mes itinéraires.') }} />}
          {page === 'profile' && <TravelerProfile profile={profile} updateProfile={updateProfile} toggleChoice={toggleChoice} onSave={() => showToast('Votre profil a bien été enregistré dans VOYARA.')} onLoadDemo={(sample) => { const nextProfile = { ...initialProfile, ...sample }; setProfile(nextProfile); saveProfile(nextProfile) }} />}
          {page === 'trips' && <TripsPage trips={sharedStore.savedTrips} setPage={setPage} onOpenTrip={(trip) => { setDestination(`${trip.destination}, Tunisie`); setDuration(trip.duration); setBudget(String(trip.budget)); setTravelers(String(trip.travelers)); setTripText(trip.request?.text || ''); setLastGenerated(trip.request); setPage('itinerary') }} />}
          {page === 'how' && <HowItWorks setPage={setPage} />}
        </div>
      </main>
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  )
}

function Onboarding({ profile, updateProfile, toggleChoice, step, setStep, finish, accountType, setAccountType, finishProviderSignup, onDemoTraveler, onDemoProvider }) {
  const [error, setError] = useState('')
  if (!accountType) return <AccountTypeChoice onChoose={setAccountType} onDemoTraveler={onDemoTraveler} onDemoProvider={onDemoProvider} />
  if (accountType === 'provider') return <ProviderSignup onBack={() => setAccountType(null)} onFinish={finishProviderSignup} />

  const continueStep = () => {
    if (step === 0 && (!profile.firstName.trim() || !profile.location.trim())) {
      setError('Renseignez votre prénom et votre ville pour continuer.')
      return
    }
    setError('')
    setStep(step + 1)
  }

  return (
    <div className="onboarding-shell">
      <section className="onboarding-visual" style={{ backgroundImage: `linear-gradient(180deg, rgba(11,43,45,.06) 25%, rgba(11,43,45,.78) 100%), url(${imageUrl('photo-1539650116574-75c0c6d73f6e', 1500)})` }}>
        <button className="brand brand-light" onClick={() => setStep(0)}><span className="brand-mark"><Sun size={19} /></span><span>voyara<span className="brand-dot">.</span></span></button>
        <div className="visual-caption"><span className="eyebrow light-eyebrow">LE VOYAGE COMMENCE ICI</span><h1>Et si le plus beau voyage était <em>celui qui vous ressemble&nbsp;?</em></h1><p>Quelques envies suffisent. On imagine la suite ensemble.</p><span className="photo-credit">DJERBA · TUNISIE</span></div>
      </section>
      <section className="onboarding-panel">
        <div className="onboarding-head"><button className="register-back" onClick={() => setAccountType(null)}><ArrowLeft size={14} /> Changer d’espace</button><span className="step-count">{step + 1} <span>/ 6</span></span></div>
        <div className="progress-track"><span style={{ width: `${((step + 1) / 6) * 100}%` }} /></div>
        <div className="onboarding-body">
          {step === 0 && <><span className="eyebrow">D’ABORD, FAISONS CONNAISSANCE</span><h2>Bienvenue chez<br />vous, {profile.firstName || 'voyageur'}.</h2><p className="section-description">Un voyage pensé autour de vous commence par quelques détails.</p><div className="field-grid"><label className="field-label">Votre prénom<input required value={profile.firstName} onChange={(event) => updateProfile('firstName', event.target.value)} placeholder="Ex. Sarra" /></label><label className="field-label">Votre ville<input required value={profile.location} onChange={(event) => updateProfile('location', event.target.value)} placeholder="Ville, pays" /></label><label className="field-label">Votre âge <span className="optional">(facultatif)</span><input type="number" value={profile.age} onChange={(event) => updateProfile('age', event.target.value)} placeholder="Ex. 24" /></label><label className="field-label">Votre langue<select value={profile.language} onChange={(event) => updateProfile('language', event.target.value)}><option>Français</option><option>العربية</option><option>English</option></select></label></div></>}
          {step === 1 && <ChoiceStep step={preferenceSteps[0]} profile={profile} toggleChoice={toggleChoice} />}
          {step === 2 && <ChoiceStep step={preferenceSteps[1]} profile={profile} toggleChoice={toggleChoice} />}
          {step === 3 && <StyleStep profile={profile} updateProfile={updateProfile} toggleChoice={toggleChoice} />}
          {step === 4 && <FoodStep profile={profile} updateProfile={updateProfile} toggleChoice={toggleChoice} />}
          {step === 5 && <ProfileSummary profile={profile} />}
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="onboarding-footer"><button className="text-button" onClick={() => step === 0 ? setAccountType(null) : setStep(step - 1)}><ArrowLeft size={16} /> {step === 0 ? 'Changer d’espace' : 'Retour'}</button>{step < 5 ? <button className="button-primary" onClick={continueStep}>Continuer <ArrowRight size={16} /></button> : <button className="button-primary" onClick={finish}>Créer mon profil <Sparkles size={16} /></button>}</div>
        <div className="privacy-note"><Heart size={13} /> Vos envies restent les vôtres. Toujours.</div>
      </section>
    </div>
  )
}

function AccountTypeChoice({ onChoose, onDemoTraveler, onDemoProvider }) {
  return (
    <div className="account-choice-shell">
      <header className="account-choice-header">
        <button className="brand" aria-label="Voyara"><span className="brand-mark"><Sun size={19} /></span><span>voyara<span className="brand-dot">.</span></span></button>
        <span className="choice-header-note">LE VOYAGE COMMENCE ENSEMBLE</span>
      </header>
      <main className="account-choice-main">
        <div className="choice-intro"><span className="eyebrow">BIENVENUE CHEZ VOYARA</span><h1>Votre voyage commence<br />par un choix.</h1><p>Quel espace souhaitez-vous rejoindre&nbsp;?</p></div>
        <div className="account-role-grid">
          <button className="account-role-card traveler-role" onClick={() => onChoose('traveler')} style={{ backgroundImage: `linear-gradient(180deg, rgba(11,43,75,.02) 8%, rgba(11,43,75,.82) 100%), url(${imageUrl('photo-1507525428034-b723cf961d3e', 900)})` }}>
            <span className="role-symbol"><Plane size={20} /></span><span className="role-kicker">POUR LES VOYAGEURS</span><strong>Partir à votre façon.</strong><span className="role-description">Des idées et des itinéraires imaginés selon vos envies.</span><span className="role-continue">Créer mon espace <ArrowRight size={16} /></span>
          </button>
          <button className="account-role-card provider-role" onClick={() => onChoose('provider')} style={{ backgroundImage: `linear-gradient(180deg, rgba(11,43,75,.02) 8%, rgba(11,43,75,.84) 100%), url(${imageUrl('photo-1516483638261-f4dbaf036963', 900)})` }}>
            <span className="role-symbol"><Store size={20} /></span><span className="role-kicker">POUR LES PROFESSIONNELS DU TOURISME</span><strong>Faire découvrir votre région.</strong><span className="role-description">Présentez vos activités et rencontrez de nouveaux voyageurs.</span><span className="role-continue">Créer mon espace prestataire <ArrowRight size={16} /></span>
          </button>
        </div>
        <div className="demo-entry"><span>ACCÈS RAPIDE POUR LA DÉMO</span><button onClick={onDemoTraveler}>Entrer en tant que Sarra <ArrowRight size={14} /></button><button onClick={onDemoProvider}>Entrer en tant que Hôtel Dar Djerba <ArrowRight size={14} /></button></div>
        <p className="account-choice-footer"><MapPin size={14} /> Deux espaces, une même envie de faire voyager.</p>
      </main>
      <footer className="account-choice-bottom"><span>VOYARA</span><span>Votre prochaine histoire n’attend que vous.</span></footer>
    </div>
  )
}

function ProviderSignup({ onBack, onFinish }) {
  const [form, setForm] = useState({ businessName: '', contactName: '', email: '', city: 'Djerba, Tunisie', category: 'Excursions & sorties' })
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  return (
    <div className="onboarding-shell provider-signup-shell">
      <section className="onboarding-visual provider-visual" style={{ backgroundImage: `linear-gradient(180deg, rgba(11,43,75,.04) 18%, rgba(11,43,75,.82) 100%), url(${imageUrl('photo-1516483638261-f4dbaf036963', 1500)})` }}>
        <button className="brand brand-light" onClick={onBack}><span className="brand-mark"><Sun size={19} /></span><span>voyara<span className="brand-dot">.</span></span></button>
        <div className="visual-caption"><span className="eyebrow light-eyebrow">ESPACE PRESTATAIRE</span><h1>Votre savoir-faire<br />mérite le <em>voyage.</em></h1><p>Faites découvrir vos expériences à ceux qui rêvent de les vivre.</p><span className="photo-credit">LES PLUS BELLES HISTOIRES SONT LOCALES</span></div>
      </section>
      <section className="provider-signup-panel">
        <button className="register-back" onClick={onBack}><ArrowLeft size={14} /> Choisir un autre espace</button>
        <span className="eyebrow">VOTRE ACTIVITÉ, VOTRE HISTOIRE</span><h2>Bienvenue à bord.</h2><p className="section-description">Présentez votre activité pour commencer à rencontrer des voyageurs.</p>
        <form className="provider-signup-form" onSubmit={(event) => { event.preventDefault(); onFinish(form) }}>
          <label className="field-label">Nom de votre activité<input required value={form.businessName} onChange={(event) => update('businessName', event.target.value)} placeholder="Ex. Les sorties de Sami" /></label>
          <label className="field-label">Votre nom<input required value={form.contactName} onChange={(event) => update('contactName', event.target.value)} placeholder="Ex. Sami Ben Ali" /></label>
          <label className="field-label">Adresse e-mail<input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="vous@votre-activite.tn" /></label>
          <label className="field-label">Votre région<input required value={form.city} onChange={(event) => update('city', event.target.value)} placeholder="Ville, région" /></label>
          <label className="field-label provider-wide-field">Votre spécialité<select value={form.category} onChange={(event) => update('category', event.target.value)}><option>Excursions & sorties</option><option>Hébergement</option><option>Restaurant & gastronomie</option><option>Artisanat & culture</option><option>Transport touristique</option><option>Guide local</option></select></label>
          <button className="button-primary provider-signup-submit" type="submit">Créer mon espace <ArrowRight size={16} /></button>
        </form>
        <p className="provider-signup-note"><BadgeCheck size={15} /> Vous pourrez compléter et modifier votre activité à tout moment.</p>
      </section>
    </div>
  )
}

function ProviderDashboard({ provider, activities, reservations, messages, offers, onPublish, onDelete, onUpdateOffer, onUpdateReservation, onTravelerSpace }) {
  const [section, setSection] = useState('dashboard')
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [aiWriting, setAiWriting] = useState(false)
  const [toast, setToast] = useState('')
  const ownOffers = activities || []
  const incoming = reservations || []
  const [form, setForm] = useState({ name: '', description: '', category: 'Activité', destination: provider.city?.split(',')[0] || 'Djerba', price: '', duration: '2 heures', hours: '09:00', tagsText: '', family: true, accessibility: false, cuisine: '', status: 'Publiée', walk: 'faible', ambiance: 'calme' })
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 3000) }
  const resetForm = () => { setForm({ name: '', description: '', category: 'Activité', destination: provider.city?.split(',')[0] || 'Djerba', price: '', duration: '2 heures', hours: '09:00', tagsText: '', family: true, accessibility: false, cuisine: '', status: 'Publiée', walk: 'faible', ambiance: 'calme' }); setEditingId(null) }
  const submitOffer = (event) => {
    event.preventDefault()
    const image = form.category.includes('Restaurant') ? 'photo-1547592180' : form.category.includes('mer') || form.category.includes('Mer') ? 'photo-1500375592092' : 'photo-1516483638261'
    const savedOffer = { ...form, id: editingId || undefined, provider: provider.businessName, price: Number(form.price) || 0, tags: form.tagsText.split(',').map((tag) => tag.trim()).filter(Boolean), image, x: 55, y: 42, popularity: 80 }
    if (editingId) { onUpdateOffer(editingId, savedOffer); notify('Votre offre a bien été mise à jour.') }
    else { onPublish(savedOffer); notify('Offre publiée : elle peut désormais être recommandée aux voyageurs.') }
    setModal(false)
    resetForm()
  }
  const startEdit = (offer) => { setEditingId(offer.id); setForm({ ...offer, tagsText: (offer.tags || []).join(', '), accessibility: Boolean(offer.accessibility) }); setModal(true) }
  const duplicateOffer = (offer) => onPublish({ ...offer, id: undefined, name: `${offer.name} (copie)`, status: 'Brouillon' })
  const runDescriptionAssist = () => {
    setAiWriting(true)
    window.setTimeout(() => { setForm((current) => ({ ...current, description: current.description ? `${current.description.trim().replace(/[.!?]$/, '')}. Une expérience authentique, proposée par un partenaire local et pensée pour vous faire découvrir ${current.destination}.` : `Découvrez ${current.destination} autrement lors d’une expérience locale conviviale, guidée par un partenaire qui connaît la région.`, tagsText: current.tagsText || 'local, culture, famille' })); setAiWriting(false) }, 750)
  }
  const pending = incoming.filter((item) => item.status === 'En attente').length
  const revenue = incoming.filter((item) => item.status === 'Confirmée').reduce((sum, item) => sum + Number(item.amount), 0)
  const nav = [['dashboard', 'Tableau de bord'], ['offers', 'Mes offres'], ['calendar', 'Disponibilités'], ['bookings', `Demandes${pending ? ` · ${pending}` : ''}`], ['messages', 'Communication'], ['profile', 'Mon établissement']]
  const toggleStatus = (offer) => onUpdateOffer(offer.id, { status: offer.status === 'Brouillon' ? 'Publiée' : 'Brouillon' })

  return <div className="provider-dashboard">
    <header className="provider-topbar"><button className="brand" aria-label="VOYARA"><span className="brand-mark"><Sun size={19} /></span><span>voyara<span className="brand-dot">.</span></span></button><nav className="provider-main-nav" aria-label="Navigation prestataire">{nav.map(([id, label]) => <button key={id} className={section === id ? 'provider-nav-active' : ''} onClick={() => setSection(id)}>{label}</button>)}</nav><div className="provider-top-actions"><span className="live-share"><i /> Données partagées en temps réel (simulé)</span><button className="provider-switch" onClick={onTravelerSpace}><Plane size={15} /> Espace Voyageur</button></div></header>
    <main className="provider-content">
      <section className="provider-welcome"><div><span className="eyebrow">ESPACE PRESTATAIRE · {provider.city?.toUpperCase()}</span><h1>Bonjour, {provider.contactName?.split(' ')[0] || 'partenaire'}.</h1><p>Votre établissement au cœur des prochaines découvertes.</p></div><span className="provider-account-pill"><BadgeCheck size={15} /> {provider.businessName}</span></section>
      {section === 'dashboard' && <>
        <div className="provider-stats"><StatCard icon={<EyeIcon />} value="2 480" label="Vues de mes offres" /><StatCard icon={<MessageCircle size={18} />} value={String(incoming.length)} label="Demandes reçues" /><StatCard icon={<BadgeCheck size={18} />} value={String(incoming.filter((item) => item.status === 'Confirmée').length)} label="Réservations confirmées" /><StatCard icon={<span>DT</span>} value={String(revenue)} label="Revenu estimé" /><StatCard icon={<Sparkles size={18} />} value="78 %" label="Apparition dans les itinéraires" /></div>
        <div className="provider-workspace-grid"><section className="provider-panel"><div className="provider-section-heading"><div><span className="eyebrow">CETTE SEMAINE</span><h2>Les voyageurs nous découvrent.</h2></div><span className="activity-count">Demandes d’itinéraire</span></div><WeeklyChart /></section><aside className="provider-panel"><div className="provider-section-heading"><div><span className="eyebrow">CE QUE VOYARA RETIENT</span><h2>Vos offres recommandées.</h2></div></div>{ownOffers.slice(0, 3).map((offer) => <div className="top-offer-row" key={offer.id}><span><strong>{offer.name}</strong><small>{offer.destination} · {offer.category}</small></span><b>{offer.popularity || 80}%</b></div>)}<div className="traveler-match-note"><Users size={15} /><span>Familles · Culture · Budget moyen<br /><strong>Profils qui correspondent à vos offres</strong></span></div></aside></div>
        <button className="new-trip-row provider-new-offer" onClick={() => { resetForm(); setModal(true) }}><span><Plus size={18} /></span><div><strong>Ajouter une offre à votre catalogue</strong><small>Elle pourra être recommandée dans les voyages créés par VOYARA.</small></div><ArrowRight size={16} /></button>
      </>}
      {section === 'offers' && <section className="provider-panel"><div className="provider-section-heading provider-list-header"><div><span className="eyebrow">CATALOGUE PARTAGÉ AVEC LES VOYAGEURS</span><h2>Mes offres</h2></div><button className="button-primary" onClick={() => { resetForm(); setModal(true) }}><Plus size={15} /> Nouvelle offre</button></div><OfferGrid offers={ownOffers} onEdit={startEdit} onDuplicate={duplicateOffer} onDelete={onDelete} onToggle={toggleStatus} /></section>}
      {section === 'calendar' && <AvailabilityCalendar provider={provider} />}
      {section === 'bookings' && <ProviderReservations reservations={incoming} offers={offers} onUpdate={onUpdateReservation} />}
      {section === 'messages' && <ProviderMessages messages={messages} />}
      {section === 'profile' && <ProviderEstablishment provider={provider} onSave={(nextProvider) => notify(`Profil de ${nextProvider.businessName} enregistré.`)} />}
    </main>
    {modal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setModal(false); resetForm() } }}><form className="offer-modal" onSubmit={submitOffer}><div className="modal-heading"><div><span className="eyebrow">VOTRE CATALOGUE VOYARA</span><h2>{editingId ? 'Modifier votre offre' : 'Nouvelle offre'}</h2></div><button type="button" className="icon-button" aria-label="Fermer" onClick={() => { setModal(false); resetForm() }}><X size={18} /></button></div><div className="offer-form-grid"><label className="field-label">Nom de l’offre<input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex. Sortie en mer au coucher du soleil" /></label><label className="field-label">Catégorie<select value={form.category} onChange={(event) => update('category', event.target.value)}>{['Hébergement', 'Restaurant', 'Activité', 'Culture', 'Mer', 'Transport'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Destination<select value={form.destination} onChange={(event) => update('destination', event.target.value)}>{destinations.map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Prix (DT)<input required min="0" type="number" value={form.price} onChange={(event) => update('price', event.target.value)} placeholder="35" /></label><label className="field-label">Durée<input value={form.duration} onChange={(event) => update('duration', event.target.value)} placeholder="2 heures" /></label><label className="field-label">Horaires<input value={form.hours} onChange={(event) => update('hours', event.target.value)} placeholder="09:00–18:00" /></label><label className="field-label offer-wide">Description<textarea required rows="3" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Décrivez l’expérience et ses atouts." /></label><label className="field-label offer-wide">Tags, séparés par des virgules<input value={form.tagsText} onChange={(event) => update('tagsText', event.target.value)} placeholder="culture, local, famille" /></label><label className="field-label">Cuisine (si restaurant)<select value={form.cuisine || ''} onChange={(event) => update('cuisine', event.target.value)}><option value="">Sans objet</option>{['tunisienne', 'fruits de mer', 'méditerranéenne', 'végétarienne', 'street food'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Accessibilité<select value={form.accessibility ? 'Oui' : 'Non'} onChange={(event) => update('accessibility', event.target.value === 'Oui')}><option>Non</option><option>Oui</option></select></label><label className="field-label offer-wide">Description assistée<button type="button" className="ai-assist-button" onClick={runDescriptionAssist} disabled={aiWriting}><Sparkles size={14} /> {aiWriting ? 'VOYARA améliore votre texte…' : 'Améliorer ma description avec VOYARA'}</button></label></div><div className="modal-actions"><button className="text-button" type="button" onClick={() => { setModal(false); resetForm() }}>Annuler</button><button className="button-primary" type="submit"><Check size={15} /> {editingId ? 'Enregistrer' : 'Publier l’offre'}</button></div></form></div>}
    {toast && <div className="toast"><Check size={15} />{toast}</div>}
  </div>
}

function EyeIcon() { return <Compass size={18} /> }

function StatCard({ icon, value, label }) { return <div className="provider-stat-card"><span className="stat-icon">{icon}</span><span><strong>{value}</strong><small>{label}</small></span></div> }

function WeeklyChart() { return <div className="weekly-chart" aria-label="Demandes cette semaine"><div className="chart-y-labels"><span>30</span><span>20</span><span>10</span><span>0</span></div><div className="chart-columns">{[['Lun', 34], ['Mar', 55], ['Mer', 45], ['Jeu', 77], ['Ven', 62], ['Sam', 92], ['Dim', 48]].map(([label, height]) => <div className="chart-column" key={label}><span style={{ height: `${height}%` }} /><small>{label}</small></div>)}</div></div> }

function OfferGrid({ offers, onEdit, onDuplicate, onDelete, onToggle }) {
  return offers.length ? <div className="provider-activity-grid">{offers.map((offer) => <article className="provider-activity-card" key={offer.id}><div className="provider-activity-image" style={{ backgroundImage: `url(${imageUrl(offer.image)})` }}><span className={offer.status === 'Brouillon' ? 'draft-status' : ''}><i /> {offer.status || 'Publiée'}</span></div><div className="provider-activity-copy"><span className="eyebrow">{offer.category} · {offer.destination}</span><h3>{offer.name}</h3><span className="activity-place"><MapPin size={13} /> {offer.destination}</span><div className="provider-activity-meta"><span>{offer.duration}</span><strong>{offer.price} DT</strong></div><div className="offer-actions"><button onClick={() => onEdit(offer)}>Modifier</button><button onClick={() => onDuplicate(offer)}>Dupliquer</button><button onClick={() => onToggle(offer)}>{offer.status === 'Brouillon' ? 'Publier' : 'Dépublier'}</button><button aria-label={`Supprimer ${offer.name}`} onClick={() => onDelete(offer.id)}><Trash2 size={14} /></button></div></div></article>)}</div> : <div className="provider-empty-state"><Store size={24} /><strong>Votre prochaine offre commence ici.</strong><span>Ajoutez une activité pour la rendre visible aux voyageurs.</span></div>
}

function ProviderReservations({ reservations, offers, onUpdate }) {
  return <section className="provider-panel"><div className="provider-section-heading"><div><span className="eyebrow">LES VOYAGEURS VOUS ONT CHOISI</span><h2>Demandes & réservations</h2></div><span className="activity-count">{reservations.filter((item) => item.status === 'En attente').length} à traiter</span></div><div className="reservation-table-wrap"><table className="reservation-table"><thead><tr><th>Voyageur</th><th>Offre</th><th>Date</th><th>Voyageurs</th><th>Montant</th><th>Statut</th><th>Action</th></tr></thead><tbody>{reservations.map((reservation) => <tr key={reservation.id}><td>{reservation.traveler}</td><td>{offers.find((offer) => offer.id === reservation.offerId)?.name || 'Expérience locale'}</td><td>{reservation.date}</td><td>{reservation.guests}</td><td>{reservation.amount} DT</td><td><span className={`reservation-status status-${reservation.status.toLowerCase().replace('é', 'e').replace(' ', '-')}`}>{reservation.status}</span></td><td>{reservation.status === 'En attente' ? <div className="reservation-actions"><button onClick={() => onUpdate(reservation.id, 'Confirmée')}>Accepter</button><button onClick={() => onUpdate(reservation.id, 'Refusée')}>Refuser</button></div> : <span className="reservation-done">Mis à jour</span>}</td></tr>)}</tbody></table></div></section>
}

function AvailabilityCalendar({ provider }) {
  const [month, setMonth] = useState(5)
  const [blocked, setBlocked] = useState([])
  const dates = Array.from({ length: 30 }, (_, index) => index + 1)
  const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date(2026, month, 1))
  return <section className="provider-panel calendar-panel"><div className="provider-section-heading"><div><span className="eyebrow">DISPONIBILITÉS DE VOTRE ÉTABLISSEMENT</span><h2>Calendrier · {provider.businessName}</h2></div><span className="activity-count">Cliquez sur une date pour bloquer/libérer</span></div><div className="calendar-controls"><button onClick={() => setMonth((value) => (value + 11) % 12)}>←</button><strong>{monthName} 2026</strong><button onClick={() => setMonth((value) => (value + 1) % 12)}>→</button></div><div className="calendar-grid">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => <span className="calendar-day-label" key={day}>{day}</span>)}{dates.map((day) => <button className={`${blocked.includes(`${month}-${day}`) ? 'date-blocked' : day % 7 === 0 ? 'date-booked' : ''}`} key={day} onClick={() => setBlocked((current) => current.includes(`${month}-${day}`) ? current.filter((item) => item !== `${month}-${day}`) : [...current, `${month}-${day}`])}>{day}<small>{blocked.includes(`${month}-${day}`) ? 'Bloqué' : day % 7 === 0 ? 'Réservé' : 'Libre'}</small></button>)}</div><div className="calendar-legend"><span><i /> Disponible</span><span><i className="legend-booked" /> Réservé</span><span><i className="legend-blocked" /> Bloqué</span></div></section>
}

function ProviderMessages({ messages }) { return <section className="provider-panel"><div className="provider-section-heading"><div><span className="eyebrow">RESTEZ À L’ÉCOUTE</span><h2>Communication</h2></div></div><div className="message-list">{messages.map((message) => <button className="message-row" key={message.id}><span className="message-avatar">{message.name.slice(0, 1)}</span><span><strong>{message.name}</strong><small>{message.preview}</small></span><time>{message.time}</time>{message.unread && <i />}</button>)}</div><div className="provider-review"><strong>★★★★★</strong><span>« Une sortie magnifique, notre famille a adoré découvrir l’île autrement. »</span><small>Sarra B. · Avis vérifié</small></div></section> }

function ProviderEstablishment({ provider, onSave }) { const [form, setForm] = useState(provider); return <section className="provider-panel establishment-panel"><div className="provider-section-heading"><div><span className="eyebrow">VOTRE PRÉSENCE SUR VOYARA</span><h2>Mon établissement</h2></div></div><label className="field-label">Nom de l’établissement<input value={form.businessName} onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))} /></label><label className="field-label">Description<textarea rows="4" value={form.description || ''} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Présentez l’histoire de votre maison et de votre région." /></label><div className="provider-form-row"><label className="field-label">Contact<input value={form.contactName || ''} onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))} /></label><label className="field-label">E-mail<input value={form.email || ''} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label></div><button className="button-primary" onClick={() => onSave(form)}>Enregistrer mon établissement <Check size={15} /></button></section> }

function ChoiceStep({ step, profile, toggleChoice }) {
  const interest = step.type === 'interest'
  return <><span className="eyebrow">VOTRE PROFIL · {interest ? '01' : '02'}</span><h2>{step.title}</h2><p className="section-description">{step.subtitle}</p><div className={interest ? 'interest-grid' : 'activity-grid'}>{step.options.map((option, index) => {
    const selected = profile[step.key].includes(option)
    return interest ? <button key={option} className={`interest-tile ${selected ? 'choice-selected' : ''}`} onClick={() => toggleChoice(step.key, option)} style={{ backgroundImage: `linear-gradient(0deg, rgba(14,36,37,.78), rgba(14,36,37,.08)), url(${imageUrl(interestOptions[index].photo, 320)})` }}><span className="tile-icon">{interestOptions[index].icon}</span><span>{option}</span>{selected && <Check size={15} className="tile-check" />}</button> : <button key={option} className={`activity-chip ${selected ? 'chip-selected' : ''}`} onClick={() => toggleChoice(step.key, option)}>{selected && <Check size={14} />}{option}</button>
  })}</div></>
}

function StyleStep({ profile, updateProfile, toggleChoice }) {
  const groups = [
    ['pace', 'Quel rythme vous va bien ?', ['Relax', 'Équilibré', 'Intense']],
    ['budget', 'Quel budget vous ressemble ?', ['Économique', 'Moyen', 'Premium']],
    ['company', 'Vous partez avec qui ?', ['Seul', 'Couple', 'Famille', 'Amis']],
  ]
  return <><span className="eyebrow">VOTRE PROFIL · 03</span><h2>Votre façon<br />de voyager.</h2><p className="section-description">Il n’y a pas de bonne façon de partir. Juste la vôtre.</p>{groups.map(([key, title, options]) => <div className="choice-group" key={key}><h3>{title}</h3><div className="segmented">{options.map((option) => <button key={option} onClick={() => updateProfile(key, option)} className={profile[key] === option ? 'segment-active' : ''}>{option}</button>)}</div></div>)}<div className="choice-group"><h3>Qu’aimez-vous retrouver en chemin ?</h3><div className="activity-grid compact-chips">{['Détente', 'Découverte', 'Aventure', 'Expérience locale', 'Divertissement'].map((option) => <button key={option} className={`activity-chip ${profile.goals.includes(option) ? 'chip-selected' : ''}`} onClick={() => toggleChoice('goals', option)}>{option}</button>)}</div></div></>
}

function FoodStep({ profile, updateProfile, toggleChoice }) {
  return <><span className="eyebrow">VOTRE PROFIL · 04</span><h2>On se retrouve<br />autour d’une table.</h2><p className="section-description">Les meilleures histoires de voyage commencent souvent par un bon plat.</p><div className="food-grid">{cuisineOptions.map((option) => <button key={option} className={`food-option ${profile.cuisines.includes(option) ? 'food-selected' : ''}`} onClick={() => toggleChoice('cuisines', option)}>{option}{profile.cuisines.includes(option) && <Check size={15} />}</button>)}</div><label className="field-label food-restrictions">Allergies ou restrictions <span className="optional">(facultatif)</span><input value={profile.restrictions} onChange={(event) => updateProfile('restrictions', event.target.value)} placeholder="Ex. sans gluten, végétarien…" /></label><div className="choice-group"><h3>Votre adresse idéale ?</h3><div className="segmented">{['Restaurant', 'Street food', 'Cuisine locale'].map((option) => <button key={option} onClick={() => updateProfile('foodStyle', option)} className={profile.foodStyle === option ? 'segment-active' : ''}>{option}</button>)}</div></div></>
}

function ProfileSummary({ profile }) {
  return <><span className="eyebrow">VOTRE PROFIL · 05</span><h2>Voilà, {profile.firstName || 'voyageur'}.</h2><p className="section-description">Une première esquisse de vos prochaines belles histoires.</p><div className="summary-card"><div className="summary-avatar">{profile.firstName.slice(0, 1)}</div><div className="summary-content"><div className="summary-name">{profile.firstName}<span>{profile.location}</span></div><SummaryRow icon="♡" label="Vos envies" value={profile.interests.join(' · ')} /><SummaryRow icon="◎" label="À vivre" value={profile.activities.join(' · ')} /><SummaryRow icon="✳" label="À savourer" value={profile.cuisines.join(' · ')} /><SummaryRow icon="↗" label="Votre style" value={`${profile.budget} · ${profile.company} · Rythme ${profile.pace.toLowerCase()}`} /></div></div><div className="summary-footnote"><Sparkles size={16} /> Ce profil évolue avec vous, au fil de vos voyages.</div></>
}

function SummaryRow({ icon, label, value }) { return <div className="summary-row"><span className="summary-icon">{icon}</span><span><small>{label}</small><strong>{value || 'À découvrir'}</strong></span></div> }

function LegacyDashboard({ profile, setPage, setTripText }) {
  return <>
    <div className="welcome-row"><div><span className="eyebrow">{new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase()} · TUNIS, TUNISIE</span><h1>Bonjour, {profile.firstName}<span className="sun-emoji"> ✳</span></h1><p>Et si on partait un peu plus loin que prévu&nbsp;?</p></div><button className="button-outline" onClick={() => setPage('profile')}><span className="avatar avatar-tiny">{profile.firstName.slice(0, 1)}</span> Votre profil <ArrowUpRight size={15} /></button></div>
    <section className="hero-card" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,38,40,.83) 0%, rgba(8,38,40,.42) 52%, rgba(8,38,40,.05) 100%), url(${imageUrl('photo-1539650116574-75c0c6d73f6e', 1500)})` }}><span className="hero-location"><MapPin size={14} /> DJERBA, TUNISIE</span><div className="hero-copy"><span className="hero-kicker">L’INSPIRATION DU MOMENT</span><h2>Du bleu, du soleil,<br />et du temps pour vous.</h2><p>Une île à vivre à votre rythme. La vôtre, bientôt&nbsp;?</p><button className="button-light" onClick={() => setPage('planner')}>Imaginer mon voyage <ArrowRight size={16} /></button></div><div className="hero-index">01 <span>/ 03</span></div><div className="hero-dots"><i className="dot-on" /><i /><i /></div></section>
    <section className="quick-plan"><div className="quick-icon"><Sparkles size={19} /></div><div className="quick-copy"><h2>Une idée en tête&nbsp;?</h2><p>Racontez-nous, on dessine la suite.</p></div><textarea aria-label="Décrivez votre prochain voyage" defaultValue="Je veux partir à Djerba 3 jours avec ma famille, budget 300 DT. Plage, culture et cuisine locale." onChange={(event) => setTripText(event.target.value)} /><button className="button-primary" onClick={() => setPage('planner')}>Créer mon voyage <ArrowRight size={16} /></button></section>
    <section className="recommend-section"><div className="section-heading"><div><span className="eyebrow">COMPOSÉ POUR VOUS</span><h2>Vos envies prennent la route<span className="heading-period">.</span></h2></div><button className="text-link" onClick={() => setPage('discover')}>Tout explorer <ArrowRight size={15} /></button></div><div className="recommend-grid">{recommendations.map((item, index) => <RecommendationCard key={item.title} item={item} index={index} onClick={() => setPage('planner')} />)}</div><div className="personal-note"><span className="personal-spark"><Sparkles size={15} /></span><span><strong>On a pensé à vous.</strong> {profile.interests.length ? profile.interests.slice(0, 2).join(' et ').toLowerCase() : 'Vos envies'} : ces idées font écho à votre profil.</span><button aria-label="En savoir plus" onClick={() => setPage('profile')}><ArrowUpRight size={15} /></button></div></section>
    <section className="destination-strip"><div><span className="eyebrow">UNE ENVIE À GARDER SOUS LE COUDE</span><h2>La Tunisie a encore mille détours.</h2></div><button onClick={() => setPage('discover')}>Voir les destinations <ArrowRight size={15} /></button></section>
  </>
}

function RecommendationCard({ item, index, onClick }) {
  return <button className="recommend-card" onClick={onClick}><div className="recommend-image" style={{ backgroundImage: `url(${imageUrl(item.image, 600)})`, backgroundPosition: item.imagePosition }}><span className="recommend-number">0{index + 1}</span><span className="recommend-rating">★ {item.rating}</span></div><div className="recommend-info"><span className="recommend-type">{item.type}</span><h3>{item.title}</h3><div className="recommend-meta"><span><MapPin size={13} /> Djerba</span><strong>{item.price}</strong></div></div></button>
}

function LegacyDiscover({ profile, onPlan }) {
  return <><PageIntro eyebrow="À VOTRE RYTHME" title="La Tunisie, autrement." text="Des idées choisies avec soin, selon vos envies de voyage." /><div className="discover-grid">{recommendations.map((item, index) => <RecommendationCard key={item.title} item={item} index={index} onClick={() => onPlan(item.title)} />)}{[
    ['Une nuit sous les étoiles', 'NATURE · DÉCONNEXION', 'Tozeur', 'photo-1500530855697-b586d89ba3ee'],
    ['Sidi Bou Saïd, tout en bleu', 'CULTURE · PHOTO', 'Tunis', 'photo-1548013146-72479768bada'],
    ['La route des potiers', 'ARTISANAT · LOCAL', 'Guellala', 'photo-1492684223066-81342ee5ff30'],
  ].map(([title, type, place, image], index) => <button className="discover-card" key={title} onClick={() => onPlan(title)}><div className="discover-image" style={{ backgroundImage: `url(${imageUrl(image, 700)})` }} /><span className="recommend-type">{type}</span><h3>{title}</h3><span className="discover-location"><MapPin size={13} /> {place} <span>·</span> 4.{8 - index}</span></button>)}</div><div className="discover-note"><Sparkles size={17} /><span><strong>La sélection VOYARA</strong> évolue avec vos goûts : {profile.interests.slice(0, 2).join(' et ').toLowerCase()} font déjà partie du voyage.</span></div></>
}

function Dashboard({ profile, setPage, setTripText, offers }) {
  const ranked = rankOffers(offers, { destination: 'Djerba', budget: 300, duration: 3, text: 'Djerba famille culture plage cuisine locale' }, profile).slice(0, 3)
  return <>
    <div className="welcome-row"><div><span className="eyebrow">{new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase()} · TUNIS, TUNISIE</span><h1>Bonjour, {profile.firstName || 'voyageur'}<span className="sun-emoji"> ✳</span></h1><p>Et si on partait un peu plus loin que prévu&nbsp;?</p></div><button className="button-outline" onClick={() => setPage('profile')}><span className="avatar avatar-tiny">{profile.firstName?.slice(0, 1) || '?'}</span> Votre profil <ArrowUpRight size={15} /></button></div>
    <section className="hero-card" style={{ backgroundImage: `linear-gradient(90deg, rgba(11,60,93,.82), rgba(11,60,93,.34) 58%, rgba(11,60,93,.04)), url(${imageUrl('photo-1539650116574')})` }}><span className="hero-location"><MapPin size={14} /> DJERBA, TUNISIE</span><div className="hero-copy"><span className="hero-kicker">L’INSPIRATION DU MOMENT</span><h2>Du bleu, du soleil,<br />et du temps pour vous.</h2><p>Une île à vivre à votre rythme. La vôtre, bientôt&nbsp;?</p><button className="button-light" onClick={() => setPage('planner')}>Imaginer mon voyage <ArrowRight size={16} /></button></div><div className="hero-index">01 <span>/ 03</span></div><div className="hero-dots"><i className="dot-on" /><i /><i /></div></section>
    <section className="quick-plan"><div className="quick-icon"><Sparkles size={19} /></div><div className="quick-copy"><h2>Une idée en tête&nbsp;?</h2><p>Racontez-nous, on dessine la suite.</p></div><textarea aria-label="Décrivez votre prochain voyage" defaultValue="Je veux partir à Djerba 3 jours avec ma famille, budget 300 DT. Plage, culture et cuisine locale." onChange={(event) => setTripText(event.target.value)} /><button className="button-primary" onClick={() => setPage('planner')}>Créer mon voyage <ArrowRight size={16} /></button></section>
    <section className="recommend-section"><div className="section-heading"><div><span className="eyebrow">CLASSEMENT PERSONNALISÉ · CATALOGUE VOYARA</span><h2>Vos envies prennent la route<span className="heading-period">.</span></h2></div><button className="text-link" onClick={() => setPage('discover')}>Tout explorer <ArrowRight size={15} /></button></div><div className="recommend-grid">{ranked.map((result, index) => <RankedOfferCard key={result.offer.id} result={result} index={index} onClick={() => setPage('planner')} />)}</div><div className="personal-note"><span className="personal-spark"><Sparkles size={15} /></span><span><strong>On a pensé à vous.</strong> {profile.interests?.slice(0, 2).join(' et ').toLowerCase() || 'Vos préférences'} · votre budget · les offres partenaires : chaque idée a été classée pour vous.</span><button aria-label="En savoir plus" onClick={() => setPage('profile')}><ArrowUpRight size={15} /></button></div></section>
    <section className="destination-strip"><div><span className="eyebrow">UNE ENVIE À GARDER SOUS LE COUDE</span><h2>La Tunisie a encore mille détours.</h2></div><button onClick={() => setPage('discover')}>Voir les destinations <ArrowRight size={15} /></button></section>
  </>
}

function RankedOfferCard({ result, index, onClick }) {
  const { offer, score, components, reasons } = result
  return <button className="recommend-card ranked-offer-card" onClick={onClick}><div className="recommend-image" style={{ backgroundImage: `url(${imageUrl(offer.image)})` }}><span className="recommend-number">0{index + 1}</span><span className="recommend-rating">★ {(4.5 + score / 250).toFixed(1)}</span></div><div className="recommend-info"><span className="recommend-type">{offer.category} · {offer.destination}</span><h3>{offer.name}</h3><div className="offer-match-score">Match profil <strong>{components.profile}%</strong></div><p>{reasons[0]}</p><div className="recommend-meta"><span><MapPin size={13} /> {offer.destination}</span><strong>{offer.price ? `${offer.price} DT` : 'Gratuit'}</strong></div></div></button>
}

function Discover({ profile, offers, onPlan }) {
  const [destination, setDestination] = useState('Djerba')
  const ranked = rankOffers(offers, { destination, budget: profile.dailyBudget || 300, duration: 3, text: `${(profile.interests || []).join(' ')} ${(profile.cuisines || []).join(' ')}` }, profile)
  return <><PageIntro eyebrow="À VOTRE RYTHME" title="La Tunisie, autrement." text="Les expériences disponibles, classées selon vos envies et votre budget." /><div className="discover-controls"><label>Destination<select value={destination} onChange={(event) => setDestination(event.target.value)}>{destinations.map((item) => <option key={item}>{item}</option>)}</select></label><span>{ranked.length} expériences disponibles dans le catalogue</span></div><div className="discover-grid ranked-discover-grid">{ranked.slice(0, 12).map((result, index) => <button className="discover-card" key={result.offer.id} onClick={() => onPlan(result.offer.destination)}><div className="discover-image" style={{ backgroundImage: `url(${imageUrl(result.offer.image)})` }}><span className="discover-match">Match profil {result.components.profile}%</span></div><span className="recommend-type">{result.offer.category} · {result.offer.destination}</span><h3>{result.offer.name}</h3><span className="discover-location"><MapPin size={13} /> {result.offer.destination} <span>·</span> {result.offer.price ? `${result.offer.price} DT` : 'Gratuit'}</span><small className="discover-reason">{result.reasons[0]}</small></button>)}</div><div className="discover-note"><Sparkles size={17} /><span><strong>Classement transparent</strong> · demande, préférences, budget, durée, distance et contraintes contribuent au score.</span></div></>
}

function PageIntro({ eyebrow, title, text }) { return <div className="page-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div> }

function HowItWorks({ setPage }) {
  const pipeline = [
    ['Demande', 'Texte libre'], ['Compréhension', 'NLP simulé'], ['Profil', 'Préférences locales'],
    ['Recherche', 'Catalogue mocké'], ['Ranking', 'Scoring pondéré'], ['Optimisation', 'Budget & trajets'],
    ['Agent IA', 'Règles scriptées'], ['Itinéraire', 'Explications visibles'],
  ]
  const criteria = [
    ['Similarité demande / description', scoringWeights.request], ['Correspondance du profil', scoringWeights.profile],
    ['Respect du budget', scoringWeights.budget], ['Durée adaptée', scoringWeights.duration],
    ['Distance estimée', scoringWeights.distance], ['Catégorie recherchée', scoringWeights.category],
    ['Contraintes & mobilité', scoringWeights.constraints],
  ]
  const metrics = [
    ['Precision@K', [38, 53, 71, 84]], ['Recall@K', [44, 59, 75, 86]],
    ['F1', [40, 56, 73, 85]], ['NDCG@K', [48, 64, 81, 91]],
  ]
  const competitors = [
    ['Langage naturel', '—', '—', '✓', '✓'], ['Profil personnalisé', '—', '✓', '—', '✓'],
    ['Budget optimisé', '—', '—', '—', '✓'], ['Itinéraire complet', '—', '✓', '✓', '✓'],
    ['Adaptation en direct', '—', '—', '—', '✓'],
  ]
  return <><PageIntro eyebrow="POUR NOTRE DÉMONSTRATION" title="Comment VOYARA compose un voyage." text="De la première phrase au dernier ajustement : voici le chemin d’une recommandation personnalisée." />
    <section className="demo-pipeline"><div className="demo-section-heading"><div><span className="eyebrow">LE PARCOURS D’UNE DEMANDE</span><h2>De l’envie à l’itinéraire.</h2></div><span className="simulation-tag"><i /> Simulation front-end</span></div><div className="pipeline-track">{pipeline.map(([title, tech], index) => <div className="pipeline-step" key={title}><span className="pipeline-number">0{index + 1}</span><strong>{title}</strong><small>{tech}</small>{index < pipeline.length - 1 && <span className="pipeline-connector">→</span>}</div>)}</div><p className="pipeline-note">Aujourd’hui, les résultats sont produits localement à partir d’un catalogue fictif. Le prototype ne contacte ni LLM ni service externe.</p></section>
    <div className="demo-analysis-grid"><section className="demo-panel"><div className="demo-section-heading"><div><span className="eyebrow">SCORING TRANSPARENT</span><h2>Ce qui pèse dans le classement.</h2></div></div><div className="weight-list">{criteria.map(([label, weight]) => <div className="weight-row" key={label}><span>{label}</span><strong>{Math.round(weight * 100)}%</strong><i><b style={{ width: `${weight * 100 / .3}%` }} /></i></div>)}</div><p className="demo-footnote">Le score affiché explique la correspondance demande/profil/budget. Il s’agit d’une pondération mockée, pas d’une mesure de production.</p></section>
      <section className="demo-panel"><div className="demo-section-heading"><div><span className="eyebrow">ÉTUDE DE L’EXISTANT</span><h2>Où VOYARA se distingue.</h2></div></div><div className="comparison-wrap"><table className="comparison-table"><thead><tr><th>Fonctionnalité</th><th>Tripadvisor</th><th>Booking</th><th>GetYourGuide</th><th>VOYARA</th></tr></thead><tbody>{competitors.map(([name, ...values]) => <tr key={name}><th>{name}</th>{values.map((value, index) => <td className={index === values.length - 1 && value === '✓' ? 'voyara-advantage' : ''} key={`${name}-${index}`}>{value}</td>)}</tr>)}</tbody></table></div><p className="demo-footnote">Comparaison pédagogique simplifiée à valider avant toute communication externe.</p></section></div>
    <section className="demo-panel evaluation-panel"><div className="demo-section-heading"><div><span className="eyebrow">ÉVALUATION · EXEMPLE MOCKÉ</span><h2>À quoi ressemblerait notre protocole.</h2></div><span className="metric-legend">Scores fictifs sur 100</span></div><div className="evaluation-chart">{metrics.map(([metric, values]) => <div className="evaluation-row" key={metric}><strong>{metric}</strong><div>{values.map((value, index) => <span className={`evaluation-bar evaluation-${index}`} key={`${metric}-${index}`}><i style={{ width: `${value}%` }} /><small>{value}</small></span>)}</div></div>)}<div className="evaluation-labels"><span>Baseline</span><span>TF-IDF</span><span>Embeddings</span><span>LLM + Agent</span></div></div><div className="how-it-works-actions"><button className="button-primary" onClick={() => setPage('planner')}><Sparkles size={15} /> Voir la démonstration <ArrowRight size={15} /></button><span>Tout est simulé; ces valeurs n’indiquent pas un résultat expérimental.</span></div></section>
  </>
}

function Planner({ destination, setDestination, duration, setDuration, budget, setBudget, travelers, setTravelers, tripCompany, setTripCompany, tripText, setTripText, profile, generateTrip, useProfile, setUseProfile }) {
  const [formMode, setFormMode] = useState(false)
  const [progress, setProgress] = useState(-1)
  const progressStages = ['Compréhension de votre demande', 'Lecture de votre profil', 'Recherche sémantique', 'Classement des expériences', 'Optimisation budget & trajets', 'Construction de votre itinéraire']
  const profileContext = [...(profile.cuisines || []).slice(0, 2), ...(profile.interests || []).slice(0, 2), ...(profile.constraints || []).slice(0, 1), profile.pace].filter(Boolean)
  const requestExamples = [
    'Djerba, 3 jours, 300 DT, famille, culture et plage',
    'Tozeur, 2 jours, 220 DT, nature et désert',
    'Tunis, 1 journée, 100 DT, culture et gastronomie',
  ]
  const startGeneration = () => {
    if (progress >= 0) return
    setProgress(0)
    const advance = (stage) => {
      if (stage >= progressStages.length) {
        window.setTimeout(generateTrip, 300)
        return
      }
      setProgress(stage)
      window.setTimeout(() => advance(stage + 1), 320)
    }
    advance(1)
  }
  return <><PageIntro eyebrow="VOTRE PROCHAINE HISTOIRE" title="Imaginons votre voyage." text="Quelques détails, ou simplement vos mots. On s’occupe de trouver le fil." />
    <div className="planner-mode-switch" role="group" aria-label="Mode de saisie"><button className={!formMode ? 'planner-mode-active' : ''} onClick={() => setFormMode(false)}>Parler de mon voyage</button><button className={formMode ? 'planner-mode-active' : ''} onClick={() => setFormMode(true)}>Remplir le formulaire</button></div>
    <div className="planner-layout"><div className="planner-main">
      <section className="planner-fields"><div className="planner-field"><MapPin size={17} /><label>DESTINATION<select value={destination.split(',')[0]} onChange={(event) => setDestination(`${event.target.value}, Tunisie`)}>{destinations.map((item) => <option key={item}>{item}</option>)}</select></label><ChevronDown size={15} /></div><div className="planner-field"><CalendarDays size={17} /><label>DURÉE<input type="number" min="1" max="14" value={Number.parseInt(duration, 10) || 3} onChange={(event) => setDuration(`${event.target.value} jours`)} /></label><ChevronDown size={15} /></div><div className="planner-field"><span className="currency-icon">DT</span><label>BUDGET TOTAL<input type="number" min="1" value={budget} onChange={(event) => setBudget(event.target.value)} /></label><ChevronDown size={15} /></div><div className="planner-field"><Users size={17} /><label>VOYAGEURS<input type="number" min="1" value={travelers} onChange={(event) => setTravelers(event.target.value)} /></label><ChevronDown size={15} /></div></section>
      {formMode && <section className="structured-trip-form"><label className="field-label">Type de voyage<select value={tripCompany} onChange={(event) => setTripCompany(event.target.value)}><option>Solo</option><option>Couple</option><option>Famille</option><option>Amis</option></select></label><label className="field-label">Préférences<input value={(profile.interests || []).join(', ')} readOnly placeholder="Culture, plage, nature…" /></label><label className="field-label">Contraintes<input value={(profile.constraints || []).join(', ')} readOnly placeholder="Ex. limiter la marche" /></label><span className="structured-profile-hint"><Sparkles size={14} /> Ces champs reprennent les préférences de votre profil. Modifiez-les dans Profil & centres d’intérêt.</span></section>}
      <section className="conversation-box"><div className="conversation-head"><span className="ai-orb"><Sparkles size={16} /></span><div><strong>Parlez-nous de votre voyage</strong><small>Une phrase naturelle suffit pour commencer.</small></div><span className="online-dot" /></div><textarea value={tripText} onChange={(event) => setTripText(event.target.value)} placeholder="Je vais à Djerba pendant 3 jours, j’ai 300 DT, je voyage en famille, je veux découvrir la culture et profiter de la plage." /><div className="conversation-bottom"><span><Sparkles size={14} /> Votre demande est comprise par VOYARA</span><span>{tripText.length} caractères</span></div></section>
      <div className="request-examples"><span>Essayez un exemple :</span>{requestExamples.map((example, index) => <button key={example} onClick={() => { setTripText(index === 0 ? 'Je vais à Djerba pendant 3 jours, j’ai 300 DT, je voyage en famille, je veux découvrir la culture et profiter de la plage.' : example); setDestination(`${index === 0 ? 'Djerba' : index === 1 ? 'Tozeur' : 'Tunis'}, Tunisie`); setBudget(index === 1 ? '220' : index === 2 ? '100' : '300'); setDuration(index === 1 ? '2 jours' : index === 2 ? '1 jour' : '3 jours') }}>{index === 0 ? 'Djerba · famille · 300 DT' : index === 1 ? 'Tozeur · désert' : 'Tunis · culture & food'}</button>)}</div>
      <div className="profile-personalize-row"><div><strong>Personnaliser avec mon profil</strong><small>Le classement tient compte de vos goûts et contraintes.</small></div><button className={`toggle-switch ${useProfile ? 'toggle-on' : ''}`} role="switch" aria-checked={useProfile} onClick={() => setUseProfile(!useProfile)}><i /></button></div>
      {useProfile && <div className="planner-context-banner"><Sparkles size={15} /><span><strong>Pris en compte depuis votre profil</strong><small>{profileContext.join(' · ') || 'Complétez votre profil pour des idées plus adaptées.'}</small></span><button onClick={() => setUseProfile(false)} aria-label="Ne pas utiliser le profil"><X size={14} /></button></div>}
      {progress >= 0 && <div className="understanding-panel"><div className="understanding-progress"><span style={{ width: `${((progress + 1) / progressStages.length) * 100}%` }} /></div>{progressStages.map((stage, index) => <div className={`understanding-step ${index < progress ? 'understanding-done' : ''} ${index === progress ? 'understanding-current' : ''}`} key={stage}><span>{index < progress ? <Check size={12} /> : index + 1}</span>{stage}{index === progress && <i />}</div>)}</div>}
      <button className="button-primary generate-button" onClick={startGeneration} disabled={!tripText.trim() || progress >= 0}><Sparkles size={17} /> {progress >= 0 ? 'VOYARA prépare votre voyage…' : 'Générer mon voyage'} <ArrowRight size={16} /></button><span className="mock-note"><span /> Classement transparent · données partenaires locales · aucun appel API</span>
    </div><aside className="planner-aside"><div className="aside-photo" style={{ backgroundImage: `url(${imageUrl('photo-1507525428034')})` }}><span><MapPin size={13} /> {destination.toUpperCase()}</span></div><div className="aside-details"><span className="eyebrow">UNE BONNE IDÉE POUR VOUS</span><h3>Trois jours au soleil, sans courir.</h3><p>Culture le matin, mer l’après-midi. Une parenthèse qui vous ressemble.</p><div className="aside-profile"><span className="avatar avatar-tiny">{profile.firstName?.slice(0, 1) || '?'}</span><span>Imaginé pour <strong>{profile.firstName || 'vous'}</strong></span><ArrowRight size={14} /></div></div></aside></div>
  </>
}

function LegacyPlanner({ destination, setDestination, duration, setDuration, budget, setBudget, travelers, setTravelers, tripText, setTripText, profile, generateTrip }) {
  return <><PageIntro eyebrow="VOTRE PROCHAINE HISTOIRE" title="Imaginons votre voyage." text="Quelques détails, ou simplement vos mots. On s’occupe de trouver le fil." /><div className="planner-layout"><div className="planner-main"><section className="planner-fields"><div className="planner-field"><MapPin size={17} /><label>DESTINATION<input value={destination} onChange={(event) => setDestination(event.target.value)} /></label><ChevronDown size={15} /></div><div className="planner-field"><Sun size={17} /><label>DURÉE<input value={duration} onChange={(event) => setDuration(event.target.value)} /></label><ChevronDown size={15} /></div><div className="planner-field"><span className="currency-icon">DT</span><label>BUDGET TOTAL<input type="number" value={budget} onChange={(event) => setBudget(event.target.value)} /></label><ChevronDown size={15} /></div><div className="planner-field"><Users size={17} /><label>VOYAGEURS<input type="number" value={travelers} onChange={(event) => setTravelers(event.target.value)} /></label><ChevronDown size={15} /></div></section><section className="conversation-box"><div className="conversation-head"><span className="ai-orb"><Sparkles size={16} /></span><div><strong>Parlez-nous de votre voyage</strong><small>Quelques mots suffisent pour commencer.</small></div><span className="online-dot" /></div><textarea value={tripText} onChange={(event) => setTripText(event.target.value)} placeholder="Je rêve de..." /><div className="conversation-bottom"><span><Sparkles size={14} /> Votre profil guide déjà nos idées</span><span>{tripText.length} caractères</span></div></section><div className="planner-chips"><span>À glisser dans le voyage :</span>{profile.interests.slice(0, 3).map((item) => <span key={item} className="profile-chip">{item}</span>)}<button onClick={() => { setTripText(`${tripText} Je préfère un rythme ${profile.pace.toLowerCase()} et des expériences locales.`) }} aria-label="Ajouter le style de voyage"><Plus size={14} /></button></div><button className="button-primary generate-button" onClick={generateTrip}><Sparkles size={17} /> Générer mon voyage <ArrowRight size={16} /></button><span className="mock-note"><span /> VOYARA compose une proposition personnalisée à partir de vos envies.</span></div><aside className="planner-aside"><div className="aside-photo" style={{ backgroundImage: `url(${imageUrl('photo-1507525428034-b723cf961d3e', 700)})` }}><span><MapPin size={13} /> DJERBA, TUNISIE</span></div><div className="aside-details"><span className="eyebrow">UNE BONNE IDÉE POUR VOUS</span><h3>Trois jours au soleil, sans courir.</h3><p>Culture le matin, mer l’après-midi. Une parenthèse qui vous ressemble.</p><div className="aside-profile"><span className="avatar avatar-tiny">{profile.firstName.slice(0, 1)}</span><span>Imaginé pour <strong>{profile.firstName}</strong></span><ArrowRight size={14} /></div></div></aside></div></>
}

function Itinerary({ destination, duration, budget, travelers, adaptation, adjusting, adaptTrip, setPage, offers, request, profile, useProfile, updateProfile, reservations, onReserve, onSave }) {
  const [activeDay, setActiveDay] = useState(0)
  const [agentText, setAgentText] = useState('')
  const [messages, setMessages] = useState([{ role: 'agent', text: `Bonjour ${profile.firstName || 'Sarra'} ! J’ai préparé ce voyage avec votre demande${useProfile ? ' et votre profil' : ''}. Que souhaitez-vous ajuster ?` }])
  const [toolStep, setToolStep] = useState(-1)
  const [pendingCuisine, setPendingCuisine] = useState('')
  const [previousAdaptation, setPreviousAdaptation] = useState('')
  const [shareToast, setShareToast] = useState('')
  const [whyOpen, setWhyOpen] = useState('')
  const days = Math.max(1, Math.min(3, Number.parseInt(duration, 10) || 3))
  const activeDestination = request?.destination || destination.split(',')[0]
  const rankingProfile = useProfile ? profile : {}
  const ranked = rankOffers(offers || [], { destination: activeDestination, budget: Number(budget), duration: days, text: request?.text || '' }, rankingProfile)
    .filter((result) => !['Hébergement', 'Transport'].includes(result.offer.category))
  const dayCategories = [['Culture', 'Restaurant', 'Plage'], ['Mer', 'Nature', 'Restaurant'], ['Culture', 'Nature', 'Plage']]
  let selectedOffers = []
  for (let index = 0; index < days * 3; index += 1) {
    const dayIndex = Math.floor(index / 3)
    const category = dayCategories[dayIndex]?.[index % 3]
    const preferred = ranked.find((result) => result.offer.category === category && !selectedOffers.some((earlier) => earlier.offer.id === result.offer.id))
    const next = preferred || ranked.find((result) => !selectedOffers.some((earlier) => earlier.offer.id === result.offer.id)) || ranked[index % Math.max(1, ranked.length)]
    if (next) selectedOffers.push(next)
  }
  if (adaptation === 'Plus de plage') selectedOffers = [...selectedOffers].sort((first, second) => Number(second.offer.category === 'Plage' || second.offer.category === 'Mer') - Number(first.offer.category === 'Plage' || first.offer.category === 'Mer'))
  if (adaptation === 'Rythme plus calme' || adaptation === 'Moins de trajets') {
    const dayStart = activeDay * 3
    const currentDayIds = selectedOffers.slice(dayStart, dayStart + 3).map((result) => result.offer.id)
    const nearbyCulture = ranked.find((result) => ['Culture', 'Famille'].includes(result.offer.category) && result.offer.walk !== 'élevé' && !currentDayIds.includes(result.offer.id))
    const nearbyAlternative = ranked.find((result) => result.offer.walk !== 'élevé' && !currentDayIds.includes(result.offer.id))
    const replacement = nearbyCulture || nearbyAlternative
    if (replacement && selectedOffers[dayStart + 1]) selectedOffers[dayStart + 1] = replacement
  }
  if (adaptation === 'Réduire le budget') selectedOffers = [...selectedOffers].sort((first, second) => Number(first.offer.price) - Number(second.offer.price))
  const dayOffers = selectedOffers.slice(activeDay * 3, activeDay * 3 + 3)
  const budgetLimit = Number(request?.budget || budget) || 300
  const estimatedTotal = Math.min(budgetLimit, adaptation === 'Réduire le budget' ? 220 : 245)
  const stayCost = Math.round(estimatedTotal * .26)
  const mealCost = Math.round(estimatedTotal * .30)
  const activityCost = Math.round(estimatedTotal * .29)
  const transportCost = estimatedTotal - stayCost - mealCost - activityCost
  const prompt = { demande: request?.text || '', profil: useProfile ? profile : null, destination: activeDestination, jours: days, budgetDT: budgetLimit }
  const toolNames = ['Search Tool', 'Profile Tool', 'Budget Tool', 'Location Tool', 'Itinerary Tool']
  const dayTitle = itineraryDays[activeDay]?.title || 'Découverte locale'
  const schedules = ['09:30', '12:00', '15:00']

  const submitAgent = (text = agentText) => {
    const query = text.trim()
    if (!query) return
    setMessages((current) => [...current, { role: 'traveler', text: query }])
    setAgentText('')
    setToolStep(0)
    const normalized = query.toLowerCase()
    let response = 'Je peux ajuster le rythme, le budget, les activités ou vous proposer une adresse. Qu’aimeriez-vous changer ?'
    let change = ''
    if (normalized.includes('moins marcher') || normalized.includes('plus calme') || normalized.includes('calme')) {
      change = 'Rythme plus calme'
      response = 'D’accord. Je remplace une activité éloignée par une expérience culturelle plus proche afin de limiter les déplacements.'
    } else if (normalized.includes('moins cher') || normalized.includes('budget') || normalized.includes('réduire')) {
      change = 'Réduire le budget'
      response = 'Je privilégie des activités locales gratuites ou moins coûteuses, en gardant le budget sous contrôle.'
    } else if (normalized.includes('plage')) {
      change = 'Plus de plage'
      response = 'J’ajoute davantage de temps en bord de mer et je réorganise la journée autour des plages de l’île.'
    } else if (normalized.includes('culture')) {
      change = 'Plus de culture'
      response = 'Je renforce la journée avec des lieux de patrimoine et des expériences culturelles de proximité.'
    } else if (normalized.includes('restaurant') || normalized.includes('manger') || normalized.includes('poisson')) {
      const restaurant = ranked.find((result) => result.offer.category === 'Restaurant' && (!normalized.includes('poisson') || result.offer.cuisine?.includes('mer')))
      response = restaurant ? `Je vous propose ${restaurant.offer.name} (${restaurant.offer.price} DT), une adresse qui correspond à vos goûts${useProfile && profile.cuisines?.length ? ` pour ${profile.cuisines.join(' et ')}` : ''}.` : 'Je n’ai pas trouvé cette adresse dans le catalogue mocké pour cette destination. Essayons une autre spécialité.'
    } else if (normalized.includes('pourquoi')) {
      response = `J’ai choisi ${dayOffers[0]?.offer.name || 'cette étape'} car elle correspond à votre demande, respecte le budget et ${dayOffers[0]?.reasons?.[0]?.toLowerCase() || 'se trouve à proximité des autres activités'}.`
    } else if (normalized.includes('j’adore') || normalized.includes("j'aime") || normalized.includes('j’aime')) {
      setPendingCuisine('fruits de mer')
      response = 'Je peux retenir cette envie de façon durable. Souhaitez-vous l’ajouter à votre profil ?'
    }
    if (change) { setPreviousAdaptation(adaptation); adaptTrip(change) }
    setTimeout(() => setToolStep(1), 180)
    setTimeout(() => setToolStep(2), 360)
    setTimeout(() => setToolStep(3), 540)
    setTimeout(() => setToolStep(4), 720)
    setTimeout(() => { setToolStep(-1); setMessages((current) => [...current, { role: 'agent', text: response }]) }, 880)
  }

  return <>
    <div className="itinerary-cover local-itinerary-cover" style={{ backgroundImage: `linear-gradient(90deg, rgba(11,60,93,.86), rgba(11,60,93,.28)), url(${imageUrl('photo-1507525428034')})` }}><button className="back-link" onClick={() => setPage('planner')}><ArrowLeft size={15} /> Modifier ma demande</button><span className="eyebrow light-eyebrow">VOTRE VOYAGE PREND FORME</span><h1>{activeDestination}, <em>à votre façon.</em></h1><div className="itinerary-tags"><span><CalendarDays size={14} /> {days} {days > 1 ? 'jours' : 'jour'}</span><span><Users size={14} /> {request?.company ? `${request.company} · ` : ''}{request?.travelers || travelers} voyageurs</span><span><span className="currency-icon currency-light">DT</span> {budgetLimit} DT</span></div></div>
    <div className="structured-understanding"><div><span className="eyebrow">FICHE STRUCTURÉE · COMPRÉHENSION SIMULÉE</span><p>{request?.text || 'Votre demande de voyage personnalisé'}</p></div><div className="structured-facts"><span><small>Destination</small><strong>{activeDestination}</strong></span><span><small>Durée</small><strong>{days} jours</strong></span><span><small>Budget</small><strong>{budgetLimit} DT</strong></span><span><small>Voyageurs</small><strong>{request?.company ? `${request.company} · ` : ''}{request?.travelers || travelers}</strong></span><span><small>Préférences</small><strong>{useProfile ? [...(profile.interests || []).slice(0, 2), ...(profile.cuisines || []).slice(0, 1)].join(' · ') : 'Demande uniquement'}</strong></span><span><small>Contraintes</small><strong>{useProfile ? (profile.constraints || []).join(' · ') || 'Aucune signalée' : 'Aucune signalée'}</strong></span></div></div>
    {useProfile && <div className="profile-used-banner"><Sparkles size={15} /><span><strong>Pris en compte depuis votre profil</strong><small>{[...(profile.cuisines || []), ...(profile.activities || []).slice(0, 2), profile.pace, ...(profile.constraints || [])].filter(Boolean).join(' · ')}</small></span></div>}
    <div className="detailed-itinerary-layout"><div className="itinerary-main-column"><div className="section-heading itinerary-heading"><div><span className="eyebrow">VOTRE CARNET DE VOYAGE</span><h2>{dayTitle}<span className="heading-period">.</span></h2></div><div className="itinerary-actions"><button className="button-outline" onClick={onSave}><Save size={14} /> Sauvegarder</button><button className="button-outline" onClick={() => setShareToast('Lien de partage simulé copié.')}>Exporter / partager</button></div></div><div className="day-tabs" role="tablist" aria-label="Jours de l’itinéraire">{Array.from({ length: days }, (_, index) => <button role="tab" aria-selected={activeDay === index} className={activeDay === index ? 'day-tab-active' : ''} onClick={() => setActiveDay(index)} key={index}><span>JOUR 0{index + 1}</span>{itineraryDays[index]?.theme || 'DÉCOUVERTE'}</button>)}</div>{adjusting && <div className="thinking-banner"><span className="thinking-dots"><i /><i /><i /></span> VOYARA adapte votre itinéraire…</div>}{adaptation && <div className="adaptation-banner"><Sparkles size={16} /><span><strong>Itinéraire adapté</strong> · {adaptation}</span><button onClick={() => adaptTrip('votre itinéraire initial')} aria-label="Annuler l’adaptation"><X size={14} /></button></div>}<div className="detailed-timeline">{dayOffers.map((result, index) => <DetailedActivity key={`${result.offer.id}-${activeDay}`} result={result} time={schedules[index]} distance={index === 0 ? '—' : `${(1.2 + index * 0.7).toFixed(1)} km`} profile={profile} useProfile={useProfile} reservations={reservations} onReserve={onReserve} whyOpen={whyOpen} setWhyOpen={setWhyOpen} />)}</div><details className="llm-prompt-preview"><summary><Sparkles size={14} /> Voir le prompt envoyé au LLM (simulation)</summary><pre>{JSON.stringify(prompt, null, 2)}</pre></details>{shareToast && <div className="inline-toast"><Check size={14} /> {shareToast}</div>}</div>
      <aside className="itinerary-side-column"><div className="local-route-map"><div className="local-map-heading"><span className="eyebrow">VOS ÉTAPES EN UN COUP D’ŒIL</span><strong>{activeDestination}</strong></div><svg viewBox="0 0 340 230" role="img" aria-label={`Carte des étapes à ${activeDestination}`}><path className="map-coast" d="M0 15Q75 60 45 110t18 120h277V0H0z"/><path className="map-route-line" d="M72 166C87 130 136 142 154 105S216 85 242 62 278 50 288 34"/><path className="map-route-line map-route-secondary" d="M72 166C87 130 136 142 154 105S216 85 242 62 278 50 288 34"/>{dayOffers.map((result, index) => { const coords = [[72,166],[154,105],[242,62]]; const [x,y] = coords[index] || [80 + index*55, 180-index*35]; return <g key={result.offer.id}><circle cx={x} cy={y} r="13" className="map-stop-shadow"/><circle cx={x} cy={y} r="10" className="map-stop-dot"/><text x={x} y={y+3} textAnchor="middle">{index+1}</text></g> })}<text className="map-city" x="62" y="196">Houmt Souk</text><text className="map-city" x="206" y="46">Sidi Mahrez</text><text className="map-water" x="263" y="207">MÉDITERRANÉE</text></svg><div className="map-total-distance"><MapPin size={13} /> Environ {Math.max(4, dayOffers.length * 2)} km · trajets optimisés</div></div>
        <div className="trip-budget-card"><div className="budget-card-heading"><span className="eyebrow">BUDGET ESTIMÉ</span><strong>{estimatedTotal} <small>/ {budgetLimit} DT</small></strong></div><div className="budget-meter"><span style={{ width: `${Math.min(100, estimatedTotal / budgetLimit * 100)}%` }} /></div><div className="budget-donut-wrap"><div className="budget-donut" style={{ background: 'conic-gradient(#1d6fa5 0 26%, #8ec9e8 26% 54%, #f28c28 54% 78%, #e8b04a 78% 100%)' }}><span>{Math.round(estimatedTotal / budgetLimit * 100)}%</span></div><div className="donut-legend"><span><i className="donut-stay" /> Hébergement <b>{stayCost} DT</b></span><span><i className="donut-meal" /> Repas <b>{mealCost} DT</b></span><span><i className="donut-activity" /> Activités <b>{activityCost} DT</b></span><span><i className="donut-transport" /> Transport <b>{transportCost} DT</b></span></div></div><div className="budget-confirmations">{['Budget respecté', 'Durée respectée', 'Distances raisonnées', 'Horaires cohérents', 'Préférences prises en compte', 'Profil voyageur intégré'].map((item) => <span key={item}><Check size={12} /> {item}</span>)}</div></div>
        <AgentChat profile={profile} useProfile={useProfile} messages={messages} setMessages={setMessages} agentText={agentText} setAgentText={setAgentText} submitAgent={submitAgent} toolStep={toolStep} pendingCuisine={pendingCuisine} onAddCuisine={() => { updateProfile('cuisines', [...(profile.cuisines || []), pendingCuisine]); setPendingCuisine(''); setMessages((current) => [...current, { role: 'agent', text: 'C’est ajouté à votre profil. Vos prochaines suggestions en tiendront compte.' }]) }} onUndo={() => { adaptTrip(previousAdaptation); setMessages((current) => [...current, { role: 'agent', text: 'La dernière adaptation a été annulée.' }]) }} hasUndo={Boolean(adaptation)} />
      </aside></div>
  </>
}

function DetailedActivity({ result, time, distance, profile, useProfile, reservations, onReserve, whyOpen, setWhyOpen }) {
  const { offer, score, components, reasons } = result
  const reservation = reservations?.find((item) => item.offerId === offer.id && item.traveler === profile.firstName)
  const key = offer.id
  const isOpen = whyOpen === key
  return <article className="detailed-activity"><div className="timeline-rail"><time>{time}</time><span>{time === '09:30' ? '☀' : '·'}</span></div><div className="detailed-activity-card"><div className="activity-card-image" style={{ backgroundImage: `url(${imageUrl(offer.image)})` }} /><div className="activity-card-content"><div className="activity-card-top"><span className="activity-category-tag">{offer.category} · {offer.destination}</span><span className="match-badge">Match profil {useProfile ? components.profile : '—'}%</span></div><h3>{offer.name}</h3><div className="activity-meta-row"><span>{offer.duration} · {offer.hours}</span><span>{distance} depuis l’étape précédente</span></div><p>{offer.description}</p><div className="activity-score-line"><span>Score de pertinence <strong>{score}%</strong></span><span>{Number(offer.price) ? `${offer.price} DT` : 'Gratuit'}</span></div><div className="activity-card-actions"><button className="why-button" onClick={() => setWhyOpen(isOpen ? '' : key)}><HelpCircle size={13} /> Pourquoi ce choix ?</button>{reservation ? <span className={`reservation-status status-${reservation.status.toLowerCase().replace('é','e').replace(' ', '-')}`}>{reservation.status === 'Confirmée' ? 'Confirmé ✓' : reservation.status}</span> : <button className="reserve-button" onClick={() => onReserve(offer)}>Demander une réservation</button>}</div>{isOpen && <div className="why-explanation"><strong>Pourquoi VOYARA l’a retenue</strong><ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}<li>Score détaillé : demande {components.request}% · profil {components.profile}% · budget {components.budget}% · contraintes {components.constraints}%.</li></ul><small>{profile.firstName || 'Votre profil'} · {requestExplanation(profile, offer)}</small></div>}</div></div></article>
}

function requestExplanation(profile, offer) { return `${offer.category.toLowerCase()} sélectionnée selon vos envies${profile.constraints?.includes('Marche limitée') ? ' et votre préférence pour des étapes accessibles' : ''}.` }

function AgentChat({ profile, useProfile, messages, setMessages, agentText, setAgentText, submitAgent, toolStep, pendingCuisine, onAddCuisine, onUndo, hasUndo }) {
  const chips = ['Je préfère moins marcher', 'Réduire le budget', 'Plus de culture', 'Un bon restaurant de poisson', 'Pourquoi ce choix ?']
  return <section className="voyara-agent-card"><div className="agent-heading"><span className="ai-orb"><Sparkles size={16} /></span><div><strong>Voyara Agent</strong><small>Votre copilote de voyage · {useProfile ? `connaît le profil de ${profile.firstName || 'Sarra'}` : 'profil désactivé'}</small></div><span className="online-dot" /></div><div className="agent-tools">{['Search Tool', 'Profile Tool', 'Budget Tool', 'Location Tool', 'Itinerary Tool'].map((name, index) => <span className={toolStep >= index ? 'tool-complete' : toolStep === index - 1 ? 'tool-running' : ''} key={name}>{toolStep >= index ? '✓' : '·'} {name}</span>)}</div><div className="agent-messages" aria-live="polite">{messages.map((message, index) => <div className={`agent-message ${message.role}`} key={`${index}-${message.text}`}>{message.text}</div>)}{pendingCuisine && <div className="agent-profile-prompt"><span>Ajouter « fruits de mer » à votre profil de façon durable ?</span><button onClick={onAddCuisine}>Oui, l’ajouter</button><button onClick={() => setMessages((current) => [...current, { role: 'traveler', text: 'Pas pour le moment.' }])}>Plus tard</button></div>}</div><div className="agent-quick-chips">{chips.map((chip) => <button key={chip} onClick={() => submitAgent(chip)}>{chip}</button>)}</div><form className="agent-input-row" onSubmit={(event) => { event.preventDefault(); submitAgent() }}><input value={agentText} onChange={(event) => setAgentText(event.target.value)} placeholder="Demandez un ajustement…" aria-label="Message à Voyara Agent" /><button aria-label="Envoyer" type="submit"><ArrowRight size={15} /></button></form>{hasUndo && <button className="agent-undo" onClick={onUndo}>↶ Annuler la dernière modification</button>}</section>
}

function LegacyItinerary({ destination, duration, budget, travelers, adaptation, adjusting, adaptTrip, setPage }) {
  const reducedBudget = adaptation === 'Réduire le budget'
  const estimatedBudget = reducedBudget ? Math.max(0, Number(budget) - 45) : Number(budget)
  const suggestions = [
    ['Réduire le budget', '↘'], ['Plus de plage', '☼'], ['Plus de culture', '⌂'],
    ['Activités enfants', '♡'], ['Rythme plus calme', '☾'], ['Moins de trajets', '↗'],
  ]
  return <>
    <div className="itinerary-cover" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,38,40,.78), rgba(8,38,40,.13)), url(${imageUrl('photo-1507525428034-b723cf961d3e', 1500)})` }}><button className="back-link" onClick={() => setPage('planner')}><ArrowLeft size={15} /> Modifier les détails</button><span className="eyebrow light-eyebrow">VOTRE VOYAGE PREND FORME</span><h1>{destination.split(',')[0]}, <em>à votre façon.</em></h1><div className="itinerary-tags"><span><Sun size={14} /> {duration}</span><span><Users size={14} /> {travelers} voyageurs</span><span><span className="currency-icon currency-light">DT</span> {budget} DT</span></div></div>
    <div className="itinerary-layout"><div className="days-column"><div className="section-heading itinerary-heading"><div><span className="eyebrow">VOTRE CARNET DE VOYAGE</span><h2>Trois jours à vivre<span className="heading-period">.</span></h2></div><button className="button-outline" onClick={() => window.print()}><ArrowDown size={15} /> Enregistrer</button></div>{adaptation && <div className="adaptation-banner"><Sparkles size={17} /><span><strong>Itinéraire adapté</strong> · {adaptation}. On a repensé quelques étapes pour vous.</span><button onClick={() => adaptTrip('votre itinéraire initial')} aria-label="Revenir à la version initiale"><X size={15} /></button></div>}{adjusting && <div className="thinking-banner"><span className="thinking-dots"><i /><i /><i /></span> VOYARA adapte votre itinéraire…</div>}{itineraryDays.map((day, dayIndex) => <DayCard key={day.title} day={day} dayIndex={dayIndex} adaptation={adaptation} />)}</div><aside className="budget-column"><div className="budget-card"><span className="eyebrow">LE BON ÉQUILIBRE</span><h3>Votre budget, en un coup d’œil.</h3><div className="budget-total"><span>{reducedBudget ? 'Budget optimisé' : 'Budget estimé'}</span><strong>{estimatedBudget} <small>DT</small></strong></div><BudgetLine label="Activités & visites" amount={reducedBudget ? '45 DT' : '90 DT'} percent={reducedBudget ? '18%' : '30%'} color="sea" /><BudgetLine label="Restaurants" amount="80 DT" percent={reducedBudget ? '31%' : '27%'} color="orange" /><BudgetLine label="Transport" amount="50 DT" percent={reducedBudget ? '20%' : '17%'} color="blue" /><BudgetLine label="Hébergement" amount="80 DT" percent={reducedBudget ? '31%' : '26%'} color="sand" /><div className="budget-foot"><Check size={15} /> {reducedBudget ? `Économie de 45 DT · budget initial ${budget} DT` : `Dans votre budget de ${budget} DT`}</div></div><div className="adjust-card"><div className="adjust-title"><span className="ai-orb"><Sparkles size={15} /></span><div><strong>On affine ensemble&nbsp;?</strong><small>Votre voyage, à votre manière.</small></div></div><div className="suggestion-list">{suggestions.map(([label, icon]) => <button key={label} onClick={() => adaptTrip(label)} disabled={adjusting} className={adaptation === label ? 'suggestion-active' : ''}><span className="suggestion-icon">{icon}</span>{label}<ArrowRight size={14} /></button>)}</div><button className="adjust-custom" onClick={() => adaptTrip('vos nouvelles envies')}>＋ Une autre envie</button></div><div className="map-card"><div className="map-art"><span className="map-route route-one" /><span className="map-route route-two" /><i className="map-pin pin-one"><MapPin size={18} fill="currentColor" /></i><i className="map-pin pin-two"><MapPin size={18} fill="currentColor" /></i><i className="map-pin pin-three"><MapPin size={18} fill="currentColor" /></i><span className="map-label label-one">Houmt Souk</span><span className="map-label label-two">Sidi Mahrez</span><span className="map-label label-three">Midoun</span><span className="map-watermark">DJERBA</span></div><div className="map-caption"><MapPin size={14} /> Vos étapes sur l’île <ArrowUpRight size={14} /></div></div></aside></div>
  </>
}

function DayCard({ day, dayIndex, adaptation }) {
  let stops = day.stops
  if (adaptation === 'Plus de plage' && dayIndex === 0) {
    stops = [
      ['09:00', 'Baignade matinale à Sidi Mahrez', 'Plage · gratuit'],
      ['10:30', 'Petit-déjeuner à Houmt Souk', 'Café de la place · 18 DT'],
      ['13:00', 'Déjeuner chez l’habitant', 'Cuisine tunisienne · 30 DT'],
      ['16:00', 'Flânerie dans les ruelles', 'Marché & artisanat · 12 DT'],
      ['19:30', 'Coucher de soleil en famille', 'Borj El Kastil · gratuit'],
    ]
  } else if (adaptation === 'Réduire le budget' && dayIndex === 1) {
    stops = day.stops.map((stop, index) => index === 0 ? ['09:00', 'Baignade libre à Sidi Yati', 'Plage · gratuit, sans excursion'] : stop)
  } else if (adaptation === 'Plus de culture' && dayIndex === 0) {
    stops = day.stops.map((stop, index) => index === 3 ? ['16:00', 'Visite de la synagogue El Ghriba', 'Patrimoine & histoire · 10 DT'] : stop)
  } else if (adaptation === 'Activités enfants' && dayIndex === 1) {
    stops = day.stops.map((stop, index) => index === 2 ? ['15:00', 'Atelier poterie pour petits voyageurs', 'Guellala · activité en famille'] : stop)
  } else if (adaptation === 'Rythme plus calme') {
    stops = day.stops.filter((_, index) => index !== 3)
  } else if (adaptation === 'Moins de trajets') {
    stops = day.stops.map((stop, index) => index === 0 && dayIndex === 1 ? ['09:00', 'Départ de la plage de Sidi Yati', 'Activité à proximité · trajet réduit'] : stop)
  }
  return <article className="day-card"><div className="day-header"><span className="day-number">0{dayIndex + 1}</span><div><span className="eyebrow">JOUR {dayIndex + 1} · {day.theme}</span><h3>{day.title}</h3></div><span className="day-weather"><Sun size={15} /> 25°</span></div><div className="timeline">{stops.map(([time, title, detail], index) => <div className="timeline-row" key={`${time}-${title}`}><span className="timeline-time">{time}</span><span className={`timeline-dot ${index === 0 ? 'timeline-dot-first' : ''}`} /><div><strong>{title}</strong><small>{detail}</small></div><button className="stop-more" aria-label={`Détails : ${title}`}><ArrowUpRight size={14} /></button></div>)}</div><div className="day-footer"><span><MapPin size={13} /> Djerba, Tunisie</span><span><Heart size={13} /> Une journée à votre rythme</span></div></article>
}

function BudgetLine({ label, amount, percent, color }) { return <div className="budget-line"><div><span>{label}</span><strong>{amount}</strong></div><div className="budget-bar"><span className={`budget-fill fill-${color}`} style={{ width: percent }} /></div></div> }

function LegacyProfilePage({ profile, updateProfile, toggleChoice, showToast }) {
  return <><PageIntro eyebrow="VOTRE BOUSSOLE PERSONNELLE" title="Tout ce qui vous fait partir." text="Vos envies changent, votre profil aussi. Gardez-le à votre image." /><div className="profile-layout"><div className="profile-main"><div className="profile-banner"><div className="profile-avatar-large">{profile.firstName.slice(0, 1)}</div><div><span className="eyebrow">VOYAGEUSE DEPUIS AUJOURD’HUI</span><h2>{profile.firstName}</h2><span className="profile-location"><MapPin size={14} /> {profile.location || 'Ajoutez votre ville'}</span></div><span className="profile-badge"><Sparkles size={14} /> Profil personnalisé</span></div><ProfileEditSection title="Ce qui vous attire" icon="♡"><div className="editable-chips">{interestOptions.map((item) => <button key={item.label} className={`activity-chip ${profile.interests.includes(item.label) ? 'chip-selected' : ''}`} onClick={() => toggleChoice('interests', item.label)}>{item.label}</button>)}</div></ProfileEditSection><ProfileEditSection title="À vivre en chemin" icon="◎"><div className="editable-chips">{activityOptions.map((item) => <button key={item} className={`activity-chip ${profile.activities.includes(item) ? 'chip-selected' : ''}`} onClick={() => toggleChoice('activities', item)}>{item}</button>)}</div></ProfileEditSection><ProfileEditSection title="À retrouver à table" icon="✳"><div className="editable-chips">{cuisineOptions.map((item) => <button key={item} className={`food-option profile-food ${profile.cuisines.includes(item) ? 'food-selected' : ''}`} onClick={() => toggleChoice('cuisines', item)}>{item}</button>)}</div><label className="field-label profile-allergy">Allergies ou restrictions<input value={profile.restrictions} onChange={(event) => updateProfile('restrictions', event.target.value)} placeholder="Rien à signaler" /></label></ProfileEditSection><ProfileEditSection title="Votre façon de voyager" icon="↗"><div className="profile-style-grid"><ProfileSelect title="Budget habituel" value={profile.budget} values={['Économique', 'Moyen', 'Premium']} onChange={(value) => updateProfile('budget', value)} /><ProfileSelect title="Vous partez plutôt" value={profile.company} values={['Seul', 'Couple', 'Famille', 'Amis']} onChange={(value) => updateProfile('company', value)} /><ProfileSelect title="Votre rythme" value={profile.pace} values={['Relax', 'Équilibré', 'Intense']} onChange={(value) => updateProfile('pace', value)} /></div></ProfileEditSection><ProfileEditSection title="Les prochaines escales" icon="⌖"><div className="editable-chips">{profile.destinations.map((place) => <span className="destination-chip" key={place}>{place}<button onClick={() => updateProfile('destinations', profile.destinations.filter((item) => item !== place))} aria-label={`Retirer ${place}`}><X size={13} /></button></span>)}<button className="add-destination" onClick={() => { const next = window.prompt('Quelle destination vous fait rêver ?'); if (next?.trim()) updateProfile('destinations', [...profile.destinations, next.trim()]) }}><Plus size={14} /> Ajouter</button></div></ProfileEditSection><button className="button-primary save-profile" onClick={() => showToast('Vos envies sont bien enregistrées')}><Check size={16} /> Enregistrer mes préférences</button></div><aside className="profile-aside"><div className="profile-aside-visual" style={{ backgroundImage: `linear-gradient(0deg, rgba(8,38,40,.75), transparent 80%), url(${imageUrl('photo-1500530855697-b586d89ba3ee', 700)})` }}><span>VOTRE PROCHAINE ENVIE</span><h3>Il reste tant<br />de chemins à prendre.</h3></div><div className="profile-aside-copy"><Sparkles size={17} /><p>Chaque préférence affinée rend les idées de VOYARA un peu plus <strong>à votre image.</strong></p><button onClick={() => showToast('Votre profil est déjà à jour')}>Découvrir ma sélection <ArrowRight size={14} /></button></div></aside></div></>
}

function ProfileEditSection({ title, icon, children }) { return <section className="profile-edit-section"><div className="profile-section-heading"><span>{icon}</span><h3>{title}</h3></div>{children}</section> }
function ProfileSelect({ title, value, values, onChange }) { return <label className="field-label">{title}<select value={value} onChange={(event) => onChange(event.target.value)}>{values.map((item) => <option key={item}>{item}</option>)}</select></label> }

function TripsPage({ setPage, trips = [], onOpenTrip }) {
  return <><PageIntro eyebrow="VOS CARNETS DE VOYAGE" title="Les belles histoires commencent ici." text="Retrouvez vos itinéraires enregistrés et reprenez le fil quand vous voulez." />{trips.length ? <div className="saved-trip-list">{trips.map((trip) => <section className="saved-trip" key={trip.id}><div className="saved-trip-image" style={{ backgroundImage: `url(${imageUrl('photo-1507525428034')})` }}><span><Check size={14} /> ITINÉRAIRE ENREGISTRÉ</span></div><div className="saved-trip-copy"><span className="eyebrow">{new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date(trip.savedAt || Date.now()))} · {trip.duration}</span><h2>{trip.destination}, à votre façon.</h2><p>{trip.profileName || 'Voyageur'} · Budget {trip.budget} DT · {trip.travelers} voyageurs</p><div><span><Sun size={14} /> Voyage personnalisé</span><span><MapPin size={14} /> {trip.duration} de découvertes</span></div><button className="button-primary" onClick={() => onOpenTrip(trip)}>Retrouver mon itinéraire <ArrowRight size={15} /></button></div></section>)}</div> : <div className="empty-trips"><MapPin size={23} /><strong>Votre premier itinéraire vous attend.</strong><span>Décrivez votre prochain voyage, puis enregistrez votre carnet ici.</span><button className="button-primary" onClick={() => setPage('planner')}><Plus size={15} /> Imaginer un voyage</button></div>}<button className="new-trip-row" onClick={() => setPage('planner')}><span><Plus size={18} /></span><div><strong>Et si on repartait&nbsp;?</strong><small>Votre prochain voyage est à quelques mots d’ici.</small></div><ArrowRight size={16} /></button></>
}

export default App