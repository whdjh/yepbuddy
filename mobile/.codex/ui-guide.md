# YepBuddy UI 가이드

컴포넌트 조합, 토큰, 레이아웃을 바꾸는 작업에서 해당 절만 참고한다. 경로는 `mobile/` 기준이며, 실제 props와 플랫폼별 동작은 사용하는 컴포넌트의 구현에서 확인한다. 공용 코드의 책임 경계가 불분명할 때는 [Shared 가이드](../src/shared/README.md)를 참고한다.

## 컴포넌트와 조합

| 용도 | `src/shared/ui/`의 구현 | 확인할 계약 |
| --- | --- | --- |
| 화면 컨테이너 | `Main.tsx` | 상단 safe-area 적용; 하단 여백은 화면에서 처리 |
| 버튼 | `Button.tsx` | `primary`, `accent`, `outline`, `ghost`, `danger`, `glass`; `label`, `onPress` |
| 카드 | `Card.tsx`, `Card.android.tsx` | `default`, `subtle`, `glass`; `Card.*` 조합과 플랫폼 차이 |
| 상태 배지 | `Badge.tsx` | `level: low/mid/high`, `label`; semantic status 색상 |
| 선택 칩·필터 | `Chip.tsx` | `Chip`, `FilterPill`; `variant`로 상태 표현 |
| 아이콘 버튼 | `IconButton.tsx` | `back-square`, `back-round`, `adjust`, `glass`, `edit`; 접근성 라벨 |
| 아이콘 컨테이너 | `IconBox.tsx` | `size: sm/md/lg/xl`, children |
| 여러 줄 입력 | `GlassTextarea.tsx` | `value` 또는 `defaultValue`, `onChangeText`, `editable`, `minHeight` |
| 숫자 증감 | `Stepper.tsx` | `value`, `min/max`, 증감 콜백, 선택적 jump controls |
| 원형 진행률 | `RingProgress.tsx` | 숫자 `size`, `strokeWidth`, `progress`, 중앙 `children` |
| 통계 카드 | `StatCard.tsx` | 라벨, 선택적 부제, 값·단위의 카드 조합 |
| 공용 아이콘 | `SymbolView.tsx` | iOS symbol과 Android 표시 방식 |
| 글래스 표면 | `GlassSurface.tsx`, `GlassBackground.tsx`, `GlassCircleBackground.tsx` | 미지원 기기·투명도 감소 설정의 fallback |

- 공용 UI는 `@/shared/ui/Button`처럼 파일 경로로 import한다. `shared/index.ts`나 `shared/ui/index.ts`를 추가하지 않는다.
- 표에 없는 컴포넌트는 실제 구현을 검색한다. 과거 계획의 `Input`, `Textarea`, `NumberInput`, `PillNav`, `CalendarCell`, `BottomDrawer`를 현재 shared export로 가정하지 않는다. 운동 drawer는 `src/features/do-workout/ui/WorkoutDrawer.tsx`, 탭은 `src/app/(tabs)/_layout.tsx`에 있다.
- iOS `Card.*`는 SwiftUI 부품으로 `Card variant="glass"` 내부에서 조합한다. 일반 RN `View`에 직접 넣지 않는다. 공용 API 변경은 `Card.android.tsx`에도 반영되는지 확인한다.
- `RingProgress.size`는 숫자이며 문자열 preset이나 `label` prop은 현재 API가 아니다.
- 화면 전용 상태·동작은 feature에 두고 공용 UI에는 값과 콜백을 전달한다. 새 공용 API는 실제 사용처가 요구하는 범위로 제한한다.

## 토큰과 테마

토큰 JSON의 설계와 런타임 매핑은 자동으로 일치하지 않는다. 값이 다르면 해당 경로에서 설계 의도와 현재 동작을 구분하며, 화면을 오래된 JSON 값에 임의로 맞추지 않는다.

| 파일 | 역할 |
| --- | --- |
| `src/tokens/primitive.json` | 색상·폰트·간격·크기 원천 값 |
| `src/tokens/semantic.json` | 용도·light/dark·타이포그래피·레이아웃 설계 |
| `src/tokens/component.json` | 컴포넌트별 토큰 조합 설계 |
| `tailwind.config.js` | NativeWind 클래스 이름과 값 매핑 |
| `src/global.css` | 런타임 light/dark 및 운동 화면 CSS 변수 |
| `src/shared/lib/designTokens.ts` | primitive export, semantic/status/card 색상과 fallback |
| `src/shared/hooks/useResolvedColorToken.ts`, `useCardColors.ts` | 네이티브 prop용 실제 색상 문자열 |

