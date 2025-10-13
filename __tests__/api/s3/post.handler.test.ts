import { POST } from "@/api/s3/post.handler";
import { createMockRequest } from "__tests__/utils/test-utils";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyAuthToken } from "lib/auth/verifyToken";
import { getS3BucketName, S3_PRESIGNED_URL_EXPIRY } from "lib/aws/s3.constants";

// Mock 설정
jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));
jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(() => ({})),
  PutObjectCommand: jest.fn((args) => ({ ...args })),
}));
jest.mock("lib/aws/s3", () => ({
  __esModule: true,
  default: {},
}));
jest.mock("lib/auth/verifyToken", () => ({
  verifyAuthToken: jest.fn(),
}));
jest.mock("lib/aws/s3.constants", () => ({
  getS3BucketName: jest.fn(() => "test-bucket"),
  S3_PRESIGNED_URL_EXPIRY: {
    DOWNLOAD: 3600,
    UPLOAD: 300,
  },
}));
jest.mock("@/utils/file/validateFileSize", () => ({
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_CONTENT_TYPES: ["image/jpeg", "image/png", "image/gif"],
}));

const mockedGetSignedUrl = getSignedUrl as jest.MockedFunction<
  typeof getSignedUrl
>;
const mockedVerifyAuthToken = verifyAuthToken as jest.MockedFunction<
  typeof verifyAuthToken
>;
const mockedGetS3BucketName = getS3BucketName as jest.MockedFunction<
  typeof getS3BucketName
>;

