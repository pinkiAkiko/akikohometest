import { StaticImageData } from "next/image";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  slug: string;
  name: string;
  material: string;
  price: string;
  priceNum: number;
  originalPrice?: string;
  badge?: string;
  category: string;
  description: string;
  gsm?: number;
  sizes: string[];
  colors: ProductColor[];
  images: (string | StaticImageData)[];
  careInstructions: string[];
  details: string[];
}

export const products: Product[] = [
  {
    slug: "classic-bath-towel-set",
    name: "Classic Bath Towel Set",
    material: "100% Combed Cotton",
    price: "₹1,299",
    priceNum: 1299,
    badge: "New",
    category: "towels",
    description: "Our signature bath towel set crafted from 100% combed cotton. Exceptionally soft, highly absorbent, and designed to get softer with every wash. A set of two generously sized bath towels.",
    gsm: 550,
    sizes: ["Hand Towel", "Bath Towel", "Bath Sheet"],
    colors: [
      { name: "White", hex: "#F5F0EB" },
      { name: "Ivory", hex: "#FFFFF0" },
      { name: "Sage", hex: "#B2AC88" },
      { name: "Slate", hex: "#708090" },
    ],
    images: [product1],
    careInstructions: ["Machine wash warm", "Tumble dry low", "Do not bleach", "Do not iron"],
    details: ["550 GSM weight", "Set of 2 towels", "Double-stitched hems", "OEKO-TEX certified"],
  },
  {
    slug: "slate-grey-hand-towels",
    name: "Slate Grey Hand Towels",
    material: "Premium Long-Staple Cotton",
    price: "₹899",
    priceNum: 899,
    category: "towels",
    description: "Elegant slate grey hand towels woven from premium long-staple cotton. The longer fibers create a smoother, more lustrous finish that resists pilling and maintains its beauty wash after wash.",
    gsm: 500,
    sizes: ["Hand Towel", "Bath Towel"],
    colors: [
      { name: "Slate Grey", hex: "#708090" },
      { name: "Charcoal", hex: "#36454F" },
      { name: "White", hex: "#F5F0EB" },
    ],
    images: [product2],
    careInstructions: ["Machine wash cold", "Tumble dry low", "Wash dark colors separately"],
    details: ["500 GSM weight", "Set of 4 hand towels", "Long-staple cotton", "Fade-resistant dye"],
  },
  {
    slug: "cloud-comforter",
    name: "Cloud Comforter",
    material: "Microfiber Fill",
    price: "₹3,499",
    priceNum: 3499,
    originalPrice: "₹4,299",
    badge: "New",
    category: "comforters",
    description: "Drift into cloud-like comfort with our premium microfiber-filled comforter. Lightweight yet incredibly warm, with a silky-soft cotton shell that feels gentle against your skin.",
    sizes: ["Single", "Double", "Queen", "King"],
    colors: [
      { name: "White", hex: "#F5F0EB" },
      { name: "Cream", hex: "#FFFDD0" },
      { name: "Light Grey", hex: "#D3D3D3" },
    ],
    images: [product3],
    careInstructions: ["Machine wash cold on gentle cycle", "Tumble dry low", "Use a duvet cover for longevity"],
    details: ["300 GSM fill weight", "100% cotton shell", "Box-stitch construction", "Hypoallergenic fill"],
  },
  {
    slug: "bamboo-bath-towel",
    name: "Bamboo Bath Towel",
    material: "Bamboo Viscose Blend",
    price: "₹1,499",
    priceNum: 1499,
    category: "bamboo",
    description: "Experience the natural luxury of bamboo. Our bamboo viscose blend towels are impossibly soft, naturally antibacterial, and more absorbent than traditional cotton. A sustainable choice for mindful living.",
    gsm: 600,
    sizes: ["Hand Towel", "Bath Towel", "Bath Sheet"],
    colors: [
      { name: "Natural", hex: "#F5F0EB" },
      { name: "Sage", hex: "#B2AC88" },
      { name: "Blush", hex: "#DEB8B8" },
    ],
    images: [product4],
    careInstructions: ["Machine wash cold", "Tumble dry low", "Avoid fabric softeners", "Do not bleach"],
    details: ["600 GSM weight", "70% bamboo viscose, 30% cotton", "Naturally antibacterial", "Sustainably sourced"],
  },
  {
    slug: "tufted-bath-mat",
    name: "Tufted Bath Mat",
    material: "Cotton Terry",
    price: "₹999",
    priceNum: 999,
    category: "bathmats",
    description: "Step out in comfort with our densely tufted cotton bath mat. The plush terry surface absorbs water quickly while the non-slip backing keeps you safe on wet floors.",
    gsm: 1200,
    sizes: ["Small (40x60cm)", "Large (50x80cm)"],
    colors: [
      { name: "White", hex: "#F5F0EB" },
      { name: "Grey", hex: "#A9A9A9" },
      { name: "Sage", hex: "#B2AC88" },
    ],
    images: [product5],
    careInstructions: ["Machine wash warm", "Hang dry or tumble dry low", "Do not bleach"],
    details: ["1200 GSM ultra-dense", "Non-slip latex backing", "Quick-dry design", "Reinforced edges"],
  },
  {
    slug: "rose-petal-towel-set",
    name: "Rose Petal Towel Set",
    material: "Zero-Twist Cotton",
    price: "₹1,599",
    priceNum: 1599,
    category: "towels",
    description: "Unbelievably soft from the very first use. Our zero-twist cotton technology creates a towel that's lighter, fluffier, and more absorbent than conventional towels.",
    gsm: 500,
    sizes: ["Hand Towel", "Bath Towel", "Bath Sheet"],
    colors: [
      { name: "Rose", hex: "#DEB8B8" },
      { name: "White", hex: "#F5F0EB" },
      { name: "Ivory", hex: "#FFFFF0" },
    ],
    images: [product6],
    careInstructions: ["Machine wash warm", "Tumble dry low", "No fabric softener needed"],
    details: ["500 GSM weight", "Zero-twist technology", "Set of 2 towels", "Ultra-absorbent"],
  },
  {
    slug: "waffle-weave-towels",
    name: "Waffle Weave Towels",
    material: "Premium Cotton",
    price: "₹1,199",
    priceNum: 1199,
    badge: "Bestseller",
    category: "towels",
    description: "Our bestselling waffle weave towels combine a contemporary honeycomb texture with exceptional absorbency. They dry faster than terry towels and get softer with every wash.",
    gsm: 400,
    sizes: ["Hand Towel", "Bath Towel"],
    colors: [
      { name: "White", hex: "#F5F0EB" },
      { name: "Oatmeal", hex: "#D2C4A5" },
      { name: "Charcoal", hex: "#36454F" },
    ],
    images: [product7],
    careInstructions: ["Machine wash warm", "Tumble dry medium", "Do not bleach"],
    details: ["400 GSM weight", "Waffle honeycomb weave", "Quick-dry design", "OEKO-TEX certified"],
  },
  {
    slug: "charcoal-spa-towel",
    name: "Charcoal Spa Towel",
    material: "Combed Cotton 600 GSM",
    price: "₹1,399",
    priceNum: 1399,
    category: "towels",
    description: "Indulge in spa-worthy luxury at home. Our 600 GSM combed cotton spa towels are thick, plush, and incredibly absorbent — the closest thing to a five-star hotel experience.",
    gsm: 600,
    sizes: ["Bath Towel", "Bath Sheet"],
    colors: [
      { name: "Charcoal", hex: "#36454F" },
      { name: "Slate", hex: "#708090" },
      { name: "White", hex: "#F5F0EB" },
    ],
    images: [product8],
    careInstructions: ["Machine wash warm", "Tumble dry low", "Wash dark colors separately"],
    details: ["600 GSM weight", "Combed cotton", "Double-stitched hems", "Fade-resistant"],
  },
];

