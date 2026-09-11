# 모바일 작업 계획

**문서 하나가 PR 하나**다. 작은 수정은 같은 기능·검증 흐름 안에 묶었다. 번호순으로 쉬운 정리부터 진행하며, 필수 선행 작업은 각 문서에 표시한다.

| 순서 | PR 범위 |
| --- | --- |
| [01](./01-code-cleanup.md) | 공통 코드·번역·의존성 정리 |
| [02](./02-screen-state-recovery.md) | 요약·조회·템포의 비동기 상태 복구 |
| [03](./03-workout-restore.md) | 루틴·현재 운동 저장과 복원 |
| [04](./04-stored-session-consistency.md) | 완료 기록·인덱스·메모 편집 정합성 |
| [05](./05-workout-completion-native.md) | 운동 완료·HealthKit·Live Activity 제어 |
| [06](./06-mobile-build.md) | 모바일 설치·빌드 기준 통일 |
| [07](./07-android-shared-screens.md) | Android 공용 UI·탭·조회 화면 |
| [08](./08-android-workout-forms.md) | Android 입력·설정·운동 화면 |
| [09](./09-android-notifications.md) | 알림 실패 복구·Android 운동 알림 |
| [10](./10-icloud-settings-backup.md) | iPhone 보존 계약과 iCloud 설정 백업 |
| [11](./11-healthkit-record-preservation.md) | HealthKit 운동 기록 보존과 기존 이력 전환 |
| [12](./12-iphone-auto-restore.md) | iPhone 자동 복원과 상태 화면 |

각 문서의 작업·완료 조건을 체크하고, 진행할 때 상태를 `진행 중`, 검증을 마치면 `완료`로 바꾼다. 실행한 명령·기기·결과와 남은 제약은 해당 문서 끝에 짧게 기록한다. 필요한 코드 근거와 설계 조건도 각 계획 안에서 관리한다.

공통 코드·화면 상태·저장·완료 흐름을 먼저 정리하고 Android 화면·알림, iPhone 보존·복원을 이어간다. Android 작업은 iPhone 복원의 기술적 선행 조건이 아니다.

## 공통 검증

명령은 `mobile/` 기준이며, 구현 시점의 `package.json`과 `scripts/`를 확인한다.

| 변경 | 검증 |
| --- | --- |
| TypeScript/TSX | `bunx tsc --noEmit --pretty false`, `bun run lint` |
| Workout config plugin | `node scripts/check_workout_session_plugin.cjs` |
| Live Activity/widget | `node scripts/check_dynamic_island_widget.js` |
| 문서 | 참조 경로·선행 관계 확인, `git diff --check` |

각 PR에 필요한 실패 재현·화면·실기기 검증을 함께 끝낸다. 감사 때의 타입·lint 통과를 수정 후 검증으로 대신하지 않는다. widget 검사의 오래된 경로는 05에서 고치며, 빌드·실기기 결과가 없는 상태를 운영 완료로 표시하지 않는다.

기존 저장 키·구버전 호환·알림 식별자·native 계약을 보존하고, 바뀐 동작은 [화면 기능서](../page/README.md)에 반영한다. 코드·UI 규칙은 [프로젝트 지침](../../AGENTS.md)을 따른다.
