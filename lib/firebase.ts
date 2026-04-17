import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope("https://www.googleapis.com/auth/youtube.readonly")
googleProvider.addScope("https://www.googleapis.com/auth/yt-analytics.readonly")

// Persistence auth explicite — garder l'utilisateur connecté entre les sessions
setPersistence(auth, browserLocalPersistence).catch(console.error)

// Cache Firestore local (IndexedDB) — données disponibles hors-ligne et au 1er rendu
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      // Plusieurs onglets ouverts — pas bloquant
      console.warn("Firestore persistence: multiple tabs open")
    } else if (err.code === "unimplemented") {
      // Navigateur trop ancien
      console.warn("Firestore persistence: not supported by browser")
    }
  })
}
