// Importar Firebase y módulos necesarios
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

// =======================
// 🔹 Configuración Balconeria
// =======================
const firebaseConfig = {
  apiKey: "AIzaSyBA2li7zIKbMULDavX-w-baTkvGCfvZoyY",
  authDomain: "balconeriafaby.firebaseapp.com",
  projectId: "balconeriafaby",
  storageBucket: "balconeriafaby.firebasestorage.app",
  messagingSenderId: "694935864743",
  appId: "1:694935864743:web:b3bbce697a717571892282",
  measurementId: "G-RDH67ZLLHP",
};

// =======================
// 🔹 Inicializar Firebase
// =======================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =======================
// 🔹 Exportaciones
// =======================
export {
  app,
  auth,
  db,
  addDoc,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
};
