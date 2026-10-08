export const interestOptions = [
  { label: 'Plage & détente', icon: '☀', photo: 'photo-1507525428034-b723cf961d3e' },
  { label: 'Culture & patrimoine', icon: '⌂', photo: 'photo-1539650116574-75c0c6d73f6e' },
  { label: 'Nature & aventure', icon: '⌁', photo: 'photo-1472396961693-142e6e269027' },
  { label: 'Gastronomie', icon: '✳', photo: 'photo-1414235077428-338989a2e8c0' },
  { label: 'Shopping', icon: '◇', photo: 'photo-1531058020387-3be344556be6' },
  { label: 'Vie nocturne', icon: '☾', photo: 'photo-1514525253161-7a46d19cd819' },
  { label: 'Voyage en famille', icon: '♡', photo: 'photo-1511895426328-dc8714191300' },
  { label: 'Voyage romantique', icon: '♡', photo: 'photo-1516483638261-f4dbaf036963' },
  { label: 'Photographie', icon: '◎', photo: 'photo-1470770841072-f978cf4d019e' },
  { label: 'Sport & activités', icon: '↗', photo: 'photo-1530549387789-4c1017266635' },
]

export const activityOptions = [
  'Natation', 'Randonnée', 'Plongée', 'Excursions en bateau', 'Musées',
  'Monuments historiques', 'Cuisine locale', 'Restaurants', 'Artisanat',
  'Spots photo', 'Activités pour enfants',
]

export const cuisineOptions = [
  '🇹🇳 Tunisienne', '🇮🇹 Italienne', '🇯🇵 Japonaise', '🇫🇷 Française',
  '🌮 Mexicaine', '🌱 Végétarienne', '🍔 Street food', '🐟 Fruits de mer',
]

export const recommendations = [
  {
    title: 'Les ruelles de Houmt Souk',
    type: 'CULTURE · PHOTO',
    price: '20 DT',
    rating: '4.8',
    image: 'photo-1539650116574-75c0c6d73f6e',
    imagePosition: 'center 47%',
  },
  {
    title: 'L’île aux flamants roses',
    type: 'MER · FAMILLE',
    price: '45 DT',
    rating: '4.7',
    image: 'photo-1500375592092-40eb2168fd21',
    imagePosition: 'center 55%',
  },
  {
    title: 'La table de Fatma',
    type: 'LOCAL · GASTRONOMIE',
    price: '25–40 DT',
    rating: '4.9',
    image: 'photo-1547592180-85f173990554',
    imagePosition: 'center 55%',
  },
]

export const itineraryDays = [
  {
    title: 'La douceur de Djerba',
    theme: 'CULTURE & PREMIERS PAS',
    stops: [
      ['09:00', 'Petit-déjeuner à Houmt Souk', 'Café de la place · 18 DT'],
      ['10:30', 'Flânerie dans les ruelles', 'Marché & artisanat · 12 DT'],
      ['13:00', 'Déjeuner chez l’habitant', 'Cuisine tunisienne · 30 DT'],
      ['16:00', 'Première baignade à Sidi Mahrez', 'Plage · gratuit'],
      ['19:30', 'Coucher de soleil en famille', 'Borj El Kastil · gratuit'],
    ],
  },
  {
    title: 'Au rythme de la mer',
    theme: 'MER & AVENTURE DOUCE',
    stops: [
      ['09:00', 'Départ pour l’île aux flamants', 'Excursion en bateau · 45 DT'],
      ['12:30', 'Déjeuner les pieds dans le sable', 'Grillades locales · 28 DT'],
      ['15:00', 'Jeux et baignade en famille', 'Plage de Sidi Yati · gratuit'],
      ['18:00', 'Pause fraîcheur au port', 'Jus frais · 12 DT'],
      ['19:30', 'Lumière dorée sur la lagune', 'Spot photo · gratuit'],
    ],
  },
  {
    title: 'Un dernier goût de l’île',
    theme: 'NATURE & DÉTENTE',
    stops: [
      ['09:00', 'Balade sous les palmiers', 'Midoun · gratuit'],
      ['11:30', 'Découverte de la synagogue El Ghriba', 'Visite · 10 DT'],
      ['13:00', 'Brunch aux saveurs de Djerba', 'Cuisine locale · 32 DT'],
      ['16:00', 'Dernière pause à la plage', 'Sidi Mahrez · gratuit'],
      ['18:00', 'Souvenirs d’artisans', 'Poterie & tissage · 25 DT'],
    ],
  },
]

