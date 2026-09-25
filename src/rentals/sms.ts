export const rentalInclude = {
  virtualNumber: true,
  service: true,
  messages: { orderBy: { receivedAt: 'asc' as const } },
};

const templates: Record<string, (code: string) => string> = {
  whatsapp: (code) => `Tu código de WhatsApp es ${code}. No lo compartas con nadie.`,
  telegram: (code) => `Telegram: ${code} es tu código de inicio de sesión.`,
  google: (code) => `G-${code} es tu código de verificación de Google.`,
  instagram: (code) => `${code} es tu código de Instagram. No lo compartas.`,
  discord: (code) => `Tu código de verificación de Discord es ${code}.`,
  tiktok: (code) => `[TikTok] Código de verificación: ${code}. Caduca en 5 minutos.`,
};

export function buildVerificationSms(serviceSlug: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const template = templates[serviceSlug] ?? ((value: string) => `Tu código es ${value}.`);
  return { code, body: template(code) };
}
