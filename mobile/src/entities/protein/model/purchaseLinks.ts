// 현재 yb_supplements의 마이프로틴 ID. 가격 조회 없이 고정 구매 링크를 사용한다.
const MYPROTEIN_LINKS: Readonly<Record<number, string>> = {
  10: "https://www.myprotein.co.kr/p/sports-nutrition/impact-whey-protein-powder/10530943/?affil=thgppc&thg_ppc_campaign=695220367&gclid=Cj0KCQjw5bjVBhCiARIsAJzMVnQOgmiXG9YGDS4ADYA8e6kv0EvJw-SlCOiK8I4Ew6lBal746-Eb4X8aAkKvEALw_wcB&variation=14302236",
  11: "https://www.myprotein.co.kr/p/sports-nutrition/impact-whey-isolate/10530911/?affil=thgppc&thg_ppc_campaign=695220367&gclid=Cj0KCQjw5bjVBhCiARIsAJzMVnQOgmiXG9YGDS4ADYA8e6kv0EvJw-SlCOiK8I4Ew6lBal746-Eb4X8aAkKvEALw_wcB&variation=10889147",
}

export function getMyproteinPurchaseUrl(id: number): string | null {
  return MYPROTEIN_LINKS[id] ?? null
}
