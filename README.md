# For Your Tickets.

![메인 이미지](public/images/og-card.png)

영화 리뷰를 검색하고, 감상을 티켓 형태로 기록·공유하는 **Next.js 기반 영화 커뮤니티 웹 앱**입니다.  
소셜 로그인, 리뷰/댓글/좋아요, 프로필 커스터마이징, 활동 등급 배지까지 포함해 “영화를 보고 기록하는 경험”을 확장합니다.

**웹사이트**: [for-your-tickets.vercel.app](https://for-your-tickets.vercel.app)
**GitHub**: [github.com/DaH-115/FOR-YOUR-TICKETS-dot](https://github.com/DaH-115/FOR-YOUR-TICKETS-dot)

---

## 1) 프로젝트 개요

**For Your Tickets**는 다음 문제를 해결하기 위해 만들어졌습니다.

- 단순 평점이 아닌, **영화 감상을 구조화된 리뷰 티켓**으로 남기고 싶다.
- 내가 쓴 리뷰를 다른 사용자와 **댓글/좋아요 기반으로 상호작용**하고 싶다.
- 단발성 리뷰 작성이 아니라, **프로필·활동 등급 기반의 지속적인 참여 동기**가 필요하다.

핵심 UX는 **“탐색 → 리뷰 작성 → 커뮤니티 상호작용 → 마이페이지 관리”** 흐름입니다.

---

## 2) 핵심 기능

### 영화 탐색

- TMDB 기반 영화 검색 (`/search`)
- 주간 트렌딩/현재 상영작 조회
- 영화 상세 정보(메타 정보, 트레일러, 유사 영화) 제공

### 리뷰(Ticket) 관리

- 리뷰 작성 / 수정 / 삭제
- 영화별 리뷰 상세 페이지 제공
- 페이징 기반 리뷰 목록 조회

### 인증/프로필

- 이메일 회원가입 + 소셜 로그인(예: Google/GitHub) 지원
- Firebase Auth + 서버사이드 토큰 검증(Firebase Admin)
- 프로필 편집(닉네임/소개/아바타)
- S3 Presigned URL 기반 이미지 업로드

### 사용자 경험

- 활동량 기반 사용자 배지(Activity Badge)
- 반응형 UI 및 접근성 고려 컴포넌트
- 테스트 코드(Jest + Testing Library) 기반 품질 관리

---

## 3) 사용자 흐름

1. 메인에서 현재 상영작/추천 영화 탐색
2. 검색에서 원하는 영화를 찾고 상세 정보 확인
3. 리뷰 티켓 작성 및 게시
4. 다른 사용자의 리뷰에 댓글/좋아요로 상호작용
5. 마이페이지에서 프로필/내 리뷰/좋아요한 리뷰 관리

---

## 4) 아키텍처

### 전체 구조(런타임)

```txt
[Next.js App Router]
  ├─ app/ (pages, layouts, route handlers)
  ├─ components (UI / domain)
  ├─ services (client API wrappers)
  └─ hooks/forms (react-hook-form + zod)
          │
          ▼
[State & Auth]
  ├─ Redux Toolkit (client state)
  ├─ Firebase Auth (client auth)
  └─ Firebase Admin (server token verify)
          │
          ▼
[External Services]
  ├─ TMDB API (movie data)
  ├─ Firestore (app data)
  └─ AWS S3 (profile image storage)
```

### 화면 아키텍처

- **App Router 기반 페이지 구성**
  - 메인(`/`), 검색(`/search`), 영화 상세(`/movie-details/[id]`)
  - 리뷰 목록/상세(`/ticket-list`, `/ticket-list/[reviewId]`)
  - 리뷰 작성(`/write-review/new`, `/write-review/[id]`)
  - 마이페이지(`/my-page`, `/my-page/edit`)

### 상태 아키텍처

- 클라이언트 상태: Redux Toolkit
- 폼 상태: React Hook Form + Zod
- 인증 상태: Firebase Auth + Context

### API 아키텍처

- Next.js Route Handler 기반 API (`app/api/*`)
- 주요 엔드포인트
  - 인증: `/api/auth/*`
  - 리뷰: `/api/reviews/*`
  - 댓글: `/api/reviews/[id]/comments/*`
  - 좋아요: `/api/reviews/[id]/likes/*`
  - 사용자: `/api/users/*`
  - 파일 업로드: `/api/s3`
  - 영화 검색: `/api/tmdb/movies`

---

## 5) 디렉터리 구조

```txt
├── app/                          # App Router 페이지/레이아웃/API 라우트
│   ├── api/                      # Route Handlers (auth, reviews, users, s3, tmdb)
│   ├── components/               # 공통 UI/도메인 컴포넌트
│   ├── movie-details/            # 영화 상세 페이지
│   ├── my-page/                  # 마이페이지 및 프로필 편집
│   ├── search/                   # 검색 페이지
│   ├── ticket-list/              # 리뷰 목록/상세
│   └── write-review/             # 리뷰 작성/수정
├── lib/                          # 영화/리뷰/인증/S3 유틸 함수
├── store/                        # Redux Toolkit, Context 상태 관리
├── firebase-config/              # Firebase Client SDK 설정
├── firebase-admin-config/        # Firebase Admin SDK 설정
├── __tests__/                    # Jest 테스트 코드
├── public/                       # 정적 파일(아이콘, OG 이미지)
└── README.md
```

---

## 6) 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS 4, Headless UI, Swiper, React Icons
- **State/Form**: Redux Toolkit, React-Redux, React Hook Form, Zod
- **Auth/Data**: Firebase Auth, Firebase Admin, Firestore, AWS S3 Presigned URL
- **Movie Data**: TMDB API
- **Quality**: ESLint, Jest, Testing Library, MSW

---

## 7) 실행 방법

### 요구 사항

- Node.js 20+
- Yarn

### 설치

```bash
git clone https://github.com/DaH-115/just-your-tickets.git
cd just-your-tickets
yarn install
```

### 개발 서버

```bash
yarn dev
```

### 빌드 / 실행

```bash
yarn build
yarn start
```

### 테스트

```bash
yarn test
```

---

## 8) 환경 변수

`.env.local` 예시:

```bash
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_APP_ID=your_app_id

# Firebase Admin (Server)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id

# TMDB
TMDB_API_KEY=your_tmdb_api_key

# AWS S3
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
S3_DOWNLOAD_URL_TTL=600

# Optional
NEXT_PUBLIC_BASE_URL=https://just-your-tickets.vercel.app
```

---

## 9) 배포

Vercel 배포를 기준으로 구성되어 있습니다.

## 10) 라이선스

개인 포트폴리오 및 학습 목적 프로젝트입니다.
