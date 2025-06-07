interface Config {
  apiUrl: string;
  isDevelopment: boolean;
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  isDevelopment: import.meta.env.DEV
};

export default config; 