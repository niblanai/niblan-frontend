'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type ReadingTheme = 'morning' | 'evening' | 'night-window' | 'cafe' | 'home' | 'fireplace';

const palettes: Record<ReadingTheme, { sky: string; wall: string; warm: string; windows: string; ambient: number }> = {
	morning: { sky: '#b8c6bb', wall: '#ddceb0', warm: '#fff0c8', windows: '#f6d990', ambient: 1.15 },
	evening: { sky: '#9c6b52', wall: '#c7a27a', warm: '#ffd69a', windows: '#ffd084', ambient: 0.9 },
	'night-window': { sky: '#242d3b', wall: '#766c60', warm: '#e4c990', windows: '#ffd987', ambient: 0.52 },
	cafe: { sky: '#77786e', wall: '#a49677', warm: '#f6d99b', windows: '#f5c979', ambient: 0.82 },
	home: { sky: '#b5b0a0', wall: '#d8c9ab', warm: '#fff0cb', windows: '#ffdc9b', ambient: 1 },
	fireplace: { sky: '#493a34', wall: '#937054', warm: '#f2a34f', windows: '#ffc578', ambient: 0.62 },
};

function addBox(
	parent: THREE.Object3D,
	size: [number, number, number],
	position: [number, number, number],
	color: THREE.ColorRepresentation,
	options: { emissive?: THREE.ColorRepresentation; emissiveIntensity?: number; roughness?: number } = {},
) {
	const mesh = new THREE.Mesh(
		new THREE.BoxGeometry(...size),
		new THREE.MeshStandardMaterial({
			color,
			roughness: options.roughness ?? 0.84,
			emissive: options.emissive ?? '#000000',
			emissiveIntensity: options.emissiveIntensity ?? 0,
		}),
	);
	mesh.position.set(...position);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	parent.add(mesh);
	return mesh;
}

function disposeScene(scene: THREE.Scene) {
	scene.traverse((object) => {
		if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
			object.geometry.dispose();
			const materials = Array.isArray(object.material) ? object.material : [object.material];
			materials.forEach((material) => material.dispose());
		}
	});
}

export function ReadingRoomScene({ theme }: { theme: ReadingTheme }) {
	const hostRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;

		const palette = palettes[theme];
		const night = theme === 'night-window';
		const scene = new THREE.Scene();
		scene.background = night ? null : new THREE.Color(palette.sky);
		scene.fog = new THREE.Fog(palette.sky, 19, 38);

		const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
		camera.position.set(0, 0.25, 15.8);
		camera.lookAt(0, 0, -3.8);

		let renderer: THREE.WebGLRenderer;
		try {
			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: night, powerPreference: 'low-power' });
		} catch {
			host.classList.add('reader-scene--fallback');
			return () => host.classList.remove('reader-scene--fallback');
		}
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
		renderer.setSize(host.clientWidth, host.clientHeight, false);
		renderer.setClearColor(palette.sky, night ? 0 : 1);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.1;
		renderer.domElement.setAttribute('aria-hidden', 'true');
		host.appendChild(renderer.domElement);

		const room = new THREE.Group();
		scene.add(room);
		scene.add(new THREE.HemisphereLight(palette.warm, '#66533d', palette.ambient));
		const sun = new THREE.DirectionalLight(palette.warm, theme === 'night-window' ? 0.65 : 1.45);
		sun.position.set(-5, 8, 6);
		scene.add(sun);

		const moonOrSun = new THREE.Mesh(
			new THREE.SphereGeometry(night ? 0.28 : 0.4, 24, 18),
			new THREE.MeshBasicMaterial({ color: night ? '#e8dfc8' : theme === 'evening' ? '#f4b46d' : '#fff0c7' }),
		);
		moonOrSun.position.set(6.3, 3.18, -8.15);
		room.add(moonOrSun);

		if (night) {
			const starGeometry = new THREE.BufferGeometry();
			const starPositions = new Float32Array(180 * 3);
			for (let index = 0; index < 180; index += 1) {
				starPositions[index * 3] = 0.4 + Math.random() * 12;
				starPositions[index * 3 + 1] = -0.1 + Math.random() * 6.8;
				starPositions[index * 3 + 2] = -8.25;
			}
			starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
			const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: '#fff1cc', size: 0.055, transparent: true, opacity: 0.88 }));
			room.add(stars);
		}

		const buildingSpecs = [
			{ x: 1.1, width: 0.92, height: 2.7, color: '#625a52' },
			{ x: 2.25, width: 1.04, height: 3.85, color: '#726253' },
			{ x: 3.55, width: 1.16, height: 2.95, color: '#5e5b53' },
			{ x: 4.95, width: 1.02, height: 4.15, color: '#71695d' },
			{ x: 6.25, width: 1.1, height: 3.22, color: '#625a54' },
			{ x: 7.55, width: 0.92, height: 2.5, color: '#7c6d5b' },
		];
		for (const building of buildingSpecs) {
			const buildingGroup = new THREE.Group();
			buildingGroup.position.set(building.x, -1.08, -7.75);
			room.add(buildingGroup);
			addBox(buildingGroup, [building.width, building.height, 0.42], [0, building.height / 2, 0], building.color);
			const columns = Math.max(2, Math.floor(building.width / 0.26));
			const rows = Math.max(2, Math.floor(building.height / 0.55));
			for (let row = 0; row < rows; row += 1) {
				for (let column = 0; column < columns; column += 1) {
					const lit = (row * 3 + column * 5 + Math.round(building.x * 8)) % 4 !== 0;
					const material = new THREE.MeshBasicMaterial({ color: night && lit ? palette.windows : '#41403d' });
					const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.105, 0.18), material);
					windowMesh.position.set(-building.width / 2 + ((column + 1) * building.width) / (columns + 1), 0.38 + row * 0.48, 0.218);
					buildingGroup.add(windowMesh);
				}
			}
		}

		addBox(room, [7.7, 0.34, 0.3], [4.9, -1.82, -7.48], '#4d4b47');
		for (const x of [-1.25, -0.25, 0.65, 1.45]) addBox(room, [0.36, 0.025, 0.015], [4.9 + x, -1.64, -7.3], '#d7bd81', { emissive: '#8b7044', emissiveIntensity: 0.12 });

		const cars: THREE.Group[] = [];
		const carSpecs = [
			{ y: -1.55, color: '#a86246', speed: 0.42, phase: 0 },
			{ y: -1.94, color: '#77766b', speed: 0.31, phase: 2.1 },
			{ y: -1.73, color: '#627985', speed: 0.25, phase: 4.4 },
		];
		for (const spec of carSpecs) {
			const car = new THREE.Group();
			car.position.set(4.9, spec.y, -7.15);
			room.add(car);
			cars.push(car);
			addBox(car, [0.54, 0.17, 0.28], [0, 0, 0], spec.color, { roughness: 0.55 });
			addBox(car, [0.23, 0.13, 0.23], [-0.07, 0.1, 0], '#d8c8a9', { roughness: 0.38 });
			addBox(car, [0.027, 0.035, 0.035], [-0.278, 0.025, 0.16], '#ffe3a4', { emissive: '#ffcf78', emissiveIntensity: 1.3 });
			addBox(car, [0.027, 0.035, 0.035], [0.278, 0.025, 0.16], '#d77d52', { emissive: '#c85e36', emissiveIntensity: 0.65 });
			car.userData.motion = spec;
		}

		for (const x of [0.82, 8.65]) {
			const lamp = new THREE.Group();
			lamp.position.set(x, -0.8, -6.85);
			room.add(lamp);
			const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 2.05, 8), new THREE.MeshStandardMaterial({ color: '#5a4c3b', metalness: 0.35, roughness: 0.6 }));
			pole.position.y = 1.02;
			lamp.add(pole);
			addBox(lamp, [0.52, 0.05, 0.07], [0.21, 2.04, 0], '#5a4c3b');
			const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), new THREE.MeshBasicMaterial({ color: palette.windows }));
			bulb.position.set(0.44, 1.98, 0.03);
			lamp.add(bulb);
			const lampLight = new THREE.PointLight(palette.windows, night ? 0.85 : 0.22, 3.8);
			lampLight.position.set(0.44, 1.82, 0.12);
			lamp.add(lampLight);
		}

		const windowFrame = new THREE.Group();
		windowFrame.position.set(4.8, 1.05, -4.75);
		room.add(windowFrame);
		const frameMaterial = new THREE.MeshStandardMaterial({ color: '#775a3d', roughness: 0.73 });
		const frameParts: Array<[number, number, number, number, number, number]> = [
			[-5.05, 0, 0, 0.2, 6.65, 0.24], [5.05, 0, 0, 0.2, 6.65, 0.24],
			[0, 3.33, 0, 10.3, 0.22, 0.24], [0, -3.33, 0, 10.3, 0.22, 0.24],
			[0, 0, 0, 0.13, 6.55, 0.28], [0, 0, 0, 10.1, 0.13, 0.28],
		];
		for (const [x, y, z, width, height, depth] of frameParts) {
			const frame = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), frameMaterial);
			frame.position.set(x, y, z);
			windowFrame.add(frame);
		}
		const glass = new THREE.Mesh(
			new THREE.PlaneGeometry(9.98, 6.48),
			new THREE.MeshPhysicalMaterial({ color: night ? '#73839a' : '#ebdfc8', transparent: true, opacity: night ? 0.11 : 0.08, roughness: 0.18, metalness: 0.05 }),
		);
		glass.position.z = -0.08;
		windowFrame.add(glass);

		addBox(room, [26, 0.34, 9], [0, -3.05, -1.4], '#9a744d', { roughness: 0.78 });
		addBox(room, [26, 0.11, 9], [0, -3.27, 2.1], '#bd9867', { roughness: 0.72 });
		for (const x of [-7, -4, -1, 2, 5, 8]) addBox(room, [0.018, 0.018, 7.8], [x, -3.207, 2.1], '#775737');

		let fireplaceLight: THREE.PointLight | null = null;
		let fireplaceFlame: THREE.Mesh | null = null;
		if (theme === 'fireplace') {
			const hearth = new THREE.Group();
			hearth.position.set(-6.1, -2.05, -4.2);
			room.add(hearth);
			addBox(hearth, [1.5, 1.35, 0.4], [0, 0.5, 0], '#75543c');
			addBox(hearth, [0.9, 0.86, 0.08], [0, 0.45, 0.23], '#241c18', { emissive: '#4a2110', emissiveIntensity: 0.4 });
			fireplaceFlame = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), new THREE.MeshBasicMaterial({ color: '#ee873d' }));
			fireplaceFlame.position.set(0, 0.43, 0.31);
			hearth.add(fireplaceFlame);
			fireplaceLight = new THREE.PointLight('#ffad58', 1.8, 4.6);
			fireplaceLight.position.set(0, 0.55, 0.55);
			hearth.add(fireplaceLight);
		}

		const resize = () => {
			const width = host.clientWidth;
			const height = host.clientHeight;
			if (!width || !height) return;
			camera.aspect = width / height;
			camera.position.z = width < 600 ? 19.5 : width < 900 ? 17.5 : 15.8;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height, false);
		};
		resize();
		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(host);

		const pointer = new THREE.Vector2();
		const handlePointerMove = (event: PointerEvent) => {
			const bounds = host.getBoundingClientRect();
			pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
			pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
		};
		host.addEventListener('pointermove', handlePointerMove, { passive: true });
		const clock = new THREE.Clock();
		let frameId = 0;
		const animate = () => {
			const elapsed = clock.getElapsedTime();
			camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.12, 0.025);
			camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.25 - pointer.y * 0.07, 0.025);
			camera.lookAt(pointer.x * 0.13, pointer.y * 0.07, -3.8);
			cars.forEach((car) => {
				const motion = car.userData.motion as { speed: number; phase: number };
				car.position.x = 4.9 + Math.sin(elapsed * motion.speed + motion.phase) * 2.8;
			});
			if (fireplaceFlame && fireplaceLight) {
				const flicker = 0.94 + Math.sin(elapsed * 8) * 0.12 + Math.sin(elapsed * 13) * 0.07;
				fireplaceFlame.scale.y = flicker;
				fireplaceLight.intensity = 1.55 + flicker * 0.3;
			}
			renderer.render(scene, camera);
			frameId = window.requestAnimationFrame(animate);
		};
		animate();

		return () => {
			window.cancelAnimationFrame(frameId);
			resizeObserver.disconnect();
			host.removeEventListener('pointermove', handlePointerMove);
			disposeScene(scene);
			renderer.dispose();
			renderer.domElement.remove();
		};
	}, [theme]);

	return <div ref={hostRef} className={`reading-room-canvas reading-room-canvas--${theme}`} aria-hidden="true" />;
}