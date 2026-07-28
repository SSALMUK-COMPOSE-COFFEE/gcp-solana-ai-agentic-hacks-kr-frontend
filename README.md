# 팬덤 총대 에이전트 — Frontend

팬덤 **총대**가 생일카페·지하철광고 등 그룹 프로젝트를 위해 모금한 자금의 집행을 AI 에이전트가 검증하는 **에스크로·투명성 시스템**의 Flutter 클라이언트.

자금의 모금 → 보관 → 집행/환불 전 과정을 Solana 온체인에서 처리하고, 총대의 "집행 버튼"을 없애 에이전트가 정책대로 자율 집행한다.

- [기획 문서](docs/project-plan.md)
- [API 명세](docs/api-spec.md)

## 스택

| | |
|---|---|
| 프레임워크 | Flutter (Dart SDK ^3.11.3) |
| 상태 관리 | Riverpod 2.6.1 + `riverpod_generator` |
| 라우팅 | go_router 17.3 |
| 린트 | `flutter_lints`, `riverpod_lint`, `custom_lint` |

## 구조

```
lib/
├── app.dart                 # MaterialApp.router 루트
├── main.dart
├── core/
│   ├── error/               # Exception / Failure
│   ├── router/              # go_router 설정
│   ├── usecase/             # UseCase 인터페이스
│   └── utils/               # Result 타입
└── design_system/
    ├── tokens/              # color · spacing · radius · typography
    ├── theme/               # light / dark 테마
    └── components/          # button · card · input · loading
```

## 시작하기

```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter run
```

`*.g.dart` 생성 코드는 커밋하지 않는다. 클론 후 반드시 `build_runner`를 한 번 돌려야 한다.

코드 생성이 필요한 파일을 수정하는 동안에는 watch 모드가 편하다.

```bash
dart run build_runner watch --delete-conflicting-outputs
```

## 서버 주소

기본값은 `https://hajin.xyz`. GCP로 옮기면 빌드할 때 넘긴다.

```bash
flutter run --dart-define=BASE_URL=https://your-host
```

인증이 필요한 요청은 `dioProvider`를 쓴다. 액세스 토큰은 자동으로 붙고, 401이 오면
`/auth/refresh`로 한 번 갱신한 뒤 원래 요청을 재시도한다. 로그인·회원가입처럼 토큰이
없어야 하는 요청은 `Options(extra: skipAuth)`를 붙인다.

## 브랜치 전략

- `main` — 배포 기준 브랜치
- `develop` — 기본 브랜치. 평소 작업은 여기서 한다

CI(format · analyze · test)는 두 브랜치의 push와 PR 모두에서 돈다.

## 검사

CI와 동일한 검사를 로컬에서 돌리려면:

```bash
dart format --output=none --set-exit-if-changed .
flutter analyze
flutter test
```
