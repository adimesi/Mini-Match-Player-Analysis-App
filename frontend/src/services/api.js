import axios from 'axios';
const REACT_APP_BACKEND_API = process.env.REACT_APP_BACKEND_API;
const instance = axios.create({
  baseURL: REACT_APP_BACKEND_API,
    timeout:10000,
    headers:{
        "Content-Type":"application/json",
    }
});

instance.interceptors.request.use(
  (config) => {
    console.log("Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("Response error:", error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default instance;