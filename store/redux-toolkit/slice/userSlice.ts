import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isAuth } from "firebase-config";
import { getAuthHeaders } from "app/utils/getIdToken/getAuthHeaders";

// 사용자 정보 타입 정의
export interface User {
  // Firebase Auth 정보
  uid: string | null;
  email: string | null;
  displayName: string | null;
  photoKey: string | null; // S3 이미지 Key만 사용합니다.

  // Firestore 메타데이터
  biography: string | null;
  provider: string | null;
  activityLevel: string;
  createdAt: string;
  updatedAt: string;

  // 사용자 통계 정보
  myTicketsCount: number;
  likedTicketsCount: number;
}

// Redux 상태 타입
type UserState = {
  user: User | null; // 사용자 정보 (null = 로그아웃 상태)
  status: "idle" | "loading" | "succeeded" | "failed"; // 로딩 상태
  error: string | null; // 에러 메시지
};

// 초기 상태
const initialState: UserState = {
  user: null,
  status: "idle",
  error: null,
};

/**
 * 사용자 프로필 데이터 조회
 * @param uid - 사용자 ID
 * @returns 최신 사용자 정보 또는 에러
 */
export const fetchUserProfile = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("user/fetchUserProfile", async (uid, { rejectWithValue }) => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`/api/users/${uid}`, {
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("사용자 프로필 조회에 실패했습니다.");
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "사용자 프로필 조회에 실패했습니다.",
    );
  }
});

// 프로필 업데이트 요청 데이터 타입
interface UpdateProfileData {
  displayName?: string;
  biography?: string;
  photoKey?: string;
}

// 사용자 프로필 업데이트 API
export const updateUserProfile = createAsyncThunk<
  User, // 성공시 반환 타입
  { uid: string; data: UpdateProfileData }, // 매개변수 타입
  { rejectValue: string; state: { userData: UserState } } // 에러 타입 및 상태 타입 추가
>(
  "user/updateUserProfile",
  async ({ uid, data }, { rejectWithValue, getState }) => {
    try {
      const user = isAuth.currentUser;
      if (!user) {
        return rejectWithValue("로그인이 필요합니다.");
      }

      const idToken = await user.getIdToken();
      const response = await fetch(`/api/users/${uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "프로필 업데이트에 실패했습니다.");
      }

      const result = await response.json(); // e.g. { displayName?, biography?, photoKey? }

      // 업데이트된 Firebase Auth 정보 다시 가져오기
      await user.reload();
      const updatedUser = isAuth.currentUser!;
      const currentUserState = getState().userData.user;

      if (!currentUserState) {
        throw new Error("현재 사용자 정보를 찾을 수 없습니다.");
      }

      // 기존 상태를 기반으로 업데이트된 정보 병합
      return {
        ...currentUserState,
        uid: updatedUser.uid,
        email: updatedUser.email,
        displayName: updatedUser.displayName, // Auth에서 최신 정보 가져오기
        ...("biography" in result && { biography: result.biography }),
        ...("photoKey" in result && { photoKey: result.photoKey }),
        updatedAt: new Date().toISOString(), // 업데이트 시각 갱신
      };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "알 수 없는 오류",
      );
    }
  },
);

// Redux Slice 생성
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 로그인 시 사용자 정보 설정
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = "succeeded";
      state.error = null;
    },

    // 로그아웃 시 모든 정보 초기화
    clearUser(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },

    // 프로필 이미지만 빠르게 업데이트 (로컬 상태)
    updatePhotoKey(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.photoKey = action.payload;
      }
    },

    // 에러 상태 초기화
    clearError(state) {
      state.error = null;
    },

    // 개발용 등급 변경 액션
    updateActivityLevel(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.activityLevel = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 프로필 조회 처리
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        // 기존 Firebase Auth 정보는 유지하고 Firestore 데이터만 업데이트
        if (state.user) {
          state.user = {
            ...state.user, // 기존 Firebase Auth 정보 유지
            ...action.payload, // Firestore 데이터로 업데이트
          };
        } else {
          state.user = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "프로필 조회에 실패했습니다.";
      })

      // 프로필 업데이트 처리
      .addCase(updateUserProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "프로필 업데이트에 실패했습니다.";
      });
  },
});

// 액션과 리듀서 내보내기
export const {
  setUser,
  clearUser,
  updatePhotoKey,
  clearError,
  updateActivityLevel,
} = userSlice.actions;
export default userSlice.reducer;

// 상태 선택자 (Selector) - 컴포넌트에서 쉽게 사용할 수 있도록
export const selectUser = (state: { userData: UserState }) =>
  state.userData.user;
export const selectUserStatus = (state: { userData: UserState }) =>
  state.userData.status;
export const selectUserError = (state: { userData: UserState }) =>
  state.userData.error;
export const selectIsLoggedIn = (state: { userData: UserState }) =>
  !!state.userData.user;
export const selectIsLoading = (state: { userData: UserState }) =>
  state.userData.status === "loading";
