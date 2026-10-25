# 모바일 작업 계획

**문서 하나가 PR 하나**다. 현재 작업 후보는 01과 07만 유지한다. 01을 우선 진행하고, 07은 Android 지원 방향을 정한 뒤 착수한다.

| 순서 | PR 범위 |
| --- | --- |
| [01](./01-code-cleanup.md) | 공통 코드·번역·의존성 정리 |
| [07](./07-android-shared-screens.md) | Android 공용 UI·탭·조회 화면 |

각 문서의 작업·완료 조건을 체크하고, 진행할 때 상태를 `진행 중`, 검증을 마치면 `완료`로 바꾼다. 실행한 명령·기기·결과와 남은 제약은 해당 문서 끝에 짧게 기록한다. 필요한 코드 근거와 설계 조건도 각 계획 안에서 관리한다.

제외한 작업은 실제 오류나 사용자 불편이 확인되거나 해당 기능이 필요해질 때 다시 검토한다. 현재 계획의 선행 작업으로 요구하지 않는다.

## 공통 검증

명령은 `mobile/` 기준이며, 구현 시점의 `package.json`과 `scripts/`를 확인한다.

| 변경 | 검증 |
| --- | --- |
| TypeScript/TSX | `bunx tsc --noEmit --pretty false`, `bun run lint` |
| Workout config plugin | `node scripts/check_workout_session_plugin.cjs` |
| Live Activity/widget | `node scripts/check_dynamic_island_widget.js` |
| 문서 | 참조 경로·선행 관계 확인, `git diff --check` |

각 PR에 필요한 실패 재현·화면·실기기 검증을 함께 끝낸다. 감사 때의 타입·lint 통과를 수정 후 검증으로 대신하지 않는다. 빌드·실기기 결과가 없는 상태를 운영 완료로 표시하지 않는다.

기존 저장 키·구버전 호환·알림 식별자·native 계약을 보존하고, 바뀐 동작은 [화면 기능서](../page/README.md)에 반영한다. 코드·UI 규칙은 [프로젝트 지침](../../AGENTS.md)을 따른다.
