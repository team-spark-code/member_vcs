# 회원 관리 시스템 (Member Management System)

Next.js와 React 기반의 현대적인 회원 관리 애플리케이션입니다.

## 🚀 주요 기능

### 회원가입
- ✅ 실시간 이름/이메일 중복 체크
- ✅ 비밀번호 재입력 확인
- ✅ 다음 우편번호 API를 사용한 주소 검색
- ✅ 폼 유효성 검사

### 회원 목록
- ✅ ID, 이름, 이메일, 가입일 조회
- ✅ 페이징 처리 (페이지당 5건)
- ✅ 이전/다음 페이지 네비게이션

### 회원정보 수정
- ✅ 프로필 정보 수정
- ✅ 비밀번호 변경 (선택사항)
- ✅ 주소 정보 업데이트

### 사용자 인증
- ✅ Next-Auth를 사용한 세션 관리
- ✅ 로그인/로그아웃 기능
- ✅ 보안된 페이지 접근 제어

## 🛠 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Database**: MariaDB
- **ORM**: Drizzle ORM
- **Authentication**: Next-Auth v5
- **Form Handling**: React Hook Form
- **Validation**: Zod

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# MariaDB Database
DATABASE_URL="mysql://root:1111@localhost:3306/redfin"

# NextAuth
AUTH_SECRET="your-super-secret-auth-secret"
```

### 3. 데이터베이스 설정
MariaDB가 실행 중인지 확인하고, `redfin` 데이터베이스를 생성하세요:

```sql
CREATE DATABASE redfin;
```

### 4. 데이터베이스 스키마 적용
```bash
npm run db:push
```

### 5. 개발 서버 실행
```bash
npm run dev
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

## 📁 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── auth/         # 인증 관련 API
│   │   ├── check-duplicate/ # 중복 체크 API
│   │   ├── members/      # 회원 목록 API
│   │   ├── profile/      # 프로필 API
│   │   └── signup/       # 회원가입 API
│   ├── login/            # 로그인 페이지
│   ├── members/          # 회원 목록 페이지
│   ├── profile/          # 프로필 수정 페이지
│   └── signup/           # 회원가입 페이지
├── components/            # 재사용 가능한 컴포넌트
│   └── ui/               # UI 컴포넌트 (shadcn/ui)
├── lib/                  # 유틸리티 및 설정
│   ├── actions/          # 서버 액션
│   └── db/              # 데이터베이스 설정 및 스키마
└── drizzle.config.ts     # Drizzle ORM 설정
```

## 🔧 데이터베이스 스키마

### member 테이블
- `id`: 고유 식별자 (UUID)
- `name`: 사용자 이름
- `email`: 이메일 주소 (고유)
- `password`: 해시된 비밀번호
- `address`: 주소
- `postalCode`: 우편번호
- `createdAt`: 등록일시
- `updatedAt`: 수정일시
- `createdBy`: 만든사람
- `updatedBy`: 수정한사람

### 데이터베이스 구조
- **redfin** 데이터베이스
  - **member** 테이블: 사용자 정보
  - **accounts** 테이블: NextAuth 외부 얰결 계정
  - **sessions** 테이블: NextAuth 세션
  - **verification_tokens** 테이블: NextAuth 인증 토큰

## 🔐 보안 기능

- 비밀번호 해싱 (bcrypt)
- CSRF 보호
- 세션 기반 인증
- 입력 데이터 검증

## 📱 반응형 디자인

모든 페이지는 반응형으로 설계되어 다양한 화면 크기에서 최적화된 사용자 경험을 제공합니다.

## 🎨 UI/UX 특징

- 깔끔하고 현대적인 디자인
- 실시간 피드백 (중복 체크, 폼 검증)
- 사용자 친화적인 오류 메시지
- 로딩 상태 표시

## 🔄 API 엔드포인트

- `GET /api/check-duplicate`: 이름/이메일 중복 체크
- `POST /api/signup`: 회원가입
- `GET /api/members`: 회원 목록 조회 (페이징)
- `GET /api/profile/[id]`: 프로필 정보 조회
- `PUT /api/profile/[id]`: 프로필 정보 수정

## 🚀 배포

프로덕션 환경에 배포하기 전에:

1. 환경 변수를 프로덕션 값으로 설정
2. 데이터베이스 연결 정보 확인
3. Next.js 빌드 실행:
   ```bash
   npm run build
   npm start
   ```

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.
