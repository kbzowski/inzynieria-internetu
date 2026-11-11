import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL }),
});

await prisma.item.deleteMany();
// po kolei, zeby kazdy produkt dostal pozniejsze id niz poprzedni
for (const item of [
  { name: 'Mleko' },
  { name: 'Chleb', bought: true },
  { name: 'Jajka' },
]) {
  await prisma.item.create({ data: item });
}
console.log('Dane startowe: 3 produkty');
await prisma.$disconnect();
