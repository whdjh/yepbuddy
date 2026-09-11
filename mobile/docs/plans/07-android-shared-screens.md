# 07. Android 공용 UI·탭·조회 화면

> 상태: 대기
>
> 선행: [01](01-code-cleanup.md), [06](06-mobile-build.md)

## 목표와 범위

공용 표시·버튼과 앱 기본 구조를 먼저 맞추고 요약·세션·캘린더·프로틴 조회 화면에 적용한다. 화면 디자인을 하나의 일관된 PR로 검토할 수 있게 한다.

## 작업

- [ ] 지원 API·화면 크기·font scale 기준을 정하고 접근 가능한 전체 화면의 변경 전 캡처와 문제 목록을 만든다.
- [ ] Card·Button·IconButton·Chip의 크기·상태·최소 44px 터치 영역·접근성 라벨을 토큰에 맞춘다. Card 숫자 prop의 지원 값과 Spacer 14의 실제 표시 차이를 명확히 한다.
- [ ] 탭·헤더·SettingsFab·system bar·safe area를 정리하고 공용 UI를 요약·세션·캘린더에 적용한다.
- [ ] 프로틴 목록·상세의 카드·텍스트·이미지·터치 영역과 화면 이동을 정리한다.
- [ ] ko/en·light/dark·작은/큰 화면·큰 font scale의 변경 후 캡처를 비교하고 새로운 공용 패턴·토큰과 관련 기능서를 갱신한다.

## 완료 조건

- [ ] 기준/변경 후 캡처에서 잘림·대비·overflow와 주요 action 접근성을 확인한다.
- [ ] Android 실기기에서 탭·상세 이동·deep link·hardware back·스크롤·시스템 제스처 영역을 확인한다.
- [ ] 공용 UI의 기존 사용처와 iOS 디자인·기능에 회귀가 없고 기존 조회·저장 흐름이 유지된다.
- [ ] TypeScript·lint와 Android debug/release 빌드가 통과한다.

## 근거와 주의점

진입점: [shared UI 가이드](../../src/shared/README.md), [UI·토큰·레이아웃 가이드](../../.codex/ui-guide.md), [화면 기능서](../page/README.md).

일반 정적 UI는 NativeWind·기존 토큰을 우선한다. style·크기 지정은 native API와 부모 제약에 맞게 판단하고 실제 차이가 있을 때만 플랫폼 파일을 분리한다. 입력·설정·운동 복합 화면은 다음 PR에서 마무리한다.
