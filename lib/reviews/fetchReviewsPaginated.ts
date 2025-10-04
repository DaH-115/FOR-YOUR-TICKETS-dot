import { adminFirestore } from "firebase-admin-config";
import type { Query, DocumentData, Timestamp } from "firebase-admin/firestore";

// 사용자 정보 타입 정의
export interface ReviewUser {
  uid: string | null;
  displayName: string | null;
  photoKey: string | null;
  activityLevel?: string;
}

// API에서 반환하는 리뷰 데이터 타입 (날짜는 문자열로 변환됨)
export interface ReviewDoc {
  id: string;
  user: ReviewUser;
  review: {
    movieId: number;
    movieTitle: string;
    originalTitle: string;
    moviePosterPath?: string;
    releaseYear: string;
    rating: number;
    reviewTitle: string;
    reviewContent: string;
    createdAt: string; // ISO 문자열
    updatedAt: string;
    likeCount: number;
    isLiked: boolean; // 리스트/상세 모두 포함
  };
  orderNumber?: number; // 전체 리뷰 중 순서 (오래된 순 기준, 1부터 시작)
}

// 'Firestore'에서 가져온 원본 리뷰 데이터 타입 (날짜는 Timestamp)
interface RawReview {
  id: string;
  user: ReviewUser;
  likeCount?: number;
  review: {
    movieId: number;
    movieTitle: string;
    originalTitle: string;
    moviePosterPath?: string;
    releaseYear: string;
    rating: number;
    reviewTitle: string;
    reviewContent: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    likeCount: number;
  };
}

// 함수 파라미터 타입
interface FetchReviewsParams {
  page: number;
  pageSize: number;
  uid?: string; // 특정 사용자의 리뷰만 보기
  search?: string;
}

// 설정값들
const MAX_SEARCH_DOCS = 1000; // 검색할 때 최대 몇 개까지 가져올지
const MAX_USERS_PER_QUERY = 10; // Firestore 제한: in 쿼리는 한번에 10개까지만

/**
 * 리뷰 목록을 페이지 단위로 가져오는 메인 함수
 *
 * @param params - 페이지 정보, 사용자 ID, 검색어 등
 * @returns 리뷰 목록과 전체 페이지 수
 */
export async function fetchReviewsPaginated({
  page,
  pageSize,
  uid,
  search = "",
}: FetchReviewsParams): Promise<{ reviews: ReviewDoc[]; totalPages: number }> {
  try {
    // 1. 기본 쿼리 설정 ('movie-reviews' 컬렉션에서 가져오기)
    let baseQuery: Query<DocumentData> =
      adminFirestore.collection("movie-reviews");

    // 2. 특정 사용자의 리뷰만 보고 싶다면 필터 추가
    if (uid) {
      baseQuery = baseQuery.where("user.uid", "==", uid);
    }

    // 3. 검색어가 있으면 검색 모드, 없으면 일반 모드
    if (search) {
      return await getReviewsWithSearch(baseQuery, search, page, pageSize);
    } else {
      return await getReviews(baseQuery, page, pageSize);
    }
  } catch (error) {
    console.error("리뷰 조회 실패:", error);
    throw new Error("리뷰 조회에 실패했습니다.");
  }
}

/**
 * 검색어가 있을 때 리뷰 가져오기
 * 데이터를 가져온 후 우리가 직접 필터링
 */
async function getReviewsWithSearch(
  baseQuery: Query<DocumentData>,
  search: string,
  page: number,
  pageSize: number,
): Promise<{ reviews: ReviewDoc[]; totalPages: number }> {
  // 1. 최신 리뷰부터 최대 1000개까지만 가져오기 (메모리 보호용)
  const snapshot = await baseQuery
    .orderBy("review.createdAt", "desc")
    .limit(MAX_SEARCH_DOCS)
    .get();

  // 2. Firestore 데이터를 우리가 사용할 형태로 변환
  const allReviews = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as RawReview,
  );

  // 3. 검색어와 일치하는 리뷰만 골라내기
  const matchingReviews = filterReviewsBySearch(allReviews, search);

  // 4. 검색 결과에서 해당 페이지만 자르기
  const { paginatedReviews, totalPages } = paginateReviews(
    matchingReviews,
    page,
    pageSize,
  );

  // 5. 사용자 정보 추가하고 날짜 형식 변환
  const finalReviews = await addUserInfoToReviews(paginatedReviews);

  return {
    reviews: finalReviews,
    totalPages,
  };
}

/**
 * 일반 모드(검색어 없음)에서 리뷰 가져오기
 */
