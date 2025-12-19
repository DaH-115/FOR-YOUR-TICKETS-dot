import { isAllowedS3Path } from "lib/aws/s3.constants";

describe("isAllowedS3Path", () => {
  describe("허용되는 경로", () => {
    test("profile-img/로 시작하는 유효한 경로는 허용된다", () => {
      expect(isAllowedS3Path("profile-img/user123/avatar.jpg")).toBe(true);
      expect(isAllowedS3Path("profile-img/test.png")).toBe(true);
      expect(isAllowedS3Path("profile-img/abc/def/ghi.jpg")).toBe(true);
    });

    test("연속된 슬래시가 있어도 정규화 후 허용된다", () => {
      expect(isAllowedS3Path("profile-img//user123//avatar.jpg")).toBe(true);
      expect(isAllowedS3Path("profile-img///test.png")).toBe(true);
    });
  });

  describe("거부되는 경로 - Path Traversal 공격", () => {
    test(".. 을 포함한 경로는 거부된다", () => {
      expect(isAllowedS3Path("profile-img/../admin/config.json")).toBe(false);
      expect(isAllowedS3Path("profile-img/user/../../../etc/passwd")).toBe(
        false,
      );
      expect(isAllowedS3Path("profile-img/..")).toBe(false);
      expect(isAllowedS3Path("../profile-img/test.jpg")).toBe(false);
    });
  });

  describe("거부되는 경로 - 절대 경로", () => {
    test("/ 로 시작하는 절대 경로는 거부된다", () => {
      expect(isAllowedS3Path("/profile-img/test.jpg")).toBe(false);
      expect(isAllowedS3Path("/admin/config.json")).toBe(false);
    });
  });

  describe("거부되는 경로 - 허용되지 않은 접두사", () => {
    test("허용되지 않은 접두사는 거부된다", () => {
      expect(isAllowedS3Path("admin/config.json")).toBe(false);
      expect(isAllowedS3Path("etc/passwd")).toBe(false);
      expect(isAllowedS3Path("uploads/file.txt")).toBe(false);
      expect(isAllowedS3Path("config/settings.json")).toBe(false);
    });
  });

  describe("거부되는 경로 - 잘못된 입력", () => {
    test("빈 문자열은 거부된다", () => {
      expect(isAllowedS3Path("")).toBe(false);
    });

    test("null 또는 undefined는 거부된다", () => {
      expect(isAllowedS3Path(null as any)).toBe(false);
      expect(isAllowedS3Path(undefined as any)).toBe(false);
    });

    test("문자열이 아닌 타입은 거부된다", () => {
      expect(isAllowedS3Path(123 as any)).toBe(false);
      expect(isAllowedS3Path({} as any)).toBe(false);
      expect(isAllowedS3Path([] as any)).toBe(false);
    });
  });

  describe("엣지 케이스", () => {
    test("profile-img만 있는 경우는 허용된다", () => {
      expect(isAllowedS3Path("profile-img/")).toBe(true);
    });

    test("접두사 일부만 일치하는 경우는 거부된다", () => {
      expect(isAllowedS3Path("profile-img-backup/test.jpg")).toBe(false);
      expect(isAllowedS3Path("profile/test.jpg")).toBe(false);
    });

    test("대소문자를 구분한다", () => {
      expect(isAllowedS3Path("Profile-img/test.jpg")).toBe(false);
      expect(isAllowedS3Path("PROFILE-IMG/test.jpg")).toBe(false);
    });
  });
});

