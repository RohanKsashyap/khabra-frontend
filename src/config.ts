interface Config {
  apiUrl: string;
  isDevelopment: boolean;
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL,
  isDevelopment: import.meta.env.DEV
};

export default config;

export const API_BASE_URL = `${config.apiUrl}/api`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    ME: `${API_BASE_URL}/auth/me`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },
  USERS: {
    EARNINGS: `${API_BASE_URL}/users/earnings`,
  },
  // These endpoints will be added when the features are implemented
  // NETWORK: {
  //   GET: `${API_BASE_URL}/network`,
  // },
  // RANKS: {
  //   GET: `${API_BASE_URL}/ranks`,
  // },
}; 