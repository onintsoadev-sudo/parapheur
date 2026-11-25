import axios from "axios";

// Configuration pour la consommation de l'API Express
const axiosRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercepteur : ajoute automatiquement le token JWT
axiosRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur réponse : déconnexion si 401
axiosRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide / expiré — on nettoie (sauf sur la page login)
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("ACCESS_TOKEN");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosRequest;
