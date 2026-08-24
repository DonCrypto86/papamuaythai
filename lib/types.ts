export type Category = "entradas" | "fideos_arroz" | "currys_sopas" | "pescados" | "especialidades" | "postres" | "bebidas";

export type Product = {
  id: string; name: string; brand: string; reference: string; price: number; category: Category;
  sizes?: string; color?: string; short_note?: string; image_url: string;
  status: "published" | "hidden"; is_new: boolean; is_offer: boolean;
  created_at?: string; updated_at?: string;
};
