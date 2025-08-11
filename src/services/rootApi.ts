import { refreshToken } from './api/auth/authentication';
import axios from 'axios'

const rootApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
// Trạng thái đang refresh token
let isRefreshing = false;

// Hàng đợi các request lỗi 401 đang chờ token mới
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

// Xử lý hàng đợi khi refreshToken xong
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

rootApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

rootApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (!originalRequest.headers) originalRequest.headers = {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return rootApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await refreshToken();
        const newToken = response.data?.data?.token;
        processQueue(null, newToken);

        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        localStorage.setItem("token", newToken);

        // Lấy lại thông tin user sau khi refresh
        try {
          const userDataRes = await rootApi.get("auth/me", {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          localStorage.setItem("userData", JSON.stringify(userDataRes.data.data));
        } catch (err) {
          // Nếu lấy user thất bại, xóa token và chuyển về login
          localStorage.clear();
          // window.location.href = "/authentication/login";
          return Promise.reject(err);
        }

        return rootApi(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        // window.location.href = "/authentication/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default rootApi;
