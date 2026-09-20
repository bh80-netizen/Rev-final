import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// Renders the Carrera solar car model in the hero section: an isometric
// framing at rest, rotating in proportion to how far the visitor has
// scrolled down the hero.
function initCarViewer() {
  const container = document.getElementById("car-viewer");
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.className = "w-full h-full block";
  container.appendChild(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (err) {
    console.warn("Carrera viewer: WebGL unavailable", err);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  // Isometric framing: 45 deg around Y, ~35.264 deg down from the horizon.
  const ISO_AZIMUTH = Math.PI / 4;
  const ISO_ELEVATION = Math.atan(1 / Math.sqrt(2));
  // How far the car turns over the length of the hero, and the breathing room
  // left around it once framed.
  const MAX_SPIN = Math.PI * 1.5;
  const FIT_PADDING = 1.12;
  // Frame with enough vertical headroom that the horizontal extent stays the
  // governing one up to this aspect ratio, which covers phones through 16:9.
  // Only wider-and-shorter viewports than this fall back to fitting on height.
  const FIXED_WIDTH_UP_TO_ASPECT = 1.85;

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  scene.add(new THREE.AmbientLight(0xffffff, 0.65));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  fillLight.position.set(-5, 2, -3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xb7c4ff, 1.1);
  rimLight.position.set(-3, 4, -6);
  scene.add(rimLight);

  let modelRadius = 1;
  let lastWidth = 0;
  let lastHeight = 0;
  // Widest and tallest the car ever projects to, measured across the full
  // rotation sweep so its on-screen size never "breathes" as it spins.
  let fitHalfWidth = 1;
  let fitHalfHeight = 1;

  // Walk the bounding box through the rotation range and record the largest
  // half-extents it reaches in camera space.
  function measureProjectedFit(object) {
    const box = new THREE.Box3().setFromObject(object);
    const corners = [];
    for (let i = 0; i < 8; i++) {
      corners.push(
        new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z),
      );
    }

    camera.updateMatrixWorld();
    const toCamera = camera.matrixWorldInverse;
    const spin = new THREE.Matrix4();
    const point = new THREE.Vector3();
    let halfWidth = 0;
    let halfHeight = 0;

    for (let step = 0; step <= 32; step++) {
      spin.makeRotationY((step / 32) * MAX_SPIN);
      for (const corner of corners) {
        point.copy(corner).applyMatrix4(spin).applyMatrix4(toCamera);
        halfWidth = Math.max(halfWidth, Math.abs(point.x));
        halfHeight = Math.max(halfHeight, Math.abs(point.y));
      }
    }

    fitHalfHeight = halfHeight * FIT_PADDING;
    fitHalfWidth = Math.max(halfWidth * FIT_PADDING, fitHalfHeight * FIXED_WIDTH_UP_TO_ASPECT);
  }

  function sizeCameraFrustum(width, height) {
    const aspect = width / height || 1;
    // Horizontal extent is fixed: the car always covers the same share of the
    // canvas width, so resizing the window scales it predictably instead of
    // swapping which axis drives the zoom. Vertical only takes over if the
    // viewport gets short enough that the car would otherwise be clipped.
    const halfWidth = Math.max(fitHalfWidth, fitHalfHeight * aspect);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfWidth / aspect;
    camera.bottom = -halfWidth / aspect;
    camera.updateProjectionMatrix();
  }

  // Polling the container's size on every animation frame (instead of
  // wiring a `resize` listener or ResizeObserver) sidesteps a real timing
  // issue: Tailwind's CDN build compiles utility classes like w-full/h-full
  // asynchronously, so a size read right when the model finishes loading
  // can be unreliable. This keeps the canvas correct through layout shifts
  // too, at negligible per-frame cost.
  function syncSize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height || (width === lastWidth && height === lastHeight)) return;
    lastWidth = width;
    lastHeight = height;
    renderer.setSize(width, height, false);
    sizeCameraFrustum(width, height);
  }

  function positionIsometricCamera() {
    const distance = modelRadius * 4;
    camera.position.set(
      distance * Math.cos(ISO_ELEVATION) * Math.sin(ISO_AZIMUTH),
      distance * Math.sin(ISO_ELEVATION),
      distance * Math.cos(ISO_ELEVATION) * Math.cos(ISO_AZIMUTH),
    );
    camera.lookAt(0, 0, 0);
  }

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/libs/draco/");

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    "assets/models/carrera.glb",
    (gltf) => {
      const model = gltf.scene;

      // Give the shell a single satin finish so it reads as one solid body.
      const shellMaterial = new THREE.MeshStandardMaterial({
        color: 0xccd4ea,
        roughness: 0.38,
        metalness: 0.15,
        flatShading: false,
      });
      model.traverse((child) => {
        if (!child.isMesh) return;
        if (!child.geometry.attributes.normal) child.geometry.computeVertexNormals();
        child.material = shellMaterial;
      });

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      modelRadius = Math.max(size.x, size.y, size.z) / 2 || 1;

      model.position.sub(center);
      modelGroup.add(model);

      positionIsometricCamera();
      measureProjectedFit(model);
      sizeCameraFrustum(lastWidth || container.clientWidth, lastHeight || container.clientHeight);
    },
    undefined,
    (err) => console.warn("Carrera viewer: failed to load model", err),
  );

  // Scroll-driven spin: rotation eases toward a target derived from how far
  // the hero section has scrolled past, then settles back to the isometric
  // resting angle once the hero is out of view.
  let targetRotation = 0;
  let currentRotation = 0;
  const heroSection = container.closest("section");

  function updateTargetRotation() {
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    if (!rect.height) return; // avoid a stray 0-height read producing NaN
    const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
    targetRotation = progress * MAX_SPIN;
  }

  function animate() {
    requestAnimationFrame(animate);
    syncSize();
    currentRotation += (targetRotation - currentRotation) * 0.08;
    modelGroup.rotation.y = currentRotation;
    renderer.render(scene, camera);
  }

  window.addEventListener("scroll", updateTargetRotation, { passive: true });

  updateTargetRotation();
  animate();
}

document.addEventListener("DOMContentLoaded", initCarViewer);
