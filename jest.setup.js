import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// =============================================================================
// 브라우저 API 모킹
// =============================================================================

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
global.IntersectionObserver = mockIntersectionObserver;

// Mock window.matchMedia (반응형 디자인 테스트용)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo (스크롤 관련 테스트용)
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: jest.fn(),
});

// Mock URL.createObjectURL (파일 업로드 테스트용)
Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: jest.fn(() => "mock-object-url"),
});

Object.defineProperty(URL, "revokeObjectURL", {
  writable: true,
  value: jest.fn(),
});

// Mock fetch API — 테스트 간 누락된 mock 응답으로 인한 오염 방지
global.fetch = jest.fn();
beforeEach(() => {
  if (jest.isMockFunction(global.fetch)) {
    global.fetch.mockReset();
  }
});

// Mock Web APIs for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// =============================================================================
// React 및 Next.js 모킹
// =============================================================================

// Mock React Cache
jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    cache: (fn) => fn,
  };
});

// =============================================================================
// Firebase 모킹
// =============================================================================

// Mock Firebase Client SDK
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
  updatePassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  GithubAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  setPersistence: jest.fn(),
  browserLocalPersistence: {},
  browserSessionPersistence: {},
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Mock Firebase Admin SDK
jest.mock("firebase-admin", () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
    updateUser: jest.fn(),
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
    })),
    runTransaction: jest.fn(),
  })),
}));

// =============================================================================
// Next.js 모킹
// =============================================================================

// Mock Next.js router (Pages Router)
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  }),
}));

// Mock Next.js navigation (App Router)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js server components
jest.mock("next/server", () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url,
    method: init?.method || "GET",
    headers: new Headers(init?.headers || {}),
    json: async () => JSON.parse(init?.body || "{}"),
  })),
  NextResponse: {
    json: (data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

// Mock Next.js cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// =============================================================================
// 상태 관리 모킹
// =============================================================================

// Mock Redux Toolkit (앱은 `store/...` 경로로 import — 동일 문자열로 mock 해야 적용됨)
jest.mock("store/redux-toolkit/hooks", () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock("store/redux-toolkit/slice/userSlice", () => ({
  selectUser: (state) => state.user,
  clearUser: () => ({ type: "user/clearUser" }),
}));

// =============================================================================
// Context API 모킹
// =============================================================================

// Mock Alert Context (`store/context/alertContext`와 동일 모듈 ID)
jest.mock("store/context/alertContext", () => ({
  AlertProvider: ({ children }) => children,
  useAlert: () => ({
    showSuccessHandler: jest.fn(),
    showErrorHandler: jest.fn(),
    showConfirmHandler: jest.fn(),
    hideErrorHandler: jest.fn(),
    hideSuccessHandler: jest.fn(),
  }),
}));

// =============================================================================
// 외부 라이브러리 모킹
// =============================================================================

// Mock AWS SDK
jest.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));

// Mock Swiper
jest.mock("swiper/react", () => ({
  Swiper: ({ children, ...props }) => (
    <div data-testid="swiper" {...props}>
      {children}
    </div>
  ),
  SwiperSlide: ({ children, ...props }) => (
    <div data-testid="swiper-slide" {...props}>
      {children}
    </div>
  ),
}));

jest.mock("swiper/modules", () => ({
  Navigation: jest.fn(),
  Pagination: jest.fn(),
  Autoplay: jest.fn(),
}));

// Mock use-debounce
jest.mock("use-debounce", () => ({
  useDebounce: (value) => [value],
  useDebouncedCallback: (fn) => {
    const wrapped = (...args) => fn(...args);
    wrapped.cancel = () => {};
    wrapped.flush = () => {};
    return wrapped;
  },
}));

