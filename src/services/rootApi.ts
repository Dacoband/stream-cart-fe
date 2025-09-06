import axios, { InternalAxiosRequestConfig, AxiosRequestHeaders, AxiosError } from 'axios'

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
  (config: InternalAxiosRequestConfig) => {
    const tokenRaw = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    // Normalize token: strip possible surrounding quotes and trim
    const token = tokenRaw ? tokenRaw.replace(/^"|"$/g, '').trim() : null;
    // Avoid double 'Bearer ' prefix if token already contains it
    const headerValue = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : null;

    // ensure headers object exists and set Authorization defensively
    const existing = (config.headers ?? {}) as AxiosRequestHeaders;
    const addition: Record<string, string> = headerValue ? { Authorization: headerValue } : {};
    config.headers = { ...existing, ...addition } as AxiosRequestHeaders;

    // debug: show URL, params and masked token if explicitly enabled via env
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') {
      const masked = headerValue ? `${headerValue.slice(0, 12)}...` : 'no-token';
      console.debug('[rootApi] request', { url: config.url, params: config.params, Authorization: masked });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

rootApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = (error.config ?? {}) as InternalAxiosRequestConfig & { _retry?: boolean };

    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') {
      try {
        console.debug('[rootApi] response error body', error.response?.data);
      } catch {
        // ignore
      }
    }

    if ((error.response?.status === 401) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (!originalRequest.headers) originalRequest.headers = {} as AxiosRequestHeaders;
            (originalRequest.headers as AxiosRequestHeaders).Authorization = `Bearer ${newToken}`;
            return rootApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = localStorage.getItem("refreshToken");
        if (!refresh) {
          throw new Error("No refresh token");
        }

        const response = await rootApi.post("auth/refresh-token", {
          refreshToken: refresh,
        });

        const data = response.data?.data;
        if (!data || !data.token) {
          throw new Error("Invalid refresh response");
        }

        const newToken = data.token;
        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        
        if (data.account) {
          const userData = {
            id: data.account.id,
            username: data.account.username,
            role: data.account.role,
            isActive: data.account.isActive,
            isVerified: data.account.isVerified,
            shopId: data.account.shopId || null,
            avatarURL: data.account.avatarURL,
            fullname: data.account.fullname,
            phoneNumber: data.account.phoneNumber,
            email: data.account.email,
          };
          localStorage.setItem("userData", JSON.stringify(userData));
        }

        processQueue(null, newToken);

        if (!originalRequest.headers) originalRequest.headers = {} as AxiosRequestHeaders;
        (originalRequest.headers as AxiosRequestHeaders).Authorization = `Bearer ${newToken}`;

        return rootApi(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        if (typeof window !== 'undefined') {
          window.location.href = "/authentication/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default rootApi;
