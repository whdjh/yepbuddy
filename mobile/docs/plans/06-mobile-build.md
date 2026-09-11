# 06. 모바일 설치·빌드 기준 통일

> 상태: 대기
>
> 선행: [05](05-workout-completion-native.md)

## 목표와 범위

로컬 설치와 실제 EAS 배포의 의존성 차이를 해소하고, 재현 가능한 모바일 설치·native 생성·빌드 기준을 남긴다.

## 작업

- [ ] EAS 실제 설치 로그와 로컬 실행 경로를 확인한다. react-native-health 하위 config-plugin의 모바일 lock/루트 override 차이를 대조한다.
- [ ] 기존 HealthKit override 의도를 유지하면서 모바일의 설치 방법·lockfile·EAS 설정을 일치시킨다. 사용자 package 변경을 덮어쓰지 않는다.
- [ ] 깨끗한 별도 작업 공간에서 고정 lock 설치와 설치 버전을 비교하고 타입·lint·두 계약 검사를 실행한다.
- [ ] plugin 반복 적용과 clean prebuild에서 Xcode source/target/dependency/embed의 의미상 중복 여부를 확인한다.
- [ ] Android debug/release와 iOS simulator 빌드 결과를 남기고 실제 명령·환경·제약을 관련 가이드에 반영한다.

## 완료 조건

- [ ] 모바일 로컬·배포의 필요한 의존 버전이 같고 깨끗한 설치를 재현할 수 있다.
- [ ] 타입·lint·기존 계약 검사, 반복 plugin 적용과 clean prebuild, 해당 Android/iOS 빌드가 통과한다.
- [ ] 미실행 기기 검증과 기존 실패를 구분한다. 각 기능 PR의 검증을 이 PR로 미루거나 이미 검증한 조합을 이유 없이 반복하지 않는다.

## 근거와 주의점

진입점: [모바일 package](../../package.json), [EAS](../../eas.json), [루트 package](../../../package.json), [workout plugin](../../plugins/with-workout-session.js).

감사 당시 두 lock 경로의 config-plugin 버전 차이를 확인했지만 실제 EAS 실패는 확인하지 않았다. 로그로 기준을 정한다. web/worker까지 패키지 매니저를 바꾸거나 생성 파일의 UUID까지 byte 일치를 요구하지 않는다.