async function getReviews(
  baseQuery: Query<DocumentData>,
  page: number,
  pageSize: number,
): Promise<{ reviews: ReviewDoc[]; totalPages: number }> {
  // 1. 전체 리뷰 개수 구하기
  const countSnapshot = await baseQuery.count().get();
  const totalCount = countSnapshot.data().count;
  const totalPages = Math.ceil(totalCount / pageSize);

  // 2. 해당 페이지의 리뷰만 가져오기
  const snapshot = await baseQuery
    .orderBy("review.createdAt", "desc")
    .offset((page - 1) * pageSize) // 몇 개 건너뛸지
    .limit(pageSize) // 몇 개 가져올지
    .get();

  // 3. 데이터 변환
  const reviews = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as RawReview,
  );

  // 4. 사용자 정보 추가
  const finalReviews = await addUserInfoToReviews(reviews);

  return {
    reviews: finalReviews,
    totalPages,
  };
}

/**
 * 검색어로 리뷰 필터링하기
 * 영화 제목, 리뷰 제목, 리뷰 내용에서 검색
 */
function filterReviewsBySearch(
  reviews: RawReview[],
  search: string,
): RawReview[] {
  const searchTerm = search.toLowerCase().trim();

  return reviews.filter((review) => {
    const movieTitle = review.review.movieTitle.toLowerCase();
    const reviewTitle = review.review.reviewTitle.toLowerCase();
    const reviewContent = review.review.reviewContent.toLowerCase();

    // 셋 중 하나라도 검색어를 포함하면 통과
    return (
      movieTitle.includes(searchTerm) ||
      reviewTitle.includes(searchTerm) ||
      reviewContent.includes(searchTerm)
    );
  });
}

/**
 * 리뷰 목록을 페이지 단위로 자르기
 */
function paginateReviews(
  reviews: RawReview[],
  page: number,
  pageSize: number,
): { paginatedReviews: RawReview[]; totalPages: number } {
  const totalPages = Math.ceil(reviews.length / pageSize);

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedReviews = reviews.slice(startIndex, endIndex);

  return { paginatedReviews, totalPages };
}

/**
 * 사용자 ID 목록을 작은 그룹으로 나누기
 * 왜? Firestore의 'in' 쿼리는 한번에 10개까지만 가능
 */
function splitUserIds(userIds: string[]): string[][] {
  const groups: string[][] = [];

  for (let i = 0; i < userIds.length; i += MAX_USERS_PER_QUERY) {
    const group = userIds.slice(i, i + MAX_USERS_PER_QUERY);
    groups.push(group);
  }

  return groups;
}

/**
 * 사용자 정보를 가져와서 리뷰에 추가하고 최종 형태로 변환
 */
async function addUserInfoToReviews(
  reviews: RawReview[],
): Promise<ReviewDoc[]> {
  // 빈 배열이면 바로 리턴
  if (reviews.length === 0) return [];

  // 1. 리뷰에서 사용자 ID들 추출 (중복 제거, null 제외)
  const userIds = [
    ...new Set(
      reviews
        .map((r) => r.user.uid)
        .filter((uid): uid is string => Boolean(uid)),
    ),
  ];

  // 2. 사용자 정보 저장용 맵
  const usersMap = new Map<string, ReviewUser>();

  // 3. 사용자 정보가 있다면 가져오기
  if (userIds.length > 0) {
    try {
      // Firestore 제한 때문에 10개씩 나누어서 조회
      const userGroups = splitUserIds(userIds);

      // 각 그룹별로 병렬 조회
      const promises = userGroups.map((group) =>
        adminFirestore.collection("users").where("__name__", "in", group).get(),
      );

      const snapshots = await Promise.all(promises);

      // 결과 합치기
      snapshots.forEach((snapshot) => {
        snapshot.forEach((doc) => {
          const userData = doc.data();
          usersMap.set(doc.id, {
            uid: doc.id,
            displayName: userData.displayName || null,
            photoKey: userData.photoKey || null,
            activityLevel: userData.activityLevel || "NEWBIE",
          });
        });
      });
    } catch (error) {
      console.error("사용자 정보 조회 실패:", error);
      // 실패해도 계속 진행 (사용자 정보 없이라도 리뷰는 보여줌)
    }
  }

  // 4. 최종 데이터 만들기
  return reviews.map((review) => {
    // 사용자 정보 찾기
    let user: ReviewUser;

    if (review.user.uid && usersMap.has(review.user.uid)) {
      // 찾았으면 업데이트된 정보 사용
      user = usersMap.get(review.user.uid)!;
    } else {
      // 못 찾았으면 기본값 사용
      user = {
        uid: review.user.uid,
        displayName: review.user.displayName || "알 수 없는 사용자",
        photoKey: review.user.photoKey,
        activityLevel: review.user.activityLevel || "NEWBIE",
      };
    }

    return {
      id: review.id,
      user,
      review: {
        ...review.review,
        // 최상위 likeCount를 review 안에 복사 (API 업데이트와 호환성 유지)
        likeCount: review.likeCount || review.review.likeCount || 0,
        createdAt: review.review.createdAt.toDate().toISOString(),
        updatedAt: review.review.updatedAt.toDate().toISOString(),
        isLiked: false, // 리스트에서는 항상 false
      },
    };
  });
}
