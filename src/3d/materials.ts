import * as THREE from 'three';

/**
 * Procedural texture generator to ensure zero 404 dependencies and high fidelity
 */
function createGridTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createBrushedMetalTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, 256, 256);

  // Micro horizontal streaks for anisotropic look
  for (let y = 0; y < 256; y++) {
    const val = Math.floor(120 + Math.random() * 50);
    ctx.fillStyle = `rgb(${val},${val},${val})`;
    ctx.fillRect(0, y, 256, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export interface MaterialPalette {
  baseClay: THREE.MeshStandardMaterial;
  panelWhite: THREE.MeshStandardMaterial;
  concretePaving: THREE.MeshStandardMaterial;
  roadWay: THREE.MeshStandardMaterial;
  roadCrossWay: THREE.MeshStandardMaterial;
  roadMarking: THREE.MeshBasicMaterial;
  gpBlue: THREE.MeshStandardMaterial;
  gpCyan: THREE.MeshStandardMaterial;
  steelTruss: THREE.MeshStandardMaterial;
  darkAccent: THREE.MeshStandardMaterial;
  frostedGlass: THREE.MeshPhysicalMaterial;
  cryoGlass: THREE.MeshPhysicalMaterial;
  waterDeep: THREE.MeshStandardMaterial;
  waterShallow: THREE.MeshStandardMaterial;
  treeFoliage: THREE.MeshStandardMaterial;
  treeTrunk: THREE.MeshStandardMaterial;
  glowNightLight: THREE.MeshBasicMaterial;
  flareGlow: THREE.MeshBasicMaterial;
  shipDeck: THREE.MeshStandardMaterial;
}

export function createMaterialPalette(isSoftwareGl = false, maxAnisotropy = 4): MaterialPalette {
  const gridTex = createGridTexture(maxAnisotropy);
  const metalTex = createBrushedMetalTexture(maxAnisotropy);

  return {
    baseClay: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.38,
      metalness: 0.12
    }),
    panelWhite: new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.22,
      metalness: 0.06
    }),
    concretePaving: new THREE.MeshStandardMaterial({
      color: 0xdde3ea,
      map: gridTex,
      roughness: 0.75,
      metalness: 0.02,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    }),
    roadWay: new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.05,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    }),
    roadCrossWay: new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.05,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3
    }),
    roadMarking: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4
    }),
    gpBlue: new THREE.MeshStandardMaterial({
      color: 0x0062ff,
      roughness: 0.24,
      metalness: 0.35,
      roughnessMap: metalTex
    }),
    gpCyan: new THREE.MeshStandardMaterial({
      color: 0x00d0f5,
      roughness: 0.25,
      metalness: 0.4
    }),
    steelTruss: new THREE.MeshStandardMaterial({
      color: 0xcad5e2,
      roughness: 0.28,
      metalness: 0.82,
      roughnessMap: metalTex
    }),
    darkAccent: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.42,
      metalness: 0.6
    }),
    frostedGlass: new THREE.MeshPhysicalMaterial({
      color: 0xecfeff,
      transparent: true,
      opacity: isSoftwareGl ? 0.45 : 0.6,
      roughness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.8,
      thickness: 1.2,
      ior: 1.48,
      depthWrite: false
    }),
    cryoGlass: new THREE.MeshPhysicalMaterial({
      color: 0x0062ff,
      transparent: true,
      opacity: isSoftwareGl ? 0.5 : 0.7,
      roughness: 0.12,
      transmission: isSoftwareGl ? 0 : 0.6,
      thickness: 1.0,
      ior: 1.5,
      depthWrite: false
    }),
    waterDeep: new THREE.MeshStandardMaterial({
      color: 0x0047b3,
      roughness: 0.12,
      metalness: 0.7,
      transparent: true,
      opacity: 0.94,
      depthWrite: false
    }),
    waterShallow: new THREE.MeshStandardMaterial({
      color: 0x0077e6,
      roughness: 0.15,
      metalness: 0.55,
      transparent: true,
      opacity: 0.88,
      depthWrite: false
    }),
    treeFoliage: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.45,
      metalness: 0.05
    }),
    treeTrunk: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.75,
      metalness: 0.02
    }),
    glowNightLight: new THREE.MeshBasicMaterial({
      color: 0xffd166
    }),
    flareGlow: new THREE.MeshBasicMaterial({
      color: 0xff9f1c
    }),
    shipDeck: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.25
    })
  };
}

export function updateMaterialsForTheme(palette: MaterialPalette, isNight: boolean): void {
  if (isNight) {
    palette.baseClay.color.setHex(0x1e293b);
    palette.panelWhite.color.setHex(0x334155);
    palette.concretePaving.color.setHex(0x0f172a);
    palette.roadWay.color.setHex(0x090d16);
    palette.roadCrossWay.color.setHex(0x090d16);
    palette.steelTruss.color.setHex(0x64748b);
    palette.waterDeep.color.setHex(0x020d24);
    palette.waterShallow.color.setHex(0x031b46);
    palette.frostedGlass.color.setHex(0x00d0f5);
    palette.frostedGlass.opacity = 0.8;
  } else {
    palette.baseClay.color.setHex(0xe2e8f0);
    palette.panelWhite.color.setHex(0xf1f5f9);
    palette.concretePaving.color.setHex(0xdde3ea);
    palette.roadWay.color.setHex(0x334155);
    palette.roadCrossWay.color.setHex(0x334155);
    palette.steelTruss.color.setHex(0xcad5e2);
    palette.waterDeep.color.setHex(0x0047b3);
    palette.waterShallow.color.setHex(0x0077e6);
    palette.frostedGlass.color.setHex(0xecfeff);
    palette.frostedGlass.opacity = 0.6;
  }
}