- `src/app/_layout.tsx`의 루트 `dark` 클래스와 `src/global.css`의 `:root`·`.dark`가 테마를 결정한다. 카운트다운·운동 화면의 `workout-mode` override는 `.dark .workout-mode`에 있으므로 운동 화면을 항상 다크로 가정하지 않는다.
- 일반 RN 정적 스타일은 NativeWind `className`과 `yb-*` 토큰을 사용한다. safe-area, 측정값, 애니메이션, SwiftUI/Skia/SVG, className을 받지 않는 API에는 필요한 `style`·modifier·prop을 사용한다.
- `placeholderTextColor`, SVG stroke, SwiftUI 색상에는 `var(--yb-*)`를 넘기지 않고 `useResolvedColorToken()` 또는 `useCardColors()`로 실제 색상을 구한다. 단일 고정 accent가 필요한 외부 API에는 `appAccentColor`를 사용할 수 있다.
- 앱 소스의 `primitive.json` 직접 import는 `src/shared/lib/designTokens.ts`에 모은다. 호출부는 `primitiveColors`, `primitiveSpacing` 등 기존 export를 사용한다.
- 상태색은 primitive 색상을 조합하기보다 `yb-status-*`를 사용한다. 기존 `Badge`·`Button`으로 표현되는 색상 분기를 중복 구현하지 않는다.

| 용도 | 클래스 예 |
| --- | --- |
| 배경·표면 | `bg-yb-bg`, `bg-yb-surface`, `bg-yb-surface-muted` |
| 텍스트 | `text-yb-fg`, `text-yb-fg-secondary`, `text-yb-fg-disabled` |
| 강조 | `bg-yb-accent` + `text-yb-on-accent` |
| 강한 채움 | `bg-yb-fill-strong` + `text-yb-on-strong` |
| 위험 액션 | `bg-yb-status-error` + `text-yb-on-danger` |
| 성공 상태 | `bg-yb-status-success-bg` + `text-yb-status-success-text` |
| 테두리 | `border-yb-border`, `border-yb-glass-border` |
| 운동 drawer | `bg-yb-drawer-bg`, `text-yb-drawer-fg` |

새 토큰은 반복 용도나 테마 의미가 있을 때 추가한다. 토큰 변경 시 JSON 설계·Tailwind 매핑·CSS 변수·네이티브 fallback 중 영향받는 경로와 light/dark·운동 화면 override를 확인한다.

## 레이아웃과 접근성

수치는 React Native 논리 단위이며 Tailwind 설정에서는 `px`로 표현된다. 화면 기능서나 실제 컴포넌트 variant에 구체적인 값이 있으면 그 요구를 따른다.

| 용도 | 기본값 | 클래스 |
| --- | --- | --- |
| 화면 좌우 패딩 | 20 | `px-yb-5` |
| 카드 내부 패딩 | 24 | `p-yb-6` |
| 내부 그룹 패딩·제목과 콘텐츠 간격 | 16 | `p-yb-4`, `gap-yb-4` |
| 섹션 간격 | 24 | `gap-yb-6` |
| 그리드 간격 | 16 | `gap-yb-4` |
| 컴포넌트 간격 | 12 | `gap-yb-3` |
| 최소 터치 높이 | 44 | `min-h-yb-touch` |
| 기본·작은 버튼 높이 | 52/44 | `h-yb-btn-md`, `h-yb-btn-sm` |
| 카드·버튼 라디우스 | 16/14 | `rounded-yb-xl`, `rounded-yb-lg` |
| 입력 테두리 | 1.5 | `border-yb-input` |

- `Card` subtle variant처럼 패딩·라디우스가 다른 구현이 있다. 중첩 카드에 2:1 라디우스 비율을 강제하지 않는다.
- 375×812 프레임과 4컬럼은 디자인 참고다. 화면 크기를 고정하거나 모든 화면에 같은 그리드를 강제하지 않는다.
- `Main`이 적용하는 상단 safe-area를 중복 추가하지 않는다. 하단 inset과 내비게이션 높이는 화면별로 고려한다.
- 새 상호작용 요소는 44×44 이상의 터치 영역을 확보한다. 작은 아이콘은 padding·hitSlop으로 영역을 확보하되 인접 요소와 겹치지 않게 한다.
- 아이콘 버튼은 번역된 `accessibilityLabel`을 제공하고 disabled·selected 상태를 전달한다. 문자열과 보간 변수는 `src/shared/i18n/locales/ko.json`, `en.json`의 기존 구조를 따른다.
- 상태를 색상만으로 구분하지 않고 라벨·아이콘을 함께 사용한다. 글래스 wrapper의 미지원 기기·투명도 감소 fallback을 유지한다.
- 레이아웃 변경은 작은 화면·큰 글자·영향받는 플랫폼의 잘림과 조작 가능 여부를 확인한다. 네이티브 렌더링은 웹 검사만으로 검증했다고 보고하지 않는다.
