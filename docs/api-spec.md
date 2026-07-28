# API 명세

> 출처: Notion "API 문서 (1)" (2026-07-28 기준 스냅샷)
> 원본에 변경이 생기면 이 파일도 함께 갱신할 것.

`BASE_URL = https://hajin.xyz` — GCP 배포 시 도메인 변경 예정.

## 표기

- **진행상황** — 서버 구현 상태 (완료 / 진행 중 / 시작 전)
- **FE** — Flutter 연동 상태
- **JWT** — 인증 토큰 필요 여부
- EndPoint는 각 그룹 경로 뒤에 붙는다. 예: `/auth` + `/login` → `POST /auth/login`

전체 54개. 서버 완료 25 / 진행 중 4 / 시작 전 25. **FE 연동은 `/health` 하나만 완료.**

---

## `/` — 헬스체크

| Method | EndPoint | 설명 | 진행상황 | FE | JWT |
|---|---|---|---|---|---|
| GET | `/health` | Health 체크 | 완료 | 완료 | X |

## `/auth` — 인증

| Method | EndPoint | 설명 | 진행상황 | FE | JWT |
|---|---|---|---|---|---|
| POST | `/signup` | 회원가입 | 완료 | 시작 전 | X |
| POST | `/login` | 로그인 (토큰 발급) | 완료 | 시작 전 | X |
| POST | `/logout` | 로그아웃 | 완료 | 시작 전 | O |
| POST | `/refresh` | 액세스 토큰 재발급 | 완료 | 시작 전 | X |
| POST | `/wallet/nonce` | 지갑 서명용 nonce 발급 | 시작 전 | 시작 전 | X |
| POST | `/wallet/connect` | 지갑 연결 (서명 검증) | 시작 전 | 시작 전 | X |
| POST | `/passkey/register` | PassKey 등록 | 시작 전 | 시작 전 | O |
| POST | `/passkey/login` | PassKey 인증 (로그인) | 시작 전 | 시작 전 | X |

## `/users` — 유저

| Method | EndPoint | 설명 | 진행상황 | FE | JWT |
|---|---|---|---|---|---|
| GET | `/me` | 내 정보 불러오기 | 완료 | 시작 전 | O |
| POST | `/me` | 프로필 수정 | 완료 | 시작 전 | O |
| GET | `/me/tiny` | 현재 유저 간단 정보 | 완료 | 시작 전 | O |
| GET | `/me/contributions` | 내 기여 내역 | 완료 | 시작 전 | O |
| GET | `/me/certificates` | 내 cNFT 기여 증서 목록 | 완료 | 시작 전 | O |
| DELETE | `/me/withdraw` | 회원 탈퇴 | 완료 | 시작 전 | O |
| GET | `/{id}` | 특정 유저 조회 | 완료 | 시작 전 | X |

## `/campaign` — 캠페인

| Method | EndPoint | 설명 | 진행상황 | FE | JWT |
|---|---|---|---|---|---|
| GET | `/` | 캠페인 목록 | 진행 중 | 시작 전 | X |
| POST | `/` | 캠페인 생성 | 완료 | 시작 전 | O |
| GET | `/{id}` | 캠페인 상세 | 시작 전 | 시작 전 | X |
| POST | `/{id}` | 캠페인 수정 | 시작 전 | 시작 전 | O |
| GET | `/{id}/quotes` | 캠페인 견적 목록 | 시작 전 | 시작 전 | X |
| GET | `/{id}/status` | 캠페인 진행상황 | 시작 전 | 시작 전 | X |
| GET | `/{id}/contributions` | 기여자 목록 | 진행 중 | 시작 전 | X |
| POST | `/{id}/close` | 캠페인 마감 | 완료 | 시작 전 | O |

## `/vendor` — 벤더

| Method | EndPoint | 설명 | 진행상황 | FE | JWT |
|---|---|---|---|---|---|
| POST | `/` | 벤더 등록 신청 | 완료 | 시작 전 | X |
| GET | `/` | 벤더 목록 (allowlist) | 완료 | 시작 전 | X |
| GET | `/{id}` | 벤더 상세 | 완료 | 시작 전 | X |
| POST | `/{id}/quote` | 견적 제출 | 완료 | 시작 전 | X |
| POST | `/{id}/allowlist` | allowlist 등재/승인 | 완료 | 시작 전 | O |
| DELETE | `/{id}/allowlist` | allowlist 해제 | 완료 | 시작 전 | O |

