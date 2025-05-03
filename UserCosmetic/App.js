import React from "react";
import AuthNavigator from "./src/navigation/AuthNavigator";
import { FavoritesProvider } from "./src/context/FavoritesContext";

export default function App() {
  return (
    <FavoritesProvider>
      <AuthNavigator />
    </FavoritesProvider>
  );
}
