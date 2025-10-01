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

// Mock fetch API
global.fetch = jest.fn();

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

// Mock Redux Toolkit (조건부 모킹)
try {
  jest.mock("@/store/redux-toolkit/hooks", () => ({
    useAppDispatch: () => jest.fn(),
    useAppSelector: jest.fn(),
  }));

  jest.mock("@/store/redux-toolkit/slice/userSlice", () => ({
    selectUser: (state) => state.user,
    userSlice: {
      actions: {
        setUser: (user) => ({ type: "user/setUser", payload: user }),
        clearUser: () => ({ type: "user/clearUser" }),
      },
    },
  }));
} catch (error) {
  // 모듈이 없으면 무시
}

// Mock Redux Persist
jest.mock("redux-persist/integration/react", () => ({
  PersistGate: ({ children }) => children,
}));

// =============================================================================
// Context API 모킹
// =============================================================================

// Mock Alert Context (조건부 모킹)
try {
  jest.mock("@/store/context/alertContext", () => ({
    useAlert: () => ({
      showSuccessHandler: jest.fn(),
      showErrorHandler: jest.fn(),
    }),
  }));

  jest.mock("@/store/context/auth/authContext", () => ({
    useAuth: () => ({
      isAuthenticated: false,
      isLoading: false,
    }),
    AuthProvider: ({ children }) => children,
  }));
} catch (error) {
  // 모듈이 없으면 무시
}

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

// React Hook Form의 zodResolver는 실제 구현을 사용 (모킹 제거)

// Mock Lodash
jest.mock("lodash/debounce", () => jest.fn((fn) => fn));

// Mock React Icons
jest.mock("react-icons", () => ({
  IoSearchOutline: () => <div data-testid="search-icon" />,
  IoCloseOutline: () => <div data-testid="close-icon" />,
  IoEyeOutline: () => <div data-testid="eye-icon" />,
  IoEyeOffOutline: () => <div data-testid="eye-off-icon" />,
}));
