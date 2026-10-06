import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const types = execFileSync(
  "npx",
  [
    "--yes",
    "supabase@2.119.0",
    "gen",
    "types",
    "typescript",
    "--linked",
    "--schema",
    "public",
  ],
  { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
);

if (!types.includes("export type Database")) {
  throw new Error("데이터베이스 타입 생성에 실패했습니다. 기존 파일은 유지됩니다.");
}

writeFileSync(
  new URL("../src/lib/supabase/database.types.ts", import.meta.url),
  types,
  "utf8",
);

console.log("Supabase 데이터베이스 타입을 생성했습니다.");
