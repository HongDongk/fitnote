import { existsSync, readFileSync } from "node:fs";

const envFiles = [
  ".env.local",
  ".env.development.local",
  ".env.development",
  ".env",
];

function loadEnvironment() {
  const loadedFiles = [];

  for (const file of envFiles) {
    if (!existsSync(file)) continue;

    loadedFiles.push(file);

    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match || process.env[match[1]] !== undefined) continue;

      let value = match[2].trim();
      const isQuoted =
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"));

      if (isQuoted) value = value.slice(1, -1);
      process.env[match[1]] = value;
    }
  }

  return loadedFiles;
}

async function request(path) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const response = await fetch(new URL(path, url), {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    signal: AbortSignal.timeout(10_000),
  });

  const text = await response.text();
  let body = {};

  try {
    body = JSON.parse(text);
  } catch {
    // Some successful endpoints return an empty or non-JSON body.
  }

  return { response, body };
}

const loadedFiles = loadEnvironment();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY가 없습니다.",
  );
  console.error(`확인한 환경파일: ${loadedFiles.join(", ") || "없음"}`);
  process.exit(1);
}

try {
  const auth = await request("/auth/v1/settings");

  if (!auth.response.ok) {
    throw new Error(
      `Auth API ${auth.response.status}: ${auth.body.message ?? "요청 실패"}`,
    );
  }

  // 존재하지 않는 테이블을 요청합니다. 유효한 키라면 PostgREST가 PGRST205를
  // 반환하고, 잘못된 키라면 테이블 확인 전에 401을 반환합니다.
  const data = await request(
    "/rest/v1/__supabase_connection_test__?select=*&limit=1",
  );
  const dataApiAcceptedKey =
    data.response.ok ||
    (data.response.status === 404 && data.body.code === "PGRST205");

  if (!dataApiAcceptedKey) {
    throw new Error(
      `Data API ${data.response.status}: ${data.body.message ?? "요청 실패"}`,
    );
  }

  console.log("✅ Supabase 연결 성공");
  console.log(`프로젝트: ${new URL(url).hostname}`);
  console.log(`환경파일: ${loadedFiles.join(", ")}`);
  console.log("Auth API: 정상");
  console.log("Data API: 정상");
} catch (error) {
  console.error("❌ Supabase 연결 실패");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
