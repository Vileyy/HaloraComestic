import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDX6MhpcOj_mMvGV6NYYsfU4by29TNAYrE",
  authDomain: "admincosmetic-8f098.firebaseapp.com",
  databaseURL: "https://admincosmetic-8f098-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "admincosmetic-8f098",
  storageBucket: "admincosmetic-8f098.appspot.com",  
  messagingSenderId: "218027957302",
  appId: "1:218027957302:web:bbbe2085cee23feee10c97"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

export { database, storage };
