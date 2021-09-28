import { initializeApp } from 'firebase/app';
import React from "react";

const firebaseConfig = {
  apiKey: "AIzaSyBYoTVD0Y_SVa6aw9CeuZIZR4av6t58TnI",
  authDomain: "reportrr-918ff.firebaseapp.com",
  projectId: "reportrr-918ff",
  storageBucket: "reportrr-918ff.appspot.com",
  messagingSenderId: "165244702798",
  appId: "1:165244702798:web:b924f4034727c356cdf31f",
  measurementId: "G-GWG1TM3MK1"
};
export default function mTea(){}
export const app = initializeApp(firebaseConfig)
export const FirebaseAuthContext = React.createContext(app);