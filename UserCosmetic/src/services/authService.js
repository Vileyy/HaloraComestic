import { auth, database } from "../../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ref, set } from "firebase/database";

// Hàm lưu thông tin người dùng vào Realtime Database
const saveUserToDatabase = async (userId, userData) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      status: "active", 
    });
  } catch (error) {
    throw error;
  }
};

// Hàm đăng ký tài khoản
export const registerUser = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Lưu thông tin người dùng vào Realtime Database
    await saveUserToDatabase(userCredential.user.uid, {
      email,
      displayName: name,
      photoURL: "https://via.placeholder.com/100", 
    });

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Hàm đăng nhập
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};
