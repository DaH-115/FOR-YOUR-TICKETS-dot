import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "firebase-admin-config";
import { verifyAuthToken } from "lib/auth/verifyToken";

// 랜덤 닉네임 생성 함수
function generateRandomNickname(): string {
  const timestamp = Date.now().toString().slice(-8);
  const base = `user${timestamp}`;
  const suffix = Math.random().toString(36).substring(2, 5);
  return `${base}_${suffix}`;
}

// 유일한 닉네임 생성 함수
async function generateUniqueNickname(uid: string): Promise<string> {
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const candidate = generateRandomNickname();
    const usernameRef = adminFirestore.collection("usernames").doc(candidate);

    try {
      // Firestore 트랜잭션을 사용하여 닉네임 존재 확인과 생성을 원자적으로 처리
      const result = await adminFirestore.runTransaction(
        async (transaction) => {
          const doc = await transaction.get(usernameRef);

          if (!doc.exists) {
            // 닉네임이 사용 가능하면 트랜잭션 내에서 등록
            transaction.set(usernameRef, {
              uid,
              createdAt: new Date(),
            });
            return candidate;
          } else {
            // 닉네임이 이미 존재하는 경우 null 반환
            return null;
          }
        },
      );

      // 트랜잭션이 성공하고 닉네임이 생성된 경우
      if (result) {
        return result;
      }
    } catch (error) {
      console.error("닉네임 생성 중 오류:", error);
    }

    attempts++;
  }

  throw new Error("유일한 닉네임 생성에 실패했습니다.");
}

// POST /api/users/me/profile - 소셜 로그인 후 현재 사용자 프로필 초기화·갱신
export async function POST(req: NextRequest) {
  try {
    // Firebase Admin SDK로 토큰 검증
    const authResult = await verifyAuthToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 },
      );
    }

    const { provider } = await req.json();

    // provider 검증
    if (!provider || !["google", "github"].includes(provider)) {
      return NextResponse.json(
        { error: "유효하지 않은 소셜 로그인 제공자입니다." },
        { status: 400 },
      );
    }

    const uid = authResult.uid!;

    // 사용자 정보 확인
    const userRef = adminFirestore.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // 기존 사용자: updatedAt만 갱신
      await userRef.update({
        updatedAt: new Date(),
      });

      const userData = userDoc.data();
      return NextResponse.json(
        {
          success: true,
          message: "로그인 성공",
          data: {
            uid,
            isNewUser: false,
            displayName: userData?.displayName || "사용자",
            provider: userData?.provider || provider,
          },
        },
        { status: 200 },
      );
    } else {
      // 신규 사용자: 프로필 생성
      try {
        // 유일한 닉네임 생성
        const uniqueNickname = await generateUniqueNickname(uid);

        // Firebase Auth 프로필 업데이트
        await adminAuth.updateUser(uid, {
          displayName: uniqueNickname,
        });

        // Firestore에 사용자 프로필 저장
        await userRef.set({
          displayName: uniqueNickname,
          provider: provider,
          biography: "Make a ticket for your own movie review.",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // 캐시 재검증
        revalidatePath("/");

        return NextResponse.json(
          {
            success: true,
            message: "회원가입이 완료되었습니다.",
            data: {
              uid,
              isNewUser: true,
              displayName: uniqueNickname,
              provider: provider,
            },
          },
          { status: 201 },
        );
      } catch (error) {
        console.error("신규 사용자 프로필 생성 실패:", error);

        // 생성된 닉네임이 있다면 롤백
        try {
          const authUser = await adminAuth.getUser(uid);
          if (authUser.displayName) {
            const usernameRef = adminFirestore
              .collection("usernames")
              .doc(authUser.displayName);
            await usernameRef.delete();
          }
        } catch (rollbackError) {
          console.error("닉네임 롤백 실패:", rollbackError);
        }

        return NextResponse.json(
          { error: "사용자 프로필 생성 중 오류가 발생했습니다." },
          { status: 500 },
        );
      }
    }
  } catch (error) {
    console.error("소셜 프로필 API 에러:", error);
    return NextResponse.json(
      { error: "소셜 로그인 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
