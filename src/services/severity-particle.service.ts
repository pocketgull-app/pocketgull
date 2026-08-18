import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class SeverityParticleService {
  /**
   * Builds an inflammatory aura particle group for high pain severity locations.
   */
  createSeverityParticleSystem(position: THREE.Vector3, painLevel: number): THREE.Points {
    const particleCount = Math.min(painLevel * 20, 200);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = painLevel >= 8
      ? new THREE.Color(0xef4444) // Severe / Bad (Red)
      : painLevel >= 6
      ? new THREE.Color(0xf97316) // Moderate (Orange)
      : painLevel >= 3
      ? new THREE.Color(0xeab308) // Mild (Yellow)
      : new THREE.Color(0x10b981); // Good / Normal (Green)

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.15 + Math.random() * 0.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = position.x + radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = position.y + radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = position.z + radius * Math.cos(phi);

      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData['painLevel'] = painLevel;
    return particles;
  }

  /**
   * Animates pulse and rotation of severity particle system.
   */
  animateParticles(particles: THREE.Points, time: number) {
    if (!particles) return;
    particles.rotation.y = time * 0.5;
    const scale = 1.0 + Math.sin(time * 3) * 0.15;
    particles.scale.set(scale, scale, scale);
  }
}
