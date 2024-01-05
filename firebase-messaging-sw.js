import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = initializeApp({
  apiKey: "AIzaSyA2CHwqB8wdUsw2TEqFP9Wta06DanxPO0w",
  authDomain: "piso-33258.firebaseapp.com",
  projectId: "piso-33258",
  storageBucket: "piso-33258.appspot.com",
  messagingSenderId: "894232306014",
  appId: "1:894232306014:web:eff2ae96b3df613ef52fcf",
  measurementId: "G-CNVN8PVPB6"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = getMessaging(firebaseConfig);
onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // ...
});