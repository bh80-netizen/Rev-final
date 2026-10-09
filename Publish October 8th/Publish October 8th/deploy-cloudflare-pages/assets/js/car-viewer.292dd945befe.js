const viewer = document.getElementById("car-viewer");

if (viewer) {
  const fallback = viewer.querySelector(".car-viewer-fallback");
  const status = viewer.querySelector(".car-viewer-status");
  const hero = viewer.closest(".hero");
  const flareLight = hero?.querySelector(".hero-light");
  let loadStarted = false;

  const setStatus = (message = "") => {
    if (!status) return;
    status.textContent = message;
    status.hidden = !message;
  };

  const showFallback = (message) => {
    viewer.classList.remove("is-loading", "is-ready");
    viewer.classList.add("has-error");
    fallback?.removeAttribute("aria-hidden");
    setStatus(message);
  };

  async function loadViewer() {
    if (loadStarted) return;
    loadStarted = true;
    viewer.classList.add("is-loading");

    try {
      const [THREE, { GLTFLoader }, { OrbitControls }] = await Promise.all([
        import("three"),
        import("three/addons/loaders/GLTFLoader.js"),
        import("three/addons/controls/OrbitControls.js"),
      ]);

      const canvas = document.createElement("canvas");
      canvas.className = "car-viewer-canvas";
      canvas.setAttribute("aria-hidden", "true");
      viewer.prepend(canvas);

      const compactViewport = window.matchMedia("(max-width: 760px)").matches;
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !compactViewport,
        alpha: true,
        powerPreference: "default",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactViewport ? 1.15 : 1.35));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 1000);
      const modelGroup = new THREE.Group();
      scene.add(modelGroup);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x183153, 3.1));
      const keyLight = new THREE.DirectionalLight(0xffffff, 4.8);
      keyLight.position.set(-5, 8, 7);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xbfdcff, 2.1);
      fillLight.position.set(6, 2, 5);
      scene.add(fillLight);
      const rimLight = new THREE.DirectionalLight(0x5ba8e1, 2.4);
      rimLight.position.set(2, 4, -7);
      scene.add(rimLight);

      const loader = new GLTFLoader();
      const modelUrl = viewer.dataset.model || "assets/models/carrera.0b2a83b775d3.glb";
      const gltf = await loader.loadAsync(modelUrl);
      const model = gltf.scene;

      model.traverse((child) => {
        if (!child.isMesh) return;
        if (!child.geometry.attributes.normal) child.geometry.computeVertexNormals();

        const originalMaterials = Array.isArray(child.material) ? child.material : [child.material];
        const materials = originalMaterials.filter(Boolean).map((material) => material.clone());

        materials.forEach((material) => {
          const materialName = material.name || "";
          if (/body/i.test(materialName)) {
            material.color?.set("#f1f4f8");
            material.metalness = 0.03;
            material.roughness = 0.3;
            if ("clearcoat" in material) material.clearcoat = 0.75;
            if ("clearcoatRoughness" in material) material.clearcoatRoughness = 0.18;
          } else if (/solar/i.test(materialName)) {
            material.color?.set("#031c35");
            material.metalness = 0.08;
            material.roughness = 0.38;
          } else if (/glass|window/i.test(materialName)) {
            material.color?.set("#46515c");
            material.transparent = true;
            material.opacity = 0.82;
            material.depthWrite = true;
            material.side = THREE.FrontSide;
            material.metalness = 0.22;
            material.roughness = 0.09;
          } else if (/tire/i.test(materialName)) {
            material.color?.set("#080b11");
            material.roughness = 0.9;
          }
          material.needsUpdate = true;
        });

        child.material = Array.isArray(child.material) ? materials : materials[0];
      });

      const initialBox = new THREE.Box3().setFromObject(model);
      const center = initialBox.getCenter(new THREE.Vector3());
      const sphere = initialBox.getBoundingSphere(new THREE.Sphere());
      const radius = sphere.radius || 1;
      model.position.sub(center);
      modelGroup.add(model);

      camera.position.set(radius * 1.85, radius * 1.1, radius * 2.4);
      camera.lookAt(0, 0, 0);

      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.075;
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.rotateSpeed = 0.58;
      controls.minPolarAngle = Math.PI * 0.16;
      controls.maxPolarAngle = Math.PI * 0.72;
      controls.target.set(0, 0, 0);
      controls.update();

      const startYaw = -0.35 + Math.PI;
      const endYaw = -1.79 + Math.PI;
      const startPitch = 0.12;
      const endPitch = 0.035;
      let currentYaw = startYaw;
      let targetYaw = currentYaw;
      let currentPitch = startPitch;
      let targetPitch = currentPitch;
      let currentScale = 1;
      let targetScale = currentScale;
      let keyboardYaw = 0;
      let keyboardPitch = 0;
      let lastWidth = 0;
      let lastHeight = 0;
      let animationFrame = 0;
      let scrollUpdateFrame = 0;
      let settleFrames = 0;
      let inViewport = true;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const syncSize = () => {
        const width = viewer.clientWidth;
        const height = viewer.clientHeight;
        if (!width || !height || (width === lastWidth && height === lastHeight)) return;
        lastWidth = width;
        lastHeight = height;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const updateScrollTarget = () => {
        if (!hero || reduceMotion) {
          targetYaw = startYaw;
          targetPitch = startPitch;
          targetScale = 1;
          flareLight?.style.setProperty("--flare-x", "0vw");
          flareLight?.style.setProperty("--flare-y", "0vh");
          return;
        }
        const bounds = hero.getBoundingClientRect();
        const scrollSpan = Math.max(bounds.height - window.innerHeight, 1);
        const progress = THREE.MathUtils.clamp(-bounds.top / scrollSpan, 0, 1);
        targetYaw = THREE.MathUtils.lerp(startYaw, endYaw, progress);
        targetPitch = THREE.MathUtils.lerp(startPitch, endPitch, progress);
        targetScale = THREE.MathUtils.lerp(1, 1.26, progress);
        flareLight?.style.setProperty("--flare-x", `${THREE.MathUtils.lerp(-18, 22, progress)}vw`);
        flareLight?.style.setProperty("--flare-y", `${THREE.MathUtils.lerp(28, -24, progress)}vh`);
        queueFrames(36);
      };

      const handleScroll = () => {
        if (scrollUpdateFrame) return;
        scrollUpdateFrame = requestAnimationFrame(() => {
          scrollUpdateFrame = 0;
          updateScrollTarget();
        });
      };

      const render = () => {
        animationFrame = 0;
        if (!inViewport) return;
        syncSize();
        currentYaw = THREE.MathUtils.lerp(currentYaw, targetYaw, 0.075);
        currentPitch = THREE.MathUtils.lerp(currentPitch, targetPitch, 0.075);
        currentScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.075);
        modelGroup.rotation.y = currentYaw + keyboardYaw;
        modelGroup.rotation.x = currentPitch + keyboardPitch;
        modelGroup.scale.setScalar(currentScale);
        const controlsChanged = controls.update();
        renderer.render(scene, camera);

        const modelMoving = Math.abs(currentYaw - targetYaw) > 0.0005 || Math.abs(currentPitch - targetPitch) > 0.0005 || Math.abs(currentScale - targetScale) > 0.0005;
        if (settleFrames > 0) settleFrames -= 1;
        if (!animationFrame && (modelMoving || controlsChanged || settleFrames > 0)) {
          animationFrame = requestAnimationFrame(render);
        }
      };

      const requestRender = () => {
        if (!animationFrame && inViewport) animationFrame = requestAnimationFrame(render);
      };

      function queueFrames(frames = 2) {
        settleFrames = Math.max(settleFrames, frames);
        requestRender();
      }

      const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          inViewport = entry.isIntersecting;
          if (inViewport) queueFrames(2);
          else if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = 0;
          }
        },
        { rootMargin: "160px" },
      );
      visibilityObserver.observe(viewer);

      const resizeObserver = new ResizeObserver(() => queueFrames(2));
      resizeObserver.observe(viewer);
      window.addEventListener("scroll", handleScroll, { passive: true });
      controls.addEventListener("start", () => {
        viewer.classList.add("is-interacting");
        queueFrames(2);
      });
      controls.addEventListener("end", () => {
        viewer.classList.remove("is-interacting");
        queueFrames(28);
      });
      controls.addEventListener("change", () => queueFrames(2));

      viewer.addEventListener("keydown", (event) => {
        const keyStep = event.shiftKey ? 0.18 : 0.09;
        if (event.key === "ArrowLeft") keyboardYaw -= keyStep;
        else if (event.key === "ArrowRight") keyboardYaw += keyStep;
        else if (event.key === "ArrowUp") keyboardPitch = Math.max(keyboardPitch - keyStep, -0.5);
        else if (event.key === "ArrowDown") keyboardPitch = Math.min(keyboardPitch + keyStep, 0.5);
        else return;
        event.preventDefault();
        queueFrames(2);
      });

      updateScrollTarget();
      syncSize();
      viewer.classList.remove("is-loading", "has-error");
      viewer.classList.add("is-ready");
      fallback?.setAttribute("aria-hidden", "true");
      setStatus();
      queueFrames(2);

      window.addEventListener(
        "pagehide",
        () => {
          if (animationFrame) cancelAnimationFrame(animationFrame);
          if (scrollUpdateFrame) cancelAnimationFrame(scrollUpdateFrame);
          window.removeEventListener("scroll", handleScroll);
          visibilityObserver.disconnect();
          resizeObserver.disconnect();
          controls.dispose();
          renderer.dispose();
        },
        { once: true },
      );
    } catch (error) {
      console.warn("Carrera viewer: using the static fallback", error);
      showFallback("Interactive view unavailable — showing the reference render.");
    }
  }

  const queueLoad = () => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(loadViewer, { timeout: 800 });
    else window.setTimeout(loadViewer, 100);
  };

  if ("IntersectionObserver" in window) {
    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        loadObserver.disconnect();
        queueLoad();
      },
      { rootMargin: "300px" },
    );
    loadObserver.observe(viewer);
  } else {
    queueLoad();
  }
}
