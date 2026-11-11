import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import argon2 from 'argon2';
import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL }),
});

// usuniecie uzytkownikow usuwa tez ich produkty (onDelete: Cascade)
await prisma.user.deleteMany();
const user = await prisma.user.create({
  data: {
    email: 'ala@example.com',
    passwordHash: await argon2.hash('haslo1234'),
  },
});
// po kolei, zeby kazdy produkt dostal pozniejsze id niz poprzedni
for (const item of [
  { name: 'Mleko' },
  { name: 'Chleb', bought: true },
  { name: 'Jajka' },
]) {
  await prisma.item.create({ data: { ...item, userId: user.id } });
}
console.log('Dane startowe: ala@example.com / haslo1234, 3 produkty');
await prisma.$disconnect();