const localImages = [
  ['1507525428034', 'djerba-coast.jpg'],
  ['1500375592092', 'boat-trip.jpg'],
  ['1472396961693', 'tozeur-oasis.jpg'],
  ['1500530855697', 'tozeur-oasis.jpg'],
  ['1548013146', 'sidi-bou-said.jpg'],
  ['1516483638261', 'sidi-bou-said.jpg'],
  ['1547592180', 'tunisian-table.jpg'],
  ['1414235077428', 'tunisian-table.jpg'],
  ['1539650116574', 'sidi-bou-said.jpg'],
]

export const imageUrl = (id = '') => {
  const image = localImages.find(([prefix]) => String(id).includes(prefix))?.[1] || 'djerba-medina.svg'
  return `/images/${image}`
}

const offer = (destination, values, index) => {
  const [name, category, price, duration, tags, image, cuisine = '', walk = 'faible', ambiance = 'calme', family = true] = values
  const id = `${destination.toLowerCase()}-${String(index + 1).padStart(2, '0')}`
  return {
    id, name, destination, category, cuisine,
    description: `${name}, une expérience ${ambiance} à vivre avec un partenaire local.`,
    price, duration, hours: '09:00–18:00', x: 15 + ((index * 17) % 72), y: 18 + ((index * 23) % 66),
    popularity: 72 + ((index * 7) % 27), tags: tags.split(', '), family, walk, ambiance,
    provider: destination === 'Djerba' && index < 3 ? 'Hôtel Dar Djerba' : `Partenaire local · ${destination}`,
    image,
  }
}

