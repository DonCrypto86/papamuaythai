export const formatGuarani = (value: number) => value > 0 ? `Gs. ${new Intl.NumberFormat("es-PY").format(value)}` : "Consultar";

export function whatsappUrl(name?: string, reference?: string, price?: number, language: "es" | "de" | "en" = "es") {
  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "595982911600").replace(/\D/g, "");
  const messages = {
    es: name ? `Hola, quisiera consultar por ${name} (${reference})${price ? ` — ${formatGuarani(price)}` : ""}.` : "Hola, quisiera consultar por el menú de Papa Muay Thai.",
    de: name ? `Hallo, ich möchte gern ${name} (${reference})${price ? ` — ${formatGuarani(price)}` : ""} anfragen.` : "Hallo, ich möchte gern etwas aus der Speisekarte von Papa Muay Thai bestellen.",
    en: name ? `Hello, I would like to ask about ${name} (${reference})${price ? ` — ${formatGuarani(price)}` : ""}.` : "Hello, I would like to ask about the Papa Muay Thai menu.",
  };
  const message = messages[language];
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
