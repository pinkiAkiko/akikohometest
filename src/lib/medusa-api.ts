import Medusa from "@medusajs/js-sdk";

const BASE_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

const sdk = new Medusa({ baseUrl: BASE_URL, publishableKey: PUB_KEY });
export const INDIA_REGION_ID = "reg_01KNHR2YN2MJ2SD8JP8BK71NF0";
export const SALES_CHANNEL_ID = "sc_01KNHR2YGS4QQQW3QPM7CGZ1NR";

const COLOR_HEX: Record<string, string> = {
  White: "#F5F5F0",
  Ivory: "#F8F5EC",
  Sage: "#8A9E7C",
  Slate: "#708090",
  "Slate Grey": "#708090",
  Charcoal: "#4A4A4A",
  Grey: "#9B9B9B",
  Natural: "#C8B89A",
  Rose: "#E8C5C5",
  Blush: "#F2D7D5",
  Oatmeal: "#C8B89A",
  Cream: "#F5F0E8",
  "Light Grey": "#D0D0D0",
};

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single product option (e.g. "Color", "Size", or any custom option). */
export interface StoreOption {
  id: string;
  title: string;
  values: { value: string; hex?: string }[];
}

export interface StoreVariant {
  id: string;
  /** Maps option_id → selected value for this variant (e.g. { "opt_123": "Beige", "opt_456": "50x80" }). */
  optionValues: Record<string, string>;
  price: string;
  priceNum: number;
  originalPrice?: string;
  discountPct?: number;
}

export interface StoreProduct {
  id: string;
  handle: string;
  slug: string;
  name: string;
  description: string;
  thumbnail: string | null;
  images: string[];
  /** Images keyed by the image-option's value — built from native variant.images (§3.16). */
  optionImages: Record<string, string[]>;
  /** Images keyed by variant ID — for exact-variant gallery filtering (takes priority over optionImages). */
  variantImages: Record<string, string[]>;
  /** The option.id whose selected value drives gallery image filtering. */
  imageOptionId: string | undefined;
  material: string;
  badge?: "New" | "Bestseller" | "Sale";
  price: string;
  priceNum: number;
  originalPrice?: string;
  discountPct?: number;
  /** All product options in order — render a selector for each. */
  options: StoreOption[];
  variants: StoreVariant[];
  category: string;
  details: string[];
  careInstructions: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> | null;
}

export interface MedusaLineItem {
  id: string;
  title: string;           // product title
  variant_title: string | null; // e.g. "Bath Sheet / Charcoal"
  thumbnail: string | null;
  quantity: number;
  unit_price: number;      // in paise
  variant_id: string | null;
  product_id: string | null;
  product_handle: string | null;
}

