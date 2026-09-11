# 08. Android 입력·설정·운동 화면

> 상태: 대기
>
> 선행: [04](04-stored-session-consistency.md), [05](05-workout-completion-native.md), [07](07-android-shared-screens.md)

## 목표와 범위

공용 입력·modal·bottom sheet를 정리하고 설정·운동 진행·결과 편집에 적용한다. 같은 입력·저장·닫기 동작을 사용하는 화면을 한 PR로 묶는다.

## 작업

- [ ] 입력·textarea·stepper의 focus·disabled·키보드·터치 영역과 modal/bottom sheet의 radius·dim·safe area·닫기 동작을 맞춘다.
- [ ] 현재 접근 가능한 설정 화면에 적용한다. 루틴 sheet의 플랫폼 prop은 좁게 모으되 공통 draft·저장 로직을 복제하지 않는다.
- [ ] countdown·운동 진행·결과·편집 화면의 정보 배치와 주요 action을 정리한다. drawer/ActiveContent의 여백 계산은 같은 배치 책임 안에 모은다.
- [ ] 결과 화면·심박 차트의 중복 iOS 조건은 유효 샘플 기준으로 줄이고 실제 HealthKit 가용성 guard는 유지한다.
- [ ] 키보드가 열린 상태의 스크롤·hardware back·deep link·화면 이탈을 확인한다. 전 PR의 조회 화면까지 포함해 전체 Android 캡처·남은 예외를 대조하고 기능서를 갱신한다.

## 완료 조건

- [ ] ko/en·light/dark·화면 크기·font scale 조합에서 입력·저장·취소·닫기 action에 접근할 수 있다.
- [ ] Android 실기기에서 시작·pause/resume·완료·메모/세트 편집·설정 저장·권한·overlay 동작을 확인한다.
- [ ] 디자인 변경 전후 기록·이동·권한 흐름과 iOS 공용 사용처가 유지된다. 지도 플랫폼 파일과 기존 디자인 경계를 보존한다.
- [ ] TypeScript·lint·Android debug/release 빌드가 통과하고 전체 접근 가능 화면의 비교 증거를 남긴다.

## 근거와 주의점

진입점: [설정](../page/08_settings.md), [운동](../page/05_workout.md), [결과](../page/02_result.md), [루틴 sheet](../../src/features/manage-settings/ui/RoutineCycleSettingsSheet.tsx).

일반 정적 UI는 기존 NativeWind·토큰을 사용하고 플랫폼별 여백은 실제 부모·스크롤 경계를 따른다. 새 건강 SDK·백업 메뉴·숨김 화면 리팩터링은 포함하지 않는다.
