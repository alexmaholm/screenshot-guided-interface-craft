import { dishEligible, type Diet, type MealType, type Restriction } from "@/lib/balans";

export type RecipeFocus = "muskler" | "forma" | "energi" | "snabbt";
export const RECIPE_FOCUS: { value: RecipeFocus; label: string }[] = [
  { value: "muskler", label: "Öka muskler" },
  { value: "forma", label: "Forma kroppen" },
  { value: "energi", label: "Mer energi" },
  { value: "snabbt", label: "Snabbt" },
];

export interface Ingredient { qty: number; unit: string; name: string }
export interface Recipe {
  id: string; name: string; type: MealType; minutes: number; focus: RecipeFocus[];
  /** Nutrition per portion. */
  kcal: number; protein: number; carbs: number; fat: number;
  diets: Diet[]; contains: Restriction[];
  /** Ingredients for 1 portion. */
  ingredients: Ingredient[]; steps: string[];
}

const NON_VEG: Diet[] = ["allt", "glutenfritt"];
const FISH: Diet[] = ["allt", "pescetariskt", "glutenfritt"];
const VEG: Diet[] = ["allt", "vegetariskt", "pescetariskt", "glutenfritt"];
const VEGAN: Diet[] = ["allt", "vegetariskt", "veganskt", "pescetariskt", "glutenfritt"];

