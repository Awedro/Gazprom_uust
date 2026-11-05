import React, { useEffect, useRef, useState } from 'react';
import { Plant3DEngine, CameraTelemetry } from './3d/engine';
import { Header } from './components/Header';
import { TourHUD } from './components/TourHUD';
import { MiniMap } from './components/MiniMap';
import { AuthModal } from './components/AuthModal';
import { TOUR_STEPS } from './data/tourData';
import { authService } from './services/auth';
import { appCache } from './services/cache';
import { UserAccount } from './types/tour';
import { Compass } from 'lucide-react';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Plant3DEngine | null>(null);
  const lastTelemetryEmitRef = useRef<number>(0);

  // Application States
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoTour, setIsAutoTour] = useState(false);
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    const cachedTheme = appCache.get<'day' | 'night'>('user_preferred_theme');
    return cachedTheme === 'night';
  });
  const [isZenMode, setIsZenMode] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [cacheStats, setCacheStats] = useState(appCache.getStats());

  // Real-time Camera Telemetry for MiniMap
  const [cameraTelemetry, setCameraTelemetry] = useState<CameraTelemetry>(() => {
    const s0 = TOUR_STEPS[0];
    const dx = s0.lookAt.x - s0.camera.x;
    const dz = s0.lookAt.z - s0.camera.z;
    return {
      camX: s0.camera.x,
      camY: s0.camera.y,
      camZ: s0.camera.z,
      targetX: s0.lookAt.x,
      targetZ: s0.lookAt.z,
      azimuthDeg: (Math.atan2(dz, dx) * 180) / Math.PI,
      fovDeg: 38
    };
  });

  // Initialize Auth state
  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  // Sync dark class on html root for Tailwind dark mode
  useEffect(() => {
    if (isNightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    appCache.set('user_preferred_theme', isNightMode ? 'night' : 'day', undefined, true);
    setCacheStats(appCache.getStats());
  }, [isNightMode]);

  // Mount Three.js Engine once in stable ref container
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new Plant3DEngine(
      canvasMountRef.current,
      {
        onStepSelect: (stepIndex) => {
          setCurrentStepIndex(stepIndex);
        },
        onCameraMoveStart: () => {
          // If user manually rotates or pans, pause auto tour so camera doesn't jerk
          setIsAutoTour(false);
        },
        onCameraUpdate: (telemetry) => {
          const now = performance.now();
          if (now - lastTelemetryEmitRef.current < 32) return;
          lastTelemetryEmitRef.current = now;

          setCameraTelemetry((prev) => {
            const moved =
              Math.abs(prev.camX - telemetry.camX) > 0.08 ||
              Math.abs(prev.camZ - telemetry.camZ) > 0.08 ||
              Math.abs(prev.targetX - telemetry.targetX) > 0.08 ||
              Math.abs(prev.targetZ - telemetry.targetZ) > 0.08 ||
              Math.abs(prev.azimuthDeg - telemetry.azimuthDeg) > 0.4;
            return moved ? telemetry : prev;
          });
        }
      },
      isNightMode
    );

    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Update 3D engine on night mode toggle
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setNightMode(isNightMode);
    }
  }, [isNightMode]);

  // Handle Step change
  const handleSelectStep = (index: number) => {
    setCurrentStepIndex(index);
    if (engineRef.current) {
      engineRef.current.flyToStep(index);
    }
  };

  // Handle free-click teleportation from MiniMap
  const handleTeleportToCoords = (worldX: number, worldZ: number) => {
    setIsAutoTour(false);
    if (engineRef.current) {
      engineRef.current.flyToWorldCoords(worldX, worldZ);
    }
  };

  // Auto-tour loop
  useEffect(() => {
    if (!isAutoTour) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = (prev + 1) % TOUR_STEPS.length;
        if (engineRef.current) {
          engineRef.current.flyToStep(next);
        }
        return next;
      });
    }, 8000);

    return () => clearInterval(timer);
  }, [isAutoTour]);

  // Auth Handlers
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setCacheStats(appCache.getStats());
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCacheStats(appCache.getStats());
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans">
      {/* 3D WebGL Canvas Container (Isolated from React DOM reconciler) */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0" />

      {/* Top Header UI */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20 pointer-events-none">
        <Header
          currentUser={currentUser}
          isNightMode={isNightMode}
          onToggleNightMode={() => setIsNightMode((prev) => !prev)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          cacheHitRate={cacheStats.hitRate}
        />
      </div>

      {/* Main Tour HUD & Ergonomic Bottom Dock */}
      <TourHUD
        steps={TOUR_STEPS}
        currentStepIndex={currentStepIndex}
        onSelectStep={handleSelectStep}
        isAutoTour={isAutoTour}
        onToggleAutoTour={() => setIsAutoTour((prev) => !prev)}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode((prev) => !prev)}
      />

      {/* Real-time Interactive MiniMap in Bottom-Right Corner */}
      <MiniMap
        telemetry={cameraTelemetry}
        currentStepIndex={currentStepIndex}
        onSelectStep={handleSelectStep}
        onTeleportToCoords={handleTeleportToCoords}
        isZenMode={isZenMode}
      />

      {/* Bottom-left Viewport Controls Hint */}
      <div
        className={`absolute bottom-5 left-5 z-10 pointer-events-none transition-all duration-300 hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shadow-md ${
          isZenMode ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <Compass className="w-3.5 h-3.5 text-blue-500" />
        <span>ЛКМ: Вращение | ПКМ: Панорама | Колесо: Зум</span>
      </div>

      {/* Auth Modal Dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
