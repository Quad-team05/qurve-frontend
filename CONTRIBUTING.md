# Contributing

## 브랜치 전략

- `main`: 배포 가능한 브랜치
- 기능 브랜치 네이밍: `feature/<topic>` 또는 `fix/<topic>`

## 커밋 컨벤션

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `chore:` 유지보수 작업
- `docs:` 문서 작업
- `refactor:` 동작 변경 없는 리팩터링
- `test:` 테스트 관련 작업

## PR 올리기 전 체크

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build` (build 스크립트가 있는 경우)

## Pull Request 규칙

- PR은 작고 목적이 분명하게 유지합니다.
- UI 변경 시 스크린샷을 첨부합니다.
