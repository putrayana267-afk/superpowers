import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sdmutu.asistenguru',
  appName: 'Asisten Guru',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    // Pakai HTTP native agar panggilan Gemini langsung dari app tidak kena CORS.
    CapacitorHttp: { enabled: true },
    CapacitorSQLite: { androidIsEncryption: false },
  },
};

export default config;
