# Contributing

## 브랜치 전략

- `main`: 배포 가능한 브랜치
- develop: 배포를 위해 개발하는 브랜치
- feat/QVE-{index}: 새로운 기능 개발하는 브랜치
- refactor/{기능명}: 개발된 기능을 리팩터링하는 브랜치
- hotfix: 출qovh 버전에서 발생한 버그를 수정하는 브랜치
- 기능 브랜치 네이밍: `feature-{idx}` 또는 `fix-{idx}`

## 커밋 컨벤션

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `chore:` 유지보수 작업
- `docs:` 문서 작업
- `refactor:` 동작 변경 없는 리팩터링
- `test:` 테스트 관련 작업

- 커밋 예시: Feat: "회원 가입 페이지 퍼블리싱"

## PR 올리기 전 체크

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build` (build 스크립트가 있는 경우)

## Pull Request 규칙

- PR은 작고 목적이 분명하게 유지합니다.
- UI 변경 시 스크린샷을 첨부합니다.
