import type { Category, Product } from "./types";

const product = (id: string, name: string, price: number, category: Category, variants = "", note = ""): Product => ({
  id, name, brand: "Papa Muay Thai", reference: `PMT-${id.padStart(3, "0")}`, price, category,
  sizes: variants, short_note: note, image_url: "/products/placeholder.svg", status: "published", is_new: false, is_offer: false
});

export const demoProducts: Product[] = [
  product("1", "Rollitos de Primavera", 20000, "entradas"),
  product("2", "Som Tum · Ensalada de Papaya", 35000, "entradas"),
  product("3", "Rollitos de Verano", 35000, "entradas", "Vegetariano Gs. 35.000 · Pollo Gs. 35.000 · Camarón Gs. 50.000"),
  product("4", "Laab", 40000, "entradas", "Cerdo o carne", "Ensalada tailandesa con menta"),
  product("5", "Ensalada de Mariscos", 50000, "entradas"),
  product("6", "Sate de Pollo", 30000, "entradas"), product("7", "Cecina Tailandesa", 25000, "entradas"), product("8", "Papas Fritas", 20000, "entradas"),
  product("9", "Fideos de Cristal Fritos", 50000, "fideos_arroz", "Vegetariano Gs. 50.000 · Pollo Gs. 60.000"),
  product("10", "Fideos de Huevo Fritos", 45000, "fideos_arroz", "Vegetariano Gs. 45.000 · Pollo Gs. 55.000"),
  product("11", "Pad Thai", 50000, "fideos_arroz", "Vegetariano Gs. 50.000 · Pollo Gs. 60.000 · Mariscos Gs. 75.000"),
  product("12", "Pad Sii Ew", 50000, "fideos_arroz", "Vegetariano Gs. 50.000 · Pollo Gs. 60.000 · Mariscos Gs. 75.000"),
  product("13", "Arroz Frito", 40000, "fideos_arroz", "Vegetariano Gs. 40.000 · Pollo Gs. 50.000 · Mariscos Gs. 70.000"),
  product("14", "Tom Yum", 55000, "currys_sopas", "Vegetariano Gs. 55.000 · Pollo Gs. 65.000 · Mariscos Gs. 80.000"),
  product("15", "Tom Ka Kai", 55000, "currys_sopas", "Vegetariano Gs. 55.000 · Pollo Gs. 65.000 · Mariscos Gs. 80.000"),
  product("16", "Curry Rojo con Bambú", 50000, "currys_sopas", "Vegetariano Gs. 50.000 · Pollo Gs. 55.000 · Carne Gs. 65.000"),
  product("17", "Curry Verde", 50000, "currys_sopas", "Vegetariano Gs. 50.000 · Pollo Gs. 55.000 · Carne Gs. 65.000"),
  product("18", "Penang Curry", 50000, "currys_sopas", "Vegetariano Gs. 50.000 · Pollo Gs. 55.000 · Carne Gs. 65.000"),
  product("19", "Pescado al Vapor con Lima", 100000, "pescados", "Tilapia Gs. 100.000 · Salmón Gs. 120.000"),
  product("20", "Tilapia con Piña Agridulce", 120000, "pescados"),
  product("21", "Pescado al Vapor con Soja Negra y Shiitake", 100000, "pescados", "Tilapia Gs. 100.000 · Salmón Gs. 120.000"),
  product("22", "Pescado con Curry Rojo", 100000, "pescados", "Tilapia Gs. 100.000 · Salmón Gs. 120.000"),
  product("23", "Salchicha Tailandesa", 50000, "especialidades", "Con arroz o papas"), product("24", "Laab con Arroz", 60000, "especialidades", "Cerdo o carne"),
  product("25", "Pad Kaprao", 50000, "especialidades", "Pollo Gs. 50.000 · Carne o cerdo Gs. 60.000 · Mariscos Gs. 80.000"),
  product("26", "Salteado con Cúrcuma", 50000, "especialidades", "Vegetariano Gs. 50.000 · Pollo Gs. 60.000 · Mariscos Gs. 80.000"),
  product("27", "Bananas de Coco Fritas", 20000, "postres"),
  product("28", "Cerveza", 8000, "bebidas", "Vaso Gs. 8.000 · Botella 0,9 l Gs. 12.000"), product("29", "Radler", 10000, "bebidas", "Vaso"),
  product("30", "Cola / Schweppes", 6000, "bebidas"), product("31", "Jugo", 6000, "bebidas"), product("32", "Agua con Gas", 5000, "bebidas"),
  product("33", "Agua sin Gas", 0, "bebidas", "Precio por confirmar"), product("34", "Café", 8000, "bebidas"), product("35", "Té", 8000, "bebidas")
];
