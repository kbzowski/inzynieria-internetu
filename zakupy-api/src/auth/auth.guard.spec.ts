import type { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard, type AuthRequest } from './auth.guard.js';

const jwt = new JwtService({
  secret: 'sekret-tylko-do-testow-co-najmniej-32-znaki',
  signOptions: { expiresIn: 900 },
});
const guard = new AuthGuard(jwt);

// straznik potrzebuje z kontekstu tylko obiektu zapytania
function contextWith(request: Partial<AuthRequest>) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
}

describe('AuthGuard', () => {
  // udawany zegar: test nie czeka 15 minut i daje zawsze ten sam wynik
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-11T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('wpuszcza z ważnym tokenem i zapisuje id użytkownika', async () => {
    const token = await jwt.signAsync({ sub: 'user-1' });
    const request = { headers: { authorization: `Bearer ${token}` } };
    await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);
    expect(request).toHaveProperty('userId', 'user-1');
  });

  it('wpuszcza przed upływem ważności tokenu i odrzuca po nim', async () => {
    const token = await jwt.signAsync({ sub: 'user-1' });
    const request = { headers: { authorization: `Bearer ${token}` } };

    vi.advanceTimersByTime(14 * 60 * 1000);
    await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);

    vi.advanceTimersByTime(60 * 1000 + 1000);
    await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
      'Nieprawidłowy lub wygasły token',
    );
  });

  it('odrzuca zapytanie bez tokenu', async () => {
    await expect(
      guard.canActivate(contextWith({ headers: {} })),
    ).rejects.toThrow('Brak tokenu');
  });
});