export interface MedusaCart {
  id: string;
  items: MedusaLineItem[];
  subtotal: number;
  total: number;
  discount_total: number;
  tax_total: number;
  // item_total = after-discount + after-tax item total; item_tax_total = tax on items
  // item_total - item_tax_total = after-discount-before-tax subtotal (what customer pays for items)
  item_total: number;
  item_tax_total: number;
  shipping_subtotal: number;
  region_id: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

interface AutoPromoEntry {
  code: string;
  product_id: string;
  discount_percent: number;
}

// Fetches structured promo data (product_id → discount_percent) for display at browse time.
// Returns empty map on error so product listing always works.
async function fetchAutoPromotionMap(): Promise<Map<string, number>> {
  try {
    const res = await fetch(`${BASE_URL}/store/promotions/auto`, {
      headers: { "x-publishable-api-key": PUB_KEY },
      cache: "no-store",
    });
    if (!res.ok) return new Map();
    const { promotions } = await res.json() as { promotions: AutoPromoEntry[] };
    const map = new Map<string, number>();
    for (const p of promotions ?? []) {
      if (p.product_id && p.discount_percent > 0) {
        map.set(p.product_id, p.discount_percent);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(p: any, discountMap?: Map<string, number>, optionImagesOverride?: Record<string, string[]>, variantImagesOverride?: Record<string, string[]>): StoreProduct {
  let minPrice = 0;
  for (const v of p.variants || []) {
    const amt = v.calculated_price?.calculated_amount;
    if (amt && (minPrice === 0 || amt < minPrice)) minPrice = amt;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const optionRanks: Record<string, number> = (p.metadata?.option_ranks as Record<string, number> | undefined) ?? {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawOptions: any[] = (p.options || []).slice().sort((a: any, b: any) => {
    return (optionRanks[a.id] ?? 999) - (optionRanks[b.id] ?? 999)
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawVariants: any[] = p.variants || [];

  // Detect the swatch option: whichever option has at least one value with
  // swatch_hex in its metadata (set via the admin product-option-swatches widget).
  // Returns undefined when no option value has swatch_hex → all options render as pills.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function detectSwatchOptId(opts: any[]): string | undefined {
    for (const opt of opts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((opt.values || []).some((v: any) => v.metadata?.swatch_hex)) {
        return opt.id as string;
      }
    }
    return undefined;
  }

  const swatchOptId = detectSwatchOptId(rawOptions);

  // Build options dynamically.
  // Hex (swatch circle) is attached ONLY to the detected swatch option's values,
  // read directly from option value metadata. COLOR_HEX is a last-resort fallback
  // for values not yet migrated or when the store API omits metadata.
  // All other options get plain values → they render as pill buttons.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: StoreOption[] = rawOptions.map((opt: any) => {
    if (opt.id !== swatchOptId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { id: opt.id, title: opt.title, values: (opt.values || []).map((v: any) => ({ value: v.value as string })) };
    }

    // Swatch option: hex read directly from option value metadata.
    return {
      id: opt.id,
      title: opt.title,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      values: (opt.values || []).map((v: any) => {
        const hex = (v.metadata?.swatch_hex as string | undefined) || COLOR_HEX[v.value as string];
        return hex ? { value: v.value as string, hex } : { value: v.value as string };
      }),
    };
  });

  // Build variant map with generic optionValues (option_id → value).
  // originalPrice comes from calculated_price.original_amount (native Promotion Module).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants: StoreVariant[] = rawVariants.map((v: any) => {
    const optionValues: Record<string, string> = {};
    for (const o of (v.options || []) as { option_id: string; value: string }[]) {
      optionValues[o.option_id] = o.value;
    }
    const amount = v.calculated_price?.calculated_amount || 0;
    const originalAmt: number = v.calculated_price?.original_amount ?? 0;
    const variantDiscountPct =
      originalAmt > amount && originalAmt > 0
        ? Math.round(((originalAmt - amount) / originalAmt) * 100)
        : 0;
    return {
      id: v.id,
      optionValues,
      price: formatPrice(amount),
      priceNum: amount,
      ...(originalAmt > amount ? { originalPrice: formatPrice(originalAmt), discountPct: variantDiscountPct } : {}),
    };
  });

  // imageOptionId drives gallery image filtering (same option as swatch — undefined = show all images)
  const imageOptionId: string | undefined = swatchOptId;

  // Build optionImages: keyed by image-option value → image URLs.
  // Sourced from /store/products/color-images route (§3.16); falls back to variant.images.
  // Uses Sets to merge images from same-value variants (e.g. "Beige / 50x80" + "Beige / 45x65").
  const optionImages: Record<string, string[]> = optionImagesOverride ?? (() => {
    const sets: Record<string, Set<string>> = {};
    if (imageOptionId) {
      for (const v of rawVariants) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variantOptions: { option_id: string; value: string }[] = (v as any).options || [];
        const optVal = variantOptions.find((o) => o.option_id === imageOptionId);
        const valueName: string = optVal?.value ?? "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variantImgUrls: string[] = ((v as any).images || [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((img: any) => img.url as string)
          .filter(Boolean);
        if (valueName && variantImgUrls.length > 0) {
          if (!sets[valueName]) sets[valueName] = new Set();
          variantImgUrls.forEach((u) => sets[valueName].add(u));
        }
      }
    }
    const map: Record<string, string[]> = {};
    for (const [val, urlSet] of Object.entries(sets)) {
      map[val] = Array.from(urlSet);
    }
    return map;
  })();

  const category: string = p.categories?.[0]?.handle || "towels";
  const material: string = p.material || (p.metadata?.material as string) || "Premium Cotton";
  const badgeRaw = p.metadata?.badge;
  const badge =
    badgeRaw === "New" || badgeRaw === "Bestseller" || badgeRaw === "Sale"
      ? (badgeRaw as "New" | "Bestseller" | "Sale")
      : undefined;

  const remoteImages: string[] =
    (p.images as { url?: string }[] | undefined)?.map((img) => img.url).filter((u): u is string => Boolean(u)) || [];
  const thumbnail: string | null = p.thumbnail ?? remoteImages[0] ?? null;
  // If no images attached, fall back to thumbnail so the PDP gallery always has something to show
  const images: string[] = remoteImages.length > 0 ? remoteImages : (thumbnail ? [thumbnail] : []);

  const gsm = p.metadata?.gsm ? ` · ${p.metadata.gsm} GSM` : "";

  // Extra detail lines from metadata (pipe-separated), e.g. "Hand Towel: 40×60 cm|Bath Towel: 70×140 cm"
  const extraDetails: string[] = p.metadata?.product_details
    ? (p.metadata.product_details as string).split("|").map((s: string) => s.trim()).filter(Boolean)
    : [];
  const details = [`${material}${gsm}`, ...extraDetails];

  // Care instructions from metadata (pipe-separated), e.g. "Machine wash at 40°C|Do not bleach"
  const careInstructions: string[] = p.metadata?.care_instructions
    ? (p.metadata.care_instructions as string).split("|").map((s: string) => s.trim()).filter(Boolean)
    : [];

  // Product-level original price: use the min-price variant's original_amount if available.
  const minVariant = variants.find((v) => v.priceNum === minPrice);
  const minOriginalAmt = minVariant?.originalPrice
    ? ((p.variants || []) as Array<{ id: string; calculated_price?: { original_amount?: number } }>).find((v) => v.id === minVariant.id)?.calculated_price?.original_amount ?? 0
    : 0;
  const nativeDiscountPct = minVariant?.discountPct ?? 0;

  // Automatic promotion discount (from promo map — not reflected in calculated_price at browse time).
  // Only applied when there is no native calculated_price-based discount already.
  const promoDiscountPct = (!nativeDiscountPct && discountMap?.get(p.id)) ? discountMap.get(p.id)! : 0;

  // Apply promo discount to variants when promoDiscountPct > 0
  const finalVariants: StoreVariant[] = promoDiscountPct > 0
    ? variants.map((v) => {
        if (v.discountPct || !v.priceNum) return v; // skip: already discounted or no price
        const discounted = Math.round(v.priceNum * (1 - promoDiscountPct / 100));
        return {
          ...v,
          price: formatPrice(discounted),
          priceNum: discounted,
          originalPrice: formatPrice(v.priceNum),
          discountPct: promoDiscountPct,
        };
      })
    : variants;

  const effectiveMinPrice = promoDiscountPct > 0
    ? Math.round(minPrice * (1 - promoDiscountPct / 100))
    : minPrice;
  const effectiveOriginalPrice = promoDiscountPct > 0
    ? formatPrice(minPrice)
    : (minOriginalAmt > 0 ? formatPrice(minOriginalAmt) : undefined);
  const effectiveDiscountPct = promoDiscountPct > 0 ? promoDiscountPct : nativeDiscountPct;

  return {
    id: p.id,
    handle: p.handle,
    slug: p.handle,
    name: p.title,
    description: p.description || "",
    thumbnail,
    images,
    optionImages,
    variantImages: variantImagesOverride ?? {},
    imageOptionId,
    material,
    badge,
    price: formatPrice(effectiveMinPrice),
    priceNum: effectiveMinPrice,
    ...(effectiveOriginalPrice ? { originalPrice: effectiveOriginalPrice } : {}),
    ...(effectiveDiscountPct > 0 ? { discountPct: effectiveDiscountPct } : {}),
    options,
    variants: finalVariants,
    category,
    details,
    careInstructions,
    metadata: p.metadata ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function medusaFetch(path: string, withRegion = false): Promise<any> {
  const url = new URL(`${BASE_URL}${path}`);
  if (withRegion) url.searchParams.set("region_id", INDIA_REGION_ID);

  const res = await fetch(url.toString(), {
    headers: { "x-publishable-api-key": PUB_KEY },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Medusa ${res.status}: ${path}`);
  return res.json();
}

// ─── Category + Tag types ─────────────────────────────────────────────────────

export interface StoreCategory {
  id: string;
  handle: string;
  name: string;
  description: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> | null;
  parent_category_id: string | null;
  category_children?: StoreCategory[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCategory(c: any): StoreCategory {
  return {
    id: c.id,
    handle: c.handle,
    name: c.name,
    description: c.description ?? null,
    metadata: c.metadata ?? null,
    parent_category_id: c.parent_category_id ?? null,
    category_children: (c.category_children || []).map(mapCategory),
  };
}

// ─── Product API ──────────────────────────────────────────────────────────────

/** Collect a category's id plus every descendant reachable via real parent/child
 *  or metadata.nav_parent links (mirrors the nav-tree walk in Header.tsx's buildNavGroups),
 *  so a parent category's page shows its own products plus all its nav children's. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectCategoryIdsWithNavDescendants(root: any, categories: any[]): string[] {
  const childrenByParentHandle: Record<string, typeof categories> = {};
  const childrenByParentId: Record<string, typeof categories> = {};
  for (const c of categories) {
    const navParentHandle = c.metadata?.nav_parent as string | undefined;
    if (navParentHandle) (childrenByParentHandle[navParentHandle] ??= []).push(c);
    if (c.parent_category_id) (childrenByParentId[c.parent_category_id] ??= []).push(c);
  }

  const visited = new Set<string>();
  const ids: string[] = [];
  const stack = [root];
  while (stack.length) {
    const c = stack.pop();
    if (!c || visited.has(c.id)) continue;
    visited.add(c.id);
    ids.push(c.id);
    stack.push(...(childrenByParentHandle[c.handle] || []));
    stack.push(...(childrenByParentId[c.id] || []));
  }
  return ids;
}

export async function getProductsByCategory(categoryHandle: string): Promise<StoreProduct[]> {
  const catData = await medusaFetch("/store/product-categories?limit=50&fields=id,handle,parent_category_id,metadata");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = (catData.product_categories || []) as any[];
  const cat = categories.find((c) => c.handle === categoryHandle);
  if (!cat) return [];

  const categoryIds = collectCategoryIdsWithNavDescendants(cat, categories);
  const categoryIdQuery = categoryIds.map((id) => `category_id[]=${id}`).join("&");

  const [data, promoMap] = await Promise.all([
    medusaFetch(`/store/products?limit=50&fields=+metadata,+options.values.metadata&${categoryIdQuery}`, true),
    fetchAutoPromotionMap(),
  ]);
  return ((data.products || []) as Record<string, unknown>[]).map((p) => mapProduct(p, promoMap));
}

export async function getAllProducts(limit = 8): Promise<StoreProduct[]> {
  const [data, promoMap] = await Promise.all([
    medusaFetch(`/store/products?limit=${limit}&fields=+metadata,+options.values.metadata,*categories`, true),
    fetchAutoPromotionMap(),
  ]);
  return ((data.products || []) as Record<string, unknown>[]).map((p) => mapProduct(p, promoMap));
}

/** Fetch products that have a specific tag value (e.g. "new-arrival", "bestseller").
 *  Medusa store API filters by tag_id[] not tag value, so we fetch all and filter client-side.
 *  Fine for catalogs up to ~200 products. */
export async function getProductsByTag(tag: string, limit = 4): Promise<StoreProduct[]> {
  const [data, promoMap] = await Promise.all([
    medusaFetch(`/store/products?limit=200&fields=+tags,+metadata,+options.values.metadata`, true),
    fetchAutoPromotionMap(),
  ]);
  const filtered = ((data.products || []) as Record<string, unknown>[]).filter((p) => {
    const tags = (p.tags || []) as { value: string }[];
    return tags.some((t) => t.value === tag);
  });
  return filtered.slice(0, limit).map((p) => mapProduct(p, promoMap));
}

/** Fetch all active product categories (flat), with any real Medusa parent/child
 *  relationships nested under `category_children` (`include_descendants_tree`).
 *  Nav nesting is mostly driven by metadata (see buildNavGroups in Header.tsx),
 *  since the Admin category edit form here has no Parent category field —
 *  so this intentionally returns every category, not just top-level ones. */
export async function getCategories(): Promise<StoreCategory[]> {
  try {
    const data = await medusaFetch(
      "/store/product-categories?limit=50&include_descendants_tree=true&fields=id,handle,name,description,metadata,parent_category_id,is_active,*category_children"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.product_categories || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((c: any) => c.is_active !== false)
      .map(mapCategory);
  } catch {
    return [];
  }
}

// ─── Dynamic Content API (store_settings / banner / testimonial modules) ──────

export interface StoreBanner {
  id: string;
  type: string; // "hero" | "editorial"
  title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  position: number;
  is_active: boolean;
}

export interface StoreTestimonial {
  id: string;
  quote: string;
  author_name: string;
  product_handle: string | null;
  position: number;
  is_active: boolean;
}

/** Fetch active banners by type from the banner module. Returns [] on error. */
export async function getBanners(type: "hero" | "editorial" = "hero"): Promise<StoreBanner[]> {
  try {
    const res = await fetch(`${BASE_URL}/store/banners?type=${type}`, {
      headers: { "x-publishable-api-key": PUB_KEY },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.banners ?? [];
  } catch {
    return [];
  }
}

/** Fetch active testimonials from the testimonial module. Returns [] on error. */
export async function getTestimonials(): Promise<StoreTestimonial[]> {
  try {
    const res = await fetch(`${BASE_URL}/store/testimonials`, {
      headers: { "x-publishable-api-key": PUB_KEY },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.testimonials ?? [];
  } catch {
    return [];
  }
}

/** Fetch a store setting by key. Returns null on error or if not found. */
export async function getStoreSetting(key: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/store/settings?keys[]=${encodeURIComponent(key)}`, {
      headers: { "x-publishable-api-key": PUB_KEY },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.settings?.[key] ?? null;
  } catch {
    return null;
  }
}

/** Fetch a single category by handle. */
export async function getCategoryByHandle(handle: string): Promise<StoreCategory | null> {
  try {
    const data = await medusaFetch(`/store/product-categories?handle=${handle}`);
    const cat = data.product_categories?.[0];
    if (!cat) return null;
    return mapCategory(cat);
  } catch {
    return null;
  }
}

export async function getProductByHandle(handle: string): Promise<StoreProduct | null> {
  const [data, promoMap, optionImagesData] = await Promise.all([
    medusaFetch(`/store/products?handle=${handle}&fields=+metadata,+options.values.metadata,*categories`, true),
    fetchAutoPromotionMap(),
    // Fetch variant image map from custom route (variant.images not traversable via query.graph in v2.13.x)
    fetch(`${BASE_URL}/store/products/color-images?handle=${handle}`, {
      headers: { "x-publishable-api-key": PUB_KEY },
      cache: "no-store",
    }).then((r) => (r.ok ? r.json() : { optionImages: {} })).catch(() => ({ optionImages: {} })),
  ]);
  const p = data.products?.[0];
  const { optionImages: optionImagesOverride, variantImages: variantImagesOverride } = optionImagesData as {
    optionImages: Record<string, string[]>;
    variantImages?: Record<string, string[]>;
  };
  return p ? mapProduct(p, promoMap, optionImagesOverride, variantImagesOverride ?? {}) : null;
}

// ─── Cart mappers ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLineItem(item: any): MedusaLineItem {
  const handle = item.product_handle ?? item.variant?.product?.handle ?? null;
  return {
    id: item.id,
    title: item.title,
    variant_title: item.variant_title ?? item.variant?.title ?? null,
    thumbnail: item.thumbnail ?? item.variant?.product?.thumbnail ?? null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    variant_id: item.variant_id ?? null,
    product_id: item.product_id ?? null,
    product_handle: handle,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCart(cart: any): MedusaCart {
  return {
    id: cart.id,
    items: (cart.items ?? []).map(mapLineItem),
    subtotal: cart.subtotal ?? 0,
    total: cart.total ?? 0,
    discount_total: cart.discount_total ?? 0,
    tax_total: cart.tax_total ?? 0,
    item_total: cart.item_total ?? 0,
    item_tax_total: cart.item_tax_total ?? 0,
    shipping_subtotal: cart.shipping_subtotal ?? 0,
    region_id: cart.region_id ?? "",
  };
}

// ─── Cart API ─────────────────────────────────────────────────────────────────

// Fetches active is_automatic promo codes from the backend and applies them to
// the cart. Medusa only adjusts line items that match each promo's target_rules,
// so applying all codes is safe — unmatched promos are silently ignored.
// Must use raw fetch: sdk.store.cart.addPromotions is not in this SDK version.
async function applyAutoPromotions(cartId: string): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/store/promotions/auto`, {
      headers: { "x-publishable-api-key": PUB_KEY },
      cache: "no-store",
    });
    if (!res.ok) return;
    const { codes } = await res.json() as { codes: string[] };
    if (!codes.length) return;
    await fetch(`${BASE_URL}/store/carts/${cartId}/promotions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-publishable-api-key": PUB_KEY },
      body: JSON.stringify({ promo_codes: codes }),
    });
  } catch {
    // Non-fatal: cart still works without automatic discounts applied
  }
}

export async function createCart(): Promise<MedusaCart> {
  const { cart } = await sdk.store.cart.create({
    region_id: INDIA_REGION_ID,
    sales_channel_id: SALES_CHANNEL_ID,
  });
  await applyAutoPromotions(cart.id);
  return mapCart(cart);
}

export async function getCart(cartId: string): Promise<MedusaCart | null> {
  try {
    const { cart } = await sdk.store.cart.retrieve(cartId, {
      fields: "*items,*items.variant,*items.variant.product,+items.thumbnail,+items.variant.product.thumbnail,+item_total,+item_tax_total,+discount_total,+subtotal,+total,+shipping_subtotal,+tax_total",
    });
    return mapCart(cart);
  } catch {
    return null;
  }
}

export async function addLineItem(cartId: string, variantId: string, quantity: number): Promise<MedusaCart> {
  await sdk.store.cart.createLineItem(cartId, { variant_id: variantId, quantity });
  // Re-apply auto promotions after each add so newly eligible promos are computed.
  // refreshCartItemsWorkflow (run inside createLineItem) only re-applies promos
  // already on the cart — it does not auto-discover is_automatic promos.
  await applyAutoPromotions(cartId);
  // Fetch with explicit fields so item_total/item_tax_total/discount_total are present.
  return (await getCart(cartId))!;
}

export async function updateLineItem(cartId: string, lineItemId: string, quantity: number): Promise<MedusaCart> {
  await sdk.store.cart.updateLineItem(cartId, lineItemId, { quantity });
  return (await getCart(cartId))!;
}

export async function deleteLineItem(cartId: string, lineItemId: string): Promise<MedusaCart> {
  await sdk.store.cart.deleteLineItem(cartId, lineItemId);
  return (await getCart(cartId))!;
}

// ─── Checkout API ─────────────────────────────────────────────────────────────

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  province: string;
  postal_code: string;
  country_code: string;
  phone: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  amount: number;
  price_type: "flat" | "calculated";
}

export async function updateCartAddress(
  cartId: string,
  email: string,
  shipping_address: ShippingAddress
): Promise<MedusaCart> {
  const { cart } = await sdk.store.cart.update(cartId, { email, shipping_address });
  return mapCart(cart);
}

export async function listShippingOptions(cartId: string): Promise<ShippingOption[]> {
  // cache:'no-store' — Medusa ETag returns 304 stale data otherwise after address change.
  const res = await fetch(`${BASE_URL}/store/shipping-options?cart_id=${cartId}`, {
    cache: "no-store",
    headers: { "x-publishable-api-key": PUB_KEY },
  });
  const { shipping_options } = await res.json();
  const options: Array<{ id: string; name: string; amount: number; price_type: string }> =
    shipping_options ?? [];

  // For price_type="calculated" options Medusa returns amount:null from the list endpoint.
  // The native calculate endpoint (POST /store/shipping-options/{id}/calculate) invokes
  // the provider's calculatePrice — which uses real cart item weights for Shiprocket.
  const calculated = options.filter((o) => o.price_type === "calculated" && o.amount == null);
  if (calculated.length > 0) {
    await Promise.allSettled(
      calculated.map(async (o) => {
        try {
          const calcRes = await fetch(`${BASE_URL}/store/shipping-options/${o.id}/calculate`, {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json", "x-publishable-api-key": PUB_KEY },
            body: JSON.stringify({ cart_id: cartId }),
          });
          const { shipping_option } = await calcRes.json();
          if (shipping_option?.amount != null) o.amount = shipping_option.amount;
        } catch {
          // leave amount null — checkout shows "Calculated at checkout"
        }
      })
    );
  }

  return options.map((o) => ({ id: o.id, name: o.name, amount: o.amount, price_type: o.price_type as "flat" | "calculated" }));
}

export async function addShippingMethod(cartId: string, shippingOptionId: string): Promise<MedusaCart> {
  const { cart } = await sdk.store.cart.addShippingMethod(cartId, { option_id: shippingOptionId });
  return mapCart(cart);
}

export interface ShiprocketFulfillmentData {
  shiprocket_order_id?: number;
  shipment_id?: number;
  awb_code?: string | null;
  courier_name?: string | null;
  current_status?: string;
}

export interface OrderFulfillment {
  id: string;
  status: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
  data?: ShiprocketFulfillmentData;
}

export interface PlacedOrder {
  id: string;
  display_id: number;
  status: string;
  email: string;
  total: number;
  subtotal: number;
  item_subtotal: number;
  shipping_total: number;
  shipping_subtotal: number;
  tax_total: number;
  original_tax_total: number;
  discount_total: number;
  items: MedusaLineItem[];
  fulfillments?: OrderFulfillment[];
}

export async function initiatePaymentSession(
  cartId: string,
  providerId: string = "pp_razorpay_razorpay"
): Promise<void> {
  const { cart } = await sdk.store.cart.retrieve(cartId);
  await sdk.store.payment.initiatePaymentSession(cart, { provider_id: providerId });
}

/** Retrieve the active payment session for a cart (returns session id, data, and collection id) */
export async function getActivePaymentSession(
  cartId: string
): Promise<{ sessionId: string; collectionId: string; data: Record<string, unknown> } | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await sdk.store.cart.retrieve(cartId, { fields: "+payment_collection.payment_sessions.*" }) as any;
    const { cart } = response;

    const collection = cart?.payment_collection;
    if (!collection) return null;

    const session = collection.payment_sessions?.[0];
    if (!session) return null;

    return {
      sessionId: session.id,
      collectionId: collection.id,
      data: session.data ?? {},
    };
  } catch {
    return null;
  }
}


export async function completeCart(
  cartId: string,
  razorpayData?: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }
): Promise<PlacedOrder> {
  // Uses /store/carts/:id/complete-sync — our custom route that skips the
  // broken hasFinished() check in the official complete route (medusajs/medusa#13962).
  // If razorpayData is provided, the route stores it in the payment session before
  // running completeCartWorkflow so authorizePayment() can verify the signature.
  const res = await sdk.client.fetch<{ type: string; order: PlacedOrder }>(
    `/store/carts/${cartId}/complete-sync`,
    { method: "POST", body: razorpayData ?? {} }
  )
  if (!res.order) {
    throw new Error("Failed to complete order")
  }
  return res.order
}

