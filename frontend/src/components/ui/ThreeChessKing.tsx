import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface PieceState {
  id: string;
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
  file: number;
  rank: number;
  mesh?: THREE.Group;
  initialFile: number;
  initialRank: number;
  captured: boolean;
}

interface ChessMove {
  pieceId: string;
  from: { file: number; rank: number };
  to: { file: number; rank: number };
  captureId?: string;
  secPieceId?: string;
  secFrom?: { file: number; rank: number };
  secTo?: { file: number; rank: number };
}

export default function ThreeChessKing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 650;

    // ─── RESOURCE TRACKING FOR SAFE CLEANUP ───
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    const registerGeom = <T extends THREE.BufferGeometry>(geom: T): T => {
      geometriesToDispose.push(geom);
      return geom;
    };

    const registerMat = <T extends THREE.Material>(mat: T): T => {
      materialsToDispose.push(mat);
      return mat;
    };

    // ─── THREE.JS SCENE SETUP ───
    const scene = new THREE.Scene();
    
    // Position camera diagonally looking down at the board
    const aspect = width / height;
    const isMobileView = width < 768;
    
    // Increase FOV and pull camera back/up on mobile so the board fits
    const fov = isMobileView ? 65 : 50;
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
    
    if (isMobileView) {
      camera.position.set(7.0, 9.5, 8.5);
      camera.lookAt(0, -1.0, 0); // Look slightly lower on mobile to center it better
    } else {
      camera.position.set(6.0, 7.5, 7.5);
      camera.lookAt(0, -0.4, 0);
    }

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ─── LIGHTING ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Main key light with shadow casting
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(6, 12, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    const d = 5.5;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // Dynamic colored accents circling the board
    const pointLight1 = new THREE.PointLight(0x8083ff, 3.5, 20);
    pointLight1.position.set(3, 2, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xa4c9ff, 3.5, 20);
    pointLight2.position.set(-3, 2, -3);
    scene.add(pointLight2);

    // ─── SCENE PARENT GROUPS ───
    const boardContainer = new THREE.Group();
    scene.add(boardContainer);

    const tileGroup = new THREE.Group();
    boardContainer.add(tileGroup);

    // Coordinate conversion helpers
    // Board is centered at 0,0,0. Coordinates span -3.5 to 3.5.
    const getX = (file: number) => file - 3.5;
    const getZ = (rank: number) => 3.5 - rank;

    // ─── MATERIALS ───
    const whitePieceMat = registerMat(new THREE.MeshPhysicalMaterial({
      color: 0xdbdff0,
      roughness: 0.15,
      metalness: 0.05,
      transmission: 0.65,
      thickness: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      emissive: 0x8083ff,
      emissiveIntensity: 0.15
    }));

    const blackPieceMat = registerMat(new THREE.MeshStandardMaterial({
      color: 0x181a20,
      roughness: 0.28,
      metalness: 0.9,
      emissive: 0x3f008e,
      emissiveIntensity: 0.08
    }));

    const lightTileMat = registerMat(new THREE.MeshPhysicalMaterial({
      color: 0x282b5e,
      emissive: 0x8083ff,
      emissiveIntensity: 0.12,
      roughness: 0.18,
      metalness: 0.15,
      transmission: 0.65,
      thickness: 0.4,
      clearcoat: 1.0
    }));

    const darkTileMat = registerMat(new THREE.MeshStandardMaterial({
      color: 0x0f1115,
      roughness: 0.45,
      metalness: 0.75
    }));

    // ─── FLOATING BOARD TILES ───
    const tileWidth = 0.9;
    const tileHeight = 0.18;
    const tileGeom = registerGeom(new THREE.BoxGeometry(tileWidth, tileHeight, tileWidth));
    const tiles: { mesh: THREE.Mesh; initialY: number; file: number; rank: number; isLight: boolean }[] = [];

    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
        const isLight = (file + rank) % 2 === 1;
        const mat = isLight ? lightTileMat.clone() : darkTileMat.clone();
        registerMat(mat);

        const tileMesh = new THREE.Mesh(tileGeom, mat);
        const x = getX(file);
        const z = getZ(rank);
        const initialY = -tileHeight / 2;
        tileMesh.position.set(x, initialY, z);
        tileMesh.receiveShadow = true;
        tileMesh.castShadow = true;

        tileGroup.add(tileMesh);
        tiles.push({ mesh: tileMesh, initialY, file, rank, isLight });
      }
    }

    // High-tech board frame & glowing underline
    const boardFrameGeom = registerGeom(new THREE.BoxGeometry(8.3, 0.1, 8.3));
    const boardFrameMat = registerMat(new THREE.MeshStandardMaterial({
      color: 0x08090d,
      roughness: 0.55,
      metalness: 0.8
    }));
    const boardFrame = new THREE.Mesh(boardFrameGeom, boardFrameMat);
    boardFrame.position.y = -0.14;
    boardFrame.receiveShadow = true;
    boardContainer.add(boardFrame);

    const outlineGeom = registerGeom(new THREE.BoxGeometry(8.4, 0.02, 8.4));
    const outlineMat = registerMat(new THREE.MeshBasicMaterial({
      color: 0x8083ff,
      transparent: true,
      opacity: 0.25
    }));
    const boardOutline = new THREE.Mesh(outlineGeom, outlineMat);
    boardOutline.position.y = -0.11;
    boardContainer.add(boardOutline);

    // ─── PROCEDURAL PIECE BUILDER ───
    const createPieceMesh = (
      type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king',
      material: THREE.Material
    ): THREE.Group => {
      const group = new THREE.Group();

      // Common base
      const baseGeom = registerGeom(new THREE.CylinderGeometry(0.24, 0.28, 0.08, 16));
      const baseMesh = new THREE.Mesh(baseGeom, material);
      baseMesh.position.y = 0.04;
      group.add(baseMesh);

      if (type === 'pawn') {
        const bodyGeom = registerGeom(new THREE.CylinderGeometry(0.08, 0.2, 0.46, 16));
        const bodyMesh = new THREE.Mesh(bodyGeom, material);
        bodyMesh.position.y = 0.31;
        group.add(bodyMesh);

        const collarGeom = registerGeom(new THREE.TorusGeometry(0.12, 0.02, 8, 16));
        const collarMesh = new THREE.Mesh(collarGeom, material);
        collarMesh.rotation.x = Math.PI / 2;
        collarMesh.position.y = 0.54;
        group.add(collarMesh);

        const headGeom = registerGeom(new THREE.SphereGeometry(0.16, 16, 16));
        const headMesh = new THREE.Mesh(headGeom, material);
        headMesh.position.y = 0.7;
        group.add(headMesh);
      } 
      else if (type === 'rook') {
        const bodyGeom = registerGeom(new THREE.CylinderGeometry(0.16, 0.22, 0.56, 16));
        const bodyMesh = new THREE.Mesh(bodyGeom, material);
        bodyMesh.position.y = 0.36;
        group.add(bodyMesh);

        const collarGeom = registerGeom(new THREE.TorusGeometry(0.2, 0.02, 8, 16));
        const collarMesh = new THREE.Mesh(collarGeom, material);
        collarMesh.rotation.x = Math.PI / 2;
        collarMesh.position.y = 0.64;
        group.add(collarMesh);

        const headGeom = registerGeom(new THREE.CylinderGeometry(0.22, 0.2, 0.18, 16));
        const headMesh = new THREE.Mesh(headGeom, material);
        headMesh.position.y = 0.73;
        group.add(headMesh);

        const battlementGeom = registerGeom(new THREE.BoxGeometry(0.05, 0.08, 0.05));
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          const bMesh = new THREE.Mesh(battlementGeom, material);
          bMesh.position.set(Math.cos(angle) * 0.16, 0.82, Math.sin(angle) * 0.16);
          group.add(bMesh);
        }
      } 
      else if (type === 'knight') {
        const neckGeom = registerGeom(new THREE.CylinderGeometry(0.12, 0.2, 0.45, 16));
        const neckMesh = new THREE.Mesh(neckGeom, material);
        neckMesh.position.set(0.04, 0.3, 0);
        neckMesh.rotation.z = -0.2;
        group.add(neckMesh);

        const snoutGeom = registerGeom(new THREE.BoxGeometry(0.16, 0.22, 0.32));
        const snoutMesh = new THREE.Mesh(snoutGeom, material);
        snoutMesh.position.set(0.08, 0.5, 0.08);
        snoutMesh.rotation.y = Math.PI / 2;
        snoutMesh.rotation.z = 0.2;
        group.add(snoutMesh);

        const earGeom = registerGeom(new THREE.BoxGeometry(0.04, 0.08, 0.04));
        const earLeft = new THREE.Mesh(earGeom, material);
        earLeft.position.set(-0.04, 0.62, -0.06);
        earLeft.rotation.z = -0.15;
        const earRight = new THREE.Mesh(earGeom, material);
        earRight.position.set(-0.04, 0.62, 0.06);
        earRight.rotation.z = -0.15;
        group.add(earLeft, earRight);
      } 
      else if (type === 'bishop') {
        const bodyGeom = registerGeom(new THREE.CylinderGeometry(0.12, 0.22, 0.66, 16));
        const bodyMesh = new THREE.Mesh(bodyGeom, material);
        bodyMesh.position.y = 0.41;
        group.add(bodyMesh);

        const collarGeom = registerGeom(new THREE.TorusGeometry(0.18, 0.02, 8, 16));
        const collarMesh = new THREE.Mesh(collarGeom, material);
        collarMesh.rotation.x = Math.PI / 2;
        collarMesh.position.y = 0.74;
        group.add(collarMesh);

        const headGeom = registerGeom(new THREE.SphereGeometry(0.18, 16, 16));
        const headMesh = new THREE.Mesh(headGeom, material);
        headMesh.scale.set(1.0, 1.35, 1.0);
        headMesh.position.y = 0.9;
        group.add(headMesh);

        const tipGeom = registerGeom(new THREE.SphereGeometry(0.04, 8, 8));
        const tipMesh = new THREE.Mesh(tipGeom, material);
        tipMesh.position.y = 1.16;
        group.add(tipMesh);
      } 
      else if (type === 'queen') {
        const bodyGeom = registerGeom(new THREE.CylinderGeometry(0.12, 0.24, 0.86, 16));
        const bodyMesh = new THREE.Mesh(bodyGeom, material);
        bodyMesh.position.y = 0.51;
        group.add(bodyMesh);

        const collarGeom = registerGeom(new THREE.TorusGeometry(0.2, 0.02, 8, 16));
        const collarMesh = new THREE.Mesh(collarGeom, material);
        collarMesh.rotation.x = Math.PI / 2;
        collarMesh.position.y = 0.94;
        group.add(collarMesh);

        const crownGeom = registerGeom(new THREE.CylinderGeometry(0.24, 0.16, 0.24, 16));
        const crownMesh = new THREE.Mesh(crownGeom, material);
        crownMesh.position.y = 1.06;
        group.add(crownMesh);

        const topGeom = registerGeom(new THREE.SphereGeometry(0.05, 8, 8));
        const topMesh = new THREE.Mesh(topGeom, material);
        topMesh.position.y = 1.2;
        group.add(topMesh);
      } 
      else if (type === 'king') {
        const bodyGeom = registerGeom(new THREE.CylinderGeometry(0.14, 0.26, 0.96, 16));
        const bodyMesh = new THREE.Mesh(bodyGeom, material);
        bodyMesh.position.y = 0.56;
        group.add(bodyMesh);

        const collarGeom = registerGeom(new THREE.TorusGeometry(0.22, 0.02, 8, 16));
        const collarMesh = new THREE.Mesh(collarGeom, material);
        collarMesh.rotation.x = Math.PI / 2;
        collarMesh.position.y = 1.04;
        group.add(collarMesh);

        const crownGeom = registerGeom(new THREE.CylinderGeometry(0.26, 0.18, 0.3, 16));
        const crownMesh = new THREE.Mesh(crownGeom, material);
        crownMesh.position.y = 1.18;
        group.add(crownMesh);

        const crossVGeom = registerGeom(new THREE.BoxGeometry(0.04, 0.18, 0.04));
        const crossV = new THREE.Mesh(crossVGeom, material);
        crossV.position.y = 1.38;
        const crossHGeom = registerGeom(new THREE.BoxGeometry(0.14, 0.04, 0.04));
        const crossH = new THREE.Mesh(crossHGeom, material);
        crossH.position.y = 1.41;
        group.add(crossV, crossH);
      }

      // Cast and receive shadows
      group.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      return group;
    };

    // ─── INITIALIZE PIECES STATE ───
    const pieces: PieceState[] = [];

    // Helper to push white / black pieces
    const addRowOfPieces = (color: 'white' | 'black', rank: number, pawnRank: number) => {
      const mat = color === 'white' ? whitePieceMat : blackPieceMat;
      const prefix = color === 'white' ? 'w' : 'b';

      pieces.push({ id: `${prefix}_rook_0`, type: 'rook', color, file: 0, rank, initialFile: 0, initialRank: rank, captured: false });
      pieces.push({ id: `${prefix}_knight_1`, type: 'knight', color, file: 1, rank, initialFile: 1, initialRank: rank, captured: false });
      pieces.push({ id: `${prefix}_bishop_2`, type: 'bishop', color, file: 2, rank, initialFile: 2, initialRank: rank, captured: false });
      pieces.push({ id: `${prefix}_queen`, type: 'queen', color, file: 3, rank, initialFile: 3, initialRank: rank, captured: false });
      pieces.push({ id: `${prefix}_king`, type: 'king', color, file: 4, rank, initialFile: 4, initialRank: rank, captured: false });
      pieces.push({ id: `${prefix}_bishop_5`, type: 'bishop', color, file: 5, rank, initialFile: 5, initialRank: rank, captured: false });
      pieces.push({ id: `${prefix}_knight_6`, type: 'knight', color, file: 6, rank, initialFile: 6, initialRank: rank, captured: false });
      pieces.push({ id: `${prefix}_rook_7`, type: 'rook', color, file: 7, rank, initialFile: 7, initialRank: rank, captured: false });

      for (let i = 0; i < 8; i++) {
        pieces.push({ id: `${prefix}_pawn_${i}`, type: 'pawn', color, file: i, rank: pawnRank, initialFile: i, initialRank: pawnRank, captured: false });
      }
    };

    addRowOfPieces('white', 0, 1);
    addRowOfPieces('black', 7, 6);

    // Create 3D meshes for each piece and add to boardContainer
    pieces.forEach((p) => {
      const mat = p.color === 'white' ? whitePieceMat : blackPieceMat;
      p.mesh = createPieceMesh(p.type, mat);
      p.mesh.position.set(getX(p.file), 0, getZ(p.rank));
      boardContainer.add(p.mesh);
    });

    // ─── AMBIENT PARTICLE SYSTEM ───
    const particlesCount = 50;
    const particlesGeom = registerGeom(new THREE.BufferGeometry());
    const posArray = new Float32Array(particlesCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particlesCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 9;
      posArray[i * 3 + 1] = Math.random() * 4.5;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 9;

      velocities.push({
        x: (Math.random() - 0.5) * 0.006,
        y: Math.random() * 0.008 + 0.004,
        z: (Math.random() - 0.5) * 0.006
      });
    }

    particlesGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = registerMat(new THREE.PointsMaterial({
      size: 0.07,
      color: 0xc0c1ff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    }));
    const particlesMesh = new THREE.Points(particlesGeom, particlesMaterial);
    scene.add(particlesMesh);

    // ─── CHESS GAME SEQUENCE (RUY LOPEZ) ───
    const moves: ChessMove[] = [
      { pieceId: 'w_pawn_4', from: { file: 4, rank: 1 }, to: { file: 4, rank: 3 } }, // 1. e4
      { pieceId: 'b_pawn_4', from: { file: 4, rank: 6 }, to: { file: 4, rank: 4 } }, // 1... e5
      { pieceId: 'w_knight_6', from: { file: 6, rank: 0 }, to: { file: 5, rank: 2 } }, // 2. Nf3
      { pieceId: 'b_knight_1', from: { file: 1, rank: 7 }, to: { file: 2, rank: 5 } }, // 2... Nc6
      { pieceId: 'w_bishop_5', from: { file: 5, rank: 0 }, to: { file: 1, rank: 4 } }, // 3. Bb5
      { pieceId: 'b_pawn_0', from: { file: 0, rank: 6 }, to: { file: 0, rank: 5 } }, // 3... a6
      { pieceId: 'w_bishop_5', from: { file: 1, rank: 4 }, to: { file: 0, rank: 3 } }, // 4. Ba4
      { pieceId: 'b_knight_6', from: { file: 6, rank: 7 }, to: { file: 5, rank: 5 } }, // 4... Nf6
      { // 5. O-O (Castling: King e1-g1, Rook h1-f1)
        pieceId: 'w_king',
        from: { file: 4, rank: 0 },
        to: { file: 6, rank: 0 },
        secPieceId: 'w_rook_7',
        secFrom: { file: 7, rank: 0 },
        secTo: { file: 5, rank: 0 }
      },
      { pieceId: 'b_knight_6', from: { file: 5, rank: 5 }, to: { file: 4, rank: 3 }, captureId: 'w_pawn_4' }, // 5... Nxe4 (Black Knight captures e4 pawn)
      { pieceId: 'w_pawn_3', from: { file: 3, rank: 1 }, to: { file: 3, rank: 3 } }, // 6. d4
      { pieceId: 'b_pawn_1', from: { file: 1, rank: 6 }, to: { file: 1, rank: 4 } }, // 6... b5
      { pieceId: 'w_bishop_5', from: { file: 0, rank: 3 }, to: { file: 1, rank: 2 } }, // 7. Bb3
      { pieceId: 'b_pawn_3', from: { file: 3, rank: 6 }, to: { file: 3, rank: 4 } }, // 7... d5
      { pieceId: 'w_pawn_3', from: { file: 3, rank: 3 }, to: { file: 4, rank: 4 }, captureId: 'b_pawn_4' } // 8. dxe5 (White Pawn captures e5 pawn)
    ];

    let currentMoveIndex = 0;
    let moveProgress = 0;
    let resetProgress = 0;
    let waitFrames = 60; // Initial delay
    let phase: 'playing' | 'waiting' | 'resetting' = 'playing';

    const ripples: { originX: number; originZ: number; time: number; intensity: number }[] = [];

    // ─── MOUSE INTERACTIVITY PARALLAX ───
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // ─── ANIMATION LOOP ───
    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.008;

      // 1. Point lights orbit
      pointLight1.position.x = Math.cos(time * 1.5) * 4.5;
      pointLight1.position.z = Math.sin(time * 1.5) * 4.5;
      
      pointLight2.position.x = -Math.cos(time * 1.2) * 5.0;
      pointLight2.position.z = -Math.sin(time * 1.2) * 5.0;

      // 2. Parallax camera tilt combined with slow rotational swing
      const baseRotY = time * 0.12;
      const targetRotY = baseRotY + mouseX * 0.28;
      const targetRotX = -0.42 + mouseY * 0.18; // Default tilt looking down

      boardContainer.rotation.y += (targetRotY - boardContainer.rotation.y) * 0.05;
      boardContainer.rotation.x += (targetRotX - boardContainer.rotation.x) * 0.05;

      // 3. Update drift particles
      const positions = particlesGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;

        // Reset if float out of bounds
        if (positions[i * 3 + 1] > 4.5) {
          positions[i * 3] = (Math.random() - 0.5) * 9;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 9;
        }
      }
      particlesGeom.attributes.position.needsUpdate = true;

      // 4. Update shockwave ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].time += 0.07;
        if (ripples[i].time > 3.0) {
          ripples.splice(i, 1);
        }
      }

      // 5. Update tile displacements & glows
      tiles.forEach((tile) => {
        let totalDy = 0;
        let totalEmissive = 0;

        ripples.forEach((r) => {
          const dx = tile.mesh.position.x - r.originX;
          const dz = tile.mesh.position.z - r.originZ;
          const dist = Math.sqrt(dx * dx + dz * dz);

          const waveFront = r.time * 2.6; // wave propagation speed
          const distFromFront = Math.abs(dist - waveFront);

          if (distFromFront < 1.0) {
            const factor = 1.0 - distFromFront; // peaks at wavefront
            const decay = Math.max(0, 1.0 - r.time / 3.0);
            const amp = 0.14 * factor * decay;
            totalDy += Math.sin(factor * Math.PI) * amp;
            totalEmissive += factor * decay * r.intensity;
          }
        });

        // Apply calculated tile wave displacement
        tile.mesh.position.y = tile.initialY + totalDy;

        // Modulate color glow based on wave
        const mat = tile.mesh.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
        if (tile.isLight) {
          mat.emissive.setHex(0x8083ff);
          mat.emissiveIntensity = 0.12 + totalEmissive * 1.6;
        } else {
          mat.emissive.setHex(0xa4c9ff);
          mat.emissiveIntensity = totalEmissive * 0.65;
        }
      });

      // 6. Chess Game States Machine
      if (phase === 'waiting') {
        waitFrames--;
        if (waitFrames <= 0) {
          if (currentMoveIndex >= moves.length) {
            phase = 'resetting';
            resetProgress = 0;
          } else {
            phase = 'playing';
            moveProgress = 0;
          }
        }
      }

      // Default static layout positions for non-animated pieces
      pieces.forEach((p) => {
        if (p.mesh) {
          if (p.captured) {
            // Smoothly scale down captured pieces if they haven't shrunk fully yet
            if (p.mesh.scale.x > 0.01) {
              const s = Math.max(0, p.mesh.scale.x - 0.05);
              p.mesh.scale.set(s, s, s);
              p.mesh.position.y -= 0.01;
            } else {
              p.mesh.visible = false;
            }
          } else {
            p.mesh.visible = true;
            // Only lock positioning if not currently the target of active moves
            const isMoving = 
              phase === 'playing' && 
              (moves[currentMoveIndex].pieceId === p.id || moves[currentMoveIndex].secPieceId === p.id);
            const isTarget =
              phase === 'playing' && 
              moves[currentMoveIndex].captureId === p.id;
              
            if (phase !== 'resetting' && !isMoving && !isTarget) {
              p.mesh.position.set(getX(p.file), 0, getZ(p.rank));
              p.mesh.scale.set(1, 1, 1);
            }
          }
        }
      });

      if (phase === 'playing') {
        const move = moves[currentMoveIndex];
        moveProgress += 0.014; // Controls animation duration (approx 70 frames per move)

        if (moveProgress >= 1.0) {
          // Commit move ending state
          const activePiece = pieces.find(p => p.id === move.pieceId);
          if (activePiece) {
            activePiece.file = move.to.file;
            activePiece.rank = move.to.rank;
            if (activePiece.mesh) {
              activePiece.mesh.position.set(getX(move.to.file), 0, getZ(move.to.rank));
            }
          }

          // Handle castling secondary rook
          if (move.secPieceId) {
            const secPiece = pieces.find(p => p.id === move.secPieceId);
            if (secPiece && move.secTo) {
              secPiece.file = move.secTo.file;
              secPiece.rank = move.secTo.rank;
              if (secPiece.mesh) {
                secPiece.mesh.position.set(getX(move.secTo.file), 0, getZ(move.secTo.rank));
              }
            }
          }

          // Handle capture ending state
          if (move.captureId) {
            const capturedPiece = pieces.find(p => p.id === move.captureId);
            if (capturedPiece) {
              capturedPiece.captured = true;
              if (capturedPiece.mesh) {
                capturedPiece.mesh.visible = false;
              }
            }
            // Trigger extra heavy landing ripple
            ripples.push({ originX: getX(move.to.file), originZ: getZ(move.to.rank), time: 0, intensity: 1.8 });
          } else {
            // Normal landing ripple
            ripples.push({ originX: getX(move.to.file), originZ: getZ(move.to.rank), time: 0, intensity: 1.2 });
          }

          currentMoveIndex++;
          phase = 'waiting';
          waitFrames = currentMoveIndex >= moves.length ? 120 : 35; // wait 2s before reset, or 0.6s between moves
        } 
        else {
          // Interpolate moving piece positions
          const t = moveProgress;
          const easedT = t * t * (3 - 2 * t); // Smoothstep easing

          const activePiece = pieces.find(p => p.id === move.pieceId);
          if (activePiece && activePiece.mesh) {
            const startX = getX(move.from.file);
            const startZ = getZ(move.from.rank);
            const endX = getX(move.to.file);
            const endZ = getZ(move.to.rank);

            const x = startX + (endX - startX) * easedT;
            const z = startZ + (endZ - startZ) * easedT;
            
            // Knights jump higher, pawns/rooks/bishops slide with a small bounce
            const jumpHeight = activePiece.type === 'knight' ? 1.1 : 0.35;
            const y = Math.sin(t * Math.PI) * jumpHeight;
            activePiece.mesh.position.set(x, y, z);
          }

          // Interpolate secondary piece position (Rook castling)
          if (move.secPieceId && move.secFrom && move.secTo) {
            const secPiece = pieces.find(p => p.id === move.secPieceId);
            if (secPiece && secPiece.mesh) {
              const startX = getX(move.secFrom.file);
              const startZ = getZ(move.secFrom.rank);
              const endX = getX(move.secTo.file);
              const endZ = getZ(move.secTo.rank);

              const x = startX + (endX - startX) * easedT;
              const z = startZ + (endZ - startZ) * easedT;
              const y = Math.sin(t * Math.PI) * 0.2; // slight lift
              secPiece.mesh.position.set(x, y, z);
            }
          }

          // Animate captured piece scaling down
          if (move.captureId) {
            const capturedPiece = pieces.find(p => p.id === move.captureId);
            if (capturedPiece && capturedPiece.mesh) {
              if (t > 0.45) {
                const s = Math.max(0, 1 - (t - 0.45) / 0.55);
                capturedPiece.mesh.scale.set(s, s, s);
                capturedPiece.mesh.position.y = (1 - s) * -0.3;
              }
            }
          }
        }
      }

      if (phase === 'resetting') {
        resetProgress += 0.012; // Controls reset duration (approx 80 frames)

        if (resetProgress >= 1.0) {
          // Conclude resetting
          pieces.forEach((p) => {
            p.file = p.initialFile;
            p.rank = p.initialRank;
            p.captured = false;
            if (p.mesh) {
              p.mesh.position.set(getX(p.initialFile), 0, getZ(p.initialRank));
              p.mesh.scale.set(1, 1, 1);
              p.mesh.visible = true;
            }
          });

          // Trigger minor setup shockwave
          ripples.push({ originX: 0, originZ: 0, time: 0, intensity: 0.8 });

          currentMoveIndex = 0;
          phase = 'waiting';
          waitFrames = 60; // wait 1s before starting game again
        } 
        else {
          // Simultaneously animate ALL pieces hopping back to starting positions
          const t = resetProgress;
          const easedT = t * t * (3 - 2 * t);

          pieces.forEach((p) => {
            if (p.mesh) {
              const startX = getX(p.file);
              const startZ = getZ(p.rank);
              const endX = getX(p.initialFile);
              const endZ = getZ(p.initialRank);

              const x = startX + (endX - startX) * easedT;
              const z = startZ + (endZ - startZ) * easedT;
              const y = Math.sin(t * Math.PI) * 0.55; // simultaneous float bounce
              p.mesh.position.set(x, y, z);
              p.mesh.visible = true;

              // Fade captured pieces back in scaling up
              if (p.captured) {
                const s = easedT;
                p.mesh.scale.set(s, s, s);
              } else {
                p.mesh.scale.set(1, 1, 1);
              }
            }
          });
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // ─── RESIZE HANDLER ───
    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;
      
      const isMobileNow = width < 768;
      camera.fov = isMobileNow ? 65 : 50;
      if (isMobileNow) {
        camera.position.set(7.0, 9.5, 8.5);
        camera.lookAt(0, -1.0, 0);
      } else {
        camera.position.set(6.0, 7.5, 7.5);
        camera.lookAt(0, -0.4, 0);
      }
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // ─── DISPOSAL AND CLEANUP ───
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose all geometry resources
      geometriesToDispose.forEach(geom => geom.dispose());
      // Dispose all material resources
      materialsToDispose.forEach(mat => mat.dispose());

      renderer.dispose();
    };
  }, [isMobile]);


  return (
    <div ref={containerRef} className="w-full h-full bg-transparent min-h-[600px] cursor-pointer" />
  );
}
