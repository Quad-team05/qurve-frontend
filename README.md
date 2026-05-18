# Qurve Frontend

Expo 기반 React Native 프론트엔드 프로젝트입니다.

## 빠른 시작

### 1) 요구 버전

- Node.js: **20 LTS** (`.nvmrc` 참고)
- npm: 10+
- Java: **JDK 17**
- Android Studio + Android SDK + Emulator

### 2) 설치

```bash
npm install
```

### 3) 실행

```bash
npx expo start
```

실행 후 단축키:

- `a`: Android
- `i`: iOS (macOS)
- `w`: Web

## 권장 개발 환경

- IDE: VS Code (권장) 또는 Android Studio
- 버전 관리: GitHub
- 에뮬레이터: Android Studio Emulator

### VS Code 권장 확장

- `expo.vscode-expo-tools`

## 프로젝트 스크립트

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript 타입 검사
npm run test          # Vitest
npm run ci            # lint + typecheck + test
npm run format        # Prettier 포맷
npm run format:check  # 포맷 검사
```

## 협업 규칙 요약

- 커밋 전 `husky + lint-staged`가 변경 파일 자동 검사/포맷
- PR/`main` push 시 GitHub Actions CI가 `lint/typecheck/test` 실행

## 환경 변수

- 예시 파일: `.env.example`
- 민감 정보는 커밋 금지 (`.env`는 Git 제외)
- 클라이언트 노출 변수는 `EXPO_PUBLIC_` prefix 사용

## 디렉토리 구조 (요약)

```text
app/           # 라우트/화면
components/    # 공통 UI
hooks/         # 커스텀 훅
lib/           # 유틸/비즈니스 로직
test/          # 테스트
.github/       # CI, PR/이슈 템플릿
```

## Android 환경 변수 (macOS / Linux)

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

반영:

```bash
source ~/.zshrc
```

## 문제 해결

### Node 버전 이슈

- Expo 실행 에러가 나면 Node 버전을 먼저 확인하세요.
- `node -v`가 20이 아니면 20으로 전환 후 재실행하세요.

### Java 버전 이슈

- Android 빌드 문제 시 `java -version` 확인
- JDK 17 사용 권장

---

추가 협업 가이드는 [CONTRIBUTING.md](./CONTRIBUTING.md) 참고.
