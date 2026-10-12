import { getMyproteinPurchaseUrl } from "./purchaseLinks"
import type {
  ApiProtein,
  ApiProteinFlavor,
  ApiProteinPrice,
  ApiProteinPriceResult,
  PriceLevel,
  Protein,
  ProteinCategory,
  ProteinDetail,
  PriceHistoryPoint,
} from "./types"

// DB의 상품 카테고리 코드를 화면에 표시할 라벨로 변환
const CATEGORY_LABELS: Record<ProteinCategory, string> = {
  wpc: "WPC",
  wpi: "WPI",
  wpcwpi: "WPC/WPI",
  creatine: "크레아틴",
  "beta-alanine": "베타알라닌",
}

// 상품 카테고리에 맞는 표시용 라벨을 반환
export function getProteinCategoryLabel(category: ProteinCategory) {
  return CATEGORY_LABELS[category]
}

// 통계가 없으면 가격 배지를 표시하지 않는다.
function priceLevelOf(badge?: { kind: PriceLevel } | null): PriceLevel | null {
  return badge?.kind ?? null
}

/** 차트에 그릴 수 있는 날짜/가격 값만 가격 히스토리 포인트로 변환 */
function toPriceHistoryPoint(price: ApiProteinPrice): PriceHistoryPoint | null {
  const date =
    typeof price.observed_date === "string" ? price.observed_date.trim() : ""
  if (!date || !Number.isFinite(price.price)) return null
  return { date, price: price.price }
}

// 상세 화면에 표시할 특징 목록을 설명 문장과 맛 정보로 구성
function toFeatureLines(protein: ApiProtein, flavors: ApiProteinFlavor[]) {
  const lines: string[] = []

  if (protein.description?.trim()) {
    // 여러 구분자를 지원해 DB에 저장된 설명을 표시 가능한 문장 단위로 나눔
    lines.push(
      ...protein.description
        .split(/[,，、ㆍ·;|\n\r]+/g)
        .map((value) => value.replace(/\s+/g, " ").trim())
        .filter(Boolean),
    )
  }

  // 맛 티어와 메모가 있으면 한 줄에 함께 노출
  for (const flavor of flavors) {
    const tier = flavor.tier ? ` (${flavor.tier})` : ""
    const note = flavor.note ? ` - ${flavor.note}` : ""
    lines.push(`맛: ${flavor.name}${tier}${note}`)
  }

  return lines.length > 0 ? lines : [`맛: ${protein.taste}`]
}

// 목록 화면에서 필요한 상품 정보와 최신 가격 정보를 하나의 모델로 합침
export function mergeProteinListItems(proteins: ApiProtein[], prices: ApiProteinPrice[]): Protein[] {
  const priceMap = new Map(prices.map((price) => [price.supplement_id, price]))

  return proteins.map((protein) => {
    const purchaseUrl = getMyproteinPurchaseUrl(protein.supplement_id)
    const latest = purchaseUrl ? undefined : priceMap.get(protein.supplement_id)

    return {
      id: String(protein.supplement_id),
      name: protein.name,
      category: protein.topic,
      categoryLabel: getProteinCategoryLabel(protein.topic),
      flavor: protein.taste,
      volume: protein.weight,
      price: latest?.price ?? null,
      pricePerGram: latest?.per_protein_gram ?? null,
      priceLevel: priceLevelOf(latest?.badge),
      showPrices: !purchaseUrl,
      purchaseUrl: purchaseUrl ?? latest?.url ?? null,
    }
  })
}

// 상세 화면에서 사용할 상품 정보, 가격 히스토리, 맛 정보를 하나의 모델로 만든다.
export function buildProteinDetail(
  protein: ApiProtein,
  priceResult: ApiProteinPriceResult,
): ProteinDetail {
  const purchaseUrl = getMyproteinPurchaseUrl(protein.supplement_id)
  const items = purchaseUrl ? [] : priceResult.items
  const latest = items[0]
  // API는 최신순으로 내려주므로 차트 표시용으로 오래된 날짜부터 정렬한다.
  const priceHistory: PriceHistoryPoint[] = [...items]
    .reverse()
    .flatMap((price) => {
      const point = toPriceHistoryPoint(price)
      return point ? [point] : []
    })

  return {
    id: String(protein.supplement_id),
    name: protein.name,
    category: protein.topic,
    categoryLabel: getProteinCategoryLabel(protein.topic),
    flavor: protein.taste,
    volume: protein.weight,
    price: latest?.price ?? null,
    pricePerGram: latest?.per_protein_gram ?? null,
    priceLevel: purchaseUrl ? null : priceLevelOf(priceResult.badge),
    showPrices: !purchaseUrl,
    purchaseUrl: purchaseUrl ?? latest?.url ?? null,
    features: toFeatureLines(protein, protein.flavor_reviews),
    priceHistory,
  }
}
