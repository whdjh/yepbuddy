# 03. 루틴·현재 운동 저장과 복원

> 상태: 대기
>
> 선행: 없음

## 목표와 범위

루틴·현재 운동 저장값을 검증하고, 앱을 다시 열어도 동일 세션과 사용자가 선택한 부위·세트를 유지한다. 루틴 진행 상태의 중복 원천도 이 저장 계약 안에서 정리한다.

## 작업

- [ ] 루틴·현재 snapshot의 저장 키·형식·phase별 필수 필드를 조사하고 정상·구버전·손상·읽기 실패 fixture를 만든다.
- [ ] 루틴 sessions·part·회차와 현재 운동 날짜·수치·배열·phase를 runtime parser로 검증한다. 손상과 일시적 읽기 실패를 구분하고 원본을 빈 상태로 덮어쓰지 않는다.
- [ ] 읽기 실패가 무한 로딩에 머물지 않게 한다. hydration 전 countdown·시작을 차단하고 복원 후 recording/paused 상태의 재시작도 막는다.
- [ ] debounce write·clear·cleanup 순서를 보장해 삭제한 snapshot을 늦은 쓰기가 되살리지 않게 한다.
- [ ] 새 운동의 첫 추천과 복원·재진입을 구분한다. 이미 선택한 부위·세트는 유지하고 명시적인 슬롯 변경만 반영한다.
- [ ] 루틴 progress의 실제 표시 원천을 하나로 맞추고 효과 없는 중복 저장·반복 액션 처리를 줄인다. 대체 완료·슬롯 선택·주기별 사용자 선택을 보존한다.
- [ ] 홈과 countdown의 현재 하루 운동 제한 차이는 기능서에 기록한다. 제한을 임의로 강화하거나 해제하지 않는다.

## 완료 조건

- [ ] 부위·세트·메모를 바꾼 recording/paused 운동을 강제 종료한 뒤 같은 값으로 복원한다. 복원 전후 중복 시작이 기존 세션을 덮지 않는다.
- [ ] 손상·구버전·read 실패·write/clear 경합에서 유효한 기록과 루틴 선택이 남고 재시도할 수 있다.
- [ ] 새 운동 추천·직접 슬롯 변경·루틴 대체 완료·재시작 결과가 유지된다.
- [ ] TypeScript·lint와 저장·상태 전이 검증이 통과하고 양 플랫폼의 실제 복원을 확인한다.

## 근거와 주의점

진입점: [현재 저장소](../../src/entities/workout-session/model/currentWorkoutStorage.ts), [persistence](../../src/entities/workout-session/model/useWorkoutPersistence.ts), [루틴 저장소](../../src/entities/workout-session/model/routineCycleStorage.ts), [추천 선택](../../src/features/do-workout/ui/RoutineSessionPicker.tsx).

기존 키·legacy 형식·루틴 사용자 선택을 보존한다. 범용 schema/migration 엔진은 만들지 않는다. 완료 본문과 남은 snapshot을 대조하는 처리는 운동 완료 PR에서 연결한다.
