# 10. iPhone 보존 계약과 iCloud 설정 백업

> 상태: 대기
>
> 선행: [04](04-stored-session-consistency.md), [05](05-workout-completion-native.md), [06](06-mobile-build.md)

## 목표와 범위

같은 Apple 계정의 iPhone 재설치·새 iPhone에서 운동과 설정을 복원할 데이터 계약을 정하고, 일반 설정의 iCloud 자동 보존까지 구현한다. 운동 기록 저장·전환은 [11번](./11-healthkit-record-preservation.md), 자동 복원·설정 상태 화면은 [12번](./12-iphone-auto-restore.md)에서 연결한다.

옙버디 로그인·백업용 서버 API/DB·수동 파일 선택을 추가하지 않는다. 건강정보는 HealthKit에 정상 저장하고 Apple 건강의 동기화를 이용한다. 건강정보가 없는 일반 설정만 앱 전용 iCloud 문서 컨테이너에 보존한다. 기존 프로틴 조회용 Supabase는 변경 대상이 아니다.

필요한 OS 건강 접근 권한을 허용한 뒤 자동으로 보존·복원한다. 권한 요청까지 생략되는 복원을 약속하지 않는다. iPhone ↔ Android 이전과 Android 백업은 후속 설계이며, 두 플랫폼의 기존 로컬 운동 기록은 계속 가능해야 한다.

| 데이터 | 보존·복원 방향 | 구현 전에 확인할 조건 |
| --- | --- | --- |
| 운동 종류·시작·종료·활동 시간 | HealthKit 운동 저장·재조회 | 실제 일시정지·종료 시간과 앱 표시값의 차이 |
| 심박수·활동/총 칼로리·평균 심박수 | 건강 샘플·통계 재조회, 로컬 요약 재생성 | 미수집·미동기화·접근 제한을 구분하고 다른 운동의 샘플로 대체하지 않음 |
| 세션 ID·부위·세트·메모·유산소 시작·디로딩·루틴 대체 정보 | 운동에 부속된 HealthKit 메타데이터 후보 | 필드 의미·자료형·크기·버전·revision·수정/삭제 API와 심사 해석은 미확정 |
| 루틴 구성·진행·주기별 사용자 선택 | 일반 설정과 운동 관련 상태를 분리하고 가능한 값은 운동에서 재계산 | 재계산할 수 없는 선택의 보존 위치는 미확정. 루틴 전체를 일반 설정으로 취급하지 않음 |
| 운동 위치·자동 학습 장소·장소 삭제 선택 | 운동 관련 정보로 검토하고 보존 원본에서 재구성 | 보존 경로와 재학습 제외 등 삭제 의도 유지 방법은 미확정. 단일 좌표를 가짜 이동 경로로 만들지 않음 |
| 건강정보가 없는 일반 설정 | iCloud 앱 전용 문서 컨테이너의 버전 있는 파일 | 실제 키·필드 allowlist, 알림·캘린더 선호값과 OS 허가 상태의 구분 |
| 날짜 인덱스·표시 캐시·알림/캘린더 ID·geofence 상태 | 백업 본문에서 제외하고 필요한 상태만 재구성 | 과거 캘린더 재등록·완료 알림 재발송·중복 geofence 등록 금지 |
| 진행 중 운동 스냅샷 | 기존 로컬 복구 유지 | 삭제·기기 교체 후 진행 중 네이티브 운동 재개는 제외 |
| OS 권한·인증 상태·기기/푸시 토큰 | 복사하지 않고 현재 기기에서 확인 | 저장값만으로 건강·알림·캘린더·위치 권한을 허용 처리하지 않음 |

메타데이터·루틴·위치의 보존 방법은 구현으로 검증되지 않았다. 지원할 수 없는 항목은 대안과 범위 변경을 명시하며, 누락한 채 전체 복원이 가능하다고 선언하지 않는다.

## 작업

- [ ] 저장 키·실제 타입을 조사해 표의 포함·제외·미확정 항목, 세션 ID·소유권·버전·revision·수정/삭제 충돌 규칙을 확정한다. 기존 로컬 키·포맷은 유지한다.
- [ ] HealthKit 신규 저장·재조회·기존 운동 수정/삭제·실제 재설치 조회를 작은 구현으로 검증한다. UUID 변경·심박수 연결·중복 여부와 필드별 제약을 기록한다.
- [ ] 루틴 진행·사용자 선택·위치·장소 삭제 의도의 보존 또는 재계산 경로를 확정한다. API 지원과 심사 허용을 구분하고 미지원 대안·확인이 필요한 해석을 남긴다.
- [ ] 일반 설정 파일의 allowlist·버전·migration·갱신 정보·무결성·충돌·손상 처리와 계정별 출처 관리 계약을 정한다. 저장소 전체를 덤프하지 않는다.
- [ ] iCloud 문서 capability·container·서명을 구성하고 사용자 폴더 선택 없이 같은 계정의 설정 파일을 찾도록 한다. 개발·배포 빌드에서 접근을 확인한다.
- [ ] 파일 조회·검증 경로와 허용된 설정 변경 후 자동 저장을 연결한다. 새 설치에서는 기존 파일 확인 전에 기본값을 업로드하지 않으며 조회 실패·다운로드 대기를 파일 없음과 구분한다.
- [ ] 오프라인·용량 부족·손상·충돌·구버전을 처리하고 마지막 유효 데이터·로컬 변경을 유지하며 재시도한다. 앱 종료 뒤 정해진 시각의 주기 작업이나 시스템 간 원자적 transaction을 가정하지 않는다.
- [ ] 계정 변경 시 이전 계정의 대기 쓰기·파일 참조·출처를 분리하고, 예전 기기 재연결이 최신 설정을 덮어쓰지 않게 한다. 로컬 문서 쓰기와 확인 가능한 업로드 상태를 구분해 후속 복원에 제공한다.

