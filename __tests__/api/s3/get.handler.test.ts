import { GET } from "@/api/s3/get.handler";
import { createMockRequest } from "__tests__/utils/test-utils";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3BucketName, getS3DownloadTTL } from "lib/aws/s3.constants";

// Mock 설정
jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));
jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(() => ({})),
  GetObjectCommand: jest.fn((args) => ({ ...args })),
}));
jest.mock("lib/aws/s3", () => ({
  __esModule: true,
  default: {},
}));
jest.mock("lib/aws/s3.constants", () => {
  // 실제 isAllowedS3Path 구현을 사용
  const actual = jest.requireActual("lib/aws/s3.constants");
  return {
    ...actual,
    getS3BucketName: jest.fn(() => "test-bucket"),
    getS3DownloadTTL: jest.fn(() => 3600),
  };
});

const mockedGetSignedUrl = getSignedUrl as jest.MockedFunction<
  typeof getSignedUrl
>;
const mockedGetS3BucketName = getS3BucketName as jest.MockedFunction<
  typeof getS3BucketName
>;
const mockedGetS3DownloadTTL = getS3DownloadTTL as jest.MockedFunction<
  typeof getS3DownloadTTL
>;

describe("GET /api/s3 - Presigned URL 다운로드", () => {
  const mockSignedUrl =
    "https://s3.amazonaws.com/test-bucket/profile-img/test.jpg?signature=xxx";
  const mockKey = "profile-img/test-user-123/1234567890_test.jpg";
  const mockTTL = 3600;

  beforeEach(() => {
    jest.clearAllMocks();

    // 기본 mock 설정
    mockedGetSignedUrl.mockResolvedValue(mockSignedUrl);
    mockedGetS3BucketName.mockReturnValue("test-bucket");
    mockedGetS3DownloadTTL.mockReturnValue(mockTTL);
  });

  describe("성공 케이스", () => {
    test("유효한 key로 presigned URL을 반환한다", async () => {
      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(mockKey)}`,
      });

      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.url).toBe(mockSignedUrl);
      expect(body.expiresIn).toBe(mockTTL);
      expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
    });

    test("S3 함수들을 올바르게 호출한다", async () => {
      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(mockKey)}`,
      });

      await GET(req);

      expect(mockedGetS3BucketName).toHaveBeenCalled();
      expect(mockedGetS3DownloadTTL).toHaveBeenCalled();
      expect(mockedGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object), // S3 client
        expect.objectContaining({
          Bucket: "test-bucket",
          Key: mockKey,
        }),
        expect.objectContaining({
          expiresIn: mockTTL,
        }),
      );
    });

    test("다양한 프로필 이미지 경로를 허용한다", async () => {
      const validKeys = [
        "profile-img/user-1/photo.jpg",
        "profile-img/user-2/avatar.png",
        "profile-img/abc123/image123.gif",
      ];

      for (const key of validKeys) {
        const req = createMockRequest({
          method: "GET",
          url: `http://localhost:3000/api/s3?key=${encodeURIComponent(key)}`,
        });

        const response = await GET(req);
        expect(response.status).toBe(200);
      }
    });
  });

  describe("유효성 검증", () => {
    test("key 파라미터가 없으면 400 에러를 반환한다", async () => {
      const req = createMockRequest({
        method: "GET",
        url: "http://localhost:3000/api/s3",
      });

      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe(true);
      expect(body.message).toBe("key 파라미터가 필요합니다.");
      expect(mockedGetSignedUrl).not.toHaveBeenCalled();
    });

    test("빈 문자열 key는 400 에러를 반환한다", async () => {
      const req = createMockRequest({
        method: "GET",
        url: "http://localhost:3000/api/s3?key=",
      });

      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe(true);
    });

    test("허용되지 않는 경로는 400 에러를 반환한다", async () => {
      const invalidKeys = [
        "private-files/secret.txt",
        "admin/config.json",
        "public/image.png",
        "documents/file.pdf",
      ];

      for (const invalidKey of invalidKeys) {
        const req = createMockRequest({
          method: "GET",
          url: `http://localhost:3000/api/s3?key=${encodeURIComponent(invalidKey)}`,
        });

        const response = await GET(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe(true);
        expect(body.message).toBe("허용되지 않는 key 경로입니다.");
      }

      expect(mockedGetSignedUrl).not.toHaveBeenCalled();
    });

    test("profile-img/로 시작하지 않는 경로는 거부된다", async () => {
      const invalidKeys = [
        "../secret/file.txt",
        "admin/config.json",
        "../../etc/passwd",
        "private-files/secret.txt",
      ];

      for (const key of invalidKeys) {
        const req = createMockRequest({
          method: "GET",
          url: `http://localhost:3000/api/s3?key=${encodeURIComponent(key)}`,
        });

        const response = await GET(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.message).toBe("허용되지 않는 key 경로입니다.");
      }
    });

    test("profile-img/로 시작하더라도 ..를 포함하면 거부된다 (Path Traversal 방지)", async () => {
      // Path Traversal 공격 시도: profile-img/../admin/config.json
      // 정규화하면 admin/config.json이 되어 허용된 경로를 벗어남
      const pathWithDotDot = "profile-img/../admin/config.json";
      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(pathWithDotDot)}`,
      });

      const response = await GET(req);
      const body = await response.json();

      // .. 패턴을 포함하므로 거부되어야 함
      expect(response.status).toBe(400);
      expect(body.message).toBe("허용되지 않는 key 경로입니다.");
    });

    test("절대 경로(/로 시작)는 거부된다", async () => {
      const absolutePath = "/profile-img/test.jpg";
      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(absolutePath)}`,
      });

      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.message).toBe("허용되지 않는 key 경로입니다.");
    });

    test("연속된 슬래시가 있어도 정규화 후 검증된다", async () => {
      const pathWithMultipleSlashes = "profile-img//user123//test.jpg";
      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(pathWithMultipleSlashes)}`,
      });

      const response = await GET(req);

      // 정규화 후 profile-img/로 시작하므로 허용됨
      expect(response.status).toBe(200);
    });

    test("빈 문자열 key는 거부된다", async () => {
      const req = createMockRequest({
        method: "GET",
        url: "http://localhost:3000/api/s3?key=",
      });

      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.message).toBe("허용되지 않는 key 경로입니다.");
    });
  });

  describe("에러 처리", () => {
    test("getSignedUrl 실패 시 500 에러를 반환한다", async () => {
      const errorMessage = "S3 서비스 장애";
      mockedGetSignedUrl.mockRejectedValue(new Error(errorMessage));

      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(mockKey)}`,
      });

      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe(true);
      expect(body.message).toBe(errorMessage);
      expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
    });

    test("AWS 권한 에러를 적절히 처리한다", async () => {
      const awsError = new Error("AccessDenied: Access Denied");
      mockedGetSignedUrl.mockRejectedValue(awsError);

      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(mockKey)}`,
      });

      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.message).toBe("AccessDenied: Access Denied");
    });

    test("환경변수 누락 에러를 처리한다", async () => {
      mockedGetS3BucketName.mockImplementation(() => {
        throw new Error("환경변수 AWS_S3_BUCKET이 설정되지 않았습니다.");
      });

      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(mockKey)}`,
      });

      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.message).toContain("환경변수");
    });

    test("알 수 없는 에러는 기본 메시지를 반환한다", async () => {
      mockedGetSignedUrl.mockRejectedValue("Unknown error");

      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(mockKey)}`,
      });

      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.message).toBe("알 수 없는 에러가 발생했습니다.");
    });
  });

  describe("응답 구조", () => {
    test("성공 응답은 url과 expiresIn을 포함한다", async () => {
      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(mockKey)}`,
      });

      const response = await GET(req);
      const body = await response.json();

      expect(body).toHaveProperty("url");
      expect(body).toHaveProperty("expiresIn");
      expect(typeof body.url).toBe("string");
      expect(typeof body.expiresIn).toBe("number");
      expect(body.expiresIn).toBeGreaterThan(0);
    });

    test("에러 응답은 error와 message를 포함한다", async () => {
      const req = createMockRequest({
        method: "GET",
        url: "http://localhost:3000/api/s3",
      });

      const response = await GET(req);
      const body = await response.json();

      expect(body).toHaveProperty("error");
      expect(body).toHaveProperty("message");
      expect(body.error).toBe(true);
      expect(typeof body.message).toBe("string");
    });
  });

  describe("URL 인코딩", () => {
    test("URL 인코딩된 key를 올바르게 디코딩한다", async () => {
      const keyWithSpecialChars = "profile-img/user-123/한글 파일명.jpg";
      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(keyWithSpecialChars)}`,
      });

      const response = await GET(req);

      expect(response.status).toBe(200);
      expect(mockedGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          Key: keyWithSpecialChars,
        }),
        expect.any(Object),
      );
    });

    test("공백이 포함된 key를 처리한다", async () => {
      const keyWithSpaces = "profile-img/user-123/my photo.jpg";
      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(keyWithSpaces)}`,
      });

      const response = await GET(req);
      expect(response.status).toBe(200);
    });
  });

  describe("통합 시나리오", () => {
    test("전체 플로우가 정상 작동한다", async () => {
      const req = createMockRequest({
        method: "GET",
        url: `http://localhost:3000/api/s3?key=${encodeURIComponent(mockKey)}`,
      });

      const response = await GET(req);
      const body = await response.json();

      // 1. 응답 상태 확인
      expect(response.status).toBe(200);

      // 2. 응답 구조 확인
      expect(body).toHaveProperty("url");
      expect(body).toHaveProperty("expiresIn");

      // 3. 유틸리티 함수 호출 확인
      expect(mockedGetS3BucketName).toHaveBeenCalled();
      expect(mockedGetS3DownloadTTL).toHaveBeenCalled();

      // 4. S3 SDK 호출 확인
      expect(mockedGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          Bucket: "test-bucket",
          Key: mockKey,
        }),
        expect.objectContaining({
          expiresIn: mockTTL,
        }),
      );
    });
  });
});
