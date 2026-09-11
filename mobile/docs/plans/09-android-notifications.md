# 09. 알림 실패 복구·Android 운동 알림

> 상태: 대기
>
> 선행: [03](03-workout-restore.md), [05](05-workout-completion-native.md), [06](06-mobile-build.md)

## 목표와 범위

기존 알림의 취소·초기화 실패를 먼저 고치고, 같은 알림 경계에 Android 운동 상태 표시와 pause/resume/finish 제어를 연결한다. 알림을 쓸 수 없어도 앱 안의 운동 기록은 정상 동작해야 한다.

## 작업

- [ ] 운동 리마인더·프로틴 예약의 취소 실패 ID를 보존한다. 미취소 예약을 새 ID로 덮어쓰지 않고 재예약·동시 sync 중복을 막는다.
- [ ] 앱 시작/설정 변경에서 앱 소유 kind의 저장 ID와 OS 예약을 대조한다. 채널 하나의 실패가 운동 장소·리마인더·프로틴의 독립 초기화를 차단하지 않게 한다.
- [ ] 운동 snapshot의 session ID·상태·시작 시각·누적 pause 시간과 command의 ID·종류·생성 시각·ack 계약을 정한다.
- [ ] 저소음 channel과 system chronometer로 운동 상태를 표시하고 같은 notification ID로 갱신한다. 완료/폐기 때 제거하고 본문 탭은 `/workout/active`를 연다.
- [ ] 기록 중 pause·finish, 일시정지 중 resume·finish action을 explicit receiver·고유 request code·적절한 PendingIntent로 연결한다. receiver는 표시를 즉시 갱신하고 명령을 native 저장소에 보존한다.
- [ ] hydration 뒤 명령을 시간순으로 적용하고 성공 뒤 ack한다. 저장 실패는 재시도하고 오래된/완료된 세션과 중복 명령을 정리한 뒤 알림을 동기화한다.
- [ ] Kotlin 원본·bridge를 `plugins/android/`에 두고 config plugin으로 source·receiver·manifest를 반복 생성할 수 있게 한다. 설정 표시·운동·알림 기능서와 프로틴 알림 저장 설명을 갱신한다.

## 완료 조건

- [ ] 취소 실패 뒤 OFF·재시도, 새 예약 후 ID 저장 실패·동시 sync에서도 추적 ID를 잃거나 중복 예약하지 않는다. 하나의 채널/도메인 실패가 다른 초기화를 막지 않는다.
- [ ] command 정규화·세션 일치·시간순 적용·중복 제거·성공 후 ack·실패 재시도와 plugin 반복 실행·manifest 계약 검사가 통과한다.
- [ ] Android 13 이상 실기기의 권한 허용/거부·channel 비활성화·foreground/background·잠금·프로세스 재생성에서 앱과 알림 상태·시간이 일치한다.
- [ ] 종료는 한 번 저장되고 재실행 후 알림이 되살아나지 않는다. 예전 세션의 action이 현재 운동을 바꾸지 않으며 기존 iOS 알림도 유지된다.
- [ ] TypeScript·lint·Android debug/release 빌드가 통과하고 실기기 증거를 남긴다.

## 근거와 주의점

진입점: [알림 기능서](../page/07_notification.md), [운동 기능서](../page/05_workout.md), [리마인더](../../src/entities/workout-session/lib/reminder.ts), [프로틴 scheduler](../../src/entities/protein/lib/protein-sale-notification/scheduler.ts), [plugin 가이드](../../plugins/README.md).

foreground service·Health Connect·심박/칼로리 표시·최신 버전 전용 promoted UI·알림에서 메모/세트 편집은 제외한다. 프로세스를 즉시 깨워 저장하는 headless 작업은 추가하지 않으며, 즉시 알림 갱신과 앱 복구 뒤 완료 저장을 구분한다.
