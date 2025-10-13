// presigned URL API 응답 타입
interface PresignedUrlResponse {
  url: string;
  expiresIn: number;
}

interface PresignedUrlError {
  error: true;
  message: string;
}

/**
 * S3 presigned URL을 요청하는 함수
 * @param key - S3 객체 키
 * @param signal - 요청 취소를 위한 AbortSignal
 * @returns presigned URL과 만료 시간(초)
 */
export async function fetchPresignedUrl({
  key,
  signal,
}: {
  key: string;
  signal?: AbortSignal;
}): Promise<PresignedUrlResponse> {
  const apiUrl = `/api/s3?key=${encodeURIComponent(key)}`;

  const response = await fetch(apiUrl, {
    method: "GET",
    signal,
  });

  const data: PresignedUrlResponse | PresignedUrlError = await response.json();

  // API 에러 응답 처리
  if ("error" in data && data.error) {
    throw new Error(data.message);
  }

  // HTTP 에러 처리 (백엔드가 JSON을 반환하지 않는 경우)
  if (!response.ok) {
    throw new Error(`presigned URL 요청 실패 (${response.status})`);
  }

  return data as PresignedUrlResponse;
}
