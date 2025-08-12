import { describe, it, expect, vi } from 'vitest';

vi.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, init?: unknown) => ({ data, init }) },
}));

describe('GET', () => {
  it('disconnects after success', async () => {
    vi.resetModules();
    const disconnect = vi.fn();
    const count = vi.fn().mockResolvedValue(0);
    const upsert = vi.fn().mockResolvedValue({ companyName: 'X' });

    vi.doMock('@/lib/prisma', () => ({
      prisma: {
        $connect: vi.fn(),
        $disconnect: disconnect,
        tenant: { count, upsert },
      },
    }));

    const { GET } = await import('./route');
    await GET();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('disconnects after error', async () => {
    vi.resetModules();
    const disconnect = vi.fn();
    const count = vi.fn().mockRejectedValue(new Error('fail'));

    vi.doMock('@/lib/prisma', () => ({
      prisma: {
        $connect: vi.fn(),
        $disconnect: disconnect,
        tenant: { count, upsert: vi.fn() },
      },
    }));

    const { GET } = await import('./route');
    await GET();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
