import React, { createContext, useState, useContext, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";

// Create the context
const FavoritesContext = createContext();
export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const auth = getAuth();
  const db = getDatabase();

  // Tải danh sách sản phẩm yêu thích 
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const favoritesRef = ref(db, `favorites/${currentUser.uid}`);
      const unsubscribe = onValue(favoritesRef, (snapshot) => {
        if (snapshot.exists()) {
          const favoritesData = snapshot.val();
          const favoritesArray = Object.values(favoritesData);
          setFavorites(favoritesArray);
        } else {
          setFavorites([]);
        }
      });

      return () => unsubscribe();
    } else {
      setFavorites([]);
    }
  }, [auth.currentUser]);

  // Thêm sản phẩm vào danh sách yêu thích
  const addToFavorites = async (product) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const updatedFavorites = [...favorites, product];
      setFavorites(updatedFavorites);

      // Lưu vào Firebase
      const productRef = ref(db, `favorites/${currentUser.uid}/${product.id}`);
      await set(productRef, product);
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  // Xóa sản phẩm khỏi danh sách yêu thích
  const removeFromFavorites = async (productId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const updatedFavorites = favorites.filter(
        (item) => item.id !== productId
      );
      setFavorites(updatedFavorites);

      // Xóa khỏi Firebase
      const productRef = ref(db, `favorites/${currentUser.uid}/${productId}`);
      await set(productRef, null);
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  // Kiểm tra sản phẩm đã có trong danh sách yêu thích chưa
  const isFavorite = (productId) => {
    return favorites.some((item) => item.id === productId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useFavorites = () => {
  return useContext(FavoritesContext);
};
