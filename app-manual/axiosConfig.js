import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://harvestguard-smart-rain-protection.onrender.com',
  withCredentials: true
});

export default axiosInstance;
smartbin-x0i7.onrender.com