import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer, controls, mannequinGroup;
const parts = new Map();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// State matching Flutter
let currentIssues = {};
let selectedId = null;
let isInternal = false;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0, 1, 0);

    createMannequin();

    window.addEventListener('resize', onWindowResize);
    setupInteractions();
    
    // Listen for messages from Flutter
    window.addEventListener('message', onMessageReceived);
}

function createMannequin() {
    mannequinGroup = new THREE.Group();
    scene.add(mannequinGroup);

    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0xfdfdfd,
        roughness: 0.5,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9
    });

    addPart('head', new THREE.BoxGeometry(0.45, 0.45, 0.45), baseMaterial, { y: 1.75 });
    addPart('neck', new THREE.BoxGeometry(0.15, 0.15, 0.15), baseMaterial, { y: 1.55 });
    addPart('chest', new THREE.BoxGeometry(0.5, 0.45, 0.3), baseMaterial, { y: 1.3 });
    addPart('abdomen', new THREE.BoxGeometry(0.45, 0.3, 0.28), baseMaterial, { y: 0.95 });
    addPart('pelvis', new THREE.BoxGeometry(0.48, 0.25, 0.3), baseMaterial, { y: 0.7 });

    // Right Arm
    addPart('r_shoulder', new THREE.BoxGeometry(0.2, 0.2, 0.2), baseMaterial, { x: -0.32, y: 1.45 });
    addPart('r_arm', new THREE.BoxGeometry(0.1, 0.5, 0.1), baseMaterial, { x: -0.42, y: 1.15, z: 0.05, rx: 0.1 });
    addPart('r_hand', new THREE.BoxGeometry(0.08, 0.15, 0.05), baseMaterial, { x: -0.5, y: 0.82, rx: 0.2 });

    // Left Arm
    addPart('l_shoulder', new THREE.BoxGeometry(0.2, 0.2, 0.2), baseMaterial, { x: 0.32, y: 1.45 });
    addPart('l_arm', new THREE.BoxGeometry(0.1, 0.5, 0.1), baseMaterial, { x: 0.42, y: 1.15, z: 0.05, rx: 0.1 });
    addPart('l_hand', new THREE.BoxGeometry(0.08, 0.15, 0.05), baseMaterial, { x: 0.5, y: 0.82, rx: 0.2 });

    // Right Leg
    addPart('r_thigh', new THREE.BoxGeometry(0.2, 0.6, 0.2), baseMaterial, { x: -0.18, y: 0.35 });
    addPart('r_shin', new THREE.BoxGeometry(0.15, 0.6, 0.15), baseMaterial, { x: -0.18, y: -0.25 });
    addPart('r_foot', new THREE.BoxGeometry(0.15, 0.08, 0.25), baseMaterial, { x: -0.18, y: -0.58, z: 0.05 });

    // Left Leg
    addPart('l_thigh', new THREE.BoxGeometry(0.2, 0.6, 0.2), baseMaterial, { x: 0.18, y: 0.35 });
    addPart('l_shin', new THREE.BoxGeometry(0.15, 0.6, 0.15), baseMaterial, { x: 0.18, y: -0.25 });
    addPart('l_foot', new THREE.BoxGeometry(0.15, 0.08, 0.25), baseMaterial, { x: 0.18, y: -0.58, z: 0.05 });
    
    updatePartColors();
}

function addPart(id, geometry, material, pos) {
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
    if (pos.rx) mesh.rotation.x = pos.rx;
    if (pos.ry) mesh.rotation.y = pos.ry;
    if (pos.rz) mesh.rotation.z = pos.rz;
    mesh.userData = { id: id };
    mannequinGroup.add(mesh);
    parts.set(id, mesh);
}

function updatePartColors() {
    parts.forEach((mesh, id) => {
        const material = mesh.material;
        const issuesForPart = currentIssues[id] || [];
        const maxPain = issuesForPart.reduce((max, issue) => Math.max(max, issue.painLevel), 0);
        const isSelected = selectedId === id;

        if (maxPain > 0) {
            const intensity = maxPain / 10;
            material.color.setRGB(1, 1 - intensity * 0.6, 1 - intensity * 0.6);
        } else {
            material.color.setHex(0xfdfdfd);
        }

        if (isSelected) {
            material.color.setHex(0x1C1C1C);
            material.emissive.setHex(0x76B362);
            material.emissiveIntensity = 0.4;
            material.opacity = 0.95;
        } else {
            material.emissive.setHex(0x000000);
            material.emissiveIntensity = 0;
            material.opacity = isInternal ? 0.2 : 0.85;
        }
    });
}

function setupInteractions() {
    let startX = 0, startY = 0;
    const canvas = renderer.domElement;

    canvas.addEventListener('pointerdown', (event) => {
        startX = event.clientX;
        startY = event.clientY;
    });

    canvas.addEventListener('pointerup', (event) => {
        const deltaX = Math.abs(event.clientX - startX);
        const deltaY = Math.abs(event.clientY - startY);

        if (deltaX < 10 && deltaY < 10) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(mannequinGroup.children, true);
            
            if (intersects.length > 0) {
                let object = intersects[0].object;
                while (object && !object.userData.id) {
                    object = object.parent;
                }

                if (object && object.userData.id) {
                    const id = object.userData.id;
                    const name = getPartName(id);
                    
                    // Send message to Flutter using the registered channel
                    const msgStr = JSON.stringify({ id: id, name: name });
                    if (window.PocketGullChannel) {
                        window.PocketGullChannel.postMessage(msgStr);
                    } else {
                        window.parent.postMessage(msgStr, '*');
                    }
                }
            }
        }
    });
}

function getPartName(id) {
    const names = {
        'head': 'Head & Neck', 'chest': 'Chest & Upper Torso',
        'abdomen': 'Abdomen & Stomach', 'pelvis': 'Pelvis & Hips',
        'r_shoulder': 'Right Shoulder', 'r_arm': 'Right Arm',
        'r_hand': 'Right Hand & Wrist', 'l_shoulder': 'Left Shoulder',
        'l_arm': 'Left Arm', 'l_hand': 'Left Hand & Wrist',
        'r_thigh': 'Right Thigh', 'r_shin': 'Right Lower Leg',
        'r_foot': 'Right Foot', 'l_thigh': 'Left Thigh',
        'l_shin': 'Left Lower Leg', 'l_foot': 'Left Foot'
    };
    return names[id] || id;
}

function onMessageReceived(event) {
    if (event.origin && event.origin !== window.location.origin && event.origin !== 'null' && !event.origin.startsWith('file://')) {
        return;
    }
    try {
        // Ensure it's a valid JSON string (since flutter sends strings, or we might receive objects directly if injected via runJavaScript)
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.type === 'UPDATE_STATE') {
            if (data.selectedId !== undefined) selectedId = data.selectedId;
            if (data.issues !== undefined) currentIssues = data.issues;
            if (data.isInternal !== undefined) isInternal = data.isInternal;
            updatePartColors();
        }
    } catch(e) {
        console.error("Invalid message format", e);
    }
}

// Expose a global function for Flutter to call directly via runJavaScript
window.updateViewerState = function(stateJson) {
    onMessageReceived({ data: stateJson });
};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
