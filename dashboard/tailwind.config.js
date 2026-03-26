/** @type {import('tailwindcss').Config} */
export default {
  // v3에서는 content 배열에 파일 경로를 지정해야 JIT 엔진이 작동합니다.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AI Rescue Buoy 전용 컬러 팔레트
        primary: '#FF5722', 
        secondary: '#64748B',
        danger: '#EF4444',
        success: '#10B981',
        background: '#F8FAFC',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}