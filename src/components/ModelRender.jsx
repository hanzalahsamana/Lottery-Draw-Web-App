// ModelRenderViewerLike.jsx
import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

function FitAndPrepareModel({ gltfScene, desiredSize = 40 }) {
  const scene = gltfScene;
  const { camera } = useThree();

  useEffect(() => {
    if (!scene) return;

    // bounding box in model space
    const bbox = new THREE.Box3().setFromObject(scene);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());

    // keep your desiredSize logic (you used a constant desiredSize before)
    const scale = desiredSize;
    scene.scale.setScalar(scale);

    // center the model at origin (after scaling)
    scene.position.x = -center.x * scale;
    scene.position.y = -center.y * scale;
    scene.position.z = -center.z * scale;

    // small lift so machine sits nicely on ground plane (optional)
    scene.position.y += (size.y * scale) / 2;

    // ensure meshes cast/receive shadows and use sRGB for textures
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const mat = child.material;
        if (mat) {
          if (mat.map) mat.map.encoding = THREE.sRGBEncoding;
          if (mat.emissiveMap) mat.emissiveMap.encoding = THREE.sRGBEncoding;
          if (typeof mat.metalness === "number") mat.metalness = Math.min(1, mat.metalness + 0.02);
          if (typeof mat.roughness === "number") mat.roughness = Math.max(0.08, mat.roughness - 0.03);
          if (mat.envMapIntensity === undefined) mat.envMapIntensity = 1.0;
          mat.needsUpdate = true;
        }
      }
    });

    // position camera to front face and look at the model center
    const camY = size.y * scale * 0.6;
    const camZ = Math.max(size.x, size.z) * scale * 2.2 + 0.5;
    camera.position.set(-camZ, camY - 0.8, 0);
    camera.lookAt(0, size.y * scale * 0.60, 0);
    camera.updateProjectionMatrix();

  }, [scene, camera, desiredSize]);

  return null;
}

/**
 * Model component - loads GLB and optionally plays animations
 */
function Model({ url, playSequence = [] }) {
  const ref = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    if (!scene) return;
    const names = Object.keys(actions || {});
    if (names.length && playSequence.length === 0) {
      actions[names[0]]?.reset()?.play();
    }
  }, [scene, actions, playSequence]);

  const playOnce = (name) => {
    const a = actions[name];
    if (!a) {
      console.warn("No animation named:", name);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      a.reset();
      a.setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = true;
      a.play();
      const duration = (a.getClip().duration * 1000) / (a.timeScale || 1);
      setTimeout(resolve, duration + 50);
    });
  };

  useEffect(() => {
    if (!playSequence || playSequence.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const name of playSequence) {
        if (cancelled) break;
        await playOnce(name);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [playSequence, actions]);

  return (
    <group ref={ref} dispose={null}>
      <primitive object={scene} />
      <FitAndPrepareModel gltfScene={scene} />
    </group>
  );
}

/**
 * SpinningBalls
 * - loads single ball GLB
 * - fixes material problems (transparency / encoding)
 * - clones it `count` times, positions in a circular volume and animates
 */
function SpinningBalls({
  count = 90,
  drumCenter = [0, 1.35, 0],
  drumRadius = 0.75,
  ballScale = 0.028,
}) {
  const group = useRef();
  const { scene: ballScene } = useGLTF(
    "/Compelet_Machine_Model_Textures/Ball_Model_Textures/Ball_Mdl_001.glb"
  );

  // fix materials (important to avoid white-square / alpha artefacts)
  useEffect(() => {
    if (!ballScene) return;
    ballScene.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        const mat = c.material;
        if (mat) {
          // allow alpha, but avoid fully transparent failing; adjust to your asset
          mat.transparent = true;
          // alphaTest helps discard fully transparent pixels if model uses cutout
          mat.alphaTest = mat.alphaTest || 0.4;
          // ensure color textures are rendered correctly
          if (mat.map) mat.map.encoding = THREE.sRGBEncoding;
          mat.depthWrite = true;
          mat.side = THREE.FrontSide;
          mat.needsUpdate = true;
        }
      }
    });
  }, [ballScene]);

  // prepare randomized positions + speeds & clones (create once)
  const balls = React.useMemo(() => {
    if (!ballScene) return [];
    return Array.from({ length: count }).map(() => {
      // random spherical-ish distribution inside drum volume
      const theta = Math.random() * Math.PI * 2; // azimuth
      const u = Math.random() * 2 - 1; // cos-like distribution
      const phi = Math.acos(u);
      const r = drumRadius * (0.25 + Math.random() * 0.75); // avoid center collapse

      const x = drumCenter[0] + r * Math.sin(phi) * Math.cos(theta);
      const y = drumCenter[1] + (Math.random() - 0.2) * (drumRadius * 0.6); // more toward bottom
      const z = drumCenter[2] + r * Math.sin(phi) * Math.sin(theta);

      // slight individualization for motion
      const rotSpeed = 0.6 + Math.random() * 1.4;
      const orbitOffset = Math.random() * Math.PI * 2;
      const orbitSpeed = 0.3 + Math.random() * 0.7;

      // clone the GLTF scene (deep clone so each instance is independent)
      const clone = ballScene.clone(true);

      return {
        clone,
        position: [x, y, z],
        rotSpeed,
        orbitOffset,
        orbitSpeed,
      };
    });
  }, [ballScene, count, drumCenter, drumRadius]);

  // animate: group rotation + small local per-ball rotations / orbit offsets
  useFrame((state, delta) => {
    if (!group.current) return;

    // rotate the whole ball group to simulate drum motion
    group.current.rotation.y += delta * 0.6; // main yaw
    group.current.rotation.x += delta * 0.18; // slight pitch

    // animate each ball: subtle self rotation + small orbit wobble
    group.current.children.forEach((child, i) => {
      const b = balls[i];
      if (!b) return;
      // basic self-rotation
      child.rotation.x += delta * b.rotSpeed;
      child.rotation.y += delta * (b.rotSpeed * 0.8);

      // small orbital wobble around initial position for liveliness
      const t = state.clock.elapsedTime * b.orbitSpeed + b.orbitOffset;
      const wobble = 0.006 * (1 + Math.sin(t * 1.5));
      child.position.x = b.position[0] + Math.cos(t) * wobble;
      child.position.y = b.position[1] + Math.sin(t * 1.1) * wobble * 0.6;
      child.position.z = b.position[2] + Math.sin(t * 0.9) * wobble;
    });
  });

  // render clones as primitives only when balls are ready
  return (
    <group ref={group}>
      {balls.map((b, i) => (
        <primitive
          key={i}
          object={b.clone}
          position={b.position}
          scale={[ballScale, ballScale, ballScale]}
        />
      ))}
    </group>
  );
}

export default function ModelRenderViewerLike({ playSequence = [], modelUrl }) {
  const MACHINE_URL =
    modelUrl ||
    "/Compelet_Machine_Model_Textures/Machine_Model_Textures/Lottery Simulator6.glb";

  return (
    <div
      style={{
        width: "400px",
        height: "600px",
        display: "flex",
        alignItems: "end",
        justifyContent: "end",
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ fov: 50 }}
        onCreated={({ gl }) => {
          gl.outputEncoding = THREE.sRGBEncoding;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
          gl.physicallyCorrectLights = true;
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Environment preset="studio" background={false} intensity={1.0} />

          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <ambientLight intensity={0.12} />

          <Model url={MACHINE_URL} playSequence={playSequence} />

          <ContactShadows
            position={[0, -0.05, 0]}
            opacity={0.6}
            width={4}
            blur={2.5}
            far={1.5}
          />
        </Suspense>

      </Canvas>
    </div>
  );
}

// preload both models for better UX
useGLTF.preload(
  "/Compelet_Machine_Model_Textures/Machine_Model_Textures/Lottery Simulator6.glb"
);
useGLTF.preload(
  "/Compelet_Machine_Model_Textures/Ball_Model_Textures/Ball_Mdl_001.glb"
);
