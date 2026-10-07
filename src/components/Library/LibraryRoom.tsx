'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  LIBRARY_ROOM_CENTER,
  LIBRARY_ROOM_MODEL,
  LIBRARY_ROOM_SHELL_OBJECTS,
  LIBRARY_ROOM_TEXTURES,
} from './domain/roomContents';

const TEXTURES = new Set([
  'statuario-bianco3.jpg',
  'istockphoto-980425526-170667a.jpg',
  'gb2-tlcmmrdagp24x24.jpg',
]);

function disposeModel(model: THREE.Object3D) {
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      material.dispose();
    });
  });
}

export function LibraryRoom({ locale }: { locale: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const isArabic = locale === 'ar';

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let frameId = 0;
    let model: THREE.Group | null = null;
    let controls: OrbitControls | null = null;
    let renderer: THREE.WebGLRenderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#d8d0bf');

    const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 100);
    camera.position.set(0, 1.65, 2.55);
    camera.lookAt(0, 1.55, -0.8);

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      setStatus('error');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', isArabic ? 'مشهد ثلاثي الأبعاد لغرفة المكتبة' : '3D library room scene');
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight('#fff3db', '#51483b', 2.1));
    const daylight = new THREE.DirectionalLight('#fff1d7', 2.2);
    daylight.position.set(-3, 7, -4);
    daylight.castShadow = true;
    scene.add(daylight);

    const fill = new THREE.DirectionalLight('#d9e5ef', 0.8);
    fill.position.set(4, 3, 5);
    scene.add(fill);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.55, -0.8);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 5.8;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.update();

    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      if (url.startsWith('data:') || url.startsWith('blob:')) return url;
      const fileName = decodeURIComponent(url).replace(/\\/g, '/').split('/').pop()?.toLowerCase();
      if (!fileName || !TEXTURES.has(fileName)) return url;
      return `${LIBRARY_ROOM_TEXTURES}${encodeURIComponent(fileName)}`;
    });

    new FBXLoader(manager)
      .setResourcePath(LIBRARY_ROOM_TEXTURES)
      .load(
        LIBRARY_ROOM_MODEL,
        (loadedModel) => {
          if (disposed) {
            disposeModel(loadedModel);
            return;
          }

          for (const child of [...loadedModel.children]) {
            if (!LIBRARY_ROOM_SHELL_OBJECTS.has(child.name)) {
              loadedModel.remove(child);
              disposeModel(child);
            }
          }

          loadedModel.scale.setScalar(0.01);
          loadedModel.position.set(
            -LIBRARY_ROOM_CENTER.x * 0.01,
            0,
            -LIBRARY_ROOM_CENTER.z * 0.01,
          );
          loadedModel.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            object.castShadow = true;
            object.receiveShadow = true;
          });

          model = loadedModel;
          scene.add(loadedModel);
          setStatus('ready');
        },
        undefined,
        (error) => {
          console.error('Could not load the 3D library room.', error);
          if (!disposed) setStatus('error');
        },
      );

    const render = () => {
      frameId = window.requestAnimationFrame(render);
      controls?.update();
      renderer.render(scene, camera);
    };
    render();

    const resize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      controls?.dispose();
      if (model) disposeModel(model);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [isArabic]);

  return (
    <main className="relative h-dvh min-h-[360px] w-full overflow-hidden bg-[#d8d0bf]">
      <div ref={hostRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      {status !== 'ready' && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#d8d0bf]/70 px-6 text-center">
          <p role={status === 'error' ? 'alert' : 'status'} className="text-sm text-[#51483b]">
            {status === 'loading'
              ? isArabic ? 'جارٍ تجهيز غرفة المكتبة...' : 'Loading your library room...'
              : isArabic ? 'تعذر تحميل غرفة المكتبة ثلاثية الأبعاد.' : 'Could not load the 3D library room.'}
          </p>
        </div>
      )}
    </main>
  );
}
