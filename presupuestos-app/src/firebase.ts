// src/firebase.ts
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// *** ESTA LÍNEA ES CRUCIAL: Necesitas getFirestore para Firestore ***
import { getFirestore } from "firebase/firestore"; // <-- Asegúrate de que esta línea esté presente

// Si usas Analytics, también lo importas aquí, pero no es esencial para Firestore
// import { getAnalytics } from "firebase/analytics"; 

// Your web app's Firebase configuration
// Asegúrate de que estos valores sean los que copiaste de tu consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA2Zd4zfPMxGwkYsO-brUBj_OL9fUPYt-E", // Tus valores reales
  authDomain: "tecnologik-d57d1.firebaseapp.com",     // Tus valores reales
  projectId: "tecnologik-d57d1",                   // Tus valores reales
  storageBucket: "tecnologik-d57d1.firebasestorage.app", // Tus valores reales
  messagingSenderId: "196509071147",                // Tus valores reales
  appId: "1:196509071147:web:adacfb97c5a85eac5ef76e",   // Tus valores reales
  measurementId: "G-VLQ0WDGL4R" // Opcional, si no lo usas, puedes quitarlo
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Inicializa Firestore y EXPORTA la instancia 'db'
// *** ESTA LÍNEA ES LA CLAVE PARA EL ERROR QUE RECIBES ***
export const db = getFirestore(app); // <-- Asegúrate de que 'export' esté aquí

// Si usas Analytics, lo inicializas aquí
// const analytics = getAnalytics(app);