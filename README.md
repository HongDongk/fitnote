# 핏노트

1인 강사·소규모 스튜디오를 위한 회원 관리 및 예약 서비스입니다.
Next.js, React, MUI, Supabase, Zod, TanStack Query를 사용합니다.

모든 명령은 프로젝트 루트에서 실행합니다. 현재 원격 Supabase를 사용하므로 웹 실행에 Docker나 로컬 Supabase 실행은 필요하지 않습니다.

## 개발 서버 실행

```bash
npm run dev
```

## 프로덕션 빌드·실행

```bash
npm run build
npm run start
```

## 코드·연결 검증

```bash
# ESLint 검사
npm run lint

# TypeScript 검사 (파일 출력 없음)
npx tsc --noEmit

# Supabase Auth·Data API 연결 확인 (읽기 요청만 수행)
npm run test:supabase
```

## Supabase CLI 로그인·프로젝트 연결

웹 실행만 할 때는 필요하지 않습니다. 타입 생성이나 마이그레이션 작업을 할 때 설정합니다.
타입 생성 스크립트와 동일한 CLI 버전 `2.119.0`을 사용합니다.

```bash
npx --yes supabase@2.119.0 login
npx --yes supabase@2.119.0 link --project-ref YOUR_PROJECT_REF
```

`YOUR_PROJECT_REF`는 Supabase 대시보드 URL의 `/project/` 뒤에 있는 프로젝트 ID입니다. 앱 환경변수와 CLI가 같은 프로젝트를 가리키는지 확인하세요. CLI 로그인은 서비스의 사용자 로그인과 별개입니다.

## DB TypeScript 타입 갱신

```bash
npm run types:supabase
```

연결된 원격 프로젝트의 `public` 스키마에서 타입을 생성해 `src/lib/supabase/database.types.ts`에 저장합니다.

- 원격 DB의 구조나 데이터를 변경하지 않습니다.
- 생성 명령이 실패하면 기존 타입 파일을 유지합니다.
- 원격 DB 스키마 변경 후 실행하고 생성된 파일도 Git에 함께 저장합니다.
- 타입 파일은 직접 수정하지 말고 생성 명령으로 갱신합니다.

## 마이그레이션

로컬 SQL 파일을 만드는 명령입니다. 아직 원격 DB에 적용되지는 않습니다.

```bash
npx --yes supabase@2.119.0 migration new change_name
```

생성된 `supabase/migrations/*.sql`을 작성한 뒤 먼저 적용 예정 목록을 확인합니다.

```bash
npx --yes supabase@2.119.0 db push --linked --dry-run
```

**아래 명령은 연결된 원격 DB에 SQL을 실제로 적용합니다.** 웹 실행을 위해 매번 실행하는 명령이 아닙니다. 프로젝트·SQL·적용 목록을 확인하고 명시적으로 적용하기로 결정한 경우에만 실행하세요.

```bash
npx --yes supabase@2.119.0 db push --linked
```

스키마 변경 적용 후 타입도 갱신합니다.

```bash
npm run types:supabase
npx tsc --noEmit
```

마이그레이션 이력 불일치 오류가 나면 임의로 `repair`하거나 DB를 초기화하지 말고 로컬 파일과 원격 이력을 먼저 확인하세요.