export async function getOrder(orderId: string): Promise<PlacedOrder | null> {
  try {
    const { order } = await sdk.store.order.retrieve(orderId, {
      fields: "+items,+items.quantity,+items.variant,+items.variant.product,+fulfillments,+fulfillments.data,+payment_collections,+payment_collections.payment_sessions,+returns,+returns.items,+item_subtotal,+shipping_subtotal,+shipping_total,+tax_total,+original_tax_total,+discount_total,+total",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return order as any;
  } catch {
    return null;
  }
}

export async function checkPincodeServiceability(
  pincode: string
): Promise<{ serviceable: boolean; cheapestRate: number | null }> {
  try {
    const res = await fetch(
      `${BASE_URL}/store/shiprocket/serviceability?pincode=${pincode}`,
      { headers: { "x-publishable-api-key": PUB_KEY } }
    );
    const data = await res.json();
    const couriers: { rate: number }[] = data.couriers ?? [];
    const cheapest = couriers.length > 0
      ? Math.round(Math.min(...couriers.map((c) => c.rate)))
      : null;
    return { serviceable: data.serviceable ?? true, cheapestRate: cheapest };
  } catch {
    return { serviceable: true, cheapestRate: null };
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

/** Register + auto-login. Sets session cookie via SDK. */
export async function registerCustomer(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<void> {
  // Step 1: create auth identity via /register
  const regRes = await fetch(`${BASE_URL}/auth/customer/emailpass/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!regRes.ok) {
    const err = await regRes.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Registration failed");
  }
  const { token: regToken } = await regRes.json();

  // Step 2: create customer profile using the registration token
  await sdk.store.customer.create(
    { email, first_name: firstName, last_name: lastName },
    undefined,
    { Authorization: `Bearer ${regToken}` }
  );

  // Step 3: login — SDK sets connect.sid session cookie automatically in session mode
  await sdk.auth.login("customer", "emailpass", { email, password });
}

/** Login. SDK sets connect.sid session cookie automatically in session mode. */
export async function loginCustomer(email: string, password: string): Promise<void> {
  await sdk.auth.login("customer", "emailpass", { email, password });
}

/** Logout (invalidates server-side session). */
export async function logoutCustomer(): Promise<void> {
  return sdk.auth.logout();
}

/** Fetch the currently authenticated customer. Uses session cookie automatically. */
export async function getCurrentCustomer(): Promise<Customer | null> {
  try {
    const { customer } = await sdk.store.customer.retrieve();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return customer as any;
  } catch {
    return null;
  }
}

/** Fetch all orders for the authenticated customer. */
export async function getCustomerOrders(): Promise<PlacedOrder[]> {
  try {
    const { orders } = await sdk.store.order.list(
      { fields: "+items,+items.variant,+items.variant.product,+fulfillments,+fulfillments.data,+fulfillments.delivered_at", limit: 50 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return orders as any[];
  } catch {
    return [];
  }
}

/** Update customer profile fields. */
export async function updateCustomer(
  data: { first_name?: string; last_name?: string; phone?: string }
): Promise<Customer> {
  const { customer } = await sdk.store.customer.update(data);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return customer as any;
}

// ─── Review API ───────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  product_id: string;
  customer_id: string | null;
  order_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const res = await fetch(`${BASE_URL}/store/reviews?product_id=${productId}`, {
      headers: { "x-publishable-api-key": PUB_KEY },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.reviews ?? [];
  } catch {
    return [];
  }
}

export async function submitReview(
  payload: { product_id: string; order_id: string; rating: number; title?: string; body?: string }
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(`${BASE_URL}/store/reviews`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUB_KEY,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, message: data.message ?? "Failed to submit review" };
  return { ok: true };
}

/** Check if the customer has an order containing the product — returns the order_id if found */
export async function findOrderWithProduct(productId: string): Promise<string | null> {
  try {
    const { orders } = await sdk.store.order.list(
      { fields: "id,items.*,items.variant.*,items.variant.product_id", limit: 50 }
    );
    for (const order of orders ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = (order as any).items ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const found = items.some((item: any) => item.variant?.product_id === productId || item.product_id === productId);
      if (found) return order.id;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Address API ──────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  first_name: string | null;
  last_name: string | null;
  address_1: string | null;
  address_2: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country_code: string | null;
  phone: string | null;
}

export interface AddressInput {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  province: string;
  postal_code: string;
  country_code: string;
  phone?: string;
}

export async function listAddresses(): Promise<Address[]> {
  try {
    const res = await sdk.store.customer.listAddress({});
    return (res.addresses ?? []) as Address[];
  } catch {
    return [];
  }
}

export async function createAddress(data: AddressInput): Promise<Address[]> {
  await sdk.store.customer.createAddress(data);
  return listAddresses();
}

export async function updateAddress(addressId: string, data: Partial<AddressInput>): Promise<Address[]> {
  await sdk.store.customer.updateAddress(addressId, data);
  return listAddresses();
}

export async function deleteAddress(addressId: string): Promise<void> {
  await sdk.store.customer.deleteAddress(addressId);
}

/** Request a password reset email. */
export async function requestPasswordReset(email: string): Promise<void> {
  await fetch(`${BASE_URL}/auth/customer/emailpass/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: email }),
  });
}

/** Complete the password reset using the token from the email link. */
export async function resetPassword(token: string, password: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/customer/emailpass/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error("Failed to reset password. The link may have expired.");
}

// ─── Native Returns ───────────────────────────────────────────────────────────

export interface NativeReturnItem {
  id: string;
  item_id: string;   // maps to order line item id
  quantity: number;
  received_quantity?: number;
  reason_id?: string | null;
  note?: string | null;
}

export interface NativeReturn {
  id: string;
  order_id: string;
  status: "requested" | "received" | "partially_received" | "canceled";
  items: NativeReturnItem[];
  refund_amount?: number | null;
  refund_issued?: boolean;
  created_at: string;
}

// ─── Guest order lookup ───────────────────────────────────────────────────────

export interface GuestOrderResult {
  order: PlacedOrder & {
    created_at?: string;
    customer_id?: string | null;
    shipping_address?: {
      first_name?: string;
      last_name?: string;
      address_1?: string;
      city?: string;
      province?: string;
      postal_code?: string;
    };
    payment_collections?: Array<{
      payment_sessions?: Array<{ provider_id: string; status: string }>;
    }>;
  };
  order_return: NativeReturn | null;
}

/** Look up an order by order_id + token (from order-confirmation email link). */
export async function lookupOrder(
  orderId: string,
  opts: { token: string; email?: string } | { token?: string; email: string }
): Promise<GuestOrderResult | null> {
  const params = new URLSearchParams({ order_id: orderId });
  if (opts.token) params.set("token", opts.token);
  if (opts.email) params.set("email", opts.email);

  const res = await fetch(`${BASE_URL}/store/orders/lookup?${params}`, {
    headers: { "x-publishable-api-key": PUB_KEY },
  });
  if (!res.ok) return null;
  return res.json();
}

/** Fetch the native Medusa return for an order (authenticated customer). */
export async function getNativeReturnForOrder(
  orderId: string
): Promise<NativeReturn | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/store/returns?order_id=${encodeURIComponent(orderId)}&fields=id,status,refund_amount,items.*`,
      {
        credentials: "include",
        headers: {
          "x-publishable-api-key": PUB_KEY,
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.returns ?? [])[0] ?? null;
  } catch {
    return null;
  }
}

/** Fetch the native return for an authenticated customer's order via custom route. */
export async function fetchOrderReturns(
  orderId: string
): Promise<NativeReturn | null> {
  try {
    const res = await fetch(`${BASE_URL}/store/orders/${encodeURIComponent(orderId)}/returns`, {
      credentials: "include",
      headers: {
        "x-publishable-api-key": PUB_KEY,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.order_return ?? null;
  } catch {
    return null;
  }
}

// ─── Native returns (§3.10) ───────────────────────────────────────────────────

export interface NativeReturnReason {
  id: string;
  value: string;
  label: string;
}

/** Fetch return reasons from native Medusa endpoint. Results are stable — safe to cache. */
export async function fetchReturnReasons(): Promise<NativeReturnReason[]> {
  try {
    const res = await fetch(`${BASE_URL}/store/return-reasons`, {
      headers: { "x-publishable-api-key": PUB_KEY },
      cache: "force-cache",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.return_reasons ?? [];
  } catch {
    return [];
  }
}

/** Create a return for an authenticated customer via native POST /store/returns. */
export async function createNativeReturnRequest(
  orderId: string,
  items: { id: string; quantity: number; reason_id?: string }[],
  returnShippingOptionId?: string,
  note?: string
): Promise<{ return: NativeReturn }> {
  const body: Record<string, unknown> = { order_id: orderId, items };
  if (returnShippingOptionId) body.return_shipping = { option_id: returnShippingOptionId };
  if (note) body.note = note;

  const res = await fetch(`${BASE_URL}/store/returns`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUB_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Failed to submit return request");
  }
  return res.json();
}

/** Create a return for a guest customer via POST /store/returns/guest (HMAC-verified). */
export async function createNativeGuestReturnRequest(
  orderId: string,
  items: { id: string; quantity: number; reason_id?: string }[],
  opts: { token: string; email: string },
  options?: { return_shipping_option_id?: string; note?: string }
): Promise<{ return: NativeReturn }> {
  const body: Record<string, unknown> = {
    order_id: orderId,
    items,
    token: opts.token,
    email: opts.email,
  };
  if (options?.return_shipping_option_id) body.return_shipping_option_id = options.return_shipping_option_id;
  if (options?.note) body.note = options.note;

  const res = await fetch(`${BASE_URL}/store/returns/guest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUB_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Failed to submit return request");
  }
  return res.json();
}
