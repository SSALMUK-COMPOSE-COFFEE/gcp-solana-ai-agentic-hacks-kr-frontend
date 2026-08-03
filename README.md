# 총대 (Chongdae) — 팬덤 에스크로 에이전트 · 웹

> **신뢰하는 사람 → 검증하는 프로토콜**
> 팬 · 총대 · 벤더 3자 풀 플로우를 담은 React SPA. 모금부터 AI 심사·자동 집행·정산까지 전 과정을 온체인 증빙과 함께 보여줍니다.

**GCP × Solana AI Agentic Hacks KR 제출작** · 백엔드 저장소는 [gcp-solana-ai-agentic-hacks-kr-backend](https://github.com/SSALMUK-COMPOSE-COFFEE/gcp-solana-ai-agentic-hacks-kr-backend)

| | |
|---|---|
| 서비스 | https://chongdae.hajin.xyz |
| API 문서 | https://chongdae.hajin.xyz/api/docs |
| 스택 | React 19 · Vite 7 · TypeScript 5.8 · Tailwind CSS v4 · React Router 7 |
| 배포 | Google Cloud Run (nginx 정적 서빙) + 글로벌 HTTPS 로드밸런서 |

런타임 의존성은 5개입니다 — `react`, `react-dom`, `react-router-dom`, `qrcode.react`, `pretendard`. Solana 지갑 어댑터 라이브러리를 쓰지 않고 `window.solana` 프로바이더를 직접 다룹니다(번들 크기 98KB gzip).

---

## 1. 빠르게 실행하기

### 백엔드 없이 (mock 모드)

UI만 훑어보려면 백엔드가 필요 없습니다. `src/api/mock.ts`가 37개 API 메서드 전체를 인메모리로 구현하고 있어, 캠페인 생성·기여·심사·정산까지 전부 동작합니다.

```bash
npm install
cp .env.example .env        # VITE_API_MODE=mock 그대로 두면 됩니다
npm run dev
```

→ http://localhost:5173

mock 모드에서는 지갑 확장 프로그램 없이도 지갑 연결/서명이 통과하고, Solana Pay 결제는 약 8초 후 자동으로 확정 처리됩니다.

### 라이브 백엔드에 붙여서 (real 모드)

```bash
npm install
cat > .env <<'EOF'
VITE_API_MODE=real
VITE_API_BASE_URL=https://chongdae.hajin.xyz/api
EOF
npm run dev
```

로컬 백엔드에 붙이려면 `VITE_API_BASE_URL=http://localhost:8090`으로 바꾸세요 (백엔드 저장소의 docker compose 기준 포트).

> real 모드에서 **지갑 연결·기여 결제에는 Phantom 등 Solana 지갑 확장이 필요**합니다. 캠페인 생성은 지갑 연결이 선행돼야 하고, 기여는 devnet USDC가 있어야 실제로 확정됩니다.

### npm 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | Vite 개발 서버 (5173) |
| `npm run build` | `tsc` 타입 체크 후 `dist/`로 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 로컬 서빙 |

---

## 2. ⚠️ 환경변수는 빌드 타임에 인라인됩니다

Vite는 `VITE_*` 값을 **빌드 시점에 번들에 박아 넣습니다.** 컨테이너를 띄울 때 환경변수를 바꿔도 반영되지 않습니다. **API 주소가 바뀌면 반드시 재빌드해야 합니다.**

| 변수 | 값 | 기본값 |
|---|---|---|
| `VITE_API_MODE` | `mock` \| `real` | `mock` |
| `VITE_API_BASE_URL` | 백엔드 API 베이스 URL | `/api` (미지정 시) |

`VITE_API_MODE`가 정확히 `real`이 아니면 mock으로 폴백합니다 (`src/api/index.ts`).

### Docker로 빌드

`Dockerfile`은 두 값을 **빌드 인자**로 받습니다. 인자를 넘기지 않으면 mock 모드로 빌드되니 주의하세요.

```bash
docker build \
  --build-arg VITE_API_MODE=real \
  --build-arg VITE_API_BASE_URL=https://chongdae.hajin.xyz/api \
  -t chongdae-web:latest .

docker run --rm -p 8080:80 chongdae-web:latest
```

또는 compose로:

```bash
VITE_API_MODE=real VITE_API_BASE_URL=https://chongdae.hajin.xyz/api \
  docker compose --profile prod up --build
```

---

## 3. 화면 구성

| 경로 | 화면 | 역할 |
|---|---|---|
| `/` | 캠페인 목록 | 모금 진행률·상태·마감, 상태 필터 |
| `/campaign/:id` | 공개 캠페인 상세 | 에이전트 판단 로그, 정산 현황, AI 심사 영수증, 기여자별 정산 — **로그인 없이 누구나 감사 가능** |
| `/campaign/:id/contribute` | 기여하기 | Solana Pay QR 발급 → 2초 폴링으로 온체인 확정 감지 |
| `/campaign/new` | 캠페인 생성 | 목표·마감 + **집행 정책**(단가/총액 한도, AI 심사 예산, 초과 모금 스케일링) + 리워드 티어 |
| `/dashboard` | 총대 대시보드 | 에이전트 크루 상태, 증빙 목록, **AI 심사 실행**, 조기 마감, 판단·집행 로그 |
| `/vendors` | 벤더 목록 · 등록 | 등록 시 API 키 1회 발급 |
| `/vendor/console` | 벤더 콘솔 | API 키 인증 → 견적서/영수증 PDF 제출 |
| `/me` | 마이페이지 | 프로필, **지갑 연결(SIWS)**, 기여 내역, cNFT 기여 증서 |
| `/login`, `/signup` | 인증 | 이메일 + 비밀번호 / 지갑 서명 로그인 |

모든 온체인 트랜잭션에는 Solana Explorer 링크가 붙습니다.

---

## 4. 코드 구조

```
src/
  api/
    types.ts      ApiClient 인터페이스 (37개 메서드) + 도메인 타입
    index.ts      VITE_API_MODE에 따라 real/mock 선택
    real.ts       실제 HTTP 클라이언트 — 401 시 refresh 토큰으로 1회 자동 재시도
    mock.ts       인메모리 구현 — 백엔드 없이 전 플로우 재현
    token.ts      access/refresh 토큰 저장소
  pages/          10개 화면
  components/
    Layout.tsx    헤더 · 푸터 · 라우터 아울렛
    ui.tsx        Card · Spinner · ErrorNote · 상태 배지 등 공용 프리미티브
    ErrorBoundary.tsx
  store/auth.tsx  인증 컨텍스트 (로그인 상태, 사용자 정보)
  lib/
    wallet.ts     window.solana 연결 · nonce 서명
    base58.ts     서명 인코딩 (의존성 없이 직접 구현)
    format.ts     USDC raw units ↔ 표시 금액 변환
```

**API 레이어가 인터페이스 하나로 통일돼 있는 것**이 이 코드베이스의 핵심입니다. 화면은 `ApiClient`만 알고, mock/real 교체는 `src/api/index.ts` 한 줄에서 끝납니다. 덕분에 백엔드 없이도 전체 UX를 개발·시연할 수 있었습니다.

**금액은 전부 raw units(6 decimals)로 다룹니다.** 표시 직전에만 `format.ts`로 변환하며, 부동소수점 오차를 피하기 위해 계산은 정수로만 합니다.

---

## 5. Cloud Run 배포

```bash
REG=asia-northeast3-docker.pkg.dev/<PROJECT>/chongdae

docker build --platform linux/amd64 \
  --build-arg VITE_API_MODE=real \
  --build-arg VITE_API_BASE_URL=https://chongdae.hajin.xyz/api \
  -t $REG/web:v1 .
docker push $REG/web:v1

gcloud run deploy chongdae-web \
  --image=$REG/web:v1 \
  --region=asia-northeast3 \
  --allow-unauthenticated \
  --port=80 --memory=256Mi --max-instances=2
```

프로덕션에서는 글로벌 HTTPS 로드밸런서가 앞에 서서 경로를 나눕니다.

```
chongdae.hajin.xyz
  ├─ /       → chongdae-web  (이 저장소 · nginx 정적 서빙)
  └─ /api/*  → chongdae-api  (백엔드 · 프리픽스 리라이트)
```

같은 오리진을 쓰므로 브라우저 CORS 프리플라이트가 발생하지 않습니다. LB 설정(`url-map.yaml`)은 백엔드 저장소의 `deploy/cloudrun/`에 있습니다.

`nginx.conf`는 SPA 폴백(`try_files $uri /index.html`)과 `/assets/` 불변 캐시 헤더만 담당합니다. API 프록시는 하지 않으므로, **이 컨테이너를 단독으로 띄우면 `VITE_API_BASE_URL`이 절대 URL이어야 합니다.**
