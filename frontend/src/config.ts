const config = {
  baseUrl: import.meta.env.VITE_BASE_URL as string,
  version: (import.meta.env.VITE_SWM_PASANG_VERSION as string) ?? "dev",
};

export default config;
