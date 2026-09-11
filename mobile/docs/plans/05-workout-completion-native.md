# 05. 운동 완료·HealthKit·Live Activity 제어

> 상태: 대기
>
> 선행: [03](03-workout-restore.md), [04](04-stored-session-consistency.md)

## 목표와 범위

앱과 Live Activity가 같은 완료 흐름을 사용하도록 정리한다. 로컬 저장 성공, snapshot 정리, native 종료와 결과 이동의 책임을 맞춰 실패·재실행에도 이전 운동이 새 운동을 건드리지 않게 한다.

## 작업

- [ ] 본문 저장 성공을 완료 기준으로 삼고 snapshot 삭제 실패와 분리해 성공 세션을 반환한다. 재시작 시 같은 ID의 완료 본문이 있으면 현재 운동으로 되살리지 않는다.
- [ ] 완료 처리의 라우팅 소유자를 하나로 정하고 중복 액션을 잠근다. native·캘린더 지연/실패가 성공 결과를 가리거나 무기한 대기시키지 않게 한다.
- [ ] 늦은 UUID·지표 병합은 sessionId로 연결하고 결과를 갱신한다. 이전 후처리·화면 이동이 새 운동에 적용되지 않게 한다.
- [ ] recording뿐 아니라 paused 복원에서도 기존 HealthKit 세션에 연결한다. pause 상태를 유지하며 즉시 완료·폐기의 소유권과 legacy fallback을 확인한다.
- [ ] Live Activity 명령 묶음을 reducer로 순서대로 적용한 최종 상태로 완료한다. finish 생성 시각을 전달하되 paused 상태의 기존 pausedAt 우선 정책은 유지한다.
- [ ] 실패한 finish를 잃지 않는 확인·재시도 계약을 두고 오래된 세션·중복 명령을 정리한다.
- [ ] widget 검사가 실제 `useWorkoutLiveActivity`의 심박 전달과 context 연결을 보도록 오래된 경로를 고친다. 운동·결과·알림 기능서와 변경된 native 계약을 함께 맞춘다.

## 완료 조건

- [ ] clear 실패에도 저장된 결과를 반환하며 홈 중간 노출·두 번 이동·완료 본문 덮어쓰기가 없다.
- [ ] HealthKit·캘린더 지연/실패와 완료 중 새 운동 시작에서 이전 세션의 종료·UUID·지표가 새 세션에 섞이지 않는다.
- [ ] iPhone의 paused 복원→즉시 완료/폐기, native 세션 유무·recovery 실패·권한 거부에서 로컬 기록과 원 세션 소유권을 확인한다.
- [ ] pause→finish, resume→startCardio→finish, 지연 소비·저장 실패 후 재시도에서 올바른 상태·시각으로 한 번 저장한다.
- [ ] TypeScript·lint·두 native 계약 검사가 통과한다. 심박 전달/훅 연결을 제거한 대역에서는 검사가 실패한다. 변경한 native 빌드와 실제 잠금화면·백그라운드 제어를 확인한다.

## 근거와 주의점

진입점: [완료 훅](../../src/entities/workout-session/model/useWorkoutCompletion.ts), [운동 화면](../../src/features/do-workout/ui/ActiveWorkoutContent.tsx), [HealthKit 연결](../../src/features/do-workout/lib/useHealthKitWorkout.ts), [Live Activity](../../src/entities/workout-session/model/useWorkoutLiveActivity.ts).

모든 캘린더·알림·주소 보강을 영속 작업 엔진으로 만들지 않는다. 로컬 저장의 중복 방지와 외부 OS 기록 중복은 별도로 검증한다. 타이머와 결과 duration의 시간 의미도 pause→resume→완료 흐름에서 대조한다.
