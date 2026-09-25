import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
  { slug: 'whatsapp', name: 'WhatsApp', sortOrder: 1 },
  { slug: 'telegram', name: 'Telegram', sortOrder: 2 },
  { slug: 'google', name: 'Google', sortOrder: 3 },
  { slug: 'instagram', name: 'Instagram', sortOrder: 4 },
  { slug: 'discord', name: 'Discord', sortOrder: 5 },
  { slug: 'tiktok', name: 'TikTok', sortOrder: 6 },
];

const numbers = [
  { e164: '+12025550148', display: '+1 202 555 0148', countryIso: 'US', countryName: 'Estados Unidos', flag: '🇺🇸' },
  { e164: '+14155550198', display: '+1 415 555 0198', countryIso: 'US', countryName: 'Estados Unidos', flag: '🇺🇸' },
  { e164: '+525541602291', display: '+52 55 4160 2291', countryIso: 'MX', countryName: 'México', flag: '🇲🇽' },
  { e164: '+523318457720', display: '+52 33 1845 7720', countryIso: 'MX', countryName: 'México', flag: '🇲🇽' },
  { e164: '+34612445908', display: '+34 612 445 908', countryIso: 'ES', countryName: 'España', flag: '🇪🇸' },
  { e164: '+34622881304', display: '+34 622 881 304', countryIso: 'ES', countryName: 'España', flag: '🇪🇸' },
  { e164: '+573104482291', display: '+57 310 448 2291', countryIso: 'CO', countryName: 'Colombia', flag: '🇨🇴' },
  { e164: '+541153427781', display: '+54 11 5342 7781', countryIso: 'AR', countryName: 'Argentina', flag: '🇦🇷' },
  { e164: '+5511988214402', display: '+55 11 98821 4402', countryIso: 'BR', countryName: 'Brasil', flag: '🇧🇷' },
  { e164: '+447700900128', display: '+44 7700 900128', countryIso: 'GB', countryName: 'Reino Unido', flag: '🇬🇧' },
  { e164: '+4915123456789', display: '+49 151 23456789', countryIso: 'DE', countryName: 'Alemania', flag: '🇩🇪' },
  { e164: '+56961234488', display: '+56 9 6123 4488', countryIso: 'CL', countryName: 'Chile', flag: '🇨🇱' },
];

async function main() {
  await prisma.message.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.virtualNumber.deleteMany();
  await prisma.service.deleteMany();

  await prisma.service.createMany({ data: services });
  await prisma.virtualNumber.createMany({ data: numbers });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
