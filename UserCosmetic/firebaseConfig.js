// firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase } from "firebase/database";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDX6MhpcOj_mMvGV6NYYsfU4by29TNAYrE",
  authDomain: "admincosmetic-8f098.firebaseapp.com",
  databaseURL:
    "https://admincosmetic-8f098-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "admincosmetic-8f098",
  storageBucket: "admincosmetic-8f098.appspot.com",
  messagingSenderId: "218027957302",
  appId: "1:218027957302:web:bbbe2085cee23feee10c97",
};

// Only initialize Firebase app once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get Auth instance - only initialize if needed
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Initialize Realtime Database
const database = getDatabase(app);

// For compatibility with Firebase v8 style code
const firebase = {
  auth: () => auth,
  database: () => database,
  app: app
};

// Export Firebase services
export { firebase, auth, database };