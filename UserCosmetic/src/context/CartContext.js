import React, { createContext, useContext, useState, useEffect } from "react";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const auth = getAuth();
  const db = getDatabase();

  // Load giỏ hàng từ Firebase khi đăng nhập hoặc khi cart thay đổi
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const cartRef = ref(db, `users/${userId}/cart`);
    const unsubscribe = onValue(cartRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCart(data);
      } else {
        setCart([]); 
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [auth.currentUser]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      const newCart = existingItem
        ? prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCart, { ...product, quantity: 1, selected: false }];

      // Cập nhật lên Firebase
      set(ref(db, `users/${userId}/cart`), newCart);
      return newCart;
    });
  };

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateQuantity = (id, newQuantity) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      );

      // Cập nhật lên Firebase
      set(ref(db, `users/${userId}/cart`), newCart);
      return newCart;
    });
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== id);

      // Cập nhật lên Firebase
      set(ref(db, `users/${userId}/cart`), newCart);
      return newCart;
    });
  };

  // Chọn hoặc bỏ chọn sản phẩm trong giỏ hàng
  const toggleSelect = (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      );

      // Cập nhật lên Firebase
      set(ref(db, `users/${userId}/cart`), newCart);
      return newCart;
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleSelect,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
