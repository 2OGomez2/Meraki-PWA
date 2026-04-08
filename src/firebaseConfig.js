import { initializeApp } from "firebase/app";
// 1. Importamos Firestore (la base de datos)
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByeBQodO8W0okOtwY50xZGa6AUqeY0BL4",
  authDomain: "meraki-4bada.firebaseapp.com",
  projectId: "meraki-4bada",
  storageBucket: "meraki-4bada.firebasestorage.app",
  messagingSenderId: "802213811455",
  appId: "1:802213811455:web:ced85d6f1d98b1b74ba8ca",
  measurementId: "G-WYNLHEPZ3R"
};

// 2. Inicializamos la App
const app = initializeApp(firebaseConfig);

// 3. Exportamos 'db' para que App.jsx pueda leerla
// Sin este 'export', la consola te seguirá tirando el error en rojo
export const db = getFirestore(app);