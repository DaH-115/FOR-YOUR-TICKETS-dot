import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyAuthToken } from "lib/auth/verifyToken";
import s3 from "lib/aws/s3";
import { NextRequest, NextResponse } from "next/server";
import { MAX_FILE_SIZE } from "@/utils/file/validateFileSize";
import { ALLOWED_CONTENT_TYPES } from "@/utils/file/validateFileType";

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode },
      );
    }
    const uid = authResult.uid as string;

    const { filename, contentType, size } = await req.json();

    if (!filename || !contentType || !size) {
      return NextResponse.json(
        { error: "filename, contentType, size가 모두 필요합니다." },
        { status: 400 },
      );
    }

    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "허용되지 않는 파일 타입입니다." },
        { status: 400 },
      );
    }

    if (size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 5MB를 초과할 수 없습니다." },
        { status: 400 },
      );
    }

    const uploadKey = `profile-img/${uid}/${Date.now()}_${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: uploadKey,
      ContentType: contentType,
      ContentLength: size,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5분

    return NextResponse.json({ url, key: uploadKey });
  } catch (err) {
    console.error("S3 presign error:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An unknown error occurred while creating a presigned URL.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
