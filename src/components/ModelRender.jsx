// ModelRenderViewerLike.jsx
import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";

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
      <SpinningBalls scene={scene} />
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
  scene,
  count = 20,
  ballUrl = "/Compelet_Machine_Model_Textures/Ball_Model_Textures/Ball_Mdl_001.glb",
  ballScale = 1,
}) {
  // refs
  const instRef = useRef(null); // InstancedMesh ref
  const ballsStateRef = useRef([]); // { pos: Vector3 (local to anchor), vel: Vector3 (local), ang: Euler, angVel: Vector3 }
  const drumAnchorRef = useRef(null);
  const tempMatrix = useMemo(() => new THREE.Object3D(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);

  // load ball GLB and extract first mesh
  const { scene: ballScene } = useGLTF(ballUrl);

  // helpers
  function randomInsideUnitSphere() {
    const v = new THREE.Vector3();
    do {
      v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    } while (v.lengthSq() > 1);
    return v;
  }

  function extractSingleBallMesh(ballScene) {
    let mesh = null;
    ballScene.traverse((node) => {
      if (node.isMesh && !mesh) mesh = node;
    });
    if (!mesh) throw new Error("No ball mesh found in ball GLB");
    // clone geometry & material for instanced usage (material will be reused across instances)
    const geometry = mesh.geometry.clone();
    // prefer a single material (if array, pick first; you can adjust if your ball uses multi-material)
    const material = Array.isArray(mesh.material) ? mesh.material[0].clone() : mesh.material.clone();
    console.log("🚀 ~ extractSingleBallMesh ~ material:", material)

    // material tweaks
    material.side = THREE.FrontSide;
    material.transparent = material.transparent ?? true;
    material.depthWrite = true;
    if (material.map) {
      material.map.encoding = THREE.sRGBEncoding;
      material.map.anisotropy = Math.min(16, material.map.anisotropy || 1);
    }
    material.needsUpdate = true;

    return { geometry, material, originalMesh: mesh };
  }

  // compute drum info using Glass_Mdl_01 and create an anchor group placed correctly in the same parent
  const drumInfo = useMemo(() => {
    if (!scene) return null;
    const drumMesh = scene.getObjectByName("Glass_Mdl_01");
    if (!drumMesh) {
      console.error("SpinningBalls: Glass_Mdl_01 not found in provided scene");
      return null;
    }

    // ensure world matrices are up-to-date
    drumMesh.updateWorldMatrix(true, true);

    // world-space bounding box & center/size
    const drumBox = new THREE.Box3().setFromObject(drumMesh);
    const drumCenterWorld = new THREE.Vector3();
    drumBox.getCenter(drumCenterWorld);
    const drumSizeWorld = new THREE.Vector3();
    drumBox.getSize(drumSizeWorld);

    const drumRadiusWorld = Math.min(drumSizeWorld.x, drumSizeWorld.y, drumSizeWorld.z) * 0.58;

    const parent = drumMesh.parent || scene;

    const centerLocal = drumCenterWorld.clone();
    parent.worldToLocal(centerLocal);

    const rimWorld = drumCenterWorld.clone().add(new THREE.Vector3(drumRadiusWorld, 0, 0));
    const rimLocal = rimWorld.clone();
    parent.worldToLocal(rimLocal);
    const radiusLocal = rimLocal.distanceTo(centerLocal);

    // vertical half-size in world -> convert to local to compute y limit
    const topWorld = drumBox.max.clone();
    const topLocal = topWorld.clone();
    parent.worldToLocal(topLocal);
    const yHalfLocal = Math.abs(topLocal.y - centerLocal.y);

    return {
      drumMesh,
      parent,
      centerLocal, // parent-local center position
      drumCenterWorld, // world-space center (useful for conversions)
      drumRadiusWorld,
      radiusLocal, // in parent-local units (works with anchor children)
      yHalfLocal,
      drumBox,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  // create anchor group once
  useEffect(() => {
    if (!drumInfo || !scene) return;
    const { parent, centerLocal } = drumInfo;

    const drumAnchor = new THREE.Group();
    drumAnchor.name = "DrumAnchor";
    // set anchor position in parent local coordinates
    drumAnchor.position.copy(centerLocal);

    // add anchor to same parent as drum mesh
    parent.add(drumAnchor);

    // small child group for instanced mesh (keeps naming safe)
    const container = new THREE.Group();
    container.name = "BallsContainer";
    drumAnchor.add(container);

    drumAnchorRef.current = { anchor: drumAnchor, container };
    return () => {
      if (drumAnchor.parent) drumAnchor.parent.remove(drumAnchor);
      drumAnchorRef.current = null;
      ballsStateRef.current = [];
    };
  }, [drumInfo, scene]);


  // prepare instanced mesh once ball GLB & anchor ready
  useEffect(() => {
    if (!ballScene || !drumInfo || !drumAnchorRef.current) return;

    const { geometry, material } = extractSingleBallMesh(ballScene);

    // create InstancedMesh
    const inst = new THREE.InstancedMesh(geometry, material, count);
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // we'll update every frame
    inst.castShadow = true;
    inst.receiveShadow = true;

    // apply a uniform "visual" scale by pre-multiplying the instance matrix on creation and also in updates
    const visualScale = new THREE.Vector3(ballScale, ballScale, ballScale);

    // attach to anchor container
    const container = drumAnchorRef.current.container;
    container.add(inst);
    instRef.current = inst;

    // create initial per-ball states (positions in anchor-local coordinates)
    const states = [];
    const { parent, drumCenterWorld, centerLocal, radiusLocal, drumRadiusWorld } = drumInfo;

    for (let i = 0; i < count; i++) {
      // random point inside world-sphere then convert to parent-local and then to anchor-local
      const randWorld = randomInsideUnitSphere().multiplyScalar(drumRadiusWorld * (0.9 - Math.random() * 0.05));
      const ballWorld = drumCenterWorld.clone().add(randWorld);

      // local in parent coords
      const ballLocalParent = ballWorld.clone();
      parent.worldToLocal(ballLocalParent);

      // convert to anchor-local by subtracting anchor position (centerLocal)
      const posLocal = ballLocalParent.clone().sub(centerLocal);

      // velocity: create a small random world delta and convert to local (approx by using world->local on position)
      const velWorld = randomInsideUnitSphere().multiplyScalar(0.3 + Math.random() * 0.3);
      const velWorldPoint = drumCenterWorld.clone().add(velWorld);
      const velLocalPoint = velWorldPoint.clone();
      parent.worldToLocal(velLocalPoint);
      // approximate local velocity by subtracting centerLocal and dividing by 1s unit (since small delta)
      const velLocal = velLocalPoint.clone().sub(centerLocal);

      // small angular rotation and velocity
      const ang = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      // reduced angVel so they don't spin crazy
      const angVel = new THREE.Vector3(
        (Math.random() - 0.5) * 2.0,
        (Math.random() - 0.5) * 2.0,
        (Math.random() - 0.5) * 2.0
      );

      // approximate collision radius in local units (use geometry boundingSphere scaled by visual scale and parent's local transform)
      let baseRadius = 0.5; // fallback
      if (geometry.boundingSphere) {
        baseRadius = geometry.boundingSphere.radius;
      } else {
        geometry.computeBoundingSphere();
        baseRadius = geometry.boundingSphere ? geometry.boundingSphere.radius : 0.5;
      }
      const ballRadiusLocal = baseRadius * ballScale; // approx in local units (good enough)

      states.push({
        pos: posLocal,
        vel: velLocal,
        ang,
        angVel,
        radius: ballRadiusLocal,
      });

      // initialize instance transform
      tempMatrix.position.copy(posLocal);
      tempMatrix.quaternion.copy(tempQuat.setFromEuler(ang));
      tempMatrix.scale.copy(visualScale);
      tempMatrix.identity && tempMatrix.identity(); // no-op but keep semantics
      const tmp = new THREE.Object3D();
      tmp.position.copy(posLocal);
      tmp.quaternion.copy(tempQuat);
      tmp.scale.copy(visualScale);
      tmp.updateMatrix();
      inst.setMatrixAt(i, tmp.matrix);
    }

    inst.instanceMatrix.needsUpdate = true;
    ballsStateRef.current = states;

    // cleanup: dispose geometry/material if we created clones (material/geometry copied earlier)
    return () => {
      if (inst.parent) inst.parent.remove(inst);
      try {
        geometry.dispose();
        material.dispose();
      } catch (e) {
        // ignore disposal errors
      }
      instRef.current = null;
      ballsStateRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballScene, drumInfo, count, ballScale]);

  // physics & instanced matrix update - run each frame
  useFrame((_, dt) => {
    const inst = instRef.current;
    const states = ballsStateRef.current;
    if (!inst || !states || states.length === 0 || !drumInfo || !drumAnchorRef.current) return;

    const { radiusLocal, parent, centerLocal, yHalfLocal } = drumInfo;
    const safetyRadius = radiusLocal; // allow small margin
    const separationStrength = 100;
    const swirlStrength = 35 * dt; // small tangential addition (scaled by dt)
    const tempObj = new THREE.Object3D();

    // O(n^2) separation is okay for <= 90
    for (let i = 0; i < states.length; i++) {
      const b = states[i];

      // small random jitter in tangential plane only
      const jitter = randomInsideUnitSphere().multiplyScalar(0.01 * dt);
      // remove radial component of jitter so it doesn't push outward—project onto tangential plane
      const radial = b.pos.clone().normalize();
      if (radial.lengthSq() === 0) radial.set(1, 0, 0);
      const radialComponent = radial.clone().multiplyScalar(jitter.dot(radial));
      const tangentialJitter = jitter.clone().sub(radialComponent);
      b.vel.add(tangentialJitter);

      // swirl (tangential velocity) to simulate air flow inside drum
      // local tangential vector: (-z, 0, x) gives a simple swirl around Y
      const swirl = new THREE.Vector3(-b.pos.z, 0, b.pos.x);
      // avoid zero
      if (swirl.lengthSq() > 0.000001) {
        swirl.normalize();
        swirl.multiplyScalar(swirlStrength);
        b.vel.add(swirl);
      }

      // small centralizing force (weak)
      const towardCenter = b.pos.clone().multiplyScalar(-0.02 * dt);
      b.vel.add(towardCenter);

      // pairwise separation
      for (let j = i + 1; j < states.length; j++) {
        const b2 = states[j];
        const diff = b.pos.clone().sub(b2.pos);
        const distSq = diff.lengthSq();
        const minDist = (b.radius + b2.radius) * 0.95;
        if (distSq > 0 && distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq) || 0.0001;
          diff.normalize();
          // push magnitude proportional to overlap
          const overlap = (minDist - dist);
          // scale by separationStrength and dt
          const push = diff.multiplyScalar((overlap / dist) * separationStrength * 0.05);
          b.vel.add(push);
          b2.vel.sub(push);
        }
      }

      // integrate
      const deltaVel = b.vel.clone().multiplyScalar(dt);
      b.pos.add(deltaVel);

      // boundary collision: spherical surface
      const distFromCenter = b.pos.length();
      const maxDist = safetyRadius - b.radius;
      if (distFromCenter > maxDist) {
        // compute normal
        const normal = b.pos.clone().normalize();
        // clamp position onto sphere surface
        b.pos.copy(normal.multiplyScalar(maxDist));
        // reflect velocity about normal: v' = v - 2*(v·n)*n
        const vDotN = b.vel.dot(normal);
        b.vel.addScaledVector(normal, -2 * vDotN);
        // damping
        b.vel.multiplyScalar(2);
      }

      // vertical ceiling/floor clamp using yHalfLocal (so we preserve real drum height)
      const yLimit = Math.max(0.0001, yHalfLocal - b.radius);
      if (b.pos.y > yLimit) {
        b.pos.y = yLimit;
        b.vel.y = -Math.abs(b.vel.y) * 0.6;
      } else if (b.pos.y < -yLimit) {
        b.pos.y = -yLimit;
        b.vel.y = Math.abs(b.vel.y) * 0.6;
      }

      // small damping
      b.vel.multiplyScalar(0.997);

      // update angular rotation
      b.ang.x += b.angVel.x * dt;
      b.ang.y += b.angVel.y * dt;
      b.ang.z += b.angVel.z * dt;

      // write instance transform
      tempObj.position.copy(b.pos);
      tempObj.quaternion.setFromEuler(b.ang);
      tempObj.scale.set(ballScale, ballScale, ballScale);
      tempObj.updateMatrix();
      inst.setMatrixAt(i, tempObj.matrix);
    }

    inst.instanceMatrix.needsUpdate = true;
  });

  // component doesn't render JSX (we mutated the scene), but return null to satisfy React
  return null;
}


export default function ModelRenderViewerLike({ playSequence = [], modelUrl }) {
  const MACHINE_URL =
    modelUrl ||
    "/Compelet_Machine_Model_Textures/Machine_Model_Textures/Lottery Simulator6.glb";

  return (
    <div
      style={{
        width: "500px",
        height: "700px",
        display: "flex",
        alignItems: "start",
        justifyContent: "start",
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
