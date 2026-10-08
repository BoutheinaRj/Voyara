const weights = {
  request: 0.3,
  profile: 0.28,
  budget: 0.14,
  duration: 0.08,
  distance: 0.08,
  category: 0.07,
  constraints: 0.05,
}

const normalize = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

const wordsIn = (text) => normalize(text).split(/[^a-z0-9]+/).filter((word) => word.length > 3)

export const scoringWeights = weights

export function scoreOffer(offer, { text = '', budget = 300, duration = 3, destination = '' } = {}, profile = {}) {
  const requestWords = new Set(wordsIn(text))
  const offerWords = wordsIn(`${offer.name} ${offer.category} ${offer.description} ${(offer.tags || []).join(' ')}`)
  const keywordMatches = offerWords.filter((word) => requestWords.has(word)).length
  const requestScore = Math.min(100, keywordMatches * 24 + (normalize(text).includes(normalize(offer.destination)) ? 35 : 0) + 18)
  const profileTerms = [...(profile.interests || []), ...(profile.activities || []), ...(profile.cuisines || [])].map(normalize)
  const profileMatches = profileTerms.filter((term) => term && normalize(`${offer.category} ${offer.name} ${offer.cuisine} ${(offer.tags || []).join(' ')}`).includes(term)).length
  const profileScore = Math.min(100, 42 + profileMatches * 17)
  const budgetScore = Number(offer.price) <= Number(budget) ? 100 : Math.max(10, 100 - ((offer.price - budget) / Math.max(1, budget)) * 100)
  const requestedDestination = normalize(destination)
  const distanceScore = !requestedDestination || normalize(offer.destination).includes(requestedDestination) ? 100 : 20
  const durationHours = Number.parseInt(String(offer.duration), 10) || 2
  const durationScore = durationHours <= Number(duration) * 4 ? 100 : 65
  const constraintScore = (profile.constraints || []).includes('Marche limitée') && offer.walk === 'élevé' ? 15 : 100
  const categoryScore = offer.status === 'Brouillon' ? 0 : 100
  const score = Math.round(
    requestScore * weights.request + profileScore * weights.profile + budgetScore * weights.budget +
    durationScore * weights.duration + distanceScore * weights.distance + categoryScore * weights.category +
    constraintScore * weights.constraints,
  )
  const reasons = []
  if (profileMatches) reasons.push(`Correspond à ${profile.interests?.[0] || offer.category} dans votre profil`)
  if (offer.cuisine && profile.cuisines?.some((cuisine) => normalize(cuisine).includes(normalize(offer.cuisine)))) reasons.push(`Cuisine ${offer.cuisine} que vous aimez`)
  if ((profile.constraints || []).includes('Marche limitée') && offer.walk !== 'élevé') reasons.push('Peu de marche nécessaire')
  if (Number(offer.price) <= Number(budget)) reasons.push(`Respecte votre budget de ${budget} DT`)
  if (!reasons.length) reasons.push('Une expérience locale appréciée des voyageurs')
  return { score, reasons, components: { request: requestScore, profile: profileScore, budget: budgetScore, duration: durationScore, distance: distanceScore, category: categoryScore, constraints: constraintScore } }
}

export function rankOffers(offers, request, profile) {
  const destination = normalize(request.destination || '')
  return offers
    .filter((offer) => offer.status !== 'Brouillon' && (!destination || normalize(offer.destination).includes(destination)))
    .map((offer) => ({ offer, ...scoreOffer(offer, request, profile) }))
    .sort((first, second) => second.score - first.score)
}

export const normalizeText = normalize