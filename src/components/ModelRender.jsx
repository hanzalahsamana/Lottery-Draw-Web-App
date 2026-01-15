// ModelRender_Fixed_and_Realistic.jsx
// Full replacement for your ModelRender.jsx with automatic centering, fit-to-view, fixed (non-draggable),
// improved PBR lighting/environment, contact shadows and a simple ball-spinner you can tweak.

import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment, ContactShadows, } from "@react-three/drei";
import * as THREE from "three";


function FitAndPrepareModel({ gltfScene }) {
  // helper used inside Model component to center/scale the loaded scene and return useful bounds
  const scene = gltfScene;
  const { camera } = useThree();

  useEffect(() => {
    if (!scene) return;

    // compute bounding box in model space
    const bbox = new THREE.Box3().setFromObject(scene);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());

    // target scale so the biggest axis fits nicely in view
    const DESIRED_SIZE = 2.2; // tweak this to make the model larger/smaller in view
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? DESIRED_SIZE / maxDim : 1;
    scene.scale.setScalar(scale);

    // re-center the model at origin (so camera framing is predictable)
    scene.position.x = -center.x * scale;
    scene.position.y = -center.y * scale;
    scene.position.z = -center.z * scale;

    // lift it a bit so it sits slightly above the ground plane (makes shadows look nicer)
    scene.position.y += (size.y * scale) / 2;

    // ensure all meshes cast/receive shadows and their textures use sRGB where appropriate
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const mat = child.material;
        if (mat) {
          if (mat.map) mat.map.encoding = THREE.sRGBEncoding;
          if (mat.emissiveMap) mat.emissiveMap.encoding = THREE.sRGBEncoding;
          // gently tweak material to be more "realistic" if it's too flat
          if (typeof mat.metalness === "number") mat.metalness = Math.min(1, mat.metalness + 0.05);
          if (typeof mat.roughness === "number") mat.roughness = Math.max(0.12, mat.roughness - 0.05);
          if (mat.envMapIntensity === undefined) mat.envMapIntensity = 1.0;
          mat.needsUpdate = true;
        }
      }
    });

    // position camera a bit further back depending on model height so it fits vertically as well
    const camY = size.y * scale * 0.8;
    const camZ = Math.max(size.x, size.z) * scale * 2.2 + 0.5;
    camera.position.set(0, camY, camZ);
    camera.lookAt(0, size.y * scale * 0.5, 0);
    camera.updateProjectionMatrix();
  }, [scene, camera]);

  return null;
}

function Model({ url, playSequence = [] }) {
  const ref = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, ref);

  // attach scene to a Group so we can reference it for sizing and transformations
  useEffect(() => {
    if (!scene) return;

    // log animations for debugging
    console.log("GLTF animations available:", Object.keys(actions));

    // if there is at least one action and no sequence requested, play the first
    const names = Object.keys(actions);
    if (names.length && playSequence.length === 0) {
      actions[names[0]].reset().play();
    }
  }, [scene, actions, playSequence]);

  // helper to play a clip once
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
      const duration = a.getClip().duration * 1000 / (a.timeScale || 1);
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

  // Ensure the primitive is a Group so useGLTF scene can be inspected/modified
  return (
    <group ref={ref} dispose={null}>
      <primitive object={scene} />
      <FitAndPrepareModel gltfScene={scene} />
    </group>
  );
}

// Simple ball spinner -- loads the ball GLB and clones it 'count' times around a circle
function BallSpinner({ ballUrl, count = 8, radius = 0.4, height = 0.5, speed = 1.2 }) {
  const { scene } = useGLTF(ballUrl);
  const group = useRef();

  // create clones only once
  const clones = useRef([]);
  useEffect(() => {
    if (!scene) return;
    // clear previous
    clones.current = [];

    for (let i = 0; i < count; i++) {
      const clone = scene.clone(true);
      // set a brake on scale if original ball is too big
      clone.scale.setScalar(0.6);
      // ensure shadows
      clone.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) c.material.map.encoding = THREE.sRGBEncoding;
        }
      });
      clones.current.push(clone);
      group.current && group.current.add(clone);
    }
    // cleanup
    return () => {
      if (group.current) group.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useFrame((state, delta) => {
    if (!group.current) return;
    // rotate the whole group
    group.current.rotation.y += delta * speed * 0.2;

    // place each clone around the circle (we do this every frame so you can animate radial movement later)
    clones.current.forEach((clone, i) => {
      const a = (i / clones.current.length) * Math.PI * 2 + state.clock.elapsedTime * speed * 0.4;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      if (clone) clone.position.set(x, height + Math.sin(state.clock.elapsedTime * 2 + i) * 0.02, z);
      if (clone) clone.rotation.y = a + Math.PI * 0.5;
    });
  });

  return <group ref={group} />;
}

export default function ModelRenderFixed({ playSequence = [] }) {
  // paths (adjust if your assets live elsewhere)
  const MACHINE_URL = "/Compelet_Machine_Model_Textures/Machine_Model_Textures/Lottery Simulator6.glb";
  const BALL_URL = "/Compelet_Machine_Model_Textures/Ball_Model_Textures/Ball_Mdl_001.glb";

  return (
    <div className="w-[500px] h-[500px] flex items-center justify-center " >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.2, 3], fov: 40 }}
        onCreated={({ gl }) => {
          gl.outputEncoding = THREE.sRGBEncoding;
          gl.physicallyCorrectLights = true;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* ambient + fill lights */}
        <ambientLight intensity={0.35} />
        <hemisphereLight intensity={0.4} />

        {/* key lights to create the studio look */}
        <directionalLight
          castShadow
          intensity={1}
          position={[5, 10, 5]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />

        <pointLight intensity={0.6} position={[-6, 4, -4]} />
        <pointLight intensity={0.4} position={[6, 4, -2]} />

        <Suspense fallback={null}>
          {/* realistic env for reflections; set background={false} to keep our CSS background */}
          {/* <Environment preset="studio" background={false} /> */}

          {/* main machine model */}
          <Model url={MACHINE_URL} playSequence={playSequence} />

          {/* place spinner near the top area of the machine; you may need to tweak translate values
              to put it exactly where the glass dome sits in your machine. */}
          <group position={[0, 0.9, 0] /* tweak X,Y,Z to position inside the machine */}>
            <BallSpinner ballUrl={BALL_URL} count={10} radius={0.45} height={0.04} speed={2.2} />
          </group>

          {/* soft contact shadow under the machine */}
          <ContactShadows position={[0, -0.05, 0]} opacity={0.7} width={4} blur={2.5} far={1.5} />
        </Suspense>

        {/* NO OrbitControls: model is fixed and user cannot drag/rotate/zoom by default */}
      </Canvas>
    </div>
  );
}

// small helper to avoid bundling warnings when using useGLTF in development
useGLTF.preload("/Compelet_Machine_Model_Textures/Machine_Model_Textures/Lottery Simulator6.glb");
// useGLTF.preload("/Compelet_Machine_Model_Textures/Ball_Model_Textures/Ball_Mdl_001.glb");
