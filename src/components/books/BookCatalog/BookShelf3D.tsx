'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import type { Book } from '@/services/books.service';

type ShelfSection = { name: string; books: Book[] };

type Props = {
  sections: ShelfSection[];
  selectedCategory: number | null;
  locale: string;
  onSelectBook: (book: Book) => void;
};

type HoveredBook = { book: Book; x: number; y: number };

type LoadedShelf = {
  model: THREE.Group;
  frameMaterial: THREE.MeshStandardMaterial;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  size: THREE.Vector3;
  shelfFloors: number[];
  frameHeight: number;
  rowSpacing: number;
  scrollFocus: { startY: number; travel: number } | null;
  cameraFocus: { target: THREE.Vector3; width: number; height: number; padding: number } | null;
};

const SHELF_MODEL = '/books-design/BookSelf.fbx';
const BOOK_MODEL = '/books-design/OldBook001.fbx';
const LAMP_MODEL = '/10003_Lamp_Textures/10003_Lamp.fbx';
const LAMP_TEXTURE_PATHS: Record<string, string> = {
  'fabric_bump.jpg': '/10003_Lamp_Textures/Fabric_bump.jpg',
  'fabric_refl.jpg': '/10003_Lamp_Textures/Fabric_refl.jpg',
  'lamp_fabric_dif.png': '/10003_Lamp_Textures/Lamp_Fabric_DIF.png',
  'lamp_porcelan_dif.png': '/10003_Lamp_Textures/Lamp_Porcelan_DIF.png',
};
const MAX_BOOKS_PER_SECTION = 12;
const BOOKS_PER_FULL_ROW = MAX_BOOKS_PER_SECTION * 2;
const MAX_BOOKS_PER_OVERVIEW_BAY = 15;
const BOOK_COLORS = ['#24413d', '#672f2c', '#263850', '#8b633a', '#4e3b29', '#5d653f', '#302c31', '#783f32', '#344b3f', '#795d42'];
const BOOK_MATERIALS = [
  '/books-design/Leather1.webp',
  '/books-design/Leather2.webp',
  '/books-design/Leather3.webp',
  '/books-design/Leather4.webp',
  '/books-design/leather5.webp',
  '/books-design/leather6.webp',
  '/books-design/hessian1.webp',
  '/books-design/hessian2.webp',
  '/books-design/hessian3.webp',
  '/books-design/hessian4.webp',
  '/books-design/hessian5.webp',
];

function bookSeed(book: Book) {
  const value = String(book.id);
  let seed = 19;
  for (let index = 0; index < value.length; index += 1) {
    seed = (seed * 31 + value.charCodeAt(index)) >>> 0;
  }
  return seed;
}

function makeSpineTexture(book: Book, isArabic: boolean) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create a canvas for the 3D book spine.');

  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(-Math.PI / 2);
  const foil = context.createLinearGradient(-190, 0, 190, 0);
  foil.addColorStop(0, '#9a7137');
  foil.addColorStop(0.35, '#fff1c5');
  foil.addColorStop(0.62, '#d2ac61');
  foil.addColorStop(1, '#fff0bd');
  context.fillStyle = foil;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.direction = isArabic ? 'rtl' : 'ltr';
  context.shadowColor = 'rgba(18,8,2,.72)';
  context.shadowBlur = 1;
  const title = Array.from(book.title).slice(0, 26).join('');
  let fontSize = 42;
  context.font = `bold ${fontSize}px Georgia, serif`;
  while (fontSize > 22 && context.measureText(title).width > canvas.height - 112) {
    fontSize -= 2;
    context.font = `bold ${fontSize}px Georgia, serif`;
  }
  context.fillText(title, 0, 0, canvas.height - 112);
  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function getCachedTexture(cache: Map<string, THREE.Texture>, loader: THREE.TextureLoader, source: string) {
  const existing = cache.get(source);
  if (existing) return existing;

  const texture = loader.load(
    source,
    undefined,
    undefined,
    (error) => console.error(`Could not load bookshelf texture "${source}".`, error),
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  cache.set(source, texture);
  return texture;
}

function getBackendCoverSource(source: string) {
  return `/api/book-cover?url=${encodeURIComponent(source)}`;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if ('map' in material && material.map && !material.userData.sharedTexture) material.map.dispose();
      material.dispose();
    });
  });
}

function createShelfFrame(
  size: THREE.Vector3,
  material: THREE.MeshStandardMaterial,
  rowCount: number,
  preserveStandardFrame: boolean,
) {
  const frame = new THREE.Group();
  frame.name = 'Open two-section bookshelf';
  const wallThickness = Math.min(size.y * 0.026, size.x * 0.022);
  const boardDepth = size.z * 0.92;
  const backDepth = wallThickness * 0.38;
  if (preserveStandardFrame) {
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(size.x - wallThickness * 2, size.y * 0.88, backDepth),
      material,
    );
    back.position.set(0, size.y * 0.48, -size.z * 0.5 + backDepth * 0.5);
    back.receiveShadow = true;
    frame.add(back);

    const addBoard = (width: number, height: number, depth: number, x: number, y: number, z: number) => {
      const board = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
      board.position.set(x, y, z);
      board.castShadow = true;
      board.receiveShadow = true;
      frame.add(board);
    };

    const centerPost = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness * 0.85, size.y * 0.84, boardDepth),
      material,
    );
    centerPost.position.set(0, size.y * 0.5, size.z * 0.035);
    centerPost.castShadow = true;
    centerPost.receiveShadow = true;
    frame.add(centerPost);
    [-1, 1].forEach((side) => {
      addBoard(wallThickness, size.y, boardDepth, side * (size.x / 2 - wallThickness / 2), size.y / 2, size.z * 0.035);
    });

    const shelfLevels = Array.from({ length: rowCount }, (_, index) => (
      size.y * (rowCount === 1 ? 0.12 : 0.12 + 0.58 * index / (rowCount - 1)) + wallThickness * 0.36
    ));
    addBoard(size.x - wallThickness * 2, wallThickness * 0.72, boardDepth, 0, size.y * 0.02, size.z * 0.035);
    shelfLevels.forEach((level) => {
      addBoard(size.x - wallThickness * 2, wallThickness * 0.72, boardDepth, 0, level - wallThickness * 0.36, size.z * 0.035);
    });
    addBoard(size.x - wallThickness * 2, wallThickness * 0.72, boardDepth, 0, size.y * 0.91, size.z * 0.035);

    const rowSpacing = rowCount > 1
      ? (shelfLevels[shelfLevels.length - 1] - shelfLevels[0]) / (rowCount - 1)
      : size.y * 0.29;
    return { frame, shelfFloors: shelfLevels, frameHeight: size.y, rowSpacing };
  }

  const rowSpacing = size.y * 0.29;
  const firstShelfY = size.y * 0.12;
  const frameHeight = firstShelfY + rowSpacing * (rowCount - 1) + size.y * 0.21;
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(size.x - wallThickness * 2, frameHeight - size.y * 0.02, backDepth),
    material,
  );
  back.position.set(0, (frameHeight + size.y * 0.02) / 2, -size.z * 0.5 + backDepth * 0.5);
  back.receiveShadow = true;
  frame.add(back);

  const addBoard = (width: number, height: number, depth: number, x: number, y: number, z: number) => {
    const board = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    board.position.set(x, y, z);
    board.castShadow = true;
    board.receiveShadow = true;
    frame.add(board);
  };

  const centerPostHeight = frameHeight;
  const centerPost = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness * 0.85, centerPostHeight, boardDepth),
    material,
  );
  centerPost.position.set(0, frameHeight / 2, size.z * 0.035);
  centerPost.castShadow = true;
  centerPost.receiveShadow = true;
  frame.add(centerPost);

  [-1, 1].forEach((side) => {
    addBoard(wallThickness, frameHeight, boardDepth, side * (size.x / 2 - wallThickness / 2), frameHeight / 2, size.z * 0.035);
  });

  const shelfLevels = Array.from({ length: rowCount }, (_, index) => (
    firstShelfY + rowSpacing * index + wallThickness * 0.36
  ));
  addBoard(size.x - wallThickness * 2, wallThickness * 0.72, boardDepth, 0, size.y * 0.02, size.z * 0.035);
  shelfLevels.forEach((level) => {
    addBoard(size.x - wallThickness * 2, wallThickness * 0.72, boardDepth, 0, level - wallThickness * 0.36, size.z * 0.035);
  });
  addBoard(size.x - wallThickness * 2, wallThickness * 0.72, boardDepth, 0, frameHeight, size.z * 0.035);

  return { frame, shelfFloors: shelfLevels, frameHeight, rowSpacing };
}

function cameraViewHeight(camera: THREE.PerspectiveCamera, width: number, height: number, padding: number) {
  const halfFovTangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const distance = Math.max(
    width / (2 * halfFovTangent * camera.aspect),
    height / (2 * halfFovTangent),
  ) * padding;
  return 2 * distance * halfFovTangent;
}

function frameCamera(
  camera: THREE.PerspectiveCamera,
  target: THREE.Vector3,
  width: number,
  height: number,
  padding = 1.18,
) {
  const halfFovTangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const distance = Math.max(
    width / (2 * halfFovTangent * camera.aspect),
    height / (2 * halfFovTangent),
  ) * padding;
  const destination = new THREE.Vector3(target.x - width * 0.07, target.y + height * 0.04, target.z + distance);
  const startPosition = camera.position.clone();
  const startTarget = (camera.userData.lookTarget as THREE.Vector3 | undefined)?.clone() ?? new THREE.Vector3();
  const start = performance.now();
  const duration = 520;
  let animationFrame = 0;

  const animate = (time: number) => {
    const progress = Math.min(1, (time - start) / duration);
    const eased = 1 - (1 - progress) ** 3;
    camera.position.lerpVectors(startPosition, destination, eased);
    camera.userData.lookTarget = startTarget.clone().lerp(target, eased);
    camera.lookAt(camera.userData.lookTarget);
    if (progress < 1) animationFrame = requestAnimationFrame(animate);
  };
  animationFrame = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(animationFrame);
}

export function BookShelf3D({ sections, selectedCategory, locale, onSelectBook }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shelfScrollRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [bookModelVersion, setBookModelVersion] = useState(0);
  const [hoveredBook, setHoveredBook] = useState<HoveredBook | null>(null);
  const onSelectBookRef = useRef(onSelectBook);
  const localeRef = useRef(locale);
  const loadedShelfRef = useRef<LoadedShelf | null>(null);
  const interactiveBooksRef = useRef<THREE.Group | null>(null);
  const bookGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const bookTextureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());
  const bookModelRef = useRef<THREE.Group | null>(null);
  const textureLoaderRef = useRef<THREE.TextureLoader | null>(null);
  const hoveredBookIdRef = useRef<string | null>(null);
  const cameraAnimationCleanupRef = useRef<(() => void) | null>(null);

  onSelectBookRef.current = onSelectBook;
  localeRef.current = locale;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const bookTextureCache = bookTextureCacheRef.current;
    const bookGroups = bookGroupsRef.current;
    let disposed = false;
    let frameId = 0;
    let model: THREE.Group | null = null;
    let lampModel: THREE.Group | null = null;
    let floorReflection: THREE.Mesh | null = null;
    let woodTexture: THREE.Texture | null = null;
    let woodMaterial: THREE.MeshStandardMaterial | null = null;
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (error) {
      console.error('Could not create the 3D bookshelf renderer.', error);
      setLoadError('WebGL is unavailable.');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', localeRef.current === 'ar' ? 'مكتبة ثلاثية الأبعاد ثابتة. انقر على كتاب لاختياره.' : 'Fixed 3D bookshelf. Click a book to select it.');
    renderer.domElement.setAttribute('role', 'img');
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight('#f7dfbd', '#24150c', 1.45));
    const keyLight = new THREE.DirectionalLight('#ffe0aa', 4);
    keyLight.position.set(-4, 7, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.bias = -0.00015;
    keyLight.shadow.radius = 5;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight('#b88653', 1.25);
    fillLight.position.set(5, 3, 4);
    scene.add(fillLight);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        hoveredBookIdRef.current = null;
        setHoveredBook(null);
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(interactiveBooksRef.current?.children ?? [], true).find((item) => item.object.userData.book);
      const bookInstanceId = hit?.object.userData.bookInstanceId as string | undefined;
      const book = hit?.object.userData.book as Book | undefined;
      hoveredBookIdRef.current = bookInstanceId ?? null;
      renderer.domElement.style.cursor = bookInstanceId ? 'pointer' : 'default';
      if (!book || !bookInstanceId) {
        setHoveredBook(null);
        return;
      }
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setHoveredBook((previous) => (
        previous?.book.id === book.id && Math.abs(previous.x - x) < 8 && Math.abs(previous.y - y) < 8
          ? previous
          : { book, x, y }
      ));
    };
    const onPointerLeave = () => {
      hoveredBookIdRef.current = null;
      setHoveredBook(null);
      renderer.domElement.style.cursor = 'default';
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !host.contains(renderer.domElement)) return;
      renderer.domElement.dataset.pointerX = String(event.clientX);
      renderer.domElement.dataset.pointerY = String(event.clientY);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!renderer.domElement.dataset.pointerX || !renderer.domElement.dataset.pointerY) return;
      const startX = Number(renderer.domElement.dataset.pointerX);
      const startY = Number(renderer.domElement.dataset.pointerY);
      delete renderer.domElement.dataset.pointerX;
      delete renderer.domElement.dataset.pointerY;
      if (Math.hypot(event.clientX - startX, event.clientY - startY) > 5) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(interactiveBooksRef.current?.children ?? [], true).find((item) => item.object.userData.book);
      const book = hit?.object.userData.book as Book | undefined;
      const instanceId = hit?.object.userData.bookInstanceId as string | undefined;
      const bookGroup = instanceId ? bookGroups.get(instanceId) : undefined;
      if (book && bookGroup && typeof bookGroup.userData.pickStartedAt !== 'number') {
        renderer.domElement.dataset.bookClick = 'true';
        window.setTimeout(() => delete renderer.domElement.dataset.bookClick, 450);
        hoveredBookIdRef.current = instanceId;
        bookGroup.userData.pickStartedAt = performance.now();
        bookGroup.userData.pickStartRotation = bookGroup.rotation.y;
        const shelfSize = loadedShelfRef.current?.size;
        if (!shelfSize) return;
        const cameraTarget = camera.userData.lookTarget as THREE.Vector3 | undefined;
        const towardCamera = camera.position.clone().sub(cameraTarget ?? new THREE.Vector3()).normalize();
        const cameraDistance = camera.position.distanceTo(bookGroup.getWorldPosition(new THREE.Vector3()));
        const bookDepth = bookGroup.userData.bookDepth as number;
        const pickOffset = towardCamera.multiplyScalar(
          Math.min(bookDepth * 0.36, cameraDistance * 0.08, shelfSize.z * 0.16),
        );
        bookGroup.userData.pickOffsetX = pickOffset.x;
        bookGroup.userData.pickOffsetY = pickOffset.y;
        bookGroup.userData.pickOffsetZ = pickOffset.z;
        bookGroup.userData.pickComplete = false;
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    const textureLoader = new THREE.TextureLoader();
    textureLoaderRef.current = textureLoader;
    const render = () => {
      frameId = window.requestAnimationFrame(render);
      bookGroups.forEach((bookGroup, instanceId) => {
        const hovered = hoveredBookIdRef.current === instanceId;
        bookGroup.children.forEach((child) => {
          if (child.userData.coverImage) {
            child.visible = Boolean(child.userData.coverLoaded && hovered);
          }
        });
        const pickStartedAt = bookGroup.userData.pickStartedAt as number | undefined;
        if (pickStartedAt !== undefined) {
          const duration = 620;
          const progress = Math.min(1, (performance.now() - pickStartedAt) / duration);
          const eased = progress * progress * (3 - 2 * progress);
          const startRotation = bookGroup.userData.pickStartRotation as number;
          const pickRotation = bookGroup.userData.pickRotation as number;
          const baseY = bookGroup.userData.baseY as number;
          const baseZ = bookGroup.userData.baseZ as number;
          const pickLift = bookGroup.userData.pickLift as number;
          bookGroup.rotation.y = THREE.MathUtils.lerp(startRotation, pickRotation, eased);
          bookGroup.position.x = (bookGroup.userData.baseX as number)
            + (bookGroup.userData.pickOffsetX as number) * eased;
          bookGroup.position.y = baseY
            + (bookGroup.userData.pickOffsetY as number) * eased
            + pickLift * eased;
          bookGroup.position.z = baseZ + (bookGroup.userData.pickOffsetZ as number) * eased;
          if (progress >= 1 && !bookGroup.userData.pickComplete) {
            bookGroup.userData.pickComplete = true;
            onSelectBookRef.current(bookGroup.userData.book as Book);
          }
          return;
        }
        const targetRotation = hovered ? bookGroup.userData.hoverRotation : 0;
        const targetZ = bookGroup.userData.baseZ + (hovered ? bookGroup.userData.hoverDepth : 0);
        bookGroup.rotation.y += (targetRotation - bookGroup.rotation.y) * 0.18;
        bookGroup.position.z += (targetZ - bookGroup.position.z) * 0.18;
      });
      renderer.render(scene, camera);
    };
    render();

    const resize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      const loaded = loadedShelfRef.current;
      if (loaded?.cameraFocus) {
        if (loaded.scrollFocus) {
          const shelfFloors = loaded.shelfFloors;
          const startY = shelfFloors[shelfFloors.length - 1] + loaded.rowSpacing * 0.5;
          const travel = Math.max(0, shelfFloors[shelfFloors.length - 1] - shelfFloors[0]);
          loaded.scrollFocus = { startY, travel };
          loaded.cameraFocus.target.y = startY;
          if (shelfScrollRef.current) shelfScrollRef.current.scrollTop = 0;
        }
        cameraAnimationCleanupRef.current?.();
        cameraAnimationCleanupRef.current = frameCamera(
          camera,
          loaded.cameraFocus.target,
          loaded.cameraFocus.width,
          loaded.cameraFocus.height,
          loaded.cameraFocus.padding,
        );
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const modelLoadingManager = new THREE.LoadingManager();
    modelLoadingManager.setURLModifier((url) => (
      url.toLowerCase().includes('screenshot 2024-09-09 151143.png')
        ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/7x8AAAAASUVORK5CYII='
        : url
    ));

    const bookModelManager = new THREE.LoadingManager();
    bookModelManager.setURLModifier((url) => (
      url.toLowerCase().endsWith('/oldbook001.fbx')
        ? url
        : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/7x8AAAAASUVORK5CYII='
    ));
    new FBXLoader(bookModelManager).load(
      BOOK_MODEL,
      (bookModel) => {
        if (disposed) {
          disposeObject(bookModel);
          return;
        }
        bookModel.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(bookModel);
        const modelSize = bounds.getSize(new THREE.Vector3());
        if (
          !Number.isFinite(modelSize.x)
          || !Number.isFinite(modelSize.y)
          || !Number.isFinite(modelSize.z)
          || modelSize.x <= 0
          || modelSize.y <= 0
          || modelSize.z <= 0
        ) {
          console.error('The 3D book model has invalid dimensions.');
          disposeObject(bookModel);
          return;
        }
        bookModelRef.current = bookModel;
        setBookModelVersion((version) => version + 1);
      },
      undefined,
      (error) => console.error('Could not load the 3D book model.', error),
    );

    new FBXLoader(modelLoadingManager).load(
      SHELF_MODEL,
      (loadedModel) => {
        if (disposed) {
          disposeObject(loadedModel);
          return;
        }
        loadedModel.updateMatrixWorld(true);
        const rawBounds = new THREE.Box3().setFromObject(loadedModel);
        const rawSize = rawBounds.getSize(new THREE.Vector3());
        if (!Number.isFinite(rawSize.x) || rawSize.x <= 0 || rawSize.y <= 0 || rawSize.z <= 0) {
          setLoadError('The bookshelf model has invalid dimensions.');
          disposeObject(loadedModel);
          return;
        }
        const horizontalSourceAxis = rawSize.z > rawSize.x ? 'z' : 'x';
        const depthSourceAxis = horizontalSourceAxis === 'z' ? 'x' : 'z';
        const modelScale = 6.35 / rawSize[horizontalSourceAxis];
        const size = new THREE.Vector3(
          rawSize[horizontalSourceAxis] * modelScale * 1.14,
          rawSize.y * modelScale,
          rawSize[depthSourceAxis] * modelScale,
        );
        disposeObject(loadedModel);
        model = new THREE.Group();
        model.name = 'FBX bookshelf structure';
        const loadedWoodTexture = textureLoader.load(
          '/books-design/wood_table_001_diff_4k.jpg',
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(2, 2);
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            texture.needsUpdate = true;
          },
          undefined,
          (error) => console.error('Could not load the 3D bookshelf wood texture.', error),
        );
        woodTexture = loadedWoodTexture;
        const frameMaterial = new THREE.MeshStandardMaterial({
          map: loadedWoodTexture,
          color: '#9b7252',
          roughness: 0.72,
          metalness: 0,
        });
        woodMaterial = frameMaterial;
        const { frame, shelfFloors, frameHeight, rowSpacing } = createShelfFrame(size, frameMaterial, 3, true);
        model.add(frame);
        scene.add(model);
        loadedShelfRef.current = {
          model,
          frameMaterial,
          scene,
          camera,
          size,
          shelfFloors,
          frameHeight,
          rowSpacing,
          scrollFocus: null,
          cameraFocus: null,
        };
        const lampLoadingManager = new THREE.LoadingManager();
        lampLoadingManager.setURLModifier((url) => {
          const fileName = url.split(/[\\/]/).pop()?.split(/[?#]/)[0]?.toLowerCase();
          return fileName ? LAMP_TEXTURE_PATHS[fileName] ?? url : url;
        });
        new FBXLoader(lampLoadingManager).load(
          LAMP_MODEL,
          (loadedLamp) => {
            if (disposed) {
              disposeObject(loadedLamp);
              return;
            }

            loadedLamp.updateMatrixWorld(true);
            const lampBounds = new THREE.Box3().setFromObject(loadedLamp);
            const lampSize = lampBounds.getSize(new THREE.Vector3());
            if (
              !Number.isFinite(lampSize.x)
              || !Number.isFinite(lampSize.y)
              || !Number.isFinite(lampSize.z)
              || lampSize.x <= 0
              || lampSize.y <= 0
              || lampSize.z <= 0
            ) {
              console.error('The 3D lamp model has invalid dimensions.');
              disposeObject(loadedLamp);
              return;
            }

            const lampScale = (size.y * 0.68 * 0.9) / lampSize.y;
            const lampCenter = lampBounds.getCenter(new THREE.Vector3());
            loadedLamp.scale.setScalar(lampScale);
            loadedLamp.position.set(
              -size.x * 0.82 - lampCenter.x * lampScale,
              size.y * 0.02 - lampBounds.min.y * lampScale,
              size.z * 0.58 - lampCenter.z * lampScale,
            );
            loadedLamp.name = 'Reading room floor lamp';
            loadedLamp.traverse((object) => {
              if (object instanceof THREE.Mesh) {
                const materials = Array.isArray(object.material) ? object.material : [object.material];
                object.castShadow = true;
                object.receiveShadow = true;
                materials.forEach((material) => {
                  const materialLabel = `${object.name} ${material.name} ${material.map?.name ?? ''}`;
                  if (
                    !/fabric|shade|lampshade/i.test(materialLabel)
                    || !(material instanceof THREE.MeshPhongMaterial || material instanceof THREE.MeshStandardMaterial)
                  ) return;

                  material.side = THREE.DoubleSide;
                  material.needsUpdate = true;
                });
              }
            });
            const lampLight = new THREE.PointLight('#ffc979', 12, 7, 2);
            lampLight.position.set(
              lampCenter.x,
              lampBounds.min.y + lampSize.y * 0.82,
              lampBounds.max.z + lampSize.z * 0.08,
            );
            loadedLamp.add(lampLight);

            const reflectionCanvas = document.createElement('canvas');
            reflectionCanvas.width = 128;
            reflectionCanvas.height = 128;
            const reflectionContext = reflectionCanvas.getContext('2d');
            if (!reflectionContext) {
              console.error('Could not create the lamp floor reflection texture.');
              disposeObject(loadedLamp);
              return;
            }
            const reflectionGradient = reflectionContext.createRadialGradient(64, 64, 2, 64, 64, 64);
            reflectionGradient.addColorStop(0, 'rgba(255, 184, 92, 0.38)');
            reflectionGradient.addColorStop(0.45, 'rgba(255, 160, 65, 0.14)');
            reflectionGradient.addColorStop(1, 'rgba(255, 160, 65, 0)');
            reflectionContext.fillStyle = reflectionGradient;
            reflectionContext.fillRect(0, 0, 128, 128);
            const reflectionTexture = new THREE.CanvasTexture(reflectionCanvas);
            reflectionTexture.colorSpace = THREE.SRGBColorSpace;
            floorReflection = new THREE.Mesh(
              new THREE.PlaneGeometry(2.1, 1.35),
              new THREE.MeshBasicMaterial({
                map: reflectionTexture,
                transparent: true,
                opacity: 0.72,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
              }),
            );
            floorReflection.rotation.x = -Math.PI / 2;
            floorReflection.position.set(
              loadedLamp.position.x + lampCenter.x * lampScale,
              size.y * 0.025,
              loadedLamp.position.z + (lampBounds.max.z + lampSize.z * 0.18) * lampScale,
            );
            floorReflection.name = 'Reading lamp floor reflection';
            scene.add(floorReflection);
            lampModel = loadedLamp;
            scene.add(loadedLamp);
          },
          undefined,
          (error) => console.error('Could not load the 3D lamp model.', error),
        );
        setLoadError('');
        setIsReady(true);
      },
      undefined,
      (error) => {
        if (!disposed) setLoadError(error instanceof Error ? error.message : 'Could not load the 3D bookshelf model.');
      },
    );

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      if (model) disposeObject(model);
      if (lampModel) disposeObject(lampModel);
      if (floorReflection) disposeObject(floorReflection);
      if (bookModelRef.current) {
        disposeObject(bookModelRef.current);
        bookModelRef.current = null;
      }
      const interactiveBooks = scene.getObjectByName('Interactive books');
      if (interactiveBooks) {
        disposeObject(interactiveBooks);
        interactiveBooksRef.current = null;
      }
      bookTextureCache.forEach((texture) => texture.dispose());
      bookTextureCache.clear();
      woodMaterial?.dispose();
      woodTexture?.dispose();
      textureLoaderRef.current = null;
      bookGroups.clear();
      hoveredBookIdRef.current = null;
      loadedShelfRef.current = null;
      renderer.dispose();
      renderer.domElement.remove();
      scene.clear();
    };
  }, []);

  useEffect(() => {
    const loaded = loadedShelfRef.current;
    if (!isReady || !loaded) return;

    cameraAnimationCleanupRef.current?.();
    const { model, frameMaterial, scene, camera, size } = loaded;
    const sourceBookModel = bookModelRef.current;
    sourceBookModel?.updateMatrixWorld(true);
    const sourceBookBounds = sourceBookModel ? new THREE.Box3().setFromObject(sourceBookModel) : null;
    const sourceBookSize = sourceBookBounds?.getSize(new THREE.Vector3()) ?? null;
    const sourceBookCenter = sourceBookBounds?.getCenter(new THREE.Vector3()) ?? null;
    const existingBooks = scene.getObjectByName('Interactive books');
    if (existingBooks) {
      scene.remove(existingBooks);
      disposeObject(existingBooks);
      interactiveBooksRef.current = null;
    }
    bookGroupsRef.current.clear();
    hoveredBookIdRef.current = null;
    setHoveredBook(null);

    const bookRoot = new THREE.Group();
    bookRoot.name = 'Interactive books';
    scene.add(bookRoot);
    interactiveBooksRef.current = bookRoot;
    const sourceBooks = selectedCategory === null ? sections.flatMap((section) => section.books) : sections[selectedCategory]?.books ?? [];
    const books = sourceBooks.filter((book): book is Book => Boolean(book?.id && typeof book.title === 'string'));
    if (books.length !== sourceBooks.length) {
      console.error(`The 3D bookshelf skipped ${sourceBooks.length - books.length} invalid book record(s).`);
    }
    const rowCount = selectedCategory === null
      ? Math.max(1, Math.ceil(sections.length / 2))
      : Math.max(1, Math.ceil(books.length / BOOKS_PER_FULL_ROW));
    const previousFrame = model.children.find((child) => child.name === 'Open two-section bookshelf');
    if (previousFrame) {
      model.remove(previousFrame);
      previousFrame.traverse((child) => {
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      });
    }
    const frameSize = size.clone();
    if (selectedCategory === null) {
      frameSize.x *= 1.2;
      frameSize.y *= 4 / 3;
    }
    const { frame, shelfFloors, frameHeight, rowSpacing } = createShelfFrame(
      frameSize,
      frameMaterial,
      rowCount,
      selectedCategory === null,
    );
    model.add(frame);
    loaded.shelfFloors = shelfFloors;
    loaded.frameHeight = frameHeight;
    loaded.rowSpacing = rowSpacing;

    if (shelfScrollRef.current) shelfScrollRef.current.scrollTop = 0;
    const floorLevels = shelfFloors;
    const layoutWidth = frameSize.x;
    const interiorWidth = layoutWidth - layoutWidth * 0.044 * 2;
    const centerDividerHalf = layoutWidth * 0.011;
    let tallestBook = 0;

    floorLevels.forEach((floor, shelfIndex) => {
      const shelfCeiling = shelfFloors[shelfIndex + 1]
        ?? (selectedCategory === null ? frameHeight * 0.91 : frameHeight);
      const bookHeight = Math.min(size.y * 0.18, (shelfCeiling - floor) * 0.68);
      tallestBook = Math.max(tallestBook, bookHeight);

      [0, 1].forEach((halfIndex) => {
        const cellIndex = shelfIndex * 2 + halfIndex;
        const cellStart = (rowCount - shelfIndex - 1) * BOOKS_PER_FULL_ROW + halfIndex * MAX_BOOKS_PER_SECTION;
        const cellBooks = selectedCategory === null
          ? (sections[cellIndex]?.books ?? []).slice(0, MAX_BOOKS_PER_OVERVIEW_BAY)
          : books.slice(cellStart, cellStart + MAX_BOOKS_PER_SECTION);
        if (!cellBooks.length) return;

        const side = locale === 'ar' ? (halfIndex === 0 ? 1 : -1) : (halfIndex === 0 ? -1 : 1);
        const halfWidth = interiorWidth / 2 - centerDividerHalf;
        const margin = layoutWidth * 0.026;
        const cellRight = side > 0 ? interiorWidth / 2 : -centerDividerHalf;
        const cellLeft = side > 0 ? centerDividerHalf : -interiorWidth / 2;
        const direction = locale === 'ar' ? -side : side;
        const bayBookCount = selectedCategory === null ? MAX_BOOKS_PER_OVERVIEW_BAY : MAX_BOOKS_PER_SECTION;
        const baseBookWidth = Math.min(layoutWidth * 0.026, ((halfWidth - margin * 2) / bayBookCount) * 0.88);
        const dimensions = cellBooks.map((book, bookIndex) => {
          const seed = (
            bookSeed(book)
            ^ Math.imul(cellIndex + 1, 0x9e3779b1)
            ^ Math.imul(bookIndex + 1, 0x85ebca6b)
          ) >>> 0;
          const height = bookHeight * (0.88 + ((seed >>> 6) % 10) / 100);
          return {
            book,
            seed,
            width: baseBookWidth * (0.68 + (seed % 40) / 100),
            height,
            depth: Math.min(size.z * 0.76, height * (0.58 + ((seed >>> 16) % 22) / 100)),
          };
        });
        const bookGaps = dimensions.map(({ seed }, bookIndex) => (
          bookIndex === dimensions.length - 1
            ? 0
            : layoutWidth * (bookIndex % 3 === 2 ? 0.009 : 0.004) + ((seed >>> 18) % 3) * layoutWidth * 0.0015
        ));
        const leadingGroupCount = dimensions.length > 1
          ? THREE.MathUtils.clamp(
            Math.floor(dimensions.length / 2) + (dimensions[0].seed % 5) - 2,
            1,
            dimensions.length - 1,
          )
          : dimensions.length;
        const totalBookWidth = dimensions.reduce((span, dimension) => span + dimension.width, 0);
        const totalBookGap = bookGaps.reduce((span, gap) => span + gap, 0);
        const centerGap = halfWidth * 0.18;
        const fitScale = Math.min(1, (halfWidth - margin * 2 - totalBookGap - centerGap) / totalBookWidth);
        if (fitScale < 1) {
          dimensions.forEach((dimension) => {
            dimension.width *= Math.max(0.1, fitScale);
          });
        }
        const trailingGroupSpan = dimensions
          .slice(leadingGroupCount)
          .reduce((span, dimension, index) => span + dimension.width + bookGaps[leadingGroupCount + index], 0);
        const positions = new Array<number>(dimensions.length);
        let leadingOffset = margin;
        for (let index = 0; index < leadingGroupCount; index += 1) {
          positions[index] = (direction > 0 ? cellLeft : cellRight)
            + direction * (leadingOffset + dimensions[index].width / 2);
          leadingOffset += dimensions[index].width + bookGaps[index];
        }
        let trailingOffset = halfWidth - margin - trailingGroupSpan;
        for (let index = leadingGroupCount; index < dimensions.length; index += 1) {
          positions[index] = (direction > 0 ? cellLeft : cellRight)
            + direction * (trailingOffset + dimensions[index].width / 2);
          trailingOffset += dimensions[index].width + bookGaps[index];
        }
        const shelf = new THREE.Group();
        shelf.name = `Shelf ${shelfIndex + 1} section ${halfIndex + 1}`;
        bookRoot.add(shelf);

        const leanDirections = new Map<number, number>();
        for (let index = 0; index < dimensions.length - 1; index += 1) {
          const hasAdjacentLean = leanDirections.has(index - 1) || leanDirections.has(index + 1);
          if (!hasAdjacentLean && dimensions[index].seed % 5 === 0) {
            leanDirections.set(index, direction);
          }
        }
        const lastIndex = dimensions.length - 1;
        if (
          lastIndex > 0
          && !leanDirections.has(lastIndex - 1)
          && !leanDirections.has(lastIndex)
          && dimensions[lastIndex].seed % 5 === 0
        ) {
          leanDirections.set(lastIndex, -direction);
        }

        dimensions.forEach(({ book, seed, width: bookWidth, height, depth }, bookIndex) => {
        const bookId = String(book.id);
        const instanceId = `${cellIndex}:${bookIndex}:${bookId}`;
        const color = BOOK_COLORS[seed % BOOK_COLORS.length];
        const loader = textureLoaderRef.current ?? new THREE.TextureLoader();
        textureLoaderRef.current = loader;
        const materialPath = BOOK_MATERIALS[seed % BOOK_MATERIALS.length];
        const materialTexture = getCachedTexture(bookTextureCacheRef.current, loader, materialPath);
        materialTexture.repeat.set(1, 1.25);
        const pageTexture = getCachedTexture(bookTextureCacheRef.current, loader, '/books-design/paper-edge.jpg');
        pageTexture.repeat.set(1.2, 5);
        const tint = new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.24);
        const material = new THREE.MeshStandardMaterial({
          map: materialTexture,
          color: tint,
          roughness: 0.84,
          metalness: 0,
          emissive: color,
          emissiveIntensity: 0.06,
        });
        material.userData.sharedTexture = true;
        const pageMaterial = new THREE.MeshStandardMaterial({ map: pageTexture, color: '#d8c9a6', roughness: 0.94 });
        pageMaterial.userData.sharedTexture = true;
        const spineOverlayTexture = makeSpineTexture(book, locale === 'ar');
        const spineMaterial = new THREE.MeshStandardMaterial({
          map: materialTexture,
          color: tint,
          roughness: 0.84,
          metalness: 0,
          emissive: color,
          emissiveIntensity: 0.06,
        });
        spineMaterial.userData.sharedTexture = true;
        const bookGroup = new THREE.Group();
        bookGroup.name = `Book ${bookId} instance ${cellIndex}-${bookIndex}`;
        bookGroup.userData.book = book;
        bookGroup.userData.hoverRotation = locale === 'ar' ? Math.PI / 4 : -Math.PI / 4;
        bookGroup.userData.pickRotation = locale === 'ar' ? Math.PI / 2 : -Math.PI / 2;
        bookGroup.userData.baseZ = size.z * 0.035 + size.z * 0.92 / 2 - depth / 2 - size.z * 0.015;
        const rotatedHalfDepth = (depth + bookWidth) * Math.SQRT1_2 * 0.5;
        bookGroup.userData.hoverDepth = depth * 0.5 + rotatedHalfDepth + size.z * 0.012;
        const leanDirection = leanDirections.get(bookIndex) ?? 0;
        const leanAngle = leanDirection ? 0.045 + (seed % 4) * 0.012 : 0;
        bookGroup.position.set(
          positions[bookIndex],
          floor + Math.sin(leanAngle) * bookWidth / 2 + size.y * 0.001,
          bookGroup.userData.baseZ,
        );
        bookGroup.userData.baseY = bookGroup.position.y;
        bookGroup.userData.baseX = bookGroup.position.x;
        bookGroup.userData.bookDepth = depth;
        bookGroup.userData.pickLift = height * 0.24;
        bookGroup.rotation.z = -leanDirection * leanAngle;

          if (sourceBookModel && sourceBookSize && sourceBookCenter && sourceBookBounds) {
            const leatherMaterial = new THREE.MeshStandardMaterial({
              map: materialTexture,
              color: tint,
              roughness: 0.82,
              metalness: 0,
            });
            const modelTransform = new THREE.Matrix4().set(
              0, 0, bookWidth / sourceBookSize.z, -sourceBookCenter.z * bookWidth / sourceBookSize.z,
              0, height / sourceBookSize.y, 0, -sourceBookBounds.min.y * height / sourceBookSize.y,
              -depth / sourceBookSize.x, 0, 0, sourceBookCenter.x * depth / sourceBookSize.x,
              0, 0, 0, 1,
            );
            leatherMaterial.userData.sharedTexture = true;
            sourceBookModel.traverse((child) => {
              if (!(child instanceof THREE.Mesh)) return;
              const geometry = child.geometry.clone();
              geometry.applyMatrix4(child.matrixWorld);
              geometry.applyMatrix4(modelTransform);
              const bookMesh = new THREE.Mesh(geometry, leatherMaterial);
              bookMesh.castShadow = true;
              bookMesh.receiveShadow = true;
              bookMesh.userData.book = book;
              bookGroup.add(bookMesh);
            });
            material.dispose();
            pageMaterial.dispose();
            spineMaterial.dispose();
          } else {
            const pageBlock = new THREE.Mesh(
              new THREE.BoxGeometry(bookWidth * 0.82, height * 0.91, depth * 0.86),
              pageMaterial,
            );
            pageBlock.position.set(0, height / 2, -depth * 0.025);
            pageBlock.castShadow = true;
            pageBlock.receiveShadow = true;
            pageBlock.userData.book = book;
            bookGroup.add(pageBlock);

            const spine = new THREE.Mesh(
              new THREE.BoxGeometry(bookWidth, height, depth * 0.12),
              [material, material, material, material, spineMaterial, material],
            );
            spine.position.set(0, height / 2, depth * 0.43);
            spine.castShadow = true;
            spine.userData.book = book;
            bookGroup.add(spine);

            const coverBoard = (coverSide: number) => {
              const boardMaterial = new THREE.MeshStandardMaterial({
                map: materialTexture,
                color: tint,
                roughness: 0.74,
                side: THREE.DoubleSide,
              });
              boardMaterial.userData.sharedTexture = true;
              const board = new THREE.Mesh(
                new THREE.PlaneGeometry(depth * 0.96, height * 0.98),
                boardMaterial,
              );
              board.position.set(coverSide * (bookWidth / 2 + 0.0015), height / 2, 0);
              board.rotation.y = coverSide * Math.PI / 2;
              board.userData.book = book;
              bookGroup.add(board);
            };
            coverBoard(-1);
            coverBoard(1);
          }

          const spineOverlay = new THREE.Mesh(
            new THREE.PlaneGeometry(bookWidth * 0.94, height * 0.96),
            new THREE.MeshBasicMaterial({
              map: spineOverlayTexture,
              transparent: true,
              depthWrite: false,
              side: THREE.DoubleSide,
            }),
          );
          spineOverlay.position.set(0, height / 2, depth * 0.5 + 0.0015);
          spineOverlay.userData.book = book;
          bookGroup.add(spineOverlay);

          if (book.cover_url) {
            const coverSide = locale === 'ar' ? -1 : 1;
            const coverMaterial = new THREE.MeshPhysicalMaterial({
              color: '#f2e9d9',
              roughness: 0.82,
              clearcoat: 0.08,
              clearcoatRoughness: 0.88,
              side: THREE.DoubleSide,
              polygonOffset: true,
              polygonOffsetFactor: -1,
            });
            const cover = new THREE.Mesh(
              new THREE.PlaneGeometry(depth * 0.9, height * 0.92),
              coverMaterial,
            );
            cover.position.set(coverSide * (bookWidth / 2 + 0.0002), height / 2, 0);
            cover.rotation.y = coverSide * Math.PI / 2;
            cover.visible = false;
            cover.userData.book = book;
            cover.userData.coverImage = true;
            bookGroup.add(cover);

            const source = getBackendCoverSource(book.cover_url);
            const applyCoverTexture = (texture: THREE.Texture) => {
              const image = texture.image as HTMLImageElement | null;
              if (!image || typeof image.naturalWidth !== 'number' || typeof image.naturalHeight !== 'number') return;
              const showCover = () => {
                const coverTexture = texture.clone();
                const imageRatio = image.naturalWidth / image.naturalHeight;
                const faceRatio = depth / height;
                if (imageRatio > faceRatio) {
                  coverTexture.repeat.set(faceRatio / imageRatio, 1);
                  coverTexture.offset.set((1 - coverTexture.repeat.x) / 2, 0);
                } else {
                  coverTexture.repeat.set(1, imageRatio / faceRatio);
                  coverTexture.offset.set(0, (1 - coverTexture.repeat.y) / 2);
                }
                coverTexture.colorSpace = THREE.SRGBColorSpace;
                coverTexture.needsUpdate = true;
                cover.userData.coverLoaded = true;
                coverMaterial.map = coverTexture;
                coverMaterial.needsUpdate = true;
              };
              if (image.naturalWidth > 0 && image.naturalHeight > 0) showCover();
              else if (!image.complete) image.addEventListener('load', showCover, { once: true });
            };
            const cachedCover = bookTextureCacheRef.current.get(source);
            if (cachedCover) {
              applyCoverTexture(cachedCover);
            } else {
              const coverTexture = loader.load(
                source,
                applyCoverTexture,
                undefined,
                (error) => console.error(`Could not load the cover for book "${book.title}".`, error),
              );
              coverTexture.colorSpace = THREE.SRGBColorSpace;
              bookTextureCacheRef.current.set(source, coverTexture);
            }
          }

        bookGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) child.userData.bookInstanceId = instanceId;
        });
        shelf.add(bookGroup);
        bookGroupsRef.current.set(instanceId, bookGroup);
      });
      });
    });

    const focusBounds = selectedCategory === null || books.length === 0
      ? new THREE.Box3().setFromObject(model)
      : new THREE.Box3().setFromObject(bookRoot);
    const focusCenter = focusBounds.getCenter(new THREE.Vector3());
    const focusSize = focusBounds.getSize(new THREE.Vector3());
    const focusWidth = selectedCategory === null || books.length === 0
      ? frameSize.x
      : Math.max(focusSize.x, size.x * 0.96);
    const focusHeight = selectedCategory === null || books.length === 0
      ? frameHeight
      : Math.min(frameHeight, Math.max(rowSpacing * 1.2, tallestBook * 1.6));
    const focusPadding = selectedCategory === null || books.length === 0 ? 1.12 : 1.08;
    const viewHeight = cameraViewHeight(camera, focusWidth, focusHeight, focusPadding);
    const startY = selectedCategory !== null && books.length > 0
      ? shelfFloors[shelfFloors.length - 1] + rowSpacing * 0.5
      : Math.max(frameHeight / 2, frameHeight - viewHeight / 2);
    const travel = selectedCategory !== null && books.length > 0
      ? Math.max(0, shelfFloors[shelfFloors.length - 1] - shelfFloors[0])
      : Math.max(0, frameHeight - viewHeight);
    loaded.scrollFocus = selectedCategory !== null && books.length > 0
      ? { startY, travel }
      : null;
    loaded.cameraFocus = {
      target: selectedCategory === null || books.length === 0
        ? new THREE.Vector3(0, frameHeight * 0.46, 0)
        : new THREE.Vector3(focusCenter.x, startY, focusCenter.z),
      width: focusWidth,
      height: focusHeight,
      padding: focusPadding,
    };
    cameraAnimationCleanupRef.current = frameCamera(
      camera,
      loaded.cameraFocus.target,
      loaded.cameraFocus.width,
      loaded.cameraFocus.height,
      loaded.cameraFocus.padding,
    );

    return () => cameraAnimationCleanupRef.current?.();
  }, [isReady, bookModelVersion, locale, sections, selectedCategory]);

  useEffect(() => () => cameraAnimationCleanupRef.current?.(), []);
  const categoryRowCount = selectedCategory === null
    ? 1
    : Math.max(1, Math.ceil((sections[selectedCategory]?.books.length ?? 0) / BOOKS_PER_FULL_ROW));

  return (
    <div className="catalog-3d-wrap">
      <div
        ref={shelfScrollRef}
        className={`catalog-3d-scroll${selectedCategory !== null ? ' catalog-3d-scroll--active' : ''}`}
        onScroll={(event) => {
          const loaded = loadedShelfRef.current;
          const focus = loaded?.scrollFocus;
          if (!loaded || !focus) return;
          const scrollableHeight = event.currentTarget.scrollHeight - event.currentTarget.clientHeight;
          const progress = scrollableHeight > 0 ? event.currentTarget.scrollTop / scrollableHeight : 0;
          const target = loaded.camera.userData.lookTarget as THREE.Vector3 | undefined;
          if (!target) return;
          cameraAnimationCleanupRef.current?.();
          const targetY = focus.startY - progress * focus.travel;
          loaded.camera.position.y += targetY - target.y;
          target.y = targetY;
          loaded.camera.lookAt(target);
        }}
      >
        <div ref={hostRef} className="catalog-3d-stage" />
        {hoveredBook && (
          <div
            className="catalog-3d-book-tooltip"
            style={{
              left: `${Math.max(132, Math.min((hostRef.current?.clientWidth ?? 0) - 132, hoveredBook.x))}px`,
              top: `${Math.max(8, Math.min((hostRef.current?.clientHeight ?? 0) - 96, hoveredBook.y + 18))}px`,
            }}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <strong className="catalog-3d-book-tooltip-title">{hoveredBook.book.title}</strong>
            <span className="catalog-3d-book-tooltip-author">
              {hoveredBook.book.author_display_name || (locale === 'ar' ? 'مؤلف غير معروف' : 'Unknown author')}
            </span>
            <span className="catalog-3d-book-tooltip-stats">
              <span>
                {locale === 'ar' ? 'قراءة' : 'Reads'}: {typeof hoveredBook.book.view_count === 'number'
                  ? hoveredBook.book.view_count.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')
                  : (locale === 'ar' ? 'غير متاح' : 'Unavailable')}
              </span>
              <span>
                {locale === 'ar' ? 'التقييم' : 'Rating'}: {typeof hoveredBook.book.average_rating === 'number'
                  ? `${hoveredBook.book.average_rating.toFixed(1)} / 5`
                  : (locale === 'ar' ? 'غير متاح' : 'Unavailable')}
              </span>
            </span>
          </div>
        )}
        {selectedCategory !== null && (
          <div
            className="catalog-3d-scroll-spacer"
            style={{ height: `${Math.max(0, (categoryRowCount - 1) * 100)}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      {loadError && (
        <div className="catalog-3d-error" role="alert">
          {locale === 'ar' ? 'تعذر تحميل نموذج المكتبة ثلاثي الأبعاد.' : `Could not load the 3D bookshelf: ${loadError}`}
        </div>
      )}
      {!isReady && !loadError && <div className="catalog-3d-loading">{locale === 'ar' ? 'جارٍ تحميل المكتبة ثلاثية الأبعاد...' : 'Loading 3D bookshelf...'}</div>}
      {selectedCategory !== null && sections[selectedCategory] && (
        <div className="catalog-3d-category-title">{sections[selectedCategory].name}</div>
      )}
    </div>
  );
}