describe("POST /api/s3 - Presigned URL 업로드", () => {
  const mockSignedUrl =
    "https://s3.amazonaws.com/test-bucket/presigned-upload-url?signature=xxx";
  const mockFilename = "test-image.png";
  const mockContentType = "image/png";
  const mockUserId = "test-user-123";
  const mockSize = 1024 * 1024; // 1MB

  beforeEach(() => {
    jest.clearAllMocks();

    // 기본 mock 설정
    mockedGetSignedUrl.mockResolvedValue(mockSignedUrl);
    mockedGetS3BucketName.mockReturnValue("test-bucket");
    mockedVerifyAuthToken.mockResolvedValue({
      success: true,
      uid: mockUserId,
    });
  });

  describe("성공 케이스", () => {
    test("유효한 요청으로 presigned URL과 key를 반환한다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.url).toBe(mockSignedUrl);
      expect(body.key).toMatch(
        new RegExp(`^profile-img/${mockUserId}/\\d+_${mockFilename}$`),
      );
      expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
    });

    test("S3 함수들을 올바르게 호출한다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      await POST(req);

      expect(mockedVerifyAuthToken).toHaveBeenCalledWith(req);
      expect(mockedGetS3BucketName).toHaveBeenCalled();
      expect(mockedGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object), // S3 client
        expect.objectContaining({
          Bucket: "test-bucket",
          ContentType: mockContentType,
          ContentLength: mockSize,
        }),
        expect.objectContaining({
          expiresIn: S3_PRESIGNED_URL_EXPIRY.UPLOAD,
        }),
      );
    });

    test("생성된 key가 올바른 형식을 갖는다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      // profile-img/{uid}/{timestamp}_{filename} 형식
      expect(body.key).toMatch(/^profile-img\//);
      expect(body.key).toContain(`/${mockUserId}/`);
      expect(body.key).toContain(`_${mockFilename}`);
      expect(body.key).toMatch(/\/\d+_/); // 타임스탬프 확인
    });

    test("허용된 모든 이미지 타입을 처리한다", async () => {
      const allowedTypes = [
        { type: "image/jpeg", filename: "photo.jpg" },
        { type: "image/png", filename: "image.png" },
        { type: "image/gif", filename: "animation.gif" },
      ];

      for (const { type, filename } of allowedTypes) {
        const req = createMockRequest({
          method: "POST",
          headers: { authorization: "Bearer valid-token" },
          body: {
            filename,
            contentType: type,
            size: mockSize,
          },
        });

        const response = await POST(req);
        expect(response.status).toBe(200);
      }
    });
  });

  describe("인증 검증", () => {
    test("인증되지 않은 요청은 401 에러를 반환한다", async () => {
      mockedVerifyAuthToken.mockResolvedValue({
        success: false,
        error: "로그인이 필요합니다.",
        statusCode: 401,
      });

      const req = createMockRequest({
        method: "POST",
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("로그인이 필요합니다.");
      expect(mockedGetSignedUrl).not.toHaveBeenCalled();
    });

    test("유효하지 않은 토큰은 403 에러를 반환한다", async () => {
      mockedVerifyAuthToken.mockResolvedValue({
        success: false,
        error: "유효하지 않은 토큰입니다.",
        statusCode: 403,
      });

      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer invalid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response = await POST(req);
      expect(response.status).toBe(403);
    });

    test("만료된 토큰은 적절한 에러를 반환한다", async () => {
      mockedVerifyAuthToken.mockResolvedValue({
        success: false,
        error: "토큰이 만료되었습니다.",
        statusCode: 401,
      });

      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer expired-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("토큰이 만료되었습니다.");
    });
  });

  describe("필수 파라미터 검증", () => {
    test("filename이 없으면 400 에러를 반환한다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("filename, contentType, size가 모두 필요합니다.");
      expect(mockedGetSignedUrl).not.toHaveBeenCalled();
    });

    test("contentType이 없으면 400 에러를 반환한다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          size: mockSize,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("filename, contentType, size가 모두 필요합니다.");
    });

    test("size가 없으면 400 에러를 반환한다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("filename, contentType, size가 모두 필요합니다.");
    });

    test("size가 숫자가 아니면 400 에러를 반환한다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: "not-a-number",
        },
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
    });
  });

  describe("파일 타입 검증", () => {
    test("허용되지 않는 파일 타입은 400 에러를 반환한다", async () => {
      const invalidTypes = [
        "text/plain",
        "application/pdf",
        "video/mp4",
        "application/json",
      ];

      for (const contentType of invalidTypes) {
        const req = createMockRequest({
          method: "POST",
          headers: { authorization: "Bearer valid-token" },
          body: {
            filename: "file.txt",
            contentType,
            size: mockSize,
          },
        });

        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("허용되지 않는 파일 타입입니다.");
      }

      expect(mockedGetSignedUrl).not.toHaveBeenCalled();
    });

    test("대소문자가 다른 MIME 타입은 거부된다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: "IMAGE/PNG", // 대문자
          size: mockSize,
        },
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
    });
  });

  describe("파일 크기 검증", () => {
    test("5MB를 초과하는 파일은 400 에러를 반환한다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: 6 * 1024 * 1024, // 6MB
        },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("파일 크기는 5MB를 초과할 수 없습니다.");
      expect(mockedGetSignedUrl).not.toHaveBeenCalled();
    });

    test("정확히 5MB인 파일은 허용된다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: 5 * 1024 * 1024, // 정확히 5MB
        },
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    test("매우 작은 파일도 허용된다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: 1024, // 1KB
        },
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    test("0 바이트 파일도 기술적으로는 허용된다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: 0,
        },
      });

      const response = await POST(req);

      // 0은 number 타입이므로 typeof 체크를 통과함
      // 실제 업로드는 S3에서 실패하겠지만 presigned URL 생성은 성공
      expect(response.status).toBe(200);
    });
  });

  describe("에러 처리", () => {
    test("getSignedUrl 실패 시 500 에러를 반환한다", async () => {
      const errorMessage = "S3 서비스 장애";
      mockedGetSignedUrl.mockRejectedValue(new Error(errorMessage));

      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe(errorMessage);
      expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
    });

    test("알 수 없는 에러는 기본 메시지를 반환한다", async () => {
      mockedGetSignedUrl.mockRejectedValue("Unknown error");

      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("알 수 없는 에러가 발생했습니다.");
    });

    test("환경변수 누락 에러를 처리한다", async () => {
      mockedGetS3BucketName.mockImplementation(() => {
        throw new Error("환경변수 AWS_S3_BUCKET이 설정되지 않았습니다.");
      });

      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain("환경변수");
    });
  });

  describe("응답 구조", () => {
    test("성공 응답은 url과 key를 포함한다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(body).toHaveProperty("url");
      expect(body).toHaveProperty("key");
      expect(typeof body.url).toBe("string");
      expect(typeof body.key).toBe("string");
    });

    test("에러 응답은 error 필드를 포함한다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: "text/plain",
          size: mockSize,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(body).toHaveProperty("error");
      expect(typeof body.error).toBe("string");
    });
  });

  describe("통합 시나리오", () => {
    test("전체 업로드 플로우가 정상 작동한다", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response = await POST(req);
      const body = await response.json();

      // 1. 인증 확인
      expect(mockedVerifyAuthToken).toHaveBeenCalledWith(req);

      // 2. 응답 상태 확인
      expect(response.status).toBe(200);

      // 3. 응답 구조 확인
      expect(body).toHaveProperty("url");
      expect(body).toHaveProperty("key");

      // 4. key 형식 확인
      expect(body.key).toMatch(/^profile-img\//);
      expect(body.key).toContain(mockUserId);

      // 5. S3 SDK 호출 확인
      expect(mockedGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          Bucket: "test-bucket",
          ContentType: mockContentType,
          ContentLength: mockSize,
        }),
        expect.objectContaining({
          expiresIn: S3_PRESIGNED_URL_EXPIRY.UPLOAD,
        }),
      );
    });

    test("다른 사용자는 다른 경로를 받는다", async () => {
      const user1 = "user-1";
      const user2 = "user-2";

      // User 1
      mockedVerifyAuthToken.mockResolvedValueOnce({
        success: true,
        uid: user1,
      });

      const req1 = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer token1" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response1 = await POST(req1);
      const body1 = await response1.json();

      // User 2
      mockedVerifyAuthToken.mockResolvedValueOnce({
        success: true,
        uid: user2,
      });

      const req2 = createMockRequest({
        method: "POST",
        headers: { authorization: "Bearer token2" },
        body: {
          filename: mockFilename,
          contentType: mockContentType,
          size: mockSize,
        },
      });

      const response2 = await POST(req2);
      const body2 = await response2.json();

      // 각 사용자는 자신의 경로를 받음
      expect(body1.key).toContain(user1);
      expect(body2.key).toContain(user2);
      expect(body1.key).not.toEqual(body2.key);
    });
  });
});
