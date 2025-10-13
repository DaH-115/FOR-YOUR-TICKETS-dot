import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "lib/aws/s3";
import {
  getS3BucketName,
  getS3DownloadTTL,
  isAllowedS3Path,
} from "lib/aws/s3.constants";
import { NextRequest, NextResponse } from "next/server";

/**
 * S3 Presigned URL 다운로드 엔드포인트 (GET)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: true, message: "key 파라미터가 필요합니다." },
        { status: 400 },
      );
    }

    if (!isAllowedS3Path(key)) {
      return NextResponse.json(
        { error: true, message: "허용되지 않는 key 경로입니다." },
        { status: 400 },
      );
    }

    const ttl = getS3DownloadTTL();
    const command = new GetObjectCommand({
      Bucket: getS3BucketName(),
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: ttl });
    return NextResponse.json({ url, expiresIn: ttl });
  } catch (err) {
    console.error("S3 download presign error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "알 수 없는 에러가 발생했습니다.";
    return NextResponse.json(
      { error: true, message: errorMessage },
      { status: 500 },
    );
  }
}
