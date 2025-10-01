// presigned URL 요청 유틸
export async function fetchPresignedUrl({
  key,
  isPublic = true,
  idToken,
  signal,
}: {
  key: string;
  isPublic?: boolean;
  idToken?: string | null;
  signal?: AbortSignal;
}): Promise<{ url: string; expiresIn: number }> {
  const headers: HeadersInit = idToken
    ? { Authorization: `Bearer ${idToken}` }
    : {};
  const apiUrl = isPublic
    ? `/api/s3?key=${encodeURIComponent(key)}&isPublic=true`
    : `/api/s3?key=${encodeURIComponent(key)}`;
  const response = await fetch(apiUrl, {
    method: "GET",
    headers,
    signal,
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (data.error) {
    // 서버에서 내려준 한글 메시지를 그대로 사용
    throw new Error(data.message || "Presigned URL 발급에 실패했습니다.");
  }
  return { url: data.url, expiresIn: data.expiresIn };
}
