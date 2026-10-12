import { getMyproteinPurchaseUrl } from "../model/purchaseLinks"
import { getSafeWebUrl } from "@/shared/lib/url"
import { getSupabaseClient } from "./supabaseClient"
import { decideBadge } from "../model/badge"
import type { PriceStats } from "../model/badge"
import type {
  ApiProtein,
  ApiProteinPrice,
  ApiProteinPriceResult,
  ProteinCategory,
} from "../model/types"

type ApiRow = Record<string, unknown>

/** Supabase RPC 응답을 key 접근 가능한 row 배열로 제한 */
function toApiRows(value: unknown): ApiRow[] {
  return Array.isArray(value)
    ? value.filter(
        (row): row is ApiRow =>
          row !== null && typeof row === "object" && !Array.isArray(row),
      )
    : []
}

/** route/query string으로 들어온 상품 id를 DB primary key 숫자로 정규화 */
function parseProteinId(id: string): number | null {
  const parsed = Number(id)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return null
  return parsed
}

/** DB 문자열 필드를 화면에 쓸 수 있는 비어 있지 않은 문자열로 정리 */
function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed || null
}

/** Supabase numeric/decimal/string 값을 계산 가능한 숫자로 정규화 */
function toFiniteNumber(value: unknown): number | null {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** DB row id처럼 양의 정수여야 하는 값을 검증 */
function toPositiveInteger(value: unknown): number | null {
  const parsed = toFiniteNumber(value)
  if (parsed == null || !Number.isSafeInteger(parsed) || parsed <= 0) return null
  return parsed
}

/** 외부 구매 링크는 http/https URL만 앱 모델에 남긴다. */
function toSafeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  const safe = getSafeWebUrl(value)
  try {
    return safe && new URL(safe).hostname ? safe : null
  } catch {
    return null
  }
}

/** RPC 결과의 분위수 통계를 배지 판정 로직에서 쓰는 숫자 타입으로 정규화 */
function toPriceStats(row: Record<string, unknown>): PriceStats {
  return {
    p20: toFiniteNumber(row.p20),
    p50: toFiniteNumber(row.p50),
    p80: toFiniteNumber(row.p80),
    sample_count: Math.max(
      0,
      Math.trunc(toFiniteNumber(row.sample_count) ?? 0),
    ),
  }
}

/** 상품 목록을 등록순으로 조회하고 검색어/카테고리 필터를 선택적으로 적용 */
export async function fetchProteins(params?: {
  q?: string
  topic?: ProteinCategory
}) {
  const supabase = getSupabaseClient()
  let query = supabase
    .from("yb_supplements")
    .select("*")
    .order("supplement_id", { ascending: true })

  const keyword = params?.q?.trim()
  if (keyword) query = query.ilike("name", `%${keyword}%`)
  if (params?.topic) query = query.eq("topic", params.topic)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return toApiRows(data).map(parseSupplement)
}

/** 단일 상품이 없으면 null을 반환해 상세 화면에서 빈 상태를 처리 */
export async function fetchProtein(id: string) {
  const proteinId = parseProteinId(id)
  if (proteinId == null) return null

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("yb_supplements")
    .select("*")
    .eq("supplement_id", proteinId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }
  return data ? parseSupplement(data) : null
}

/** 목록 화면에서 사용할 각 상품의 최신 가격과 가격대 배지를 조회 */
export async function fetchLatestProteinPrices(): Promise<ApiProteinPrice[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc("yb_get_latest_supplement_prices")
  if (error) throw new Error(error.message)

  return toApiRows(data).flatMap((row) => {
    const proteinId = toPositiveInteger(row.supplement_id)
    const price = toFiniteNumber(row.price)
    const observedDate = toNonEmptyString(row.observed_date)
    if (proteinId == null || price == null || !observedDate) return []

    const stats = toPriceStats(row)
    const item: ApiProteinPrice = {
      supplement_id: proteinId,
      observed_date: observedDate,
      price,
      url: toSafeUrl(row.url),
      per_protein_gram: toFiniteNumber(row.per_protein_gram),
      badge: decideBadge(price, stats),
    }
    return [item]
  })
}

/** 특정 상품의 가격 히스토리와 최신 가격 기준 배지를 함께 조회 */
export async function fetchProteinPrices(
  id: string,
  limit = 180,
): Promise<ApiProteinPriceResult> {
  const proteinId = parseProteinId(id)
  if (proteinId == null || getMyproteinPurchaseUrl(proteinId)) return { items: [], badge: null }

  const normalizedLimit = Number.isFinite(limit)
    ? Math.min(366, Math.max(1, Math.trunc(limit)))
    : 180
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc("yb_get_supplement_price_history", {
    p_supplement_id: proteinId,
    p_limit: normalizedLimit,
  })
  if (error) throw new Error(error.message)

  const rows = toApiRows(data)
  const first = rows[0]

  // 히스토리가 없으면 배지를 만들 수 없도록 빈 통계값을 사용
  const stats: PriceStats = first
    ? toPriceStats(first)
    : { p20: null, p50: null, p80: null, sample_count: 0 }

  // DB 숫자/nullable 필드를 앱에서 쓰는 타입으로 변환
  const items: ApiProteinPrice[] = rows.flatMap((row) => {
    const rowProteinId = toPositiveInteger(row.supplement_id)
    const rowPrice = toFiniteNumber(row.price)
    const observedDate = toNonEmptyString(row.observed_date)
    if (rowProteinId == null || rowPrice == null || !observedDate) return []

    return [
      {
        supplement_id: rowProteinId,
        observed_date: observedDate,
        price: rowPrice,
        url: toSafeUrl(row.url),
        per_protein_gram: toFiniteNumber(row.per_protein_gram),
      },
    ]
  })

  return {
    items,
    badge: items.length > 0 ? decideBadge(items[0].price, stats) : null,
  }
}

function parseSupplement(row: ApiRow): ApiProtein {
  const id = toPositiveInteger(row.supplement_id)
  const weight = toPositiveInteger(row.weight)
  const { name, topic, taste, description } = row
  if (!id || !weight || typeof name !== "string" || typeof taste !== "string" ||
      typeof description !== "string" ||
      (topic !== "wpc" && topic !== "wpi" && topic !== "wpcwpi" &&
       topic !== "creatine" && topic !== "beta-alanine")) {
    throw new Error("Invalid supplement data")
  }
  return {
    supplement_id: id, name, topic, taste, weight, description,
    scoop_weight: toFiniteNumber(row.scoop_weight),
    protein_per_scoop: toFiniteNumber(row.protein_per_scoop),
    flavor_reviews: toApiRows(row.flavor_reviews).flatMap(({ name, tier, note }) =>
      typeof name === "string" && typeof note === "string" &&
      (tier === "T1" || tier === "T2" || tier === "T3")
        ? [{ name, tier, note }] : []),
  }
}
