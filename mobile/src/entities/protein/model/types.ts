export type ProteinCategory = "wpc" | "wpi" | "wpcwpi" | "creatine" | "beta-alanine"

export type PriceLevel = "low" | "mid" | "high"

export type PriceBadge = {
  kind: PriceLevel
  color: "green" | "blue" | "red"
  reason: string
}

export interface ApiProtein {
  supplement_id: number
  name: string
  weight: number
  topic: ProteinCategory
  taste: string
  description: string
  scoop_weight: number | null
  protein_per_scoop: number | null
  flavor_reviews: ApiProteinFlavor[]
}

export interface ApiProteinPrice {
  supplement_id: number
  observed_date: string
  price: number
  url?: string | null
  per_protein_gram?: number | null
  badge?: PriceBadge | null
}

export interface ApiProteinPriceResult {
  items: ApiProteinPrice[]
  badge: PriceBadge | null
}

export interface ApiProteinFlavor {
  name: string
  tier: "T1" | "T2" | "T3"
  note: string
}

export interface Protein {
  id: string
  name: string
  category: ProteinCategory
  categoryLabel: string
  flavor: string
  volume: number
  price: number | null
  pricePerGram: number | null
  priceLevel: PriceLevel | null
  showPrices: boolean
  purchaseUrl: string | null
}

export interface PriceHistoryPoint {
  date: string
  price: number
}

export interface ProteinDetail extends Protein {
  features: string[]
  priceHistory: PriceHistoryPoint[]
}