export const RECIPES: Recipe[] = [
  { id: "kyckling-ris", name: "Kyckling med ris och broccoli", type: "middag", minutes: 25, focus: ["muskler"], kcal: 560, protein: 48, carbs: 62, fat: 11, diets: NON_VEG, contains: [],
    ingredients: [{ qty: 150, unit: "g", name: "kycklingfilé" }, { qty: 70, unit: "g", name: "jasminris (okokt)" }, { qty: 150, unit: "g", name: "broccoli" }, { qty: 1, unit: "tsk", name: "olivolja" }],
    steps: ["Koka riset.", "Stek kycklingen i olja, salta och peppra.", "Ångkoka broccolin och servera allt tillsammans."] },
  { id: "lax-potatis", name: "Ugnslax med potatis och sparris", type: "middag", minutes: 30, focus: ["muskler", "energi"], kcal: 590, protein: 38, carbs: 45, fat: 26, diets: FISH, contains: [],
    ingredients: [{ qty: 130, unit: "g", name: "laxfilé" }, { qty: 200, unit: "g", name: "potatis" }, { qty: 100, unit: "g", name: "grön sparris" }, { qty: 1, unit: "tsk", name: "olivolja" }],
    steps: ["Sätt ugnen på 200°.", "Rosta potatisklyftor 15 min.", "Lägg på lax och sparris, ringla olja och baka 12–15 min."] },
  { id: "kvarg-bowl", name: "Proteinbowl med kvarg och bär", type: "frukost", minutes: 5, focus: ["muskler", "snabbt"], kcal: 330, protein: 32, carbs: 38, fat: 4, diets: VEG.filter((d) => d !== "glutenfritt"), contains: ["mjolk", "laktos", "gluten"],
    ingredients: [{ qty: 250, unit: "g", name: "kvarg" }, { qty: 1, unit: "dl", name: "frysta bär" }, { qty: 3, unit: "msk", name: "müsli" }],
    steps: ["Häll kvarg i en skål.", "Toppa med bär och müsli."] },
  { id: "aggwrap", name: "Äggwrap med spenat och fetaost", type: "frukost", minutes: 10, focus: ["muskler", "snabbt"], kcal: 420, protein: 27, carbs: 30, fat: 21, diets: ["allt", "vegetariskt", "pescetariskt"], contains: ["gluten", "agg", "mjolk", "laktos"],
    ingredients: [{ qty: 3, unit: "st", name: "ägg" }, { qty: 1, unit: "st", name: "tortillabröd" }, { qty: 1, unit: "dl", name: "babyspenat" }, { qty: 20, unit: "g", name: "fetaost" }],
    steps: ["Vispa och stek äggen med spenaten.", "Lägg i tortillan, smula över feta och rulla ihop."] },
  { id: "kikarts-sallad", name: "Matig kikärtssallad", type: "lunch", minutes: 10, focus: ["forma", "snabbt"], kcal: 410, protein: 17, carbs: 48, fat: 14, diets: VEGAN, contains: [],
    ingredients: [{ qty: 1, unit: "pkt", name: "kikärtor (230 g)" }, { qty: 1, unit: "st", name: "gurka" }, { qty: 10, unit: "st", name: "körsbärstomater" }, { qty: 1, unit: "msk", name: "olivolja" }, { qty: 0.5, unit: "st", name: "citron" }],
    steps: ["Skölj kikärtorna.", "Hacka grönsakerna.", "Blanda med olja, citron, salt och peppar."] },
  { id: "kyckling-sallad", name: "Kycklingsallad med quinoa", type: "lunch", minutes: 20, focus: ["forma", "muskler"], kcal: 450, protein: 40, carbs: 35, fat: 14, diets: NON_VEG, contains: [],
    ingredients: [{ qty: 130, unit: "g", name: "kycklingfilé" }, { qty: 50, unit: "g", name: "quinoa (okokt)" }, { qty: 2, unit: "dl", name: "sallad" }, { qty: 0.5, unit: "st", name: "avokado" }],
    steps: ["Koka quinoan.", "Stek och skiva kycklingen.", "Blanda med sallad och avokado."] },
  { id: "torsk-gronsaker", name: "Torsk med rotfrukter", type: "middag", minutes: 35, focus: ["forma"], kcal: 380, protein: 34, carbs: 40, fat: 8, diets: FISH, contains: [],
    ingredients: [{ qty: 150, unit: "g", name: "torskfilé" }, { qty: 250, unit: "g", name: "rotfrukter" }, { qty: 1, unit: "tsk", name: "rapsolja" }, { qty: 1, unit: "msk", name: "dill" }],
    steps: ["Rosta rotfrukterna i 200° i 20 min.", "Lägg på torsken och baka 12 min.", "Toppa med dill."] },
  { id: "linsgryta", name: "Röd linsgryta med kokos", type: "middag", minutes: 25, focus: ["energi", "forma"], kcal: 480, protein: 20, carbs: 60, fat: 16, diets: VEGAN, contains: [],
    ingredients: [{ qty: 0.75, unit: "dl", name: "röda linser" }, { qty: 1, unit: "dl", name: "kokosmjölk" }, { qty: 2, unit: "dl", name: "krossade tomater" }, { qty: 1, unit: "tsk", name: "curry" }, { qty: 0.5, unit: "st", name: "gul lök" }],
    steps: ["Fräs löken med curry.", "Tillsätt linser, tomat och kokosmjölk.", "Sjud 15 min och smaka av."] },
  { id: "overnight-oats", name: "Overnight oats med banan", type: "frukost", minutes: 5, focus: ["energi", "snabbt"], kcal: 390, protein: 14, carbs: 62, fat: 9, diets: ["allt", "vegetariskt", "veganskt", "pescetariskt"], contains: ["gluten"],
    ingredients: [{ qty: 1, unit: "dl", name: "havregryn" }, { qty: 1.5, unit: "dl", name: "havredryck" }, { qty: 1, unit: "msk", name: "chiafrön" }, { qty: 1, unit: "st", name: "banan" }],
    steps: ["Blanda havre, dryck och chia i en burk.", "Låt stå i kylen över natten.", "Toppa med skivad banan."] },
  { id: "tofu-wok", name: "Tofu-wok med grönsaker och ris", type: "middag", minutes: 20, focus: ["energi", "muskler"], kcal: 520, protein: 28, carbs: 60, fat: 17, diets: VEGAN, contains: ["soja"],
    ingredients: [{ qty: 150, unit: "g", name: "fast tofu" }, { qty: 60, unit: "g", name: "ris (okokt)" }, { qty: 200, unit: "g", name: "wokgrönsaker" }, { qty: 1, unit: "msk", name: "tamari (glutenfri soja)" }],
    steps: ["Koka riset.", "Stek tofun gyllene.", "Woka grönsakerna, blanda med tofu och tamari."] },
  { id: "tonfisk-macka", name: "Tonfiskmacka med ägg", type: "mellanmål", minutes: 5, focus: ["snabbt", "muskler"], kcal: 340, protein: 30, carbs: 26, fat: 12, diets: ["allt", "pescetariskt"], contains: ["gluten", "agg"],
    ingredients: [{ qty: 1, unit: "brk", name: "tonfisk i vatten" }, { qty: 2, unit: "skivor", name: "fullkornsbröd" }, { qty: 1, unit: "st", name: "kokt ägg" }, { qty: 1, unit: "msk", name: "lätt majonnäs" }],
    steps: ["Blanda tonfisk och majonnäs.", "Bred på brödet och toppa med skivat ägg."] },
  { id: "smoothie", name: "Grön energismoothie", type: "mellanmål", minutes: 5, focus: ["energi", "snabbt"], kcal: 260, protein: 8, carbs: 45, fat: 6, diets: VEGAN, contains: [],
    ingredients: [{ qty: 1, unit: "st", name: "banan" }, { qty: 1, unit: "dl", name: "fryst mango" }, { qty: 1, unit: "dl", name: "spenat" }, { qty: 2, unit: "dl", name: "havredryck (glutenfri)" }],
    steps: ["Mixa allt slätt.", "Drick direkt."] },
];

export function recipesFor(diet: Diet | undefined, restrictions: Restriction[] = [], focus?: RecipeFocus) {
  return RECIPES.filter((r) => dishEligible(r.diets, r.contains, diet, restrictions) && (!focus || r.focus.includes(focus)));
}

function fmt(n: number) {
  const r = Math.round(n * 10) / 10;
  return String(r).replace(".", ",");
}

export function scaleIngredients(r: Recipe, portions: number): string[] {
  return r.ingredients.map((i) => `${fmt(i.qty * portions)} ${i.unit} ${i.name}`);
}

export function ingredientsText(r: Recipe, portions: number) {
  return `${r.name} (${portions} ${portions === 1 ? "portion" : "portioner"})\n` + scaleIngredients(r, portions).map((l) => `- ${l}`).join("\n");
}
