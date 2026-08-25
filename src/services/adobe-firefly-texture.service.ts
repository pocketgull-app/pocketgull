import { Injectable, signal } from '@angular/core';
import * as THREE from 'three';

export type FireflyTextureType = 'skin' | 'muscle' | 'skeleton' | 'organs';

export interface IFireflyTextureMetadata {
  type: FireflyTextureType;
  prompt: string;
  resolution: number;
  roughness: number;
  metalness: number;
  bumpScale: number;
  emissiveHex: number;
  emissiveIntensity: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdobeFireflyTextureService {
  public isFireflyEnabled = signal<boolean>(true);
  private textureCache = new Map<FireflyTextureType, THREE.Texture>();
  private imageCache = new Map<FireflyTextureType, string>();
  private textureLoader = new THREE.TextureLoader();

  private readonly textureConfigs: Record<FireflyTextureType, IFireflyTextureMetadata> = {
    skin: {
      type: 'skin',
      prompt: 'Edwin Smith Surgical Codex Case I: Micro-cellular dermal integument, biophotonic SSS refraction, Type I/III collagen substrate, non-invasive PBR telemetry',
      resolution: 512,
      roughness: 0.35,
      metalness: 0.15,
      bumpScale: 0.04,
      emissiveHex: 0x0284c7,
      emissiveIntensity: 0.12
    },
    muscle: {
      type: 'muscle',
      prompt: 'Edwin Smith Surgical Codex Case II: Striated myofibrillar fascicles, deep teal fascia collagen sheath, vascular endomysium strain mapping',
      resolution: 512,
      roughness: 0.45,
      metalness: 0.25,
      bumpScale: 0.08,
      emissiveHex: 0x0d9488,
      emissiveIntensity: 0.20
    },
    skeleton: {
      type: 'skeleton',
      prompt: 'Edwin Smith Surgical Codex Case III: Compact osteon cortical bone matrix, Haversian canal lattice, polished ivory trabecular architecture',
      resolution: 512,
      roughness: 0.25,
      metalness: 0.10,
      bumpScale: 0.03,
      emissiveHex: 0xe2e8f0,
      emissiveIntensity: 0.08
    },
    organs: {
      type: 'organs',
      prompt: 'Edwin Smith Surgical Codex Case IV: Endothelial organ vascular membrane, glowing cardiac micro-capillary web, visceral perfusion substrate',
      resolution: 512,
      roughness: 0.30,
      metalness: 0.20,
      bumpScale: 0.06,
      emissiveHex: 0xf43f5e,
      emissiveIntensity: 0.25
    }
  };

  constructor() {
    // Register cached static PNG texture assets generated via Firefly AI
    this.imageCache.set('skin', 'assets/textures/firefly_skin.png');
    this.imageCache.set('muscle', 'assets/textures/firefly_muscle.png');
    this.imageCache.set('skeleton', 'assets/textures/firefly_skeleton.png');
    this.imageCache.set('organs', 'assets/textures/firefly_organs.png');
  }

  /**
   * Retrieves a cached Firefly PBR texture map (image or procedural fallback).
   */
  public getFireflyTexture(type: FireflyTextureType): THREE.Texture {
    if (this.textureCache.has(type)) {
      return this.textureCache.get(type)!;
    }

    const imageUrl = this.imageCache.get(type);
    if (imageUrl && typeof window !== 'undefined') {
      try {
        const loadedTexture = this.textureLoader.load(
          imageUrl,
          (tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(4, 4);
            tex.needsUpdate = true;
          },
          undefined,
          () => {
            // Fall back to procedural canvas texture on load error
            const fallback = this.generateProceduralCanvasTexture(type);
            this.textureCache.set(type, fallback);
          }
        );

        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.repeat.set(4, 4);

        this.textureCache.set(type, loadedTexture);
        return loadedTexture;
      } catch (e) {
        console.debug('[AdobeFireflyTexture] Texture load fallback to procedural:', (e as Error)?.message);
      }
    }

    const fallback = this.generateProceduralCanvasTexture(type);
    this.textureCache.set(type, fallback);
    return fallback;
  }

  /**
   * Dynamically updates or swaps a cached texture asset at runtime.
   */
  public updateCachedTextureImage(type: FireflyTextureType, newImageUrl: string) {
    this.imageCache.set(type, newImageUrl);
    this.textureCache.delete(type);
    return this.getFireflyTexture(type);
  }

  /**
   * Generates a procedural PBR normal/bump texture map mimicking Adobe Firefly AI generative texture synthesis.
   */
  private generateProceduralCanvasTexture(type: FireflyTextureType): THREE.CanvasTexture {
    const config = this.textureConfigs[type] || this.textureConfigs.skin;
    const canvas = document.createElement('canvas');
    canvas.width = config.resolution;
    canvas.height = config.resolution;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, config.resolution, config.resolution);

      const imgData = ctx.getImageData(0, 0, config.resolution, config.resolution);
      const data = imgData.data;

      for (let y = 0; y < config.resolution; y++) {
        for (let x = 0; x < config.resolution; x++) {
          const idx = (y * config.resolution + x) * 4;
          const noise = Math.sin(x * 0.08) * Math.cos(y * 0.08) * 40 + (Math.random() - 0.5) * 30;
          
          if (type === 'muscle') {
            const fiber = Math.sin((x + y * 0.5) * 0.15) * 60;
            data[idx] = Math.min(255, Math.max(0, 15 + fiber + noise));
            data[idx + 1] = Math.min(255, Math.max(0, 140 + fiber + noise));
            data[idx + 2] = Math.min(255, Math.max(0, 130 + fiber + noise));
          } else if (type === 'organs') {
            const vascular = Math.sin(Math.sqrt(x * x + y * y) * 0.1) * 70;
            data[idx] = Math.min(255, Math.max(0, 220 + vascular));
            data[idx + 1] = Math.min(255, Math.max(0, 40 + vascular * 0.3));
            data[idx + 2] = Math.min(255, Math.max(0, 80 + vascular * 0.4));
          } else {
            data[idx] = Math.min(255, Math.max(0, 56 + noise));
            data[idx + 1] = Math.min(255, Math.max(0, 189 + noise));
            data[idx + 2] = Math.min(255, Math.max(0, 248 + noise));
          }
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  /**
   * Applies an Adobe Firefly AI texturized mesh material to a Three.js Mesh.
   */
  public applyFireflyTextureToMesh(mesh: THREE.Mesh, type: FireflyTextureType, baseColorHex: number = 0x38bdf8) {
    if (!mesh || !this.isFireflyEnabled()) return;

    const config = this.textureConfigs[type] || this.textureConfigs.skin;
    const bumpTexture = this.getFireflyTexture(type);

    const fireflyMaterial = new THREE.MeshStandardMaterial({
      color: baseColorHex,
      bumpMap: bumpTexture,
      bumpScale: config.bumpScale,
      roughness: config.roughness,
      metalness: config.metalness,
      emissive: config.emissiveHex,
      emissiveIntensity: config.emissiveIntensity,
      transparent: true,
      opacity: 0.92,
      depthWrite: true
    });

    mesh.material = fireflyMaterial;
    mesh.userData['fireflyTexturized'] = true;
    mesh.userData['fireflyPrompt'] = config.prompt;
  }
}
