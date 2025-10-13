import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyAuthToken } from "lib/auth/verifyToken";
import s3 from "lib/aws/s3";
import { getS3BucketName, S3_PRESIGNED_URL_EXPIRY } from "lib/aws/s3.constants";
import { NextRequest, NextResponse } from "next/server";
import { MAX_FILE_SIZE } from "@/utils/file/validateFileSize";
import { ALLOWED_CONTENT_TYPES } from "@/utils/file/validateFileType";

/**
 * S3 업로드를 위한 요청 본문 타입
 */
interface UploadRequestBody {
  filename: string;
  contentType: string;
  size: number;
}

/**
 * S3 Presigned URL 업로드 엔드포인트 (POST)
 * - 인증 필수
 * - 프로필 이미지 업로드용
 */
export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode },
      );
    }
    const uid = authResult.uid as string;

    // 요청 본문 파싱 및 타입 체크
    const body = (await req.json()) as Partial<UploadRequestBody>;
    const { filename, contentType, size } = body;

    // 필수 파라미터 검증
    if (!filename || !contentType || typeof size !== "number") {
      return NextResponse.json(
        { error: "filename, contentType, size가 모두 필요합니다." },
        { status: 400 },
      );
    }

    // 파일 타입 검증
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "허용되지 않는 파일 타입입니다." },
        { status: 400 },
      );
    }

    // 파일 크기 검증
    if (size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 5MB를 초과할 수 없습니다." },
        { status: 400 },
      );
    }

    // S3 키 생성 (사용자별 디렉토리 + 타임스탬프)
    const uploadKey = `profile-img/${uid}/${Date.now()}_${filename}`;

    const command = new PutObjectCommand({
      Bucket: getS3BucketName(),
      Key: uploadKey,
      ContentType: contentType,
      ContentLength: size,
    });

    const url = await getSignedUrl(s3, command, {
      expiresIn: S3_PRESIGNED_URL_EXPIRY.UPLOAD,
    });

    return NextResponse.json({ url, key: uploadKey });
  } catch (err) {
    console.error("S3 presign error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "알 수 없는 에러가 발생했습니다.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
