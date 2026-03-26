export function formatMovieDate(dateString: string | undefined) {
  if (dateString) {
    const [year, month, day] = dateString.split("-");
    const monthNames = [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ];
    const monthName = monthNames[parseInt(month, 10) - 1];
    return `${year}년 ${monthName} ${parseInt(day, 10)}일`;
  } else {
    return "";
  }
}

/** 리뷰 작성일 기준 오늘 날짜를 `formatMovieDate`와 동일한 한글 형식으로 */
export function formatTodayKorean(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return formatMovieDate(`${y}-${m}-${day}`);
}
