import { Component, ChangeDetectionStrategy, ElementRef, OnDestroy, AfterViewInit, input, viewChild, effect, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

@Component({
    selector: 'app-medical-3d-viewer',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div #canvasContainer class="w-full h-full relative overflow-hidden rounded-2xl border border-amber-500/20 shadow-inner bg-[#F9F3D9]/20 dark:bg-zinc-900/60" [class.cursor-grab]="webglSupported()" [class.active:cursor-grabbing]="webglSupported()">
            @if (!webglSupported()) {
                <div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                    <svg class="w-10 h-10 text-zinc-400 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">3D view unavailable on this device</span>
                    @if (webglError()) {
                        <span class="text-[12px] text-red-500 mt-2 max-w-xs break-words">{{ webglError() }}</span>
                    }
                </div>
            }
        </div>
    `,
    styles: [`
        :host { display: block; height: 100%; width: 100%; }
        canvas { outline: none; }
    `]
})
export class Medical3DViewerComponent implements AfterViewInit, OnDestroy {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

    threejsId = input.required<string>();
    severity = input<'green' | 'yellow' | 'red' | undefined>();
    afflictionHighlight = input<string | undefined>();
    particles = input<boolean | undefined>();
    layerMode = input<'surface' | 'acetate' | 'core' | 'all' | undefined>();

    activeLayerMode = signal<'surface' | 'acetate' | 'core' | 'all'>('acetate');

    setLayerMode(mode: 'surface' | 'acetate' | 'core' | 'all') {
      this.activeLayerMode.set(mode);
      if (this.scene && this.threejsId()) {
        this.loadModel(this.threejsId());
      }
    }

    private renderer!: THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private controls!: OrbitControls;
    private composer!: EffectComposer;
    private currentModelGroup!: THREE.Group;
    private animationFrameId?: number;

    readonly webglSupported = signal<boolean>(true);
    readonly webglError = signal<string>('');

    // Industrial Grace palette + Kaizen Severity
    private readonly PALETTE = {
        background: 0x0a0a0a,
        wireframe: 0x334155,
        primary: 0x0ea5e9, // A stark cyan/blue for the main form
        particles: 0x38bdf8,
        severity: {
            red: 0xef4444,    // Critical / Severe
            yellow: 0xeab308, // Warning / Moderate
            green: 0x22c55e   // Normal / Healthy
        }
    };

    constructor() {
        effect(() => {
            const id = this.threejsId();
            // trigger re-render if severity or particles change
            this.severity();
            this.particles();
            if (this.scene) {
                this.loadModel(id);
            }
        });
    }

    ngAfterViewInit() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        try {
            const ua = window.navigator.userAgent.toLowerCase();
            const isAutomated = window.navigator.webdriver || ua.includes('headless') || ua.includes('playwright');
            if (isAutomated) {
                throw new Error("WebGL disabled in automated test environments to prevent GPU hangs.");
            }
            this.initScene();
            this.startAnimation();
            // Load initial model after slight delay to ensure container is ready
            setTimeout(() => {
                if (this.webglSupported()) {
                    this.handleResize();
                    this.loadModel(this.threejsId());
                }
            }, 0);
        } catch (e: any) {
            console.warn("Failed to initialize Medical 3D Viewer:", e);
            this.webglSupported.set(false);
            this.webglError.set(e?.message || String(e));
        }
    }

    ngOnDestroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            this.renderer.domElement?.remove();
        }
    }

    private isWebGLAvailable(): boolean {
        try {
            if (typeof window === 'undefined' || typeof document === 'undefined') return false;
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    private initScene() {
        const container = this.canvasContainer()!.nativeElement;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.PALETTE.background);
        this.scene.fog = new THREE.FogExp2(this.PALETTE.background, 0.05);

        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        this.camera.position.set(0, 0, isMobile ? 12 : 10);

        if (!this.isWebGLAvailable()) {
            throw new Error('WebGL is not supported in this environment.');
        }

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        // Lighting - Industrial Grace (Harsh, directional)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);

        const rimLight = new THREE.DirectionalLight(this.PALETTE.primary, 2);
        rimLight.position.set(-5, 5, -5);
        this.scene.add(rimLight);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 1.0; // Slower, more premium idle rotation
        this.controls.enablePan = false;
        
        // Touch interaction fixes for mobile
        if (isMobile) {
            this.controls.enableZoom = false;
            this.renderer.domElement.style.touchAction = 'pan-y';
        }
        
        // Post-Processing (Bloom)
        const renderScene = new RenderPass(this.scene, this.camera);
        // Resolution, strength, radius, threshold - downsampled on mobile
        const bloomWidth = isMobile ? container.clientWidth / 2 : container.clientWidth;
        const bloomHeight = isMobile ? container.clientHeight / 2 : container.clientHeight;
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(bloomWidth, bloomHeight), 1.2, 0.5, 0.2);
        
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);

        // Handle resize
        const resizeObserver = new ResizeObserver(() => this.handleResize());
        resizeObserver.observe(container);
    }

    private handleResize() {
        if (!this.canvasContainer() || !this.camera || !this.renderer) return;
        const container = this.canvasContainer()!.nativeElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) return;

        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        this.camera.aspect = width / height;

        // Prevent layout clipping on narrow screens
        const baseDistance = isMobile ? 12 : 10;
        const aspectLimit = 1.0;
        if (this.camera.aspect < aspectLimit) {
            this.camera.position.z = baseDistance * (aspectLimit / this.camera.aspect);
        } else {
            this.camera.position.z = baseDistance;
        }

        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        
        if (this.composer) {
            const bloomWidth = isMobile ? width / 2 : width;
            const bloomHeight = isMobile ? height / 2 : height;
            this.composer.setSize(width, height);
            
            // Re-configure bloom composer resolution
            this.composer.passes.forEach(pass => {
                if (pass instanceof UnrealBloomPass) {
                    pass.setSize(bloomWidth, bloomHeight);
                }
            });
        }
    }

    private loadModel(id: string) {
        if (this.currentModelGroup) {
            this.scene.remove(this.currentModelGroup);
        }

        this.currentModelGroup = new THREE.Group();

        // Procedural generation based on ID
        switch (id.toLowerCase()) {
            case 'cardiac':
            case 'heart':
                this.generateHeart();
                break;
            case 'pulmonary':
            case 'lungs':
                this.generateLungs();
                break;
            case 'neurological':
            case 'brain':
                this.generateBrain();
                break;
            case 'skeletal':
            case 'spine':
                this.generateSpine();
                break;
            default:
                this.generateGenericOrgan();
                break;
        }

        // Intro animation starting scale
        this.currentModelGroup.scale.set(0.01, 0.01, 0.01);
        this.scene.add(this.currentModelGroup);
    }

    // --- Procedural Generators ---

    private createBaseMaterial(isHighlight = false) {
        const sev = this.severity();
        const mode = this.activeLayerMode();
        let color = mode === 'acetate' ? 0x2AA4A0 : (mode === 'surface' ? 0xF9F3D9 : this.PALETTE.primary);
        
        if (sev) {
            color = this.PALETTE.severity[sev];
        } else if (isHighlight) {
            color = 0xEF6658;
        }

        if (mode === 'surface') {
            return new THREE.MeshLambertMaterial({
                color: 0xF9F3D9,
                flatShading: true,
                transparent: false,
            });
        }

        if (mode === 'acetate') {
            return new THREE.MeshPhysicalMaterial({
                color: color,
                roughness: 0.1,
                metalness: 0.1,
                transmission: 0.8,
                thickness: 0.5,
                transparent: true,
                opacity: 0.45,
            });
        }

        return new THREE.MeshPhysicalMaterial({
            color: color,
            metalness: 0.8,
            roughness: 0.2,
            wireframe: mode === 'core',
            transparent: true,
            opacity: 0.85,
            emissive: color,
            emissiveIntensity: 0.3
        });
    }
    
    // Charcoal Ink Core material
    private createCoreMaterial() {
        const mode = this.activeLayerMode();
        return new THREE.MeshPhysicalMaterial({
            color: mode === 'surface' ? 0xF5B98E : 0x1C1C1C,
            metalness: 0.2,
            roughness: 0.8,
            wireframe: true,
            transparent: true,
            opacity: mode === 'acetate' ? 0.3 : 0.9,
        });
    }

    private addParticles(count: number, spread: number, flowDirection: THREE.Vector3 = new THREE.Vector3(0, 1, 0)) {
        if (this.particles() === false) return null; // Respect Kaizen toggle

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const initials = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            const val = (Math.random() - 0.5) * spread;
            positions[i] = val;
            initials[i] = val;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('initialPosition', new THREE.BufferAttribute(initials, 3));

        const material = new THREE.PointsMaterial({
            color: this.severity() ? this.PALETTE.severity[this.severity()!] : this.PALETTE.particles,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        particles.userData = { isFlowing: true, spread, flowDirection };
        this.currentModelGroup.add(particles);
        return particles;
    }

    private addHighlight(mesh: THREE.Mesh, label: string) {
        if (!this.afflictionHighlight()) return;

        const h = this.afflictionHighlight()!.toLowerCase();
        if (h.includes(label) || h === 'all') {
            const sevColor = this.severity() ? this.PALETTE.severity[this.severity()!] : this.PALETTE.severity.red;
            const highlightMaterial = new THREE.MeshBasicMaterial({
                color: sevColor,
                wireframe: true,
                transparent: true,
                opacity: 0.8
            });
            const highlightMesh = new THREE.Mesh(mesh.geometry, highlightMaterial);
            highlightMesh.scale.setScalar(1.05); // tightly envelop the original object
            highlightMesh.userData = { isHighlight: true, tick: 0 };

            if (this.particles() === true) {
                mesh.geometry.computeBoundingBox();
                const bbox = mesh.geometry.boundingBox;
                if (bbox) {
                    const size = new THREE.Vector3();
                    bbox.getSize(size);
                    const center = new THREE.Vector3();
                    bbox.getCenter(center);

                    const pCount = 60;
                    const pGeo = new THREE.BufferGeometry();
                    const pPos = new Float32Array(pCount * 3);
                    for (let i = 0; i < pCount * 3; i += 3) {
                        pPos[i] = center.x + (Math.random() - 0.5) * size.x * 1.5;
                        pPos[i + 1] = center.y + (Math.random() - 0.5) * size.y * 1.5;
                        pPos[i + 2] = center.z + (Math.random() - 0.5) * size.z * 1.5;
                    }
                    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
                    const pMat = new THREE.PointsMaterial({
                        color: sevColor,
                        size: 0.08,
                        transparent: true,
                        opacity: 0.9,
                        blending: THREE.AdditiveBlending
                    });
                    const pSys = new THREE.Points(pGeo, pMat);
                    pSys.userData = { isHighlightParticle: true };
                    highlightMesh.add(pSys);
                }
            }
            mesh.add(highlightMesh);
        }
    }

    private generateHeart() {
        // Main body - strict Box geometry (Dieter Rams philosophy)
        const geo = new THREE.BoxGeometry(2.2, 2.2, 2.2);
        const mat = this.createBaseMaterial();
        const coreMat = this.createCoreMaterial();
        
        const mesh = new THREE.Mesh(geo, mat);
        const core = new THREE.Mesh(geo, coreMat);
        core.scale.set(0.95, 0.95, 0.95);
        mesh.add(core); // add core inside wireframe
        
        this.addHighlight(mesh, 'heart');

        // Add vessels (strict cylinders, perpendicular/aligned)
        const aortaGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16);
        const aorta = new THREE.Mesh(aortaGeo, mat);
        const aortaCore = new THREE.Mesh(aortaGeo, coreMat);
        aortaCore.scale.set(0.95, 0.95, 0.95);
        aorta.add(aortaCore);
        
        aorta.position.set(0.6, 1.5, 0);
        this.addHighlight(aorta, 'aorta');

        this.currentModelGroup.add(mesh);
        this.currentModelGroup.add(aorta);
        this.addParticles(100, 4, new THREE.Vector3(0, 1, 0)); // Flowing upwards

        // Animation data
        this.currentModelGroup.userData = { type: 'heart', baseScale: 1, tick: 0 };
    }

    private generateLungs() {
        const mat = this.createBaseMaterial();
        const coreMat = this.createCoreMaterial();

        // Left lung - strict box
        const leftGeo = new THREE.BoxGeometry(1.5, 3.5, 1.5);
        const left = new THREE.Mesh(leftGeo, mat);
        const leftCore = new THREE.Mesh(leftGeo, coreMat);
        leftCore.scale.setScalar(0.95);
        left.add(leftCore);
        left.position.set(-1.2, 0, 0);
        this.addHighlight(left, 'left');

        // Right lung - strict box
        const rightGeo = new THREE.BoxGeometry(1.5, 3.5, 1.5);
        const right = new THREE.Mesh(rightGeo, mat);
        const rightCore = new THREE.Mesh(rightGeo, coreMat);
        rightCore.scale.setScalar(0.95);
        right.add(rightCore);
        right.position.set(1.2, 0, 0);
        this.addHighlight(right, 'right');

        // Trachea
        const tracheaGeo = new THREE.CylinderGeometry(0.4, 0.4, 2, 16);
        const trachea = new THREE.Mesh(tracheaGeo, mat);
        const tracheaCore = new THREE.Mesh(tracheaGeo, coreMat);
        tracheaCore.scale.setScalar(0.95);
        trachea.add(tracheaCore);
        trachea.position.set(0, 2.5, 0);
        this.addHighlight(trachea, 'trachea');

        this.currentModelGroup.add(left, right, trachea);
        this.addParticles(200, 6, new THREE.Vector3(0, -1, 0)); // Flowing downwards

        this.currentModelGroup.userData = { type: 'lungs', baseScale: 1, tick: 0 };
    }

    private generateBrain() {
        const mat = this.createBaseMaterial();
        const coreMat = this.createCoreMaterial();
        // Strict box representation of the brain
        const geo = new THREE.BoxGeometry(3, 2.4, 3.2);
        const mesh = new THREE.Mesh(geo, mat);
        this.addHighlight(mesh, 'brain');

        // Add inner core as a smaller solid box (dual layer)
        const coreGeo = new THREE.BoxGeometry(3, 2.4, 3.2);
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.scale.setScalar(0.95);
        mesh.add(core);

        this.currentModelGroup.add(mesh);

        // Neural network particles flowing downwards towards spine
        const particles = this.addParticles(500, 5, new THREE.Vector3(0, -1, 0));

        this.currentModelGroup.userData = { type: 'brain', particles: particles };
    }

    private generateSpine() {
        const mat = this.createBaseMaterial();
        const coreMat = this.createCoreMaterial();

        // Add vertebrae
        for (let i = 0; i < 11; i++) {
            const vertebraGroup = new THREE.Group();
            vertebraGroup.position.set(0, i * 0.65 - 3.2, 0);

            // Vertebral body (anterior cylinder)
            const bodyGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.45, 16);
            const bodyMesh = new THREE.Mesh(bodyGeo, mat);
            const bodyCore = new THREE.Mesh(bodyGeo, coreMat);
            bodyCore.scale.setScalar(0.95);
            bodyMesh.add(bodyCore);
            bodyMesh.position.set(0, 0, 0.4);
            this.addHighlight(bodyMesh, `vertebra-${i}`);
            this.addHighlight(bodyMesh, 'spine');
            vertebraGroup.add(bodyMesh);

            // Spinous process (posterior projection)
            const spinousGeo = new THREE.BoxGeometry(0.2, 0.25, 0.9);
            const spinousMesh = new THREE.Mesh(spinousGeo, mat);
            const spinousCore = new THREE.Mesh(spinousGeo, coreMat);
            spinousCore.scale.setScalar(0.95);
            spinousMesh.add(spinousCore);
            spinousMesh.position.set(0, 0, -0.45);
            this.addHighlight(spinousMesh, `vertebra-${i}`);
            this.addHighlight(spinousMesh, 'spine');
            vertebraGroup.add(spinousMesh);

            // Transverse processes (lateral projections)
            const transverseGeo = new THREE.BoxGeometry(2.0, 0.2, 0.25);
            const transverseMesh = new THREE.Mesh(transverseGeo, mat);
            const transverseCore = new THREE.Mesh(transverseGeo, coreMat);
            transverseCore.scale.setScalar(0.95);
            transverseMesh.add(transverseCore);
            transverseMesh.position.set(0, 0, -0.1);
            this.addHighlight(transverseMesh, `vertebra-${i}`);
            this.addHighlight(transverseMesh, 'spine');
            vertebraGroup.add(transverseMesh);

            this.currentModelGroup.add(vertebraGroup);
        }

        this.addParticles(200, 3, new THREE.Vector3(0, -1, 0));
        this.currentModelGroup.userData = { type: 'spine', tick: 0 };
    }

    private generateGenericOrgan() {
        const geo = new THREE.BoxGeometry(2, 2, 2);
        const mat = this.createBaseMaterial();
        const coreMat = this.createCoreMaterial();
        
        const mesh = new THREE.Mesh(geo, mat);
        const core = new THREE.Mesh(geo, coreMat);
        core.scale.setScalar(0.95);
        mesh.add(core);

        this.addHighlight(mesh, 'organ');
        this.addHighlight(mesh, 'all');
        this.currentModelGroup.add(mesh);
        this.addParticles(100, 3, new THREE.Vector3(0, 1, 0));

        this.currentModelGroup.userData = { type: 'generic' };
    }

    private startAnimation() {
        const animate = () => {
            this.animationFrameId = requestAnimationFrame(animate);

            if (this.controls) this.controls.update();

            // Custom animations
            if (this.currentModelGroup) {
                this.currentModelGroup.traverse((child) => {
                    if (child.userData?.isHighlight) {
                        child.userData.tick += 0.05;
                        const pulse = 1.05 + Math.sin(child.userData.tick) * 0.03;
                        child.scale.setScalar(pulse);
                    }
                    if (child instanceof THREE.Points && child.userData?.isHighlightParticle) {
                        child.rotation.y += 0.02;
                        child.rotation.x += 0.01;
                    }
                    if (child instanceof THREE.Points && child.userData?.isFlowing) {
                        const positions = child.geometry.attributes['position'];
                        const dir = child.userData.flowDirection;
                        const speed = 0.03;
                        const spread = child.userData.spread;

                        for (let i = 0; i < positions.count; i++) {
                            let y = positions.getY(i) + dir.y * speed;
                            if (y > spread / 2) y = -spread / 2;
                            if (y < -spread / 2) y = spread / 2;
                            positions.setY(i, y);

                            let x = positions.getX(i) + dir.x * speed;
                            if (x > spread / 2) x = -spread / 2;
                            if (x < -spread / 2) x = spread / 2;
                            positions.setX(i, x);

                            let z = positions.getZ(i) + dir.z * speed;
                            if (z > spread / 2) z = -spread / 2;
                            if (z < -spread / 2) z = spread / 2;
                            positions.setZ(i, z);
                        }
                        positions.needsUpdate = true;
                    }
                });

                // Intro scale animation
                const currentScale = this.currentModelGroup.scale.x;
                const data = this.currentModelGroup.userData;
                const baseScale = data.baseScale || 1;
                
                if (currentScale < baseScale - 0.01) {
                    this.currentModelGroup.scale.lerp(new THREE.Vector3(baseScale, baseScale, baseScale), 0.1);
                }

                if (data.type === 'heart') {
                    data.tick += 0.05;
                    // Heartbeat pulse
                    const pulseOffset = Math.sin(data.tick * Math.PI * 2) * 0.05 * (Math.sin(data.tick * Math.PI) > 0 ? 1 : 0.2);
                    const scale = baseScale + pulseOffset;
                    this.currentModelGroup.scale.set(scale, scale, scale);
                }
                else if (data.type === 'lungs') {
                    data.tick += 0.02;
                    // Breathing pulse
                    const scaleY = baseScale + Math.sin(data.tick) * 0.05;
                    const scaleXZ = baseScale + Math.sin(data.tick) * 0.08;
                    this.currentModelGroup.scale.set(scaleXZ, scaleY, scaleXZ);
                }
                else if (data.type === 'spine' || data.type === 'brain' || data.type === 'generic') {
                    // Gentle ambient float/breathing for other organs
                    data.tick = (data.tick || 0) + 0.01;
                    const scale = baseScale + Math.sin(data.tick) * 0.02;
                    this.currentModelGroup.scale.set(scale, scale, scale);
                }
            }

            if (this.composer && this.scene && this.camera) {
                this.composer.render();
            } else if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };

        animate();
    }
}
