# Qurve app Frontend

이 프로젝트는 [`create-expo-app`](https://www.npmjs.com/package/create-expo-app)으로 생성된 [Expo](https://expo.dev) 프로젝트입니다.

## 시작하기

1. 의존성 설치

```bash
npm install
```

2. 앱 실행

```bash
npx expo start
```

실행 후 출력되는 옵션을 통해 다음 환경에서 앱을 열 수 있습니다.

- 개발 빌드
- Android 에뮬레이터
- iOS 시뮬레이터
- Expo Go, Expo로 앱 개발을 간단히 체험해볼 수 있는 제한된 샌드박스 환경

개발을 시작하려면 `app` 디렉토리 안의 파일을 수정하면 됩니다. 이 프로젝트는 파일 기반 라우팅을 사용합니다.

## 개발 환경 세팅

### 1. 필수 설치 항목

프로젝트 실행 및 개발을 위해 아래 항목들이 필요합니다.

- Node.js LTS
- npm
- Android Studio
- Android SDK
- Android Emulator
- VS Code 또는 Android Studio
- Git

### 2. Node.js 설치 확인

터미널에서 아래 명령어를 입력하여 Node.js와 npm이 정상 설치되었는지 확인합니다.

```bash
node -v
npm -v
```

### 3. Android Studio 및 Android SDK 설치

Android 에뮬레이터를 사용하기 위해 Android Studio를 설치합니다. 설치 후 아래 항목이 포함되어 있는지 확인합니다.

- Android SDK Platform
- Android SDK Platform-Tools
- Android Emulator
- Android SDK Build-Tools

### 4. 환경변수 설정

Android SDK 경로가 정상적으로 잡혀 있어야 합니다.

#### macOS / Linux

셸 설정 파일(`~/.zshrc`, `~/.bashrc` 등)에 아래 내용을 추가합니다.

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

설정 후 아래 명령어로 반영합니다.

```bash
source ~/.zshrc
```

#### Windows

시스템 환경 변수에 아래 항목을 추가합니다.

- 변수 이름: `ANDROID_HOME`
- 변수 값: Android SDK 설치 경로
  예: `C:\Users\사용자명\AppData\Local\Android\Sdk`

`Path` 항목에도 아래 경로를 추가합니다.

```text
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

### 5. 환경변수 확인

터미널 또는 명령 프롬프트에서 아래 명령어를 실행하여 정상 반영 여부를 확인합니다.

```bash
echo $ANDROID_HOME
adb --version
emulator -list-avds
```

Windows PowerShell에서는 아래처럼 확인할 수 있습니다.

```powershell
echo $env:ANDROID_HOME
adb --version
emulator -list-avds
```

### 6. Android Emulator 실행

생성된 에뮬레이터가 있다면 아래 명령어로 실행할 수 있습니다.

```bash
emulator -avd 에뮬레이터이름
```

예시:

```bash
emulator -avd Medium_Phone
```

에뮬레이터 실행 후 Expo 프로젝트를 실행하고 `a` 키를 입력하면 Android 환경에서 앱을 확인할 수 있습니다.

## 권장 개발 도구

### 코드 편집

- VS Code
- Android Studio

### 안드로이드 실행 환경

- Android Studio Emulator

### 버전 관리

- GitHub

## 프로젝트 세팅 순서

### 1. 프로젝트 생성

원하는 위치에서 Expo 프로젝트를 생성합니다.

```bash
npx create-expo-app qurve-frontend
```

또는 상위 폴더를 만든 뒤 그 안에서 생성할 수도 있습니다.

```bash
mkdir qurve-app
cd qurve-app
npx create-expo-app qurve-frontend
```

### 2. 프로젝트 폴더로 이동

```bash
cd qurve-frontend
```

### 3. 의존성 설치

```bash
npm install
```

### 4. Expo 개발 서버 실행

```bash
npx expo start
```

### 5. Android 실행

- Android Emulator를 먼저 실행
- Expo 실행 후 터미널에서 `a` 입력
- 또는 Expo 화면에서 Android 실행 선택

## GitHub 연동

원격 저장소를 이미 만들어둔 경우 아래 순서로 연결합니다.

```bash
git init
git remote add origin 저장소주소
git add .
git commit -m "chore: initialize expo project"
git branch -M main
git push -u origin main
```

만약 원격 저장소에 README만 있는 상태라면, 상황에 따라 pull 후 병합하거나 force push가 필요할 수 있습니다.

## 추가 라이브러리 설치 예시

프로젝트 진행에 따라 아래 라이브러리를 추가로 사용할 수 있습니다.

- `axios` : 백엔드 API 통신
- `nativewind` : Tailwind 스타일링
- `react-native-chart-kit` : 학습 통계 그래프 시각화
- `react-native-svg` : 차트 관련 의존성
- `@tanstack/react-query` : 서버 상태 관리
- `zustand` : 전역 상태 관리
- `expo-secure-store` : 토큰 저장
- `expo-notifications` : 알림 기능

예시 설치 명령어:

```bash
npm install axios
npm install nativewind tailwindcss
npm install react-native-chart-kit react-native-svg
npm install @tanstack/react-query
npm install zustand
npx expo install expo-secure-store expo-notifications
```

## 주의 사항

- `.env` 파일은 Git에 올리지 않습니다.
- `node_modules`는 Git에 포함하지 않습니다.
- 민감한 API 키는 프론트엔드에 직접 넣지 않고 백엔드에서 관리하는 것을 권장합니다.
- Expo 프로젝트에서 Tailwind 스타일링은 일반 웹 방식 대신 `NativeWind`를 사용합니다.
- 프로젝트 생성은 Expo로 하고, Android Studio는 에뮬레이터 및 SDK 관리 용도로 사용하는 방식이 일반적입니다.

