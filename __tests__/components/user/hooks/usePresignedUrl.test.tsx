import { renderHook, waitFor } from "@testing-library/react";
import { usePresignedUrl } from "@/components/user/hooks/usePresignedUrl";
import { fetchPresignedUrl } from "@/utils/api/fetchPresignedUrl";

// fetchPresignedUrl 모킹
jest.mock("@/utils/api/fetchPresignedUrl");
const mockFetchPresignedUrl = fetchPresignedUrl as jest.MockedFunction<
  typeof fetchPresignedUrl
>;

// useAuth 모킹
const mockUseAuth = jest.fn();
jest.mock("store/context/auth/authContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// isAuth 모킹
const mockIsAuth = {
  currentUser: null,
};
jest.mock("firebase-config", () => ({
  isAuth: mockIsAuth,
}));

describe("usePresignedUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    mockIsAuth.currentUser = null;
  });

  describe("기본 동작", () => {
    test("key가 없을 때 빈 URL을 반환한다", () => {
      const { result } = renderHook(() =>
        usePresignedUrl({
          key: null,
        }),
      );

      expect(result.current.url).toBe("");
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    test("key가 빈 문자열일 때 빈 URL을 반환한다", () => {
      const { result } = renderHook(() =>
        usePresignedUrl({
          key: "",
        }),
      );

      expect(result.current.url).toBe("");
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    test("fallbackUrl이 제공되면 초기값으로 사용한다", () => {
      const { result } = renderHook(() =>
        usePresignedUrl({
          key: null,
          fallbackUrl: "https://example.com/fallback.jpg",
        }),
      );

      expect(result.current.url).toBe("https://example.com/fallback.jpg");
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    test("공개 이미지에 대해 presigned URL을 요청한다", async () => {
      mockFetchPresignedUrl.mockResolvedValue({
        url: "https://example.com/presigned-url",
        expiresIn: 3600,
      });

      const { result } = renderHook(() =>
        usePresignedUrl({
          key: "public-photos/123.jpg",
        }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBe("https://example.com/presigned-url");
      expect(result.current.error).toBe(null);
      expect(mockFetchPresignedUrl).toHaveBeenCalledWith({
        key: "public-photos/123.jpg",
        isPublic: true,
        idToken: null,
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe("캐시 기능", () => {
    test("동일한 키에 대해서는 캐시를 사용한다", async () => {
      mockFetchPresignedUrl.mockResolvedValue({
        url: "https://example.com/cached-url",
        expiresIn: 3600,
      });

      // 첫 번째 호출
      const { result: firstResult, rerender } = renderHook(
        ({ key }) => usePresignedUrl({ key }),
        { initialProps: { key: "test-key" } },
      );

      await waitFor(() => {
        expect(firstResult.current.loading).toBe(false);
      });

      // 같은 키로 다시 렌더링
      rerender({ key: "test-key" });

      await waitFor(() => {
        expect(firstResult.current.loading).toBe(false);
      });

      // 한 번만 호출되어야 함 (캐시 사용)
      expect(mockFetchPresignedUrl).toHaveBeenCalledTimes(1);
      expect(firstResult.current.url).toBe("https://example.com/cached-url");
    });

    test("다른 키에 대해서는 별도로 요청한다", async () => {
      mockFetchPresignedUrl
        .mockResolvedValueOnce({
          url: "https://example.com/url1",
          expiresIn: 3600,
        })
        .mockResolvedValueOnce({
          url: "https://example.com/url2",
          expiresIn: 3600,
        });

      // 첫 번째 키
      const { result: firstResult } = renderHook(() =>
        usePresignedUrl({ key: "key1" }),
      );

      await waitFor(() => {
        expect(firstResult.current.loading).toBe(false);
      });

      // 두 번째 키
      const { result: secondResult } = renderHook(() =>
        usePresignedUrl({ key: "key2" }),
      );

      await waitFor(() => {
        expect(secondResult.current.loading).toBe(false);
      });

      // 두 번 호출되어야 함
      expect(mockFetchPresignedUrl).toHaveBeenCalledTimes(2);
      expect(firstResult.current.url).toBe("https://example.com/url1");
      expect(secondResult.current.url).toBe("https://example.com/url2");
    });
  });

  describe("에러 처리", () => {
    test("API 호출 실패 시 에러를 반환한다", async () => {
      mockFetchPresignedUrl.mockRejectedValue(new Error("API 오류"));

      const { result } = renderHook(() =>
        usePresignedUrl({
          key: "error-key",
          fallbackUrl: "https://example.com/fallback.jpg",
        }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBe("https://example.com/fallback.jpg");
      expect(result.current.error).toBe("API 오류");
    });

    test("알 수 없는 에러는 기본 메시지를 반환한다", async () => {
      mockFetchPresignedUrl.mockRejectedValue("Unknown error");

      const { result } = renderHook(() =>
        usePresignedUrl({
          key: "unknown-error-key",
          fallbackUrl: "https://example.com/fallback.jpg",
        }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBe("https://example.com/fallback.jpg");
      expect(result.current.error).toBe("알 수 없는 에러가 발생했습니다.");
    });
  });

  describe("컴포넌트 언마운트", () => {
    test("컴포넌트 언마운트 시 요청을 취소한다", async () => {
      let resolvePromise: (value: { url: string; expiresIn: number }) => void;
      const promise = new Promise<{ url: string; expiresIn: number }>(
        (resolve) => {
          resolvePromise = resolve;
        },
      );
      mockFetchPresignedUrl.mockReturnValue(promise);

      // 고유한 키를 사용하여 캐시 충돌 방지
      const uniqueKey = `test-key-${Date.now()}-${Math.random()}`;

      const { unmount } = renderHook(() => usePresignedUrl({ key: uniqueKey }));

      // fetchPresignedUrl이 호출되었는지 확인
      expect(mockFetchPresignedUrl).toHaveBeenCalledWith({
        key: uniqueKey,
        isPublic: true,
        idToken: null,
        signal: expect.any(AbortSignal),
      });

      // 컴포넌트 언마운트
      unmount();

      // Promise 해결
      resolvePromise!({
        url: "https://example.com/url",
        expiresIn: 3600,
      });
    });
  });

  describe("키 변경", () => {
    test("키가 변경되면 새로운 요청을 한다", async () => {
      mockFetchPresignedUrl
        .mockResolvedValueOnce({
          url: "https://example.com/url1",
          expiresIn: 3600,
        })
        .mockResolvedValueOnce({
          url: "https://example.com/url2",
          expiresIn: 3600,
        });

      // 고유한 키를 사용하여 캐시 충돌 방지
      const uniqueKey1 = `key1-${Date.now()}-${Math.random()}`;
      const uniqueKey2 = `key2-${Date.now()}-${Math.random()}`;

      const { result, rerender } = renderHook(
        ({ key }) => usePresignedUrl({ key }),
        { initialProps: { key: uniqueKey1 } },
      );

      // 첫 번째 요청이 완료될 때까지 기다림
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.url).toBe("https://example.com/url1");
      });

      // 첫 번째 요청이 호출되었는지 확인
      expect(mockFetchPresignedUrl).toHaveBeenCalledWith({
        key: uniqueKey1,
        isPublic: true,
        idToken: null,
        signal: expect.any(AbortSignal),
      });

      // 키 변경
      rerender({ key: uniqueKey2 });

      // 두 번째 요청이 완료될 때까지 기다림
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.url).toBe("https://example.com/url2");
      });

      // 두 번째 요청도 호출되었는지 확인
      expect(mockFetchPresignedUrl).toHaveBeenCalledWith({
        key: uniqueKey2,
        isPublic: true,
        idToken: null,
        signal: expect.any(AbortSignal),
      });
    });
  });
});
