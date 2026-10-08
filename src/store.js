import { demoProfiles, demoProvider, demoReservations, mockOffers } from './data.js'

const storageKey = 'voyara-demo-store'
const listeners = new Set()

const createInitialState = () => ({
  profile: demoProfiles[0],
  provider: demoProvider,
  offers: mockOffers,
  reservations: demoReservations,
  savedTrips: [],
  blockedDates: [],
})

const readState = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null')
    return stored ? { ...createInitialState(), ...stored } : createInitialState()
  } catch {
    return createInitialState()
  }
}

let state = readState()

const notify = () => listeners.forEach((listener) => listener())

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey) {
      state = readState()
      notify()
    }
  })
  window.addEventListener('voyara:store', () => {
    state = readState()
    notify()
  })
}

export const getStore = () => state

export const subscribeStore = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const updateStore = (updater) => {
  state = updater(state)
  localStorage.setItem(storageKey, JSON.stringify(state))
  window.dispatchEvent(new Event('voyara:store'))
  return state
}

export const saveProfile = (profile) => updateStore((current) => ({ ...current, profile }))

export const publishOffer = (offer) => updateStore((current) => ({
  ...current,
  offers: [{ ...offer, id: offer.id || `offer-${Date.now()}`, status: offer.status || 'Publiée' }, ...current.offers],
}))

export const updateOffer = (id, changes) => updateStore((current) => ({
  ...current,
  offers: current.offers.map((offer) => offer.id === id ? { ...offer, ...changes } : offer),
}))

export const removeOffer = (id) => updateStore((current) => ({
  ...current,
  offers: current.offers.filter((offer) => offer.id !== id),
}))

export const createReservation = (reservation) => updateStore((current) => ({
  ...current,
  reservations: [{ ...reservation, id: `reservation-${Date.now()}`, status: 'En attente' }, ...current.reservations],
}))

export const updateReservation = (id, status) => updateStore((current) => ({
  ...current,
  reservations: current.reservations.map((reservation) => reservation.id === id ? { ...reservation, status } : reservation),
}))

export const saveTrip = (trip) => updateStore((current) => ({
  ...current,
  savedTrips: [{ ...trip, id: `trip-${Date.now()}`, savedAt: new Date().toISOString() }, ...current.savedTrips],
}))