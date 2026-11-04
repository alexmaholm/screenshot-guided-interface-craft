import { createServerFn } from "@tanstack/react-start";
import { parseOffSearch, type BarcodeProduct } from "./barcode";

const FIELDS = "code,product_name,product_name_sv,brands,nutriments,serving_quantity";

/** Brand/product search via Open Food Facts, proxied server-side (no browser CORS issues). */
export const searchBrandFoods = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string }) => ({ q: String(d?.q ?? "").trim().slice(0, 60) }))
  .handler(async ({ data }): Promise<BarcodeProduct[]> => {
    if (data.q.length < 2) return [];
    const q = encodeURIComponent(data.q);
    const headers = { "User-Agent": "Balans/1.0 (food search)" };
    try {
      const r = await fetch(`https://search.openfoodfacts.org/search?q=${q}&page_size=20&langs=sv,en&fields=${FIELDS}`, { headers });
      if (r.ok) {
        const j = (await r.json()) as { hits?: Record<string, unknown>[] };
        const products = (j.hits ?? []).map((h) => ({ ...h, brands: Array.isArray(h["brands"]) ? (h["brands"] as string[]).join(",") : h["brands"] }));
        const out = parseOffSearch({ products });
        if (out.length) return out;
      }
    } catch (e) { console.error("OFF search-a-licious failed", e); }
    try {
      const r = await fetch(`https://se.openfoodfacts.org/cgi/search.pl?search_terms=${q}&search_simple=1&action=process&json=1&page_size=20&fields=${FIELDS}`, { headers });
      if (r.ok && (r.headers.get("content-type") ?? "").includes("json")) return parseOffSearch(await r.json());
    } catch (e) { console.error("OFF search.pl failed", e); }
    return [];
  });