## `/payment` — 결제

| Method | 프로토콜 | EndPoint | 설명 | 진행상황 | FE |
|---|---|---|---|---|---|
| POST | Solana Pay | `/solana-pay/qr` | 기여용 Solana Pay QR/딥링크 생성 | 완료 | 시작 전 |
| GET | Solana Pay | `/solana-pay/{ref}/status` | 결제 상태 조회 | 완료 | 시작 전 |
| POST | REST | `/contribute` | 기여 트랜잭션 확정·기록 | 시작 전 | 시작 전 |
| POST | x402 | `/paysh/micropay` | 에이전트 API 비용 micropay | 시작 전 | 시작 전 |
| GET | REST | `/paysh/usage` | micropay 사용 내역 | 시작 전 | 시작 전 |

## `/proof` — 증빙

| Method | EndPoint | 설명 | 진행상황 | FE | JWT |
|---|---|---|---|---|---|
| POST | `/quote` | 견적서 업로드 | 시작 전 | 시작 전 | O |
| POST | `/receipt` | 영수증 업로드 | 시작 전 | 시작 전 | O |
| GET | `/{id}` | 증빙 상세 | 시작 전 | 시작 전 | X |
| POST | `/{id}/verify` | 증빙↔지출 매칭 검증 (에이전트) | 시작 전 | 시작 전 | O |
| GET | `/certificate/{id}` | 증서 조회 | 시작 전 | 시작 전 | X |
| POST | `/certificate/mint` | cNFT 기여증서 발행 | 시작 전 | 시작 전 | O |

## `/settlement` — 정산

| Method | EndPoint | 설명 | 진행상황 | FE | JWT |
|---|---|---|---|---|---|
| GET | `/{campaignId}` | 정산 현황 | 완료 | 시작 전 | X |
| GET | `/{campaignId}/breakdown` | 기여자별 정산·환불 내역 | 시작 전 | 시작 전 | X |
| POST | `/{campaignId}/refund` | 환불 (기여 비율 일괄) | 진행 중 | 시작 전 | O |
| POST | `/{campaignId}/release` | 집행 (벤더 대금 지급) | 완료 | 시작 전 | O |

## `/agent` — AI 에이전트

| Method | 프로토콜 | EndPoint | 설명 | 진행상황 | FE | JWT |
|---|---|---|---|---|---|---|
| POST | REST | `/policy/evaluate` | 정책 판단 요청 | 완료 | 시작 전 | O |
| GET | REST | `/{campaignId}/decisions` | 에이전트 판단 로그 | 완료 | 시작 전 | X |
| POST | A2A | `/negotiate` | 벤더 에이전트와 협상 | 시작 전 | 시작 전 | O |
| POST | REST | `/audit` | 증빙 감사 실행 | 시작 전 | 시작 전 | O |
| POST | A2A | `/a2a/message` | A2A 메시지 송수신 | 시작 전 | 시작 전 | X |
| GET | REST | `/status` | 에이전트 크루 상태 대시보드 | 시작 전 | 시작 전 | O |

## `/webhook` — 콜백 (서버 수신용, 앱에서 호출하지 않음)

| Method | EndPoint | 설명 | 진행상황 |
|---|---|---|---|
| POST | `/onchain` | 온체인 이벤트 콜백 | 시작 전 |
| POST | `/solana-pay` | Solana Pay 결제 확인 콜백 | 시작 전 |
| POST | `/paysh` | pay.sh 콜백 | 시작 전 |

---

## 확인 필요

- 요청/응답 스키마가 원본 표에 없다. 각 행의 하위 페이지에 있을 가능성이 큼 — 연동 전에 확보할 것.
- `/users/me/certificates` — 원본에서 컬럼이 잘려 있어 정확한 경로 미확인.
- `/agent/status` — JWT 컬럼이 잘려 있어 O로 추정.
- 에러 응답 포맷, 페이지네이션 규약, 토큰 만료·재발급 흐름 미정의.
