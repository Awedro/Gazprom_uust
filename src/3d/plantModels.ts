import * as THREE from 'three';
import { MaterialPalette } from './materials';

export interface PlantBuildResult {
  root: THREE.Group;
  animatedElements: {
    coolers: THREE.Mesh[];
    flareFlame: THREE.Mesh;
    radarMast?: THREE.Mesh;
  };
  nightLights: THREE.Light[];
  nightGlowMeshes: THREE.Mesh[];
}

export function buildCompleteLngPlant(materials: MaterialPalette): PlantBuildResult {
  const root = new THREE.Group();
  const animatedCoolers: THREE.Mesh[] = [];
  const nightLights: THREE.Light[] = [];
  const nightGlowMeshes: THREE.Mesh[] = [];

  // ==========================================
  // 1. TERRAIN & FOUNDATION ISLAND SHELVES
  // ==========================================
  // Lower foundation shelf spans under land and harbor without overlapping water boxes
  const lowerBase = new THREE.Mesh(new THREE.BoxGeometry(270, 4.5, 160), materials.panelWhite);
  lowerBase.position.set(10, -4.4, 0);
  lowerBase.receiveShadow = true;
  root.add(lowerBase);

  // Land island (X: -120 to +46, so it stops cleanly at the harbor edge X=46)
  const mainIsland = new THREE.Mesh(new THREE.BoxGeometry(166, 3.2, 136), materials.baseClay);
  mainIsland.position.set(-37, -0.6, 0);
  mainIsland.receiveShadow = true;
  root.add(mainIsland);

  // Concrete Pavement on land island (Y=1.02, X: -119 to +45)
  const pavement = new THREE.Mesh(new THREE.PlaneGeometry(164, 132), materials.concretePaving);
  pavement.rotation.x = -Math.PI / 2;
  pavement.position.set(-37, 1.02, 0);
  pavement.receiveShadow = true;
  root.add(pavement);

  // Internal road network (Y=1.05, well above pavement Y=1.02)
  for (let r = -50; r <= 50; r += 25) {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(162, 4.8), materials.roadWay);
    road.rotation.x = -Math.PI / 2;
    road.position.set(-37, 1.05, r);
    road.receiveShadow = true;
    root.add(road);

    // Dashed road markings (Y=1.09)
    for (let mx = -112; mx <= 40; mx += 9) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.28), materials.roadMarking);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(mx, 1.09, r);
      root.add(dash);
    }
  }

  // Cross arterial roads (Y=1.07, cleanly separated from main road Y=1.05)
  const crossRoads = [-25, 25];
  crossRoads.forEach(cx => {
    const cr = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 115), materials.roadCrossWay);
    cr.rotation.x = -Math.PI / 2;
    cr.position.set(cx, 1.07, 0);
    cr.receiveShadow = true;
    root.add(cr);
  });

  // Harbor basin & Deep Water (non-overlapping X ranges)
  // Shallow shelf: X from 46 to 59 (width 13, center X=52.5)
  const shallowShelf = new THREE.Mesh(new THREE.BoxGeometry(13, 2.8, 134), materials.waterShallow);
  shallowShelf.position.set(52.5, -0.8, 0);
  shallowShelf.receiveShadow = true;
  shallowShelf.renderOrder = 1;
  root.add(shallowShelf);

  // Deep water: X from 59 to 139 (width 80, center X=99)
  const deepWater = new THREE.Mesh(new THREE.BoxGeometry(80, 3.2, 134), materials.waterDeep);
  deepWater.position.set(99, -0.6, 0);
  deepWater.receiveShadow = true;
  deepWater.renderOrder = 1;
  root.add(deepWater);

  // Concrete Wharf Pier (X from 46 to 59, rising above shallow water)
  const pierWharf = new THREE.Mesh(new THREE.BoxGeometry(13, 4.6, 96), materials.panelWhite);
  pierWharf.position.set(52.5, 1.2, 0);
  pierWharf.receiveShadow = true;
  pierWharf.castShadow = true;
  root.add(pierWharf);

  // Mooring Bollards
  for (let bz = -42; bz <= 42; bz += 8) {
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 1.1, 14), materials.darkAccent);
    bollard.position.set(57.5, 3.8, bz);
    bollard.castShadow = true;
    root.add(bollard);
  }

  // Soft Radial Contact Shadow under plant blocks (Y=1.11, with polygonOffset to never flicker)
  const contactShadowMat = new THREE.MeshBasicMaterial({
    color: 0x050c18,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -5,
    polygonOffsetUnits: -5
  });

  function addContactShadow(x: number, z: number, rx: number, rz: number) {
    const shadowGeo = new THREE.PlaneGeometry(rx * 2, rz * 2);
    const shadow = new THREE.Mesh(shadowGeo, contactShadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, 1.11, z);
    root.add(shadow);
  }

  // ==========================================
  // NODE 1: ВХОДНАЯ СЕПАРАЦИЯ И ОСУШКА
  // ==========================================
  const sepGroup = new THREE.Group();
  sepGroup.position.set(-38, 1.0, 0);
  addContactShadow(-38, 0, 14, 15);

  const plinth1 = new THREE.Mesh(new THREE.BoxGeometry(24, 0.9, 26), materials.panelWhite);
  plinth1.position.y = 0.45;
  plinth1.receiveShadow = true;
  sepGroup.add(plinth1);

  // 3 Horizontal 3-phase separation drums with dished heads
  for (let i = 0; i < 3; i++) {
    const zP = -7 + i * 7;
    const drum = new THREE.Group();
    drum.position.set(-3, 3.6, zP);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 11, 28), materials.baseClay);
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    drum.add(body);

    const capL = new THREE.Mesh(new THREE.SphereGeometry(1.75, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), materials.gpBlue);
    capL.rotation.z = Math.PI / 2;
    capL.position.x = -5.5;
    const capR = capL.clone();
    capR.rotation.z = -Math.PI / 2;
    capR.position.x = 5.5;
    drum.add(capL, capR);

    // Saddle supports
    const saddle1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.4, 2.6), materials.steelTruss);
    saddle1.position.set(-3.2, -1.9, 0);
    const saddle2 = saddle1.clone();
    saddle2.position.x = 3.2;
    drum.add(saddle1, saddle2);

    // Pressure gauge & relief valve assembly
    const valveAssembly = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16), materials.darkAccent);
    valveAssembly.position.set(0, 2.2, 0);
    const valveHandwheel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 8, 16), materials.gpCyan);
    valveHandwheel.rotation.x = Math.PI / 2;
    valveHandwheel.position.set(0, 2.7, 0);
    drum.add(valveAssembly, valveHandwheel);

    sepGroup.add(drum);
  }

  // 2 Vertical Molecular Sieve Adsorption Columns with Inspection Glass Rings
  for (let j = 0; j < 2; j++) {
    const zC = -4 + j * 8;
    const tower = new THREE.Group();
    tower.position.set(6, 0.45, zC);

    const mainCol = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 16, 32), materials.baseClay);
    mainCol.position.y = 8;
    mainCol.castShadow = true;
    tower.add(mainCol);

    // Glowing frosted glass section for bed monitoring
    const glassSection = new THREE.Mesh(new THREE.CylinderGeometry(2.24, 2.24, 2.8, 32), materials.frostedGlass);
    glassSection.position.y = 9.2;
    glassSection.renderOrder = 2;
    tower.add(glassSection);

    // Blue dome top
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.1, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), materials.gpBlue);
    dome.position.y = 16;
    dome.castShadow = true;
    tower.add(dome);

    // Maintenance catwalk rings
    for (let p = 4.5; p <= 14; p += 4.5) {
      const platform = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.28, 24), materials.steelTruss);
      platform.position.y = p;
      tower.add(platform);

      // Handrail around platform
      const rail = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.05, 8, 24), materials.steelTruss);
      rail.rotation.x = Math.PI / 2;
      rail.position.y = p + 0.6;
      tower.add(rail);
    }

    sepGroup.add(tower);
  }
  root.add(sepGroup);

  // ==========================================
  // NODE 2: РЕКТИФИКАЦИЯ И ФРАКЦИОНИРОВАНИЕ
  // ==========================================
  const fracGroup = new THREE.Group();
  fracGroup.position.set(-12, 1.0, 0);
  addContactShadow(-12, 0, 13, 16);

  const plinth2 = new THREE.Mesh(new THREE.BoxGeometry(22, 0.9, 28), materials.panelWhite);
  plinth2.position.y = 0.45;
  plinth2.receiveShadow = true;
  fracGroup.add(plinth2);

  const colSpecs = [
    { r: 2.2, h: 30, x: -4.5, z: -4 },
    { r: 1.8, h: 24, x: 3.0, z: 3.2 },
    { r: 1.4, h: 19, x: 6.0, z: -6.0 }
  ];

  colSpecs.forEach((s) => {
    const colGroup = new THREE.Group();
    colGroup.position.set(s.x, 0.45, s.z);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r, s.h, 32), materials.baseClay);
    body.position.y = s.h / 2;
    body.castShadow = true;
    colGroup.add(body);

    const glassBand = new THREE.Mesh(new THREE.CylinderGeometry(s.r + 0.12, s.r + 0.12, 3.8, 32), materials.frostedGlass);
    glassBand.position.y = s.h * 0.52;
    glassBand.renderOrder = 2;
    colGroup.add(glassBand);

    const topDome = new THREE.Mesh(new THREE.SphereGeometry(s.r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), materials.gpBlue);
    topDome.position.y = s.h;
    colGroup.add(topDome);

    // Multi-tier access platforms
    for (let lvl = 4.5; lvl < s.h; lvl += 4.5) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(s.r + 0.9, s.r + 0.9, 0.25, 24), materials.steelTruss);
      ring.position.y = lvl;
      colGroup.add(ring);

      const rail = new THREE.Mesh(new THREE.TorusGeometry(s.r + 0.9, 0.05, 8, 24), materials.steelTruss);
      rail.rotation.x = Math.PI / 2;
      rail.position.y = lvl + 0.65;
      colGroup.add(rail);
    }

    fracGroup.add(colGroup);
  });

  // Steel lattice support structure surrounding columns
  const trussFrame = new THREE.Group();
  for (let tx = -8; tx <= 8; tx += 5.3) {
    for (let tz = -10; tz <= 10; tz += 6.6) {
      const colPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 20, 8), materials.steelTruss);
      colPost.position.set(tx, 10, tz);
      trussFrame.add(colPost);
    }
  }
  for (let ty = 5; ty <= 20; ty += 5) {
    const beamX = new THREE.Mesh(new THREE.BoxGeometry(16, 0.28, 0.28), materials.steelTruss);
    beamX.position.set(0, ty, 0);
    const beamZ = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 20), materials.steelTruss);
    beamZ.position.set(0, ty + 0.04, 0); // offset to prevent beam intersection Z-fighting
    trussFrame.add(beamX, beamZ);
  }
  fracGroup.add(trussFrame);
  root.add(fracGroup);

  // ==========================================
  // NODE 3: ОСНОВНОЙ БЛОК СЖИЖЕНИЯ (MCHE)
  // ==========================================
  const liqGroup = new THREE.Group();
  liqGroup.position.set(12, 1.0, 0);
  addContactShadow(12, 0, 15, 16);

  const plinth3 = new THREE.Mesh(new THREE.BoxGeometry(26, 0.9, 28), materials.panelWhite);
  plinth3.position.y = 0.45;
  liqGroup.add(plinth3);

  // MCHE Cryogenic Tower (Spirally Wound Heat Exchanger)
  const mcheGroup = new THREE.Group();
  mcheGroup.position.set(-4.5, 0.45, -2);

  const mcheCore = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.2, 25, 36), materials.baseClay);
  mcheCore.position.y = 12.5;
  mcheCore.castShadow = true;
  mcheGroup.add(mcheCore);

  const mcheGlassJacket = new THREE.Mesh(new THREE.CylinderGeometry(4.45, 4.65, 14, 36), materials.frostedGlass);
  mcheGlassJacket.position.y = 13.5;
  mcheGlassJacket.renderOrder = 2;
  mcheGroup.add(mcheGlassJacket);

  const mcheDome = new THREE.Mesh(new THREE.SphereGeometry(3.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), materials.gpBlue);
  mcheDome.position.y = 25;
  mcheGroup.add(mcheDome);

  // Connected circumferential service catwalks & vertical caged elevator shaft on MCHE
  for (const levelY of [7.5, 14.5, 21.5]) {
    const catwalk = new THREE.Mesh(new THREE.CylinderGeometry(4.85, 4.85, 0.24, 36), materials.steelTruss);
    catwalk.position.y = levelY;
    mcheGroup.add(catwalk);

    const guardRail = new THREE.Mesh(new THREE.TorusGeometry(4.85, 0.06, 8, 36), materials.steelTruss);
    guardRail.rotation.x = Math.PI / 2;
    guardRail.position.y = levelY + 0.65;
    mcheGroup.add(guardRail);
  }
  const mcheShaft = new THREE.Mesh(new THREE.BoxGeometry(0.9, 23.5, 0.9), materials.steelTruss);
  mcheShaft.position.set(4.5, 12.2, 0);
  mcheGroup.add(mcheShaft);
  liqGroup.add(mcheGroup);

  // Compressor Hall Building with illuminated control room glass
  const compBuilding = new THREE.Mesh(new THREE.BoxGeometry(13, 9.5, 19), materials.baseClay);
  compBuilding.position.set(6.5, 5.2, 0);
  compBuilding.castShadow = true;
  liqGroup.add(compBuilding);

  const compGlassWall = new THREE.Mesh(new THREE.PlaneGeometry(11, 4.8), materials.cryoGlass);
  compGlassWall.position.set(6.5, 5.5, 9.58);
  compGlassWall.renderOrder = 2;
  liqGroup.add(compGlassWall);

  // Aerial Coolers (Fin-fan Heat Exchangers on roof)
  for (let c = 0; c < 4; c++) {
    const coolerBox = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 3.6), materials.gpBlue);
    const cx = 3.2 + (c % 2) * 5.6;
    const cz = -5.0 + Math.floor(c / 2) * 8.6;
    coolerBox.position.set(cx, 10.8, cz);
    coolerBox.castShadow = true;
    liqGroup.add(coolerBox);

    // Rotating fan blade indicator
    const fanBlade = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.28), materials.steelTruss);
    fanBlade.position.set(cx, 11.68, cz);
    liqGroup.add(fanBlade);
    animatedCoolers.push(fanBlade);
  }
  root.add(liqGroup);

  // ==========================================
  // NODE 4: ИЗОТЕРМИЧЕСКИЙ ПАРК РЕЗЕРВУАРОВ СПГ
  // ==========================================
  const tankGroup = new THREE.Group();
  tankGroup.position.set(38, 1.0, -2);
  addContactShadow(38, -2, 16, 20);

  for (let t = 0; t < 2; t++) {
    // Spaced +/-13.5 so bunds (radius 11.8) have clean 3.4m separation and never intersect
    const zT = t === 0 ? -13.5 : 13.5;
    const tHolder = new THREE.Group();
    tHolder.position.set(0, 0, zT);

    // Outer concrete containment wall
    const tBase = new THREE.Mesh(new THREE.CylinderGeometry(9.4, 9.4, 14, 48), materials.panelWhite);
    tBase.position.y = 7.45;
    tBase.castShadow = true;
    tHolder.add(tBase);

    // Domed roof
    const tDome = new THREE.Mesh(new THREE.SphereGeometry(9.4, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), materials.baseClay);
    tDome.position.y = 14.45;
    tDome.castShadow = true;
    tHolder.add(tDome);

    // Gazprom Brand Blue identification band (openEnded + polygonOffset so it never Z-fights with tank wall)
    const stripeMat = materials.gpBlue.clone();
    stripeMat.polygonOffset = true;
    stripeMat.polygonOffsetFactor = -1;
    stripeMat.polygonOffsetUnits = -1;
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(9.48, 9.48, 1.1, 48, 1, true), stripeMat);
    stripe.position.y = 11.5;
    tHolder.add(stripe);

    // Top safety relief valve cluster & cupola
    const cupola = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 1.2, 24), materials.steelTruss);
    cupola.position.y = 23.6;
    const ventPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.2, 16), materials.darkAccent);
    ventPipe.position.set(0, 24.8, 0);
    tHolder.add(cupola, ventPipe);

    // Connected vertical service tower shaft & upper perimeter catwalk ring (no floating discrete steps)
    const serviceTower = new THREE.Mesh(new THREE.BoxGeometry(1.1, 14.2, 1.2), materials.steelTruss);
    serviceTower.position.set(-9.55, 7.5, 0);
    serviceTower.castShadow = true;
    tHolder.add(serviceTower);

    const upperCatwalk = new THREE.Mesh(new THREE.TorusGeometry(9.55, 0.16, 8, 48), materials.steelTruss);
    upperCatwalk.rotation.x = Math.PI / 2;
    upperCatwalk.position.y = 14.3;
    tHolder.add(upperCatwalk);

    // Secondary containment bund wall around each tank (DoubleSide so inner face is visible)
    const bundMat = materials.panelWhite.clone();
    bundMat.side = THREE.DoubleSide;
    const bund = new THREE.Mesh(new THREE.CylinderGeometry(11.8, 11.8, 2.6, 44, 1, true), bundMat);
    bund.position.y = 1.3;
    bund.castShadow = true;
    tHolder.add(bund);

    tankGroup.add(tHolder);
  }
  root.add(tankGroup);

  // ==========================================
  // NODE 5: МОРСКОЙ ТЕРМИНАЛ И ТАНКЕР-ГАЗОВОЗ
  // ==========================================
  const termGroup = new THREE.Group();
  termGroup.position.set(0, 0, 0);

  // Articulated Marine Loading Arms (Standers)
  const loadingArmGroup = new THREE.Group();
  const standerPositionsZ = [-8, 0, 8];

  standerPositionsZ.forEach((zPos) => {
    const station = new THREE.Group();
    station.position.set(54.0, 3.4, zPos);

    // Heavy base pedestal
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 1.8), materials.darkAccent);
    pedestal.position.y = 0.25;
    pedestal.castShadow = true;
    station.add(pedestal);

    // Main riser tower
    const towerHeight = 8.2;
    const riser = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, towerHeight, 20), materials.gpBlue);
    riser.position.y = 0.5 + towerHeight / 2;
    riser.castShadow = true;
    station.add(riser);

    const apexY = 0.5 + towerHeight;

    // Swivel joint & heavy counterweight
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.6, 18, 14), materials.darkAccent);
    joint.position.set(0, apexY, 0);
    joint.castShadow = true;
    station.add(joint);

    const cWeight = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.9), materials.darkAccent);
    cWeight.position.set(-1.2, apexY + 0.1, 0);
    station.add(cWeight);

    // Articulated inboard arm
    const inArmLen = 5.8;
    const inAngle = Math.PI / 5.2;
    const inPivot = new THREE.Group();
    inPivot.position.set(0, apexY, 0);
    inPivot.rotation.z = -inAngle;

    const inArm = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, inArmLen, 16), materials.steelTruss);
    inArm.position.y = inArmLen / 2;
    inArm.castShadow = true;
    inPivot.add(inArm);
    station.add(inPivot);

    // Elbow swivel attached directly at end of inboard arm
    const elbowX = Math.sin(inAngle) * inArmLen;
    const elbowY = apexY + Math.cos(inAngle) * inArmLen;
    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12), materials.darkAccent);
    elbowJoint.position.set(elbowX, elbowY, 0);
    station.add(elbowJoint);

    // Outboard loading arm reaching ship manifold
    const outArmLen = 7.4;
    const outAngle = Math.PI / 3.2;
    const outPivot = new THREE.Group();
    outPivot.position.set(elbowX, elbowY, 0);
    outPivot.rotation.z = -(Math.PI - outAngle);

    const outArm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, outArmLen, 16), materials.steelTruss);
    outArm.position.y = outArmLen / 2;
    outArm.castShadow = true;
    outPivot.add(outArm);

    // Emergency quick-disconnect coupler (PERC / QCDC) mounted directly at the tip of outPivot!
    const coupler = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 1.0, 16), materials.gpBlue);
    coupler.position.set(0, outArmLen, 0);
    coupler.castShadow = true;
    outPivot.add(coupler);

    station.add(outPivot);
    loadingArmGroup.add(station);
  });
  termGroup.add(loadingArmGroup);

  // ==========================================
  // ARCTIC LNG CARRIER (TANKER ARC7)
  // ==========================================
  const shipGroup = new THREE.Group();
  shipGroup.position.set(73, 1.0, 0);

  const shipLength = 70;
  const shipWidth = 19;
  const shipHullHeight = 7.2;

  // Icebreaker Double-Acting Hull
  const hull = new THREE.Mesh(new THREE.BoxGeometry(shipWidth, shipHullHeight, shipLength), materials.darkAccent);
  hull.position.y = shipHullHeight / 2 - 0.5;
  hull.castShadow = true;
  shipGroup.add(hull);

  // Ship Weather Deck (placed flush above hull top Y=6.7 -> Y=6.925 so no Z-fighting)
  const shipDeck = new THREE.Mesh(new THREE.BoxGeometry(shipWidth - 0.6, 0.45, shipLength - 0.6), materials.shipDeck);
  shipDeck.position.y = shipHullHeight - 0.25;
  shipGroup.add(shipDeck);

  // 4 Spherical Moss-type Cryogenic Cargo Tanks
  for (let m = 0; m < 4; m++) {
    const tankZ = -23 + m * 15.2;
    const tankMesh = new THREE.Mesh(new THREE.SphereGeometry(4.8, 36, 26), materials.panelWhite);
    tankMesh.position.set(0, shipHullHeight + 3.2, tankZ);
    tankMesh.castShadow = true;
    shipGroup.add(tankMesh);

    // Equatorial support ring
    const eqRing = new THREE.Mesh(new THREE.TorusGeometry(4.88, 0.2, 12, 36), materials.gpBlue);
    eqRing.rotation.x = Math.PI / 2;
    eqRing.position.set(0, shipHullHeight + 3.2, tankZ);
    shipGroup.add(eqRing);

    // Frosted aerodynamic weather protective cover
    const shield = new THREE.Mesh(new THREE.SphereGeometry(5.15, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2), materials.frostedGlass);
    shield.position.set(0, shipHullHeight + 3.2, tankZ);
    shield.renderOrder = 2;
    shipGroup.add(shield);
  }

  // Manifold cargo loading station on ship side
  const shipManifold = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 20), materials.steelTruss);
  shipManifold.position.set(-shipWidth / 2 + 1.3, shipHullHeight + 0.5, 0);
  shipGroup.add(shipManifold);

  // Superstructure Bridge Tower (Stern)
  const bridgeTower = new THREE.Mesh(new THREE.BoxGeometry(16, 9.2, 10), materials.baseClay);
  bridgeTower.position.set(0, shipHullHeight + 4.6, 27);
  bridgeTower.castShadow = true;
  shipGroup.add(bridgeTower);

  // Wheelhouse observation glass (offset to Z=21.92 so it sits cleanly in front of Z=22.0 wall)
  const bridgeGlass = new THREE.Mesh(new THREE.PlaneGeometry(14.5, 1.8), materials.cryoGlass);
  bridgeGlass.position.set(0, shipHullHeight + 7.8, 21.92);
  bridgeGlass.renderOrder = 2;
  shipGroup.add(bridgeGlass);

  // Radar mast & funnel exhaust properly mounted on the bridge tower roof (y = shipHullHeight + 9.2)
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 4.5, 18), materials.gpBlue);
  funnel.position.set(0, shipHullHeight + 11.2, 29);
  shipGroup.add(funnel);

  const radarBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 0.7, 16), materials.darkAccent);
  radarBase.position.set(0, shipHullHeight + 9.55, 25);
  shipGroup.add(radarBase);

  const radarColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 2.2, 12), materials.steelTruss);
  radarColumn.position.set(0, shipHullHeight + 10.8, 25);
  shipGroup.add(radarColumn);

  const radarMast = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 0.34), materials.darkAccent);
  radarMast.position.set(0, shipHullHeight + 11.95, 25);
  shipGroup.add(radarMast);

  termGroup.add(shipGroup);
  root.add(termGroup);

  // ==========================================
  // INFRASTRUCTURE: FLARE STACK (ФАКЕЛЬНАЯ УСТАНОВКА)
  // ==========================================
  const flareGroup = new THREE.Group();
  flareGroup.position.set(-78, 1.0, -32);
  addContactShadow(-78, -32, 6, 6);

  const flareBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 2.0, 16), materials.darkAccent);
  flareBase.position.y = 1.0;
  flareGroup.add(flareBase);

  const flareTower = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 34, 16), materials.steelTruss);
  flareTower.position.y = 18;
  flareTower.castShadow = true;
  flareGroup.add(flareTower);

  // Flare tip burner
  const flareTip = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 2.2, 16), materials.darkAccent);
  flareTip.position.y = 35.5;
  flareGroup.add(flareTip);

  // Dynamic procedural flame
  const flameGeo = new THREE.ConeGeometry(0.95, 3.8, 14);
  const flareFlame = new THREE.Mesh(flameGeo, materials.flareGlow);
  flareFlame.position.y = 38.0;
  flareGroup.add(flareFlame);

  root.add(flareGroup);

  // ==========================================
  // CRYOGENIC OVERHEAD PIPE RACK (ОБЩЕЗАВОДСКАЯ ЭСТАКАДА)
  // ==========================================
  const pipePoints = [
    new THREE.Vector3(-38, 3.8, 0),
    new THREE.Vector3(-12, 3.8, 0),
    new THREE.Vector3(12, 3.8, 0),
    new THREE.Vector3(38, 3.8, 0),
    new THREE.Vector3(54, 3.8, 0)
  ];

  const mainPipeCurve = new THREE.CatmullRomCurve3(pipePoints);
  const mainPipeGeo = new THREE.TubeGeometry(mainPipeCurve, 100, 0.52, 16, false);
  const mainPipeMesh = new THREE.Mesh(mainPipeGeo, materials.panelWhite);
  mainPipeMesh.castShadow = true;
  root.add(mainPipeMesh);

  // Secondary cold liquid return pipe
  const subPipePoints = pipePoints.map(p => new THREE.Vector3(p.x, p.y + 0.9, p.z + 0.8));
  const subPipeCurve = new THREE.CatmullRomCurve3(subPipePoints);
  const subPipeGeo = new THREE.TubeGeometry(subPipeCurve, 100, 0.32, 14, false);
  const subPipeMesh = new THREE.Mesh(subPipeGeo, materials.gpBlue);
  root.add(subPipeMesh);

  // Structural T-support bents
  for (let px = -36; px <= 52; px += 6.5) {
    const bent = new THREE.Group();
    bent.position.set(px, 1.0, 0);

    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 3.4, 8), materials.steelTruss);
    legL.position.set(0, 1.7, -1.4);
    const legR = legL.clone();
    legR.position.z = 1.4;

    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.28, 3.2), materials.steelTruss);
    crossBeam.position.set(0, 3.3, 0);

    const upperBeam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 2.4), materials.steelTruss);
    upperBeam.position.set(0, 4.4, 0.4);

    bent.add(legL, legR, crossBeam, upperBeam);
    root.add(bent);
  }

  // ==========================================
  // NIGHT LIGHTING POSTS & GLOWING BEACONS
  // ==========================================
  const lightPostCoords = [
    [-38, 12], [-38, -12],
    [-12, 13], [-12, -13],
    [12, 14], [12, -14],
    [38, 16], [38, -16],
    [54, 20], [54, -20],
    [70, 25], [70, -25]
  ];

  lightPostCoords.forEach(([lx, lz]) => {
    const post = new THREE.Group();
    post.position.set(lx, 1.0, lz);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 6.5, 8), materials.steelTruss);
    pole.position.y = 3.25;
    post.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.14, 0.14), materials.steelTruss);
    arm.position.set(0.3, 6.4, 0);
    post.add(arm);

    const luminaire = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), materials.glowNightLight);
    luminaire.position.set(0.65, 6.3, 0);
    post.add(luminaire);
    nightGlowMeshes.push(luminaire);

    // PointLight for night mode
    const pl = new THREE.PointLight(0xffeedd, 0, 25, 1.5);
    pl.position.set(0.65, 6.0, 0);
    post.add(pl);
    nightLights.push(pl);

    root.add(post);
  });

  return {
    root,
    animatedElements: {
      coolers: animatedCoolers,
      flareFlame,
      radarMast
    },
    nightLights,
    nightGlowMeshes
  };
}