const destinationOffers = {
  Djerba: [
    ['Village de Guellala', 'Culture', 25, '2 h', 'culture, artisanat, famille', 'photo-1539650116574'],
    ['Flânerie à Houmt Souk', 'Culture', 15, '2 h', 'culture, souk, photo', 'photo-1539650116574'],
    ['Musée du Patrimoine traditionnel', 'Culture', 12, '1 h 30', 'culture, musée, histoire', 'photo-1539650116574', '', 'faible', 'calme'],
    ['Plage de Sidi Mahrez', 'Plage', 0, '2 h', 'plage, détente, famille', 'photo-1507525428034'],
    ['Synagogue de la Ghriba', 'Culture', 10, '1 h', 'culture, patrimoine, histoire', 'photo-1539650116574', '', 'faible', 'calme'],
    ['Fort Ghazi Mustapha', 'Culture', 8, '1 h', 'culture, histoire, photo', 'photo-1539650116574'],
    ['Balade en quad dans les oliveraies', 'Aventure', 55, '2 h', 'aventure, nature, sport', 'photo-1472396961693', '', 'moyen', 'animé', false],
    ['Djerba Explore Park', 'Famille', 35, '3 h', 'famille, culture, découverte', 'photo-1500530855697'],
    ['Sortie bateau vers l’île aux flamants', 'Mer', 45, '3 h', 'mer, famille, photo', 'photo-1500375592092'],
    ['Poisson grillé au port', 'Restaurant', 38, '1 h 30', 'gastronomie, mer, local', 'photo-1547592180', 'fruits de mer'],
    ['Brik et ojja chez Fatma', 'Restaurant', 22, '1 h', 'gastronomie, tunisienne, local', 'photo-1547592180', 'tunisienne'],
    ['Maison d’hôtes Dar El Bhar', 'Hébergement', 95, '1 nuit', 'authentique, calme, famille', 'photo-1516483638261'],
  ],
  Tozeur: [
    ['Oasis de Chebika', 'Nature', 20, '3 h', 'nature, randonnée, photo', 'photo-1472396961693', '', 'moyen', 'calme'],
    ['Décor de cinéma d’Ong Jemel', 'Désert', 35, '2 h', 'désert, dunes, aventure', 'photo-1500530855697', '', 'moyen', 'animé'],
    ['Coucher de soleil sur Chott el-Djerid', 'Nature', 18, '2 h', 'désert, photo, détente', 'photo-1500530855697'],
    ['Médina Ouled el-Hadef', 'Culture', 10, '2 h', 'culture, artisanat, photo', 'photo-1539650116574'],
    ['Calèche dans la palmeraie', 'Famille', 25, '1 h', 'famille, nature, calme', 'photo-1472396961693'],
    ['Randonnée au canyon de Midès', 'Aventure', 30, '3 h', 'randonnée, nature, aventure', 'photo-1472396961693', '', 'élevé', 'animé', false],
    ['Musée Dar Cheraït', 'Culture', 15, '1 h 30', 'culture, musée, histoire', 'photo-1539650116574'],
    ['Dattes fraîches au marché', 'Gastronomie', 18, '1 h', 'gastronomie, local, souk', 'photo-1547592180', 'tunisienne'],
    ['Cuisine du Jérid chez l’habitant', 'Restaurant', 32, '2 h', 'gastronomie, local, famille', 'photo-1547592180', 'tunisienne'],
    ['Nuit en maison d’hôtes dans l’oasis', 'Hébergement', 110, '1 nuit', 'authentique, nature, calme', 'photo-1500530855697'],
  ],
  Tunis: [
    ['Médina de Tunis et ses souks', 'Culture', 0, '2 h 30', 'culture, souk, artisanat', 'photo-1539650116574'],
    ['Musée national du Bardo', 'Culture', 13, '2 h', 'culture, musée, histoire', 'photo-1539650116574'],
    ['Sidi Bou Saïd, ruelles bleues', 'Culture', 0, '2 h', 'culture, photo, détente', 'photo-1548013146'],
    ['Site archéologique de Carthage', 'Culture', 12, '2 h 30', 'culture, histoire, patrimoine', 'photo-1539650116574'],
    ['Promenade au bord du lac', 'Nature', 0, '1 h', 'nature, détente, marche', 'photo-1507525428034'],
    ['Dégustation au marché central', 'Gastronomie', 20, '1 h 30', 'gastronomie, local, marché', 'photo-1547592180', 'tunisienne'],
    ['Lablabi, recette du terroir', 'Restaurant', 16, '1 h', 'street food, gastronomie, local', 'photo-1547592180', 'tunisienne'],
    ['Table méditerranéenne à La Goulette', 'Restaurant', 42, '1 h 30', 'fruits de mer, gastronomie, mer', 'photo-1547592180', 'fruits de mer'],
    ['Atelier de mosaïque artisanale', 'Artisanat', 28, '2 h', 'artisanat, culture, famille', 'photo-1539650116574'],
    ['Maison d’hôtes dans la médina', 'Hébergement', 105, '1 nuit', 'authentique, culture, calme', 'photo-1516483638261'],
  ],
  Hammamet: [
    ['Médina et fort de Hammamet', 'Culture', 10, '2 h', 'culture, histoire, photo', 'photo-1539650116574'],
    ['Plage de Yasmine Hammamet', 'Plage', 0, '2 h', 'plage, détente, famille', 'photo-1507525428034'],
    ['Sortie en catamaran', 'Mer', 48, '3 h', 'mer, famille, détente', 'photo-1500375592092'],
    ['Atelier de poterie de Nabeul', 'Artisanat', 27, '2 h', 'artisanat, culture, local', 'photo-1539650116574'],
    ['Couscous de la côte', 'Restaurant', 29, '1 h 30', 'gastronomie, tunisienne, local', 'photo-1547592180', 'tunisienne'],
    ['Hôtel Dar Jasmin', 'Hébergement', 125, '1 nuit', 'confort, plage, famille', 'photo-1516483638261'],
  ],
  Tabarka: [
    ['Aiguilles de Tabarka', 'Nature', 0, '1 h 30', 'nature, photo, détente', 'photo-1472396961693'],
    ['Plongée au Cap Tabarka', 'Mer', 58, '3 h', 'mer, aventure, sport', 'photo-1500375592092', '', 'moyen', 'animé', false],
    ['Fort génois et vieille ville', 'Culture', 8, '2 h', 'culture, histoire, photo', 'photo-1539650116574'],
    ['Sentier des chênes-lièges', 'Nature', 15, '3 h', 'nature, randonnée, aventure', 'photo-1472396961693', '', 'élevé', 'calme', false],
    ['Poisson du jour au port', 'Restaurant', 40, '1 h 30', 'fruits de mer, gastronomie, local', 'photo-1547592180', 'fruits de mer'],
    ['Maison d’hôtes Les Aiguilles', 'Hébergement', 90, '1 nuit', 'nature, calme, authentique', 'photo-1516483638261'],
  ],
}

