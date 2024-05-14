
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDI_vPf22rQNND9dIqzSk76FY2bzKvn9Wk",
  authDomain: "webcars-72d9e.firebaseapp.com",
  projectId: "webcars-72d9e",
  storageBucket: "webcars-72d9e.appspot.com",
  messagingSenderId: "270045226927",
  appId: "1:270045226927:web:71635d9e8e286c688fb15a"
}


const app = initializeApp(firebaseConfig)

const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { db, auth, storage }