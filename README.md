# For Your Tickets.

![메인 이미지](public/images/og-card.png)

영화 리뷰를 티켓 형태로 기록하고 공유하는 Next.js 기반 커뮤니티 웹 앱

**웹사이트**: [for-your-tickets.vercel.app](https://for-your-tickets.vercel.app)

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | Next.js 15, React 19, TypeScript |
| UI | Tailwind CSS v4, Headless UI, Swiper |
| 상태/폼 | Redux Toolkit, React Hook Form, Zod |
| 인증/DB | Firebase Auth, Firebase Admin, Firestore |
| 스토리지 | AWS S3 (Presigned URL) |
| 외부 API | TMDB API |
| 테스트 | Jest, Testing Library, MSW |

## 아키텍처

```
[Next.js App Router]
  ├─ app/          (pages, layouts, route handlers)
  ├─ components/   (UI / domain)
  ├─ services/     (client API wrappers)
  └─ hooks/forms/  (react-hook-form + zod)
          │
          ▼
[State & Auth]
  ├─ Redux Toolkit  (클라이언트 상태)
  ├─ Firebase Auth  (클라이언트 인증)
  └─ Firebase Admin (서버 토큰 검증)
          │
          ▼
[External Services]
  ├─ TMDB API   (영화 데이터)
  ├─ Firestore  (앱 데이터)
  └─ AWS S3     (프로필 이미지)
```

### 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 메인 (추천 영화 + 최신 티켓) |
| `/search` | 영화 검색 |
| `/movie-details/[id]` | 영화 상세 |
| `/ticket-list` | 전체 리뷰 목록 |
| `/ticket-list/[reviewId]` | 리뷰 상세 |
| `/write-review/new` | 리뷰 작성 |
| `/write-review/[id]` | 리뷰 수정 |
| `/my-page` | 마이페이지 |
| `/my-page/edit` | 프로필 편집 |

### API 엔드포인트

| 엔드포인트 | 설명 |
|-----------|------|
| `POST /api/auth/signup` | 이메일 회원가입 |
| `POST /api/auth/identifiers/availability` | 닉네임·이메일 중복 확인 |
| `GET/POST /api/reviews` | 리뷰 목록 조회 / 생성 |
| `GET/PUT/DELETE /api/reviews/[id]` | 리뷰 상세·수정·삭제 |
| `GET/POST /api/reviews/[id]/comments` | 댓글 목록 조회 / 생성 |
| `PUT/DELETE /api/reviews/[id]/comments/[commentId]` | 댓글 수정·삭제 |
| `POST /api/reviews/[id]/likes` | 좋아요 추가 |
| `DELETE /api/reviews/[id]/likes/me` | 좋아요 취소 |
| `GET/PUT/PATCH/DELETE /api/users/[uid]` | 사용자 프로필 관리 |
| `GET /api/users/me/liked-reviews` | 좋아요한 리뷰 목록 |
| `POST /api/users/me/profile` | 소셜 로그인 프로필 초기화 |
| `GET/POST /api/s3` | S3 Presigned URL (다운로드·업로드) |
| `GET /api/tmdb/movies` | TMDB 영화 검색 |

## 로컬 실행

### 요구사항

- Node.js 20+
- Yarn

### 설치 및 실행

```bash
git clone https://github.com/DaH-115/FOR-YOUR-TICKETS-dot.git
cd FOR-YOUR-TICKETS-dot
yarn install
# .env.local 파일 생성 후 아래 환경변수 항목 채우기
yarn dev
```

### 빌드 / 프로덕션 실행

```bash
yarn build
yarn start
```

### 테스트

```bash
yarn test           # 전체 실행
yarn test:watch     # 감시 모드
yarn test:coverage  # 커버리지 포함
```

## 환경변수

`.env.local` 파일에 아래 항목을 설정하세요.

```bash
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_AUTH_DOMAIN=
NEXT_PUBLIC_PROJECT_ID=
NEXT_PUBLIC_STORAGE_BUCKET=
NEXT_PUBLIC_MESSAGING_SENDER_ID=
NEXT_PUBLIC_APP_ID=

# Firebase Admin (Server)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=

# TMDB
TMDB_API_KEY=

# AWS S3
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
S3_DOWNLOAD_URL_TTL=600

# 기타
NEXT_PUBLIC_BASE_URL=https://for-your-tickets.vercel.app
```

## 디렉토리 구조

```
├── app/
│   ├── api/                # Route Handlers
│   │   ├── auth/           # 회원가입, 중복 확인
│   │   ├── reviews/        # 리뷰 CRUD, 댓글, 좋아요
│   │   ├── s3/             # Presigned URL
│   │   ├── tmdb/           # 영화 검색
│   │   └── users/          # 사용자 프로필
│   ├── components/         # 공통 UI / 도메인 컴포넌트
│   ├── home/               # 메인 페이지
│   ├── movie-details/      # 영화 상세
│   ├── my-page/            # 마이페이지 (프로필, 티켓 목록)
│   ├── search/             # 검색
│   ├── ticket-list/        # 리뷰 목록·상세
│   ├── write-review/       # 리뷰 작성·수정
│   ├── login/              # 로그인
│   ├── sign-up/            # 회원가입
│   ├── services/           # 클라이언트 API 호출 유틸
│   └── utils/              # 공용 유틸 (인증, 파일, 날짜 등)
├── lib/
│   ├── auth/               # 서버 토큰 검증
│   ├── aws/                # S3 클라이언트
│   ├── movies/             # TMDB 데이터 페칭
│   ├── reviews/            # 리뷰 데이터 레이어
│   ├── users/              # 사용자 데이터 레이어
│   └── utils/              # 활동 등급 등 공용 유틸
├── store/
│   ├── context/            # Alert, Auth, LevelUp Context
│   └── redux-toolkit/      # Redux Store, userSlice
├── types/                  # 전역 타입 정의
├── firebase-config/        # Firebase Client SDK
├── firebase-admin-config/  # Firebase Admin SDK
└── __tests__/              # Jest 테스트 코드
```

## 배포

Vercel 배포 기준으로 구성되어 있습니다. 환경변수를 Vercel 프로젝트 설정에 동일하게 등록하면 됩니다.

## 라이선스

개인 포트폴리오 및 학습 목적 프로젝트입니다.
