import { MovieReleaseDates } from "lib/movies/types/movieReleaseDates";

// 등급 정규화
export const normalizeCertification = (
  certification: string,
): string | null => {
  if (!certification) return null;

  const certificationMap: Record<string, string> = {
    all: "ALL",
    "12": "12",
    "15": "15",
    "18": "18",
    g: "ALL",
    pg: "12",
    "pg-13": "15",
    r: "18",
    전체관람가: "ALL",
    "12세관람가": "12",
    "15세관람가": "15",
    "18세관람가": "18",
  };

  return certificationMap[certification.trim().toLowerCase()] || null;
};

/** 최적 등급 추출
 * @param releaseDates 영화 등급 정보
 * @returns 최적 등급
 */
export function getCertification(
  releaseDates: MovieReleaseDates,
): string | null {
  if (!releaseDates?.results?.length) return null;

  // 한국 등급 우선
  const kr = releaseDates.results.find((r) => r.iso_3166_1 === "KR");
  if (kr?.release_dates?.[0]?.certification) {
    return normalizeCertification(kr.release_dates[0].certification);
  }

  // 미국 등급
  const us = releaseDates.results.find((r) => r.iso_3166_1 === "US");
  if (us?.release_dates?.[0]?.certification) {
    return normalizeCertification(us.release_dates[0].certification);
  }

  return null;
}

export default getCertification;
