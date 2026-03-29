import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Sprawdzamy, czy w pamięci przeglądarki jest zapisany użytkownik
  const user = localStorage.getItem('user');

  // Jeśli go nie ma, natychmiast przekierowujemy na stronę logowania
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jeśli jest, pozwalamy mu wejść na żądaną stronę
  return children;
};

export default ProtectedRoute;