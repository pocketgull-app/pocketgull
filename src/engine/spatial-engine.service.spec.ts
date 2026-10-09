import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SpatialEngineService } from './spatial-engine.service';
import { createAnatomicalEllipsoid } from './geometry/procedural-mesh';

describe('SpatialEngineService (Multi-Tier Graphics Engine)', () => {
  let service: SpatialEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpatialEngineService]
    });
    service = TestBed.inject(SpatialEngineService);
  });

  afterEach(() => {
    service.destroy();
  });

  it('should initialize with null active backend and false initialized signal', () => {
    expect(service.activeBackend()).toBeNull();
    expect(service.isInitialized()).toBe(false);
    expect(service.frameCount()).toBe(0);
  });

  it('should fall back to canvas2d backend when WebGPU and WebGL2 are unavailable', async () => {
    // Create mock canvas with 2D context only
    const mockCtx2d = {
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() })
    };

    const mockCanvas = {
      width: 640,
      height: 480,
      getContext: vi.fn((type: string) => {
        if (type === 'webgpu' || type === 'webgl2') return null;
        if (type === '2d') return mockCtx2d;
        return null;
      })
    } as unknown as HTMLCanvasElement;

    const backend = await service.initialize(mockCanvas);
    expect(backend).toBe('canvas2d');
    expect(service.activeBackend()).toBe('canvas2d');
    expect(service.isInitialized()).toBe(true);

    // Upload a test mesh
    const mesh = createAnatomicalEllipsoid(1, 1, 1, 8, 8, 0, 101);
    const handle = service.uploadMesh(mesh);
    expect(handle).toBeGreaterThan(0);

    // Trigger render frame
    service.renderFrame();
    expect(service.frameCount()).toBe(1);
    expect(mockCtx2d.fillRect).toHaveBeenCalled();

    // Hit test picking
    const picked = await service.pickPartAt(320, 240); // Center of canvas
    expect(picked).toBe(101);
  });

  it('should clean up resources on destroy', async () => {
    const mockCtx2d = {
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() })
    };

    const mockCanvas = {
      width: 640,
      height: 480,
      getContext: vi.fn((type: string) => (type === '2d' ? mockCtx2d : null))
    } as unknown as HTMLCanvasElement;

    await service.initialize(mockCanvas);
    expect(service.isInitialized()).toBe(true);

    service.destroy();
    expect(service.isInitialized()).toBe(false);
    expect(service.activeBackend()).toBeNull();
  });
});
