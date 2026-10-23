// 가입 정보나 Google·카카오 계정에 담긴 이름을 찾는다. 없으면 undefined.
export function getMetadataDisplayName(metadata: Record<string, unknown>) {
  const candidates = [
    metadata.display_name,
    metadata.name,
    metadata.nickname,
    metadata.full_name,
    metadata.preferred_username,
  ];
  const displayName = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );

  return displayName?.trim().slice(0, 50);
}
