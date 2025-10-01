/**
 * 데이터 갱신 시점을 포맷팅하는 유틸리티 함수
 * Next.js ISR의 revalidate 설정을 기반으로 마지막 갱신 시점을 계산
 */

/**
 * 24시간 단위로 정렬된 마지막 갱신 시점을 계산
 * @param revalidateSeconds - revalidate 설정값 (초 단위)
 * @returns 포맷된 갱신 시점 문자열 (예: "2025.01.15 00:00 기준")
 */
export function getLastUpdateTime(revalidateSeconds: number = 86400): string {
  // 24시간 주기인 경우 매일 자정(00:00)에 갱신되는 것으로 가정
  if (revalidateSeconds === 86400) {
    // 한국 시간대 기준으로 오늘 자정 계산
    const now = new Date();
    const koreanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    // 오늘 자정 (00:00:00)으로 설정
    const todayMidnight = new Date(koreanTime);
    todayMidnight.setHours(0, 0, 0, 0);

    const year = todayMidnight.getFullYear();
    const month = String(todayMidnight.getMonth() + 1).padStart(2, "0");
    const day = String(todayMidnight.getDate()).padStart(2, "0");
    const hours = String(todayMidnight.getHours()).padStart(2, "0");
    const minutes = String(todayMidnight.getMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes} 기준`;
  }

  return "갱신 정보 없음";
}

/**
 * 트렌딩 영화 데이터의 마지막 갱신 시점을 반환
 * TMDB API는 주간 트렌딩 데이터를 제공하므로, 매일 자정에 갱신되는 것으로 가정
 */
export function getTrendingMoviesUpdateTime(): string {
  return getLastUpdateTime(86400); // 24시간 = 86400초
}
