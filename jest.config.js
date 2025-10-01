import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",

  // Jest 전용 절대 경로 설정 (우선순위: 구체적 → 일반적)
  moduleNameMapper: {
    // 1. 정확한 파일명 매칭 (가장 구체적)
    "^@/firebase-config$": "<rootDir>/firebase-config",
    "^@/firebase-admin-config$": "<rootDir>/firebase-admin-config",
    "^firebase-config$": "<rootDir>/firebase-config",
    "^firebase-admin-config$": "<rootDir>/firebase-admin-config",
    "^@/next/cache$": "next/cache",

    // 2. 디렉토리별 매칭 (구체적)
    "^@/components/(.*)$": "<rootDir>/app/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/store/(.*)$": "<rootDir>/store/$1",
    "^@/utils/(.*)$": "<rootDir>/app/utils/$1",
    "^@/types/(.*)$": "<rootDir>/lib/types/$1",
    "^@/api/(.*)$": "<rootDir>/app/api/$1",
    "^@/hooks/(.*)$": "<rootDir>/app/hooks/$1",
    "^@/home/(.*)$": "<rootDir>/app/home/$1",
    "^@/__tests__/(.*)$": "<rootDir>/__tests__/$1",
    // 비-@ 별칭도 지원 (테스트 코드 내 사용됨)
    "^app/(.*)$": "<rootDir>/app/$1",
    "^components/(.*)$": "<rootDir>/app/components/$1",
    "^lib/(.*)$": "<rootDir>/lib/$1",
    "^store/(.*)$": "<rootDir>/store/$1",
    "^utils/(.*)$": "<rootDir>/app/utils/$1",
    "^types/(.*)$": "<rootDir>/lib/types/$1",
    "^api/(.*)$": "<rootDir>/app/api/$1",
    "^hooks/(.*)$": "<rootDir>/app/hooks/$1",
    "^home/(.*)$": "<rootDir>/app/home/$1",
    // 주의: 포괄 매핑("^@/(.*)$")는 충돌을 유발하므로 의도적으로 제거
  },

  // 테스트 파일 매칭 패턴 (*.test|*.spec 파일만 실행)
  testMatch: ["**/*.(test|spec).(ts|tsx|js)"],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/out/",
  ],

  // 커버리지 설정
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "store/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/out/**",
    "!**/coverage/**",
    "!**/*.config.{js,ts}",
    "!**/jest.setup.js",
  ],

  // 커버리지 임계값 설정 (품질 게이트)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // 테스트 타임아웃 설정 (비동기 테스트용)
  testTimeout: 10000,

  // 변환 설정 (TypeScript 지원)
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },

  // 변환 제외 패턴
  transformIgnorePatterns: ["/node_modules/(?!(swiper|react-player)/)"],
};

export default createJestConfig(customJestConfig);
