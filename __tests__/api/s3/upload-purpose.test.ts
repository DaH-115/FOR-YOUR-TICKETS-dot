import { POST } from "@/api/s3/post.handler";
import { createMockRequest } from "__tests__/utils/test-utils";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyAuthToken } from "lib/auth/verifyToken";

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
}));

jest.mock("@/utils/file/validateFileType", () => ({
  ALLOWED_CONTENT_TYPES: ["image/jpeg", "image/png"],
}));

const mockedGetSignedUrl = getSignedUrl as jest.MockedFunction<
  typeof getSignedUrl
>;
const mockedVerifyAuthToken = verifyAuthToken as jest.MockedFunction<
  typeof verifyAuthToken
>;

describe("POST /api/s3 upload purpose", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetSignedUrl.mockResolvedValue("https://example.com/upload-url");
    mockedVerifyAuthToken.mockResolvedValue({
      success: true,
      uid: "user-123",
    });
  });

  test("review purpose creates review-img keys", async () => {
    const request = createMockRequest({
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
      body: {
        filename: "review.jpg",
        contentType: "image/jpeg",
        size: 1024,
        purpose: "review",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.key).toMatch(/^review-img\/user-123\/\d+_review\.jpg$/);
  });

  test("missing purpose defaults to profile-img keys", async () => {
    const request = createMockRequest({
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
      body: {
        filename: "profile.jpg",
        contentType: "image/jpeg",
        size: 1024,
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.key).toMatch(/^profile-img\/user-123\/\d+_profile\.jpg$/);
  });

  test("unknown purpose is rejected", async () => {
    const request = createMockRequest({
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
      body: {
        filename: "bad.jpg",
        contentType: "image/jpeg",
        size: 1024,
        purpose: "other",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mockedGetSignedUrl).not.toHaveBeenCalled();
  });
});
