import type {
  BodyPart,
  BodyPartDetail,
  WorkoutBodyPartSet,
} from "./types"

const BODY_PART_ORDER: Record<BodyPart, number> = {
  chest: 0,
  back: 1,
  legs: 2,
  shoulders: 3,
  arms: 4,
  core: 5,
}

// 클릭 순서와 무관하게 부위를 배치하고 같은 부위의 세부 항목 순서는 유지한다.
export function sortByBodyPart<T extends { part: BodyPart }>(items: readonly T[]): T[] {
  return [...items].sort(
    (left, right) => BODY_PART_ORDER[left.part] - BODY_PART_ORDER[right.part],
  )
}

interface WorkoutBodyPartSetLabelFormatters {
  bodyPartLabel: (part: BodyPart) => string
  bodyPartDetailLabel: (detail: BodyPartDetail) => string
}

// 부위와 세부 부위를 합쳐 목록 렌더링에 쓸 고유 키 만듬
export function getWorkoutBodyPartSetKey(item: WorkoutBodyPartSet): string {
  return `${item.part}:${item.detail ?? "all"}`
}

// 세트 항목을 화면에 표시할 라벨로 변환
export function getWorkoutBodyPartSetLabel(
  item: WorkoutBodyPartSet,
  formatters: WorkoutBodyPartSetLabelFormatters,
): string {
  const parentLabel = formatters.bodyPartLabel(item.part)

  if (item.detail) {
    return `${parentLabel} ${formatters.bodyPartDetailLabel(item.detail)}`
  }

  const legacyDetails = item.details ?? []

  if (legacyDetails.length === 0) {
    return parentLabel
  }

  const detailLabel = legacyDetails
    .map(formatters.bodyPartDetailLabel)
    .join(", ")
  return `${parentLabel} ${detailLabel}`
}

// 특정 상위 부위에 선택된 세부 부위 목록 가져옴
export function getWorkoutBodyPartDetails(
  items: WorkoutBodyPartSet[],
  part: BodyPart,
): BodyPartDetail[] {
  return items.flatMap((item) => {
    if (item.part !== part) return []
    if (item.detail) return [item.detail]
    return item.details ?? []
  })
}

// 뱃지나 대표 아이콘에 쓸 상위 부위 목록만 중복 없이 가져옴
export function getUniqueWorkoutBodyParts(
  items: WorkoutBodyPartSet[],
): BodyPart[] {
  return Array.from(new Set(items.map((item) => item.part)))
}
