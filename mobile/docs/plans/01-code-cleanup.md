# 01. 공통 코드·번역·의존성 정리

> 상태: 대기
>
> 선행: 없음

## 목표와 범위

작동 방식은 유지하면서 번역 누락, 미사용 코드, 공개 API 우회와 공용 코드의 잘못된 책임을 한 PR에서 정리한다.

## 작업

- [ ] 영어 루틴 완료 버튼 두 개를 추가하고 탭의 한국어 상수를 기존 번역 키로 바꾼다.
- [ ] 소비처를 확인한 뒤 미사용 워치 provider·센서 선택 함수, `useLatestSession`, 요약 이동 helper·export를 삭제한다. 월별 조회 파일은 사용 중인 loader만 남기고 이름을 맞춘다.
- [ ] drawer의 항상 true인 종료 helper·고정 tone 분기와 프로틴 탭의 고정 flag를 제거한다. 완료 처리 중 잠금과 pause/resume 표시는 보존한다.
- [ ] app의 feature 내부 import 16건을 기존 공개 API로, 같은 `do-workout` 내부 alias 3건을 상대 경로로 맞춘다.
- [ ] `SettingsFab` 이동 책임을 app/설정 feature에 두고 운동 부위 라벨 함수는 `workout-session`에 모은다. 루틴 앵커는 기존 로컬 날짜 함수로 정리한다.

## 완료 조건

- [ ] ko/en 키·placeholder가 일치하고 탭·루틴 안내, 요약 편집·월별 조회·drawer·설정 이동이 유지된다.
- [ ] 삭제한 API의 잔여 사용처와 새 런타임 순환이 없으며 공개 API·슬라이스 경계를 지킨다.
- [ ] TypeScript·lint가 통과하고 변경된 화면을 양 플랫폼에서 확인한다.

## 근거와 주의점

진입점: [shared](../../src/shared/README.md), [FSD 규칙](../../.codex/fsd-architecture.md), [features](../../src/features/README.md), [탭](../../src/app/(tabs)/_layout.tsx).

저장된 source·카드 ID·legacy 형식과 native payload는 사용처 없는 코드와 구분해 보존한다. 200줄을 넘었다는 이유만으로 파일을 나누지 않는다. 상수 Context·요약 wrapper는 다음 화면 상태 PR에서 함께 정리한다.
