import type { Category, Product } from "@/lib/types";

export type Language = "es" | "de" | "en";

export const copy = {
  es: { cuisine:"Cocina tailandesa", hero:"Sabores de Tailandia,", near:"más cerca.", intro:"Explorá el menú y consultá directamente por WhatsApp.", viewMenu:"Ver menú", menu:"Nuestro menú", favorite:"Elegí tu favorito", products:"productos", price:"Precio", view:"Ver", from:"Desde", ask:"Consultar", order:"¿Querés hacer un pedido?", write:"Escribinos por WhatsApp", productOf:"Producto de", close:"Cerrar", share:"Compartir en mi Estado", preparing:"Preparando…", all:"Todo" },
  de: { cuisine:"Thailändische Küche", hero:"Thailändische Aromen,", near:"ganz in deiner Nähe.", intro:"Entdecke die Speisekarte und frag direkt über WhatsApp an.", viewMenu:"Speisekarte ansehen", menu:"Unsere Speisekarte", favorite:"Wähle deinen Favoriten", products:"Produkte", price:"Preis", view:"Ansehen", from:"Ab", ask:"Anfragen", order:"Möchtest du bestellen?", write:"Schreib uns über WhatsApp", productOf:"Ein Produkt von", close:"Schließen", share:"Im Status teilen", preparing:"Wird vorbereitet…", all:"Alle" },
  en: { cuisine:"Thai cuisine", hero:"Flavors of Thailand,", near:"closer to you.", intro:"Explore the menu and ask us directly on WhatsApp.", viewMenu:"View menu", menu:"Our menu", favorite:"Choose your favorite", products:"products", price:"Price", view:"View", from:"From", ask:"Ask us", order:"Would you like to order?", write:"Message us on WhatsApp", productOf:"A product by", close:"Close", share:"Share to my Status", preparing:"Preparing…", all:"All" },
} as const;

export const categoryLabels: Record<Language, Record<Category, string>> = {
  es: { entradas:"Aperitivos", fideos_arroz:"Fideos y arroz", currys_sopas:"Currys y sopas", pescados:"Pescados", especialidades:"Especialidades", postres:"Postres", bebidas:"Bebidas" },
  de: { entradas:"Vorspeisen", fideos_arroz:"Nudeln & Reis", currys_sopas:"Currys & Suppen", pescados:"Fischgerichte", especialidades:"Spezialitäten", postres:"Desserts", bebidas:"Getränke" },
  en: { entradas:"Starters", fideos_arroz:"Noodles & rice", currys_sopas:"Curries & soups", pescados:"Fish dishes", especialidades:"Specialties", postres:"Desserts", bebidas:"Drinks" },
};

const names: Record<string, [string, string]> = {
  "PMT-001":["Frühlingsrollen","Spring Rolls"], "PMT-002":["Som Tum · Papayasalat","Som Tum · Papaya Salad"], "PMT-003":["Sommerrollen","Summer Rolls"], "PMT-004":["Laab","Laab"], "PMT-005":["Meeresfrüchtesalat","Seafood Salad"], "PMT-006":["Hähnchen-Satay","Chicken Satay"], "PMT-007":["Thailändisches Trockenfleisch","Thai Dried Meat"], "PMT-008":["Pommes frites","French Fries"], "PMT-009":["Gebratene Glasnudeln","Fried Glass Noodles"], "PMT-010":["Gebratene Eiernudeln","Fried Egg Noodles"], "PMT-011":["Pad Thai","Pad Thai"], "PMT-012":["Pad See Ew","Pad See Ew"], "PMT-013":["Gebratener Reis","Fried Rice"], "PMT-014":["Tom Yam","Tom Yam"], "PMT-015":["Tom Kha Gai","Tom Kha Gai"], "PMT-016":["Rotes Curry mit Bambus","Red Curry with Bamboo"], "PMT-017":["Grünes Curry","Green Curry"], "PMT-018":["Panang Curry","Panang Curry"], "PMT-019":["Gedämpfter Fisch mit Limette","Steamed Fish with Lime"], "PMT-020":["Süß-saure Tilapia mit Ananas","Sweet and Sour Tilapia with Pineapple"], "PMT-021":["Gedämpfter Fisch mit schwarzer Sojasauce und Shiitake","Steamed Fish with Black Soy Sauce and Shiitake"], "PMT-022":["Fisch mit rotem Curry","Fish with Red Curry"], "PMT-023":["Thailändische Wurst","Thai Sausage"], "PMT-024":["Laab mit Reis","Laab with Rice"], "PMT-025":["Pad Kra Pao","Pad Kra Pao"], "PMT-026":["Kurkuma-Pfannengericht","Turmeric Stir-Fry"], "PMT-027":["Frittierte Kokosbananen","Fried Coconut Bananas"], "PMT-028":["Bier","Beer"], "PMT-029":["Radler","Radler"], "PMT-030":["Coca-Cola / Schweppes","Coca-Cola / Schweppes"], "PMT-031":["Saft","Juice"], "PMT-032":["Mineralwasser mit Kohlensäure","Sparkling Water"], "PMT-033":["Stilles Wasser","Still Water"], "PMT-034":["Kaffee","Coffee"], "PMT-035":["Tee","Tea"],
};

const replacements: Record<"de"|"en", Record<string,string>> = {
  de: { "Precio por confirmar":"Preis auf Anfrage", "Vegetariano":"Vegetarisch", "Camarón":"Garnelen", "Mariscos":"Meeresfrüchte", "Pollo":"Hähnchen", "Carne":"Rind", "Cerdo":"Schwein", "Tilapia":"Tilapia", "Salmón":"Lachs", "Con arroz o papas":"Mit Reis oder Pommes", "Botella":"Flasche", "Vaso":"Glas" },
  en: { "Precio por confirmar":"Price on request", "Vegetariano":"Vegetarian", "Camarón":"Shrimp", "Mariscos":"Seafood", "Pollo":"Chicken", "Carne":"Beef", "Cerdo":"Pork", "Tilapia":"Tilapia", "Salmón":"Salmon", "Con arroz o papas":"With rice or fries", "Botella":"Bottle", "Vaso":"Glass" },
};

function translateList(value: string | undefined, language: Language) {
  if (!value || language === "es") return value;
  return value.split("·").map(part => replacements[language][part.trim()] ?? part.trim()).join(" · ");
}

export function productName(product: Product, language: Language) {
  if (language === "es") return product.name;
  return (language === "de" ? product.name_de : product.name_en) || names[product.reference]?.[language === "de" ? 0 : 1] || product.name;
}
export function productSizes(product: Product, language: Language) {
  return (language === "de" ? product.sizes_de : language === "en" ? product.sizes_en : product.sizes) || translateList(product.sizes, language);
}
export function productNote(product: Product, language: Language) {
  const saved = language === "de" ? product.short_note_de : language === "en" ? product.short_note_en : product.short_note;
  if (saved) return saved;
  if (product.reference === "PMT-004") return language === "de" ? "Thailändischer Salat mit Minze" : language === "en" ? "Thai salad with mint" : product.short_note;
  return product.short_note;
}
