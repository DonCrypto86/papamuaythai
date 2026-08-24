export const formatGuarani = (value: number) => value > 0 ? `Gs. ${new Intl.NumberFormat("es-PY").format(value)}` : "Consultar";

export function whatsappUrl(name?: string, reference?: string, price?: number) {
  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "595982911600").replace(/\D/g, "");
  const message = name
    ? `Hola, quisiera consultar por ${name} (${reference})${price ? ` — ${formatGuarani(price)}` : ""}.`
    : "Hola, quisiera consultar por el menú de Papa Muay Thai.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
