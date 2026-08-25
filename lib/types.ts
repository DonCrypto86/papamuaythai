export type Category = "entradas" | "fideos_arroz" | "currys_sopas" | "pescados" | "especialidades" | "postres" | "bebidas";

export type Product = {
  id: string; tenant_id?: string; name: string; brand: string; reference: string; price: number; category: Category;
  name_de?: string; name_en?: string; sizes?: string; sizes_de?: string; sizes_en?: string;
  color?: string; short_note?: string; short_note_de?: string; short_note_en?: string; image_url: string;
  status: "published" | "hidden"; is_new: boolean; is_offer: boolean;
  created_at?: string; updated_at?: string;
};
