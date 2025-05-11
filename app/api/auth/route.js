import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để xử lý token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers['Authorization'] = 'Bearer ' + user.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý refresh token khi token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const res = await axios.post(API_URL + 'refresh-token', user.refreshToken);
        
        if (res.status === 200) {
          localStorage.setItem('user', JSON.stringify(res.data));
          
          return api(originalRequest);
        }
      } catch (err) {
        console.error('Không thể làm mới token', err);
        // Đăng xuất người dùng
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const response = await api.post(API_URL + 'login', { email, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (fullName, email, password) => {
  try {
    const response = await api.post(API_URL + 'register', {
      fullName,
      email,
      password,
      role: 'customer', // Mặc định là khách hàng
    });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export default api;