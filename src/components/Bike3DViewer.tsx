import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BikeComponentStatus } from '../types';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  Palette
} from 'lucide-react';

interface Bike3DViewerProps {
  components: BikeComponentStatus[];
  onSelectComponent?: (comp: BikeComponentStatus) => void;
}

export const Bike3DViewer: React.FC<Bike3DViewerProps> = ({
  components,
  onSelectComponent
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPartKey, setSelectedPartKey] = useState<string>('frame');
  const [frameColor, setFrameColor] = useState<string>('#2c52a1'); // Cobalt Blue (Variation 3)
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // References to 3D objects for dynamic updating
  const frameMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bikeGroupRef = useRef<THREE.Group | null>(null);

  // Colors available for customization
  const colorOptions = [
    { name: 'Azul Cobalto Clássico', hex: '#2c52a1' },
    { name: 'Preto Fosco Stealth', hex: '#1a1a1a' },
    { name: 'Verde Corrida', hex: '#15803d' },
    { name: 'Laranja Sunset', hex: '#ea580c' },
    { name: 'Titânio Metálico', hex: '#71717a' },
    { name: 'Vermelho Gran Fondo', hex: '#dc2626' }
  ];

  const partDetailsMap: Record<
    string,
    { title: string; desc: string; compId: string }
  > = {
    frame: {
      title: 'Quadro Monocoque Carbono T800',
      desc: 'Geometria aero-endurance balanceada, cabeamento 100% interno e caixa de direção cônica.',
      compId: 'quadro_carbono'
    },
    fork: {
      title: 'Garfo & Suspensão a Ar',
      desc: 'Hastes com tratamento anti-fricção, trava remota no guidão e ajuste de retorno (Rebound).',
      compId: 'suspensao'
    },
    tires: {
      title: 'Rodas & Pneus Tubeless Ready',
      desc: 'Aros de perfil 38mm, raios perfilados aerodinâmicos e pneus com composto de sílica.',
      compId: 'pneu_traseiro'
    },
    brakes: {
      title: 'Freios a Disco Hidráulicos',
      desc: 'Rotores 160mm Ice-Tech ventilados com cáliper de pistão duplo para frenagem precisa na chuva.',
      compId: 'pastilhas_freio'
    },
    chain: {
      title: 'Transmissão & Corrente 12v',
      desc: 'Coroa única Direct Mount, elos chanfrados com revestimento PTFE para trocas silenciosas.',
      compId: 'corrente'
    },
    derailleur: {
      title: 'Câmbio Traseiro Shadow RD+',
      desc: 'Sistema com estabilizador de corrente (embreagem) contra impactos de corrente na trilha.',
      compId: 'cambio_traseiro'
    }
  };

  const currentCompData = components.find(
    (c) => c.threeDPartKey === selectedPartKey || c.id === partDetailsMap[selectedPartKey]?.compId
  );

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    const isDark = document.documentElement.classList.contains('dark');
    const isAmoled = document.documentElement.classList.contains('amoled');
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isAmoled ? 0x000000 : isDark ? 0x0b0f17 : 0xf5f4f0);

    // Theme change observer
    const themeObserver = new MutationObserver(() => {
      const darkNow = document.documentElement.classList.contains('dark');
      const amoledNow = document.documentElement.classList.contains('amoled');
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(amoledNow ? 0x000000 : darkNow ? 0x0b0f17 : 0xf5f4f0);
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 3.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe2e8f0, 0.8);
    dirLight2.position.set(-5, 4, -4);
    scene.add(dirLight2);

    const rimLight = new THREE.PointLight(0x2c52a1, 1.2, 10);
    rimLight.position.set(0, 3, -2);
    scene.add(rimLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(6, 24, 0xd4d2cc, 0xe8e7e3);
    gridHelper.position.y = -0.75;
    scene.add(gridHelper);

    // Ground Shadow Catcher
    const planeGeo = new THREE.PlaneGeometry(8, 8);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const groundPlane = new THREE.Mesh(planeGeo, planeMat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -0.751;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    // BIKE 3D MODEL HIERARCHY
    const bikeGroup = new THREE.Group();
    bikeGroupRef.current = bikeGroup;
    scene.add(bikeGroup);

    // Materials
    frameMaterialsRef.current = [];
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(frameColor),
      metalness: 0.5,
      roughness: 0.25,
      wireframe: wireframeMode
    });
    frameMaterialsRef.current.push(frameMaterial);

    const blackMetal = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.8,
      roughness: 0.3,
      wireframe: wireframeMode
    });
    const chrome = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.95,
      roughness: 0.1,
      wireframe: wireframeMode
    });
    const tireRubber = new THREE.MeshStandardMaterial({
      color: 0x121214,
      roughness: 0.85,
      wireframe: wireframeMode
    });
    const goldKashima = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: wireframeMode
    });
    const brakeRotorMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: wireframeMode
    });

    // WHEELS (Radius ~0.55m, positioned at -1.0 and +1.0 X)
    const wheelRadius = 0.52;
    const tireThickness = 0.045;
    const rearWheelCenter = new THREE.Vector3(-0.95, -0.2, 0);
    const frontWheelCenter = new THREE.Vector3(0.95, -0.2, 0);

    const buildWheel = (center: THREE.Vector3) => {
      const wGroup = new THREE.Group();
      wGroup.position.copy(center);

      // Tire torus
      const tireGeo = new THREE.TorusGeometry(wheelRadius, tireThickness, 16, 48);
      const tireMesh = new THREE.Mesh(tireGeo, tireRubber);
      tireMesh.castShadow = true;
      wGroup.add(tireMesh);

      // Rim
      const rimGeo = new THREE.TorusGeometry(wheelRadius - 0.03, 0.02, 12, 48);
      const rimMesh = new THREE.Mesh(rimGeo, blackMetal);
      wGroup.add(rimMesh);

      // Hub
      const hubGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 16);
      hubGeo.rotateX(Math.PI / 2);
      const hubMesh = new THREE.Mesh(hubGeo, blackMetal);
      wGroup.add(hubMesh);

      // Spokes
      const spokeCount = 18;
      const spokeMat = new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.6 });
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * Math.PI * 2;
        const pts = [
          new THREE.Vector3(0, 0, (i % 2 === 0 ? 0.04 : -0.04)),
          new THREE.Vector3(Math.cos(angle) * (wheelRadius - 0.04), Math.sin(angle) * (wheelRadius - 0.04), 0)
        ];
        const spokeGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const spokeLine = new THREE.Line(spokeGeo, spokeMat);
        wGroup.add(spokeLine);
      }

      // Disc Brake Rotor
      const rotorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.008, 24);
      rotorGeo.rotateX(Math.PI / 2);
      const rotorMesh = new THREE.Mesh(rotorGeo, brakeRotorMat);
      rotorMesh.position.z = 0.045;
      wGroup.add(rotorMesh);

      return wGroup;
    };

    const rearWheel = buildWheel(rearWheelCenter);
    const frontWheel = buildWheel(frontWheelCenter);
    bikeGroup.add(rearWheel);
    bikeGroup.add(frontWheel);

    // Cassette (rear gears)
    const cassetteGeo = new THREE.CylinderGeometry(0.09, 0.05, 0.035, 20);
    cassetteGeo.rotateX(Math.PI / 2);
    const cassetteMesh = new THREE.Mesh(cassetteGeo, chrome);
    cassetteMesh.position.set(rearWheelCenter.x, rearWheelCenter.y, -0.04);
    bikeGroup.add(cassetteMesh);

    // Bottom Bracket (BB) Center
    const bbCenter = new THREE.Vector3(-0.1, -0.22, 0);

    // BB Shell
    const bbShellGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 16);
    bbShellGeo.rotateX(Math.PI / 2);
    const bbMesh = new THREE.Mesh(bbShellGeo, blackMetal);
    bbMesh.position.copy(bbCenter);
    bikeGroup.add(bbMesh);

    // Chainring & Cranks
    const chainringGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.006, 28);
    chainringGeo.rotateX(Math.PI / 2);
    const chainring = new THREE.Mesh(chainringGeo, blackMetal);
    chainring.position.set(bbCenter.x, bbCenter.y, -0.055);
    bikeGroup.add(chainring);

    // Cranks and Pedals
    const crankLGeo = new THREE.BoxGeometry(0.025, 0.17, 0.015);
    const crankL = new THREE.Mesh(crankLGeo, blackMetal);
    crankL.position.set(bbCenter.x, bbCenter.y - 0.07, -0.065);
    bikeGroup.add(crankL);

    const pedalLGeo = new THREE.BoxGeometry(0.08, 0.02, 0.06);
    const pedalL = new THREE.Mesh(pedalLGeo, chrome);
    pedalL.position.set(bbCenter.x, bbCenter.y - 0.15, -0.09);
    bikeGroup.add(pedalL);

    const crankRGeo = new THREE.BoxGeometry(0.025, 0.17, 0.015);
    const crankR = new THREE.Mesh(crankRGeo, blackMetal);
    crankR.position.set(bbCenter.x, bbCenter.y + 0.07, 0.065);
    bikeGroup.add(crankR);

    const pedalR = new THREE.Mesh(pedalLGeo.clone(), chrome);
    pedalR.position.set(bbCenter.x, bbCenter.y + 0.15, 0.09);
    bikeGroup.add(pedalR);

    // Chain simulation loop
    const chainGeo = new THREE.TorusGeometry(0.48, 0.008, 6, 32);
    chainGeo.scale(1.9, 0.22, 1);
    const chainMesh = new THREE.Mesh(chainGeo, chrome);
    chainMesh.position.set(-0.52, -0.21, -0.05);
    bikeGroup.add(chainMesh);

    // Derailleur
    const derGeo = new THREE.BoxGeometry(0.06, 0.09, 0.04);
    const derMesh = new THREE.Mesh(derGeo, blackMetal);
    derMesh.position.set(rearWheelCenter.x + 0.05, rearWheelCenter.y - 0.08, -0.05);
    bikeGroup.add(derMesh);

    // FRAME TUBE GENERATOR HELPER
    const makeTube = (
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      radius: number,
      mat: THREE.Material
    ) => {
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      const cylGeo = new THREE.CylinderGeometry(radius, radius, len, 16);
      cylGeo.translate(0, len / 2, 0);
      cylGeo.rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(cylGeo, mat);
      mesh.position.copy(p1);
      mesh.lookAt(p2);
      mesh.castShadow = true;
      return mesh;
    };

    // Frame key joints:
    const headTubeTop = new THREE.Vector3(0.68, 0.58, 0);
    const headTubeBottom = new THREE.Vector3(0.76, 0.36, 0);
    const seatTubeTop = new THREE.Vector3(-0.25, 0.52, 0);
    const seatTubeBottom = bbCenter;

    // Head Tube
    bikeGroup.add(makeTube(headTubeBottom, headTubeTop, 0.035, frameMaterial));

    // Top Tube (from seatTubeTop to headTubeTop)
    bikeGroup.add(makeTube(seatTubeTop, headTubeTop, 0.03, frameMaterial));

    // Down Tube (from headTubeBottom to bbCenter)
    bikeGroup.add(makeTube(headTubeBottom, seatTubeBottom, 0.038, frameMaterial));

    // Seat Tube (from bbCenter to seatTubeTop)
    bikeGroup.add(makeTube(seatTubeBottom, seatTubeTop, 0.032, frameMaterial));

    // Chainstays (from BB to Rear Wheel axle, both sides)
    const rearAxleL = new THREE.Vector3(rearWheelCenter.x, rearWheelCenter.y, -0.055);
    const rearAxleR = new THREE.Vector3(rearWheelCenter.x, rearWheelCenter.y, 0.055);
    bikeGroup.add(makeTube(bbCenter, rearAxleL, 0.018, frameMaterial));
    bikeGroup.add(makeTube(bbCenter, rearAxleR, 0.018, frameMaterial));

    // Seatstays (from seatTubeTop to Rear Wheel axle, both sides)
    bikeGroup.add(makeTube(seatTubeTop, rearAxleL, 0.016, frameMaterial));
    bikeGroup.add(makeTube(seatTubeTop, rearAxleR, 0.016, frameMaterial));

    // FRONT FORK & SUSPENSION
    const forkCrown = headTubeBottom;
    const frontAxleL = new THREE.Vector3(frontWheelCenter.x, frontWheelCenter.y, -0.05);
    const frontAxleR = new THREE.Vector3(frontWheelCenter.x, frontWheelCenter.y, 0.05);

    // Upper stanchions (Kashima Gold)
    const stanchionL = makeTube(forkCrown, new THREE.Vector3(forkCrown.x + 0.08, forkCrown.y - 0.25, -0.04), 0.018, goldKashima);
    const stanchionR = makeTube(forkCrown, new THREE.Vector3(forkCrown.x + 0.08, forkCrown.y - 0.25, 0.04), 0.018, goldKashima);
    bikeGroup.add(stanchionL);
    bikeGroup.add(stanchionR);

    // Lower fork legs (black)
    bikeGroup.add(makeTube(new THREE.Vector3(forkCrown.x + 0.08, forkCrown.y - 0.22, -0.04), frontAxleL, 0.022, blackMetal));
    bikeGroup.add(makeTube(new THREE.Vector3(forkCrown.x + 0.08, forkCrown.y - 0.22, 0.04), frontAxleR, 0.022, blackMetal));

    // COCKPIT: Stem, Handlebars, Grips
    const stemEnd = new THREE.Vector3(headTubeTop.x + 0.08, headTubeTop.y + 0.06, 0);
    bikeGroup.add(makeTube(headTubeTop, stemEnd, 0.022, blackMetal));

    // Handlebar curve
    const barCurve = new THREE.CylinderGeometry(0.015, 0.015, 0.65, 16);
    barCurve.rotateX(Math.PI / 2);
    const barMesh = new THREE.Mesh(barCurve, blackMetal);
    barMesh.position.copy(stemEnd);
    bikeGroup.add(barMesh);

    // Handlebar Grips
    const gripL = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.12, 12), tireRubber);
    gripL.rotateX(Math.PI / 2);
    gripL.position.set(stemEnd.x, stemEnd.y, -0.27);
    bikeGroup.add(gripL);

    const gripR = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.12, 12), tireRubber);
    gripR.rotateX(Math.PI / 2);
    gripR.position.set(stemEnd.x, stemEnd.y, 0.27);
    bikeGroup.add(gripR);

    // SEATPOST & SADDLE
    const seatPostEnd = new THREE.Vector3(seatTubeTop.x - 0.06, seatTubeTop.y + 0.18, 0);
    bikeGroup.add(makeTube(seatTubeTop, seatPostEnd, 0.02, blackMetal));

    // Ergonomic Saddle (Seat)
    const saddleGeo = new THREE.BoxGeometry(0.24, 0.045, 0.12);
    saddleGeo.scale(1, 0.8, 0.9);
    const saddle = new THREE.Mesh(saddleGeo, tireRubber);
    saddle.position.set(seatPostEnd.x - 0.03, seatPostEnd.y + 0.02, 0);
    saddle.rotation.z = -0.05;
    bikeGroup.add(saddle);

    // Interactive mouse drag / rotate logic
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !bikeGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      bikeGroupRef.current.rotation.y += deltaX * 0.008;
      bikeGroupRef.current.rotation.x += deltaY * 0.004;

      // Limit pitch
      bikeGroupRef.current.rotation.x = Math.max(-0.4, Math.min(0.5, bikeGroupRef.current.rotation.x));
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.002;
      camera.position.z = Math.max(2.2, Math.min(5.5, camera.position.z));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Touch support for mobile
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!bikeGroupRef.current) return;
      if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        bikeGroupRef.current.rotation.y += deltaX * 0.008;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = touchStartDist - dist;
        camera.position.z += diff * 0.005;
        camera.position.z = Math.max(2.2, Math.min(5.5, camera.position.z));
        touchStartDist = dist;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    let reqId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDragging && bikeGroupRef.current) {
        bikeGroupRef.current.rotation.y += delta * 0.25;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      themeObserver.disconnect();
      renderer.dispose();
    };
  }, [wireframeMode]); // Re-create scene if wireframe changed

  // Frame color change without full re-creation
  useEffect(() => {
    frameMaterialsRef.current.forEach((mat) => {
      mat.color.set(frameColor);
    });
  }, [frameColor]);

  const resetView = () => {
    if (bikeGroupRef.current) {
      bikeGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div id="bike-3d-section" className="bg-white border border-[#1a1a1a]/10 rounded-3xl overflow-hidden shadow-xs relative">
      {/* Top Header Controls - Variation 3 Style */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#1a1a1a]/10 bg-[#f8f7f4]/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2c52a1] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1a1a1a] flex items-center gap-2.5">
              Oficina 3D Interativa
              <span className="meta text-[#2c52a1] text-[10px] px-2.5 py-0.5 rounded-full bg-white border border-[#2c52a1]/20 font-bold">
                DIAGNÓSTICO DIGITAL
              </span>
            </h3>
            <p className="text-xs text-[#1a1a1a]/60 mt-0.5">
              Arraste para girar em 360° e inspecione o desgaste de componentes críticos
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-auto-rotate"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono-numbers transition-all flex items-center gap-1.5 border ${
              autoRotate
                ? 'bg-[#2c52a1] text-white border-[#2c52a1] shadow-xs'
                : 'bg-white text-[#1a1a1a]/70 border-[#1a1a1a]/10 hover:border-[#1a1a1a]/20'
            }`}
            title="Giro Automático"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="meta-dark">{autoRotate ? 'GIRO ATIVO' : 'PAUSADO'}</span>
          </button>

          <button
            id="btn-wireframe-mode"
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono-numbers transition-all flex items-center gap-1.5 border ${
              wireframeMode
                ? 'bg-[#2c52a1] text-white border-[#2c52a1] shadow-xs'
                : 'bg-white text-[#1a1a1a]/70 border-[#1a1a1a]/10 hover:border-[#1a1a1a]/20'
            }`}
            title="Modo Raio-X Wireframe"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="meta-dark">RAIO-X</span>
          </button>

          <button
            id="btn-reset-view"
            onClick={resetView}
            className="p-2 rounded-full text-xs bg-white text-[#1a1a1a]/70 border border-[#1a1a1a]/10 hover:border-[#1a1a1a]/20 transition-colors"
            title="Centralizar Câmera"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="relative h-[360px] sm:h-[440px] w-full cursor-grab active:cursor-grabbing bg-[#f5f4f0]">
        <div ref={mountRef} className="w-full h-full" />

        {/* Hotspot Pills overlay */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-1.5 pointer-events-auto">
          {Object.entries(partDetailsMap).map(([key, part]) => {
            const isSelected = selectedPartKey === key;
            const matchingComp = components.find((c) => c.threeDPartKey === key || c.id === part.compId);
            const isAttention = matchingComp?.status === 'atencao';
            const isCritical = matchingComp?.status === 'critico';

            return (
              <button
                key={key}
                id={`hotspot-${key}`}
                onClick={() => {
                  setSelectedPartKey(key);
                  if (matchingComp && onSelectComponent) {
                    onSelectComponent(matchingComp);
                  }
                }}
                className={`text-xs px-3 py-1 rounded-full font-mono-numbers transition-all flex items-center gap-1.5 border shadow-xs ${
                  isSelected
                    ? 'bg-[#2c52a1] text-white font-bold border-[#2c52a1] scale-105'
                    : 'bg-white/90 text-[#1a1a1a] border-[#1a1a1a]/10 hover:bg-white'
                }`}
              >
                {isCritical ? (
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                ) : isAttention ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
                <span className="meta-dark uppercase">{part.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Frame Color Picker Floating Widget */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-2.5 rounded-full border border-[#1a1a1a]/10 shadow-md flex items-center gap-2.5">
          <Palette className="w-4 h-4 text-[#2c52a1]" />
          <span className="meta text-[#1a1a1a]/70 hidden sm:inline">COR DO QUADRO:</span>
          <div className="flex items-center gap-1.5">
            {colorOptions.map((opt) => (
              <button
                key={opt.hex}
                onClick={() => setFrameColor(opt.hex)}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  frameColor === opt.hex ? 'scale-125 border-[#1a1a1a] shadow-xs' : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: opt.hex }}
                title={opt.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selected Part Technical Card Footer */}
      <div className="p-5 sm:p-6 bg-white border-t border-[#1a1a1a]/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h4 className="font-serif-display text-lg sm:text-xl font-bold text-[#1a1a1a]">
                {partDetailsMap[selectedPartKey]?.title}
              </h4>
              {currentCompData && (
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono-numbers font-semibold border ${
                    currentCompData.status === 'otimo'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : currentCompData.status === 'atencao'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {currentCompData.status === 'otimo'
                    ? '100% SAUDÁVEL'
                    : currentCompData.status === 'atencao'
                    ? 'ATENÇÃO RECOMENDADA'
                    : 'SUBSTITUIÇÃO URGENTE'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#1a1a1a]/70 max-w-2xl">
              {currentCompData?.tips || partDetailsMap[selectedPartKey]?.desc}
            </p>
          </div>

          {currentCompData && (
            <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
              <div className="text-right">
                <span className="meta text-[#1a1a1a]/60 block text-[10px]">USO ACUMULADO</span>
                <span className="font-mono-numbers text-sm font-bold text-[#1a1a1a]">
                  {currentCompData.currentKm} KM / {currentCompData.maxRecommendedKm} KM
                </span>
              </div>
              <button
                id="btn-inspect-part-service"
                onClick={() => {
                  const careSection = document.getElementById('bike-care-section');
                  if (careSection) {
                    careSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 py-2 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
              >
                <Wrench className="w-3.5 h-3.5" />
                Registrar Revisão
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