export const categoryInfo: Record<string, { title: string; description: string; image?: StaticImageData }> = {
  towels: {
    title: "Towels",
    description: "Premium bath, hand, and face towels crafted from the finest cotton and bamboo.",
    image: product1,
  },
  bathmats: {
    title: "Bathmats",
    description: "Step onto luxury. Plush, absorbent bath mats designed for comfort and safety.",
    image: product5,
  },
  comforters: {
    title: "Comforters",
    description: "Cloud-like comforters for restful nights and cozy mornings.",
    image: product3,
  },
  bamboo: {
    title: "Bamboo Collection",
    description: "Naturally soft, antibacterial, and sustainable. The future of home textiles.",
    image: product4,
  },
  cleaning: {
    title: "Cleaning Towels",
    description: "Durable, efficient cleaning towels for a spotless home.",
  },
  kids: {
    title: "Kids Collection",
    description: "Gentle on delicate skin. Fun designs your little ones will love.",
  },
};

export const getProductsByCategory = (category: string): Product[] =>
  products.filter((p) => p.category === category);

export const getProductBySlug = (slug: string): Product | undefined =>
  products.find((p) => p.slug === slug);

export const getRelatedProducts = (slug: string, limit = 4): Product[] => {
  const product = getProductBySlug(slug);
  if (!product) return products.slice(0, limit);
  const related = products.filter((p) => p.category === product.category && p.slug !== slug);
  if (related.length >= limit) return related.slice(0, limit);
  return [...related, ...products.filter((p) => p.slug !== slug && p.category !== product.category)].slice(0, limit);
};
