export const siteUrl = "https://www.fitnote.online";
export const siteName = "핏노트";
export const siteDescription =
  "PT·필라테스·음악·댄스 강사를 위한 회원 관리·수업 예약 서비스. 회원은 앱 설치 없이 링크로 간편하게 수업을 신청하세요.";

// JSON-LD를 <script>에 넣을 때 '<'를 이스케이프해 태그 주입을 막는다.
export function toJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