export const destinations = Object.keys(destinationOffers)
export const mockOffers = Object.entries(destinationOffers).flatMap(([destination, offers]) => offers.map((item, index) => offer(destination, item, index)))

export const demoProfiles = [
  { id: 'family', label: 'Famille culture + plage', firstName: 'Sarra', ageRange: '35–44 ans', location: 'Tunis, Tunisie', languages: ['Français', 'Arabe'], cuisines: ['tunisienne', 'fruits de mer'], diet: ['halal'], spice: 2, mealBudget: 35, activities: ['Culture', 'Plage', 'Activités en famille', 'Artisanat'], style: { calm: 35, adventure: 45, authentic: 75, mobility: 25 }, pace: 'Normal', maxActivities: 4, constraints: ['Marche limitée', 'Voyage avec enfants'], accommodation: 'Maison d’hôtes', accommodationBudget: 100, transport: 'Taxi', dailyBudget: 100, company: 'Famille', interests: ['Culture', 'Plage', 'Cuisine locale', 'Photographie'], budget: 'Moyen', goals: ['Détente', 'Découverte'] },
  { id: 'solo', label: 'Solo nature + authentique', firstName: 'Yassine', ageRange: '25–34 ans', location: 'Sousse, Tunisie', languages: ['Français', 'Arabe', 'Anglais'], cuisines: ['tunisienne', 'végétarienne'], diet: ['végétarien'], spice: 3, mealBudget: 25, activities: ['Nature', 'Randonnée', 'Photographie', 'Culture'], style: { calm: 55, adventure: 70, authentic: 90, mobility: 80 }, pace: 'Lève-tôt', maxActivities: 5, constraints: [], accommodation: 'Maison d’hôtes', accommodationBudget: 70, transport: 'Transport en commun', dailyBudget: 90, company: 'Solo', interests: ['Nature', 'Culture', 'Randonnée'], budget: 'Économique', goals: ['Aventure', 'Expérience locale'] },
  { id: 'friends', label: 'Amis aventure + vie nocturne', firstName: 'Meriem', ageRange: '25–34 ans', location: 'Tunis, Tunisie', languages: ['Français', 'Arabe'], cuisines: ['street food', 'italienne'], diet: ['aucune'], spice: 4, mealBudget: 45, activities: ['Sports nautiques', 'Vie nocturne', 'Festivals', 'Souks'], style: { calm: 75, adventure: 90, authentic: 50, mobility: 80 }, pace: 'Couche-tard', maxActivities: 5, constraints: [], accommodation: 'Hôtel', accommodationBudget: 150, transport: 'Voiture de location', dailyBudget: 180, company: 'Amis', interests: ['Aventure', 'Gastronomie', 'Vie nocturne'], budget: 'Premium', goals: ['Aventure', 'Divertissement'] },
]

export const demoProvider = { businessName: 'Hôtel Dar Djerba', contactName: 'Ali Ben Salem', email: 'bonjour@dardjerba.tn', city: 'Djerba, Tunisie', category: 'Hôtel & restaurant' }

export const demoReservations = [
  { id: 'r-101', traveler: 'Sarra Ben Ali', offerId: 'djerba-09', date: '2026-06-15', guests: 4, amount: 180, status: 'En attente' },
  { id: 'r-102', traveler: 'Yassine Trabelsi', offerId: 'djerba-01', date: '2026-06-16', guests: 2, amount: 50, status: 'Confirmée' },
  { id: 'r-103', traveler: 'Meriem Gharbi', offerId: 'djerba-10', date: '2026-06-18', guests: 3, amount: 114, status: 'En attente' },
  { id: 'r-104', traveler: 'Sarra Ben Ali', offerId: 'djerba-02', date: '2026-06-19', guests: 4, amount: 60, status: 'Confirmée' },
  { id: 'r-105', traveler: 'Nour Kammoun', offerId: 'tozeur-01', date: '2026-06-20', guests: 2, amount: 40, status: 'Refusée' },
  { id: 'r-106', traveler: 'Amir Jlassi', offerId: 'tunis-02', date: '2026-06-21', guests: 2, amount: 26, status: 'En attente' },
]

export const mockMessages = [
  { id: 'm1', name: 'Sarra Ben Ali', preview: 'Bonjour, la sortie en mer est-elle adaptée aux enfants ?', time: '10:24', unread: true },
  { id: 'm2', name: 'Yassine Trabelsi', preview: 'Merci pour les informations sur Guellala.', time: 'Hier', unread: false },
]