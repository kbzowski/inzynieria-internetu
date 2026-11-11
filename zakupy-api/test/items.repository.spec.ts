import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { ItemsRepository } from '../src/items/items.repository.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

// prawdziwa baza test.db (DATABASE_URL w vitest.config.ts), bez Nesta i bez HTTP
const prisma = new PrismaService();
const repository = new ItemsRepository(prisma);

async function createUser(email: string) {
  return prisma.user.create({ data: { email, passwordHash: 'x' } });
}

describe('ItemsRepository', () => {
  beforeEach(async () => {
    // pusta baza przed kazdym testem; produkty znikaja razem z uzytkownikami
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('zwraca produkty w kolejności dodania', async () => {
    const ala = await createUser('ala@example.com');
    for (const name of ['Mleko', 'Chleb', 'Jajka']) {
      await repository.create(ala.id, { name });
    }
    const items = await repository.findAll(ala.id, {});
    expect(items.map((item) => item.name)).toEqual(['Mleko', 'Chleb', 'Jajka']);
  });

  it('nie zwraca produktów innego użytkownika', async () => {
    const ala = await createUser('ala@example.com');
    const ola = await createUser('ola@example.com');
    const milk = await repository.create(ala.id, { name: 'Mleko' });

    expect(await repository.findAll(ola.id, {})).toEqual([]);
    expect(await repository.findById(ola.id, milk.id)).toBeNull();
    expect(await repository.findByName(ola.id, 'Mleko')).toBeNull();
    expect(await repository.count(ola.id)).toBe(0);
  });

  it('nie wysyła userId w danych produktu', async () => {
    const ala = await createUser('ala@example.com');
    const milk = await repository.create(ala.id, { name: 'Mleko' });
    expect(Object.keys(milk)).toEqual(['id', 'name', 'bought']);
  });

  it('filtruje i sortuje według parametrów zapytania', async () => {
    const ala = await createUser('ala@example.com');
    await repository.create(ala.id, { name: 'Mleko' });
    const bread = await repository.create(ala.id, { name: 'Chleb' });
    await repository.update(ala.id, bread.id, { bought: true });

    const toBuy = await repository.findAll(ala.id, { bought: false });
    expect(toBuy.map((item) => item.name)).toEqual(['Mleko']);
    const sorted = await repository.findAll(ala.id, { sort: 'name' });
    expect(sorted.map((item) => item.name)).toEqual(['Chleb', 'Mleko']);
  });

  it('baza pozwala na tę samą nazwę u dwóch użytkowników, ale nie u jednego', async () => {
    const ala = await createUser('ala@example.com');
    const ola = await createUser('ola@example.com');
    await repository.create(ala.id, { name: 'Mleko' });
    await repository.create(ola.id, { name: 'Mleko' });

    await expect(repository.create(ala.id, { name: 'Mleko' })).rejects.toThrow(
      'Unique constraint failed',
    );
  });
});
