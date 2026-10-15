import { describe, it, expect, vi } from 'vitest';
import { MediaService } from './media.service';

describe('MediaService', () => {
  it('generates a presigned upload url and S3 key', async () => {
    const mockRepo: any = {
      create: vi.fn(),
      findAll: vi.fn(),
    };
    const mockPrisma: any = {
      article: { findMany: vi.fn(), update: vi.fn() },
      person: { findMany: vi.fn(), update: vi.fn() },
      media: { findMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    };

    const service = new MediaService(mockRepo, mockPrisma);
    const result = await service.getPresignedUploadUrl({
      filename: 'my test image.PNG',
      mimeType: 'image/png',
      size: 1024,
      altText: 'Custom Alt',
    });

    expect(result.key).toBe('optimark/blog-uploads/my-test-image.webp');
    expect(result.filename).toBe('my-test-image.webp');
    expect(result.fileUrl).toContain('optimark-staging-media.dritech.co.id');
    expect(result.uploadUrl).toContain('X-Amz-Algorithm=AWS4-HMAC-SHA256');
    expect(result.altText).toBe('Custom Alt');
  });

  it('confirms upload and stores metadata in repository', async () => {
    const mockCreated = {
      id: 'media_123',
      url: 'https://optimark-staging-media.dritech.co.id/test.png',
      key: 'test.png',
      filename: 'test.png',
      altText: 'Alt',
      mimeType: 'image/png',
      size: 1024,
      width: 100,
      height: 100,
      createdAt: new Date(),
    };

    const mockRepo: any = {
      create: vi.fn().mockResolvedValue(mockCreated),
    };
    const mockPrisma: any = {
      article: { findMany: vi.fn(), update: vi.fn() },
      person: { findMany: vi.fn(), update: vi.fn() },
      media: { findMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    };

    const service = new MediaService(mockRepo, mockPrisma);
    const saved = await service.confirmUpload({
      key: 'test.png',
      url: 'https://optimark-staging-media.dritech.co.id/test.png',
      filename: 'test.png',
      mimeType: 'image/png',
      size: 1024,
      altText: 'Alt',
      width: 100,
      height: 100,
    });

    expect(mockRepo.create).toHaveBeenCalledWith({
      url: 'https://optimark-staging-media.dritech.co.id/test.png',
      key: 'test.png',
      filename: 'test.png',
      altText: 'Alt',
      mimeType: 'image/png',
      size: 1024,
      width: 100,
      height: 100,
    });
    expect(saved.id).toBe('media_123');
  });
});
