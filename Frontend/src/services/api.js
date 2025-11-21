import axios from "axios";

const api = axios.create({
   baseURL: "https://fortnite-shop.onrender.com",
  withCredentials: true,  
});

export default api;
