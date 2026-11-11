import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { appOptions, configureApp } from '../src/app.setup.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('API listy zakupów', () => {
  let app: INestApplication;

  // cala aplikacja z tymi samymi ustawieniami co w main.ts, ale bez nasluchiwania na porcie
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication(appOptions);
    configureApp(app);
    await app.init();
  });

  beforeEach(async () => {
    await app.get(PrismaService).user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  // zaklada konto i loguje sie; zwraca naglowek Authorization i ciasteczko z refresh tokenem
  async function login(email = 'ala@example.com') {
    const credentials = { email, password: 'haslo1234' };
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(201);
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200);
    return {
      authorization: `Bearer ${response.body.accessToken}`,
      // z naglowka "refresh_token=...; Path=/auth; ..." do odeslania wystarczy pierwsza czesc
      cookie: response.headers['set-cookie'][0].split(';')[0],
    };
  }

  it('bez tokenu odpowiada 401', async () => {
    await request(app.getHttpServer()).get('/items').expect(401);
  });

  it('dodaje produkt i pokazuje go na liście', async () => {
    const { authorization } = await login();
    await request(app.getHttpServer())
      .post('/items')
      .set('Authorization', authorization)
      .send({ name: '  Mleko ' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/items')
      .set('Authorization', authorization)
      .expect(200);
    expect(response.body).toMatchObject([{ name: 'Mleko', bought: false }]);
  });

  it('odrzuca złe dane kodem 400', async () => {
    const { authorization } = await login();
    const response = await request(app.getHttpServer())
      .post('/items')
      .set('Authorization', authorization)
      .send({ name: 42 })
      .expect(400);
    expect(response.body.message).toEqual([
      'name: Invalid input: expected string, received number',
    ]);
  });

  it('odpowiada 404 na produkt innego użytkownika', async () => {
    const ala = await login('ala@example.com');
    const created = await request(app.getHttpServer())
      .post('/items')
      .set('Authorization', ala.authorization)
      .send({ name: 'Mleko' })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/items/${created.body.id}`)
      .set('Authorization', ala.authorization)
      .expect(200);

    const ola = await login('ola@example.com');
    await request(app.getHttpServer())
      .get(`/items/${created.body.id}`)
      .set('Authorization', ola.authorization)
      .expect(404);
  });

  it('obsługuje /items/summary mimo trasy /items/:id', async () => {
    const { authorization } = await login();
    await request(app.getHttpServer())
      .post('/items')
      .set('Authorization', authorization)
      .send({ name: 'Mleko' });
    const bread = await request(app.getHttpServer())
      .post('/items')
      .set('Authorization', authorization)
      .send({ name: 'Chleb' });
    await request(app.getHttpServer())
      .patch(`/items/${bread.body.id}`)
      .set('Authorization', authorization)
      .send({ bought: true });

    const response = await request(app.getHttpServer())
      .get('/items/summary')
      .set('Authorization', authorization)
      .expect(200);
    expect(response.body).toEqual({ total: 2, left: 1 });
  });

  it('wymienia refresh token i odrzuca stary', async () => {
    const { cookie } = await login();
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', cookie)
      .expect(200);
    expect(response.body.accessToken).toBeDefined();
    const newCookie = response.headers['set-cookie'][0].split(';')[0];

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', cookie)
      .expect(401);
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', newCookie)
      .expect(200);
  });
});