## 완료 조건

- [ ] 표의 모든 데이터에 저장 위치·제외/재구성 방법·미지원 처리와 근거가 있고, 메타데이터·설정의 정상·누락·손상·구버전·미지원 버전 검증이 통과한다.
- [ ] 실제 iPhone의 최소 HealthKit 검증에서 값·UUID·심박수 연결·수정/삭제·재설치 조회를 확인하고, 확인하지 못한 조건은 구현 가능으로 표시하지 않는다.
- [ ] iCloud 설정 파일에 건강정보·원본 좌표·자유 메모·기기 토큰·OS 권한이 없고, 초기 기본값·조회 실패·다운로드 대기로 기존 설정이 유실되지 않는다.
- [ ] 같은 계정의 재설치·다른 iPhone에서 설정 파일을 조회하고, 오프라인·용량 부족·충돌·재시도·계정 전환·구형 기기 재연결을 확인한다. 이전 계정 데이터가 새 계정에 업로드되지 않는다.
- [ ] 개발 빌드와 TestFlight/배포 구성에서 iCloud entitlement·container 접근을 확인한다. 설정 파일 저장 시각이나 HealthKit 로컬 저장 성공을 전체 운동 동기화 완료로 취급하지 않는다.
- [ ] `bunx tsc --noEmit --pretty false`, `bun run lint`와 변경한 native/plugin의 계약 검사·빌드를 실행하고 실제 기기·명령·미검증 항목을 남긴다.

## 근거와 주의점

현재 저장 구조는 [완료 저장소](../../src/entities/workout-session/model/storedWorkoutSessionStorage.ts), [세션 타입](../../src/entities/workout-session/model/types.ts), [HealthKit API](../../src/entities/workout-session/api/healthKit.ts), [네이티브 완료 처리](../../plugins/ios/workout-session/LiveWorkoutSessionController.swift)에서 확인한다. 전체 AsyncStorage의 기기 백업을 켜서 위 설계를 대체하지 않는다.

아래는 2026-09-09 설계에서 확인한 공식 근거다. 이 기록은 현재 기능 구현·기기 동기화·심사 통과 증거가 아니며, 실제 구현 전에 사용하는 API와 불명확한 필드의 해석을 확인한다.

- [App Review 5.1.3(ii)](https://developer.apple.com/app-store/review/guidelines/#health-and-health-research)의 개인 건강정보 iCloud 저장 제한에 따라 완료 세션 전체를 앱의 iCloud 파일·CloudKit에 복사하는 설계를 채택하지 않는다.
- [Apple Developer Program License Agreement](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)의 건강정보·iCloud/CloudKit 관련 조항을 함께 확인한다. 암호화·개인 컨테이너·사용자 동의만으로 예외를 가정하지 않는다.
- [건강 앱 개인정보 안내](https://www.apple.com/legal/privacy/data/en/health-app/)의 Apple 건강 동기화와 앱이 자기 저장소에 건강정보를 복제하는 경로를 구분한다.
- [HealthKit Metadata Keys](https://developer.apple.com/documentation/healthkit/metadata-keys)는 운동 부속 메타데이터의 기술 근거이며 앱 전체 백업이나 모든 필드의 심사 허용 근거는 아니다.
- [HealthKit 접근 권한](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data)에 따라 빈 조회만으로 읽기 거부·데이터 삭제를 확정하지 않는다.
- [iCloud 문서 동기화](https://developer.apple.com/documentation/uikit/synchronizing-documents-in-the-icloud-environment)를 일반 설정 보존 경로로 사용하며 기기의 iCloud 계정·사용 가능 상태를 확인한다.
- [암호화된 개인 CloudKit 저장에 관한 Apple 직원 답변](https://developer.apple.com/forums/thread/838493)은 허용 판정 없이 App Review 상담을 안내한다. 세트·메모·루틴·위치의 불명확한 해석을 확정된 허용으로 기록하지 않는다.
