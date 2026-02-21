import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PIPE_CENTER_POINTS } from "../../constants/constant";

const SpinningBalls = forwardRef(({
  scene,
  count = 25,
  ballScale = 1,
  ballScene,
  ballTexture,
  ballTextures,
  // new tunable props:
  speed = 1.5,                 // global speed multiplier (>1 faster, <1 slower)
  animationTimeProp = 5.0,     // base animation time for active ball (seconds)
  damping = 0.98,              // per-frame velocity damping (0.98 keeps velocity, 0.9 more drag)
  jitterScale = 0.01,          // random jitter magnitude
  initialVelBase = 0.3,        // base initial velocity multiplier
}, ref) => {
  const instRef = useRef(null);
  const ballsStateRef = useRef([]);
  const drumAnchorRef = useRef(null);

  const seqIndexRef = useRef(0);
  const animStartRef = useRef(null);
  const startPosRef = useRef(new THREE.Vector3());
  const finalPositionsRef = useRef([]);
  const lastSeqRef = useRef(-1);
  const sequenceRef = useRef([]);

  const tempMatrix = useMemo(() => new THREE.Object3D(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempObj = useMemo(() => new THREE.Object3D(), []);

  const drumInfo = useMemo(() => {
    if (!scene) return null;
    const drumMesh = scene.getObjectByName("Line001");
    const parent = drumMesh?.parent || scene;
    if (!drumMesh) return null;

    drumMesh.updateWorldMatrix(true, true);

    const drumBox = new THREE.Box3().setFromObject(drumMesh, true);
    const drumCenterWorld = new THREE.Vector3();
    drumBox.getCenter(drumCenterWorld);
    const drumSizeWorld = new THREE.Vector3();
    drumBox.getSize(drumSizeWorld);

    const trueDiameter = drumSizeWorld.z;
    drumSizeWorld.set(trueDiameter, trueDiameter, trueDiameter);
    const drumRadiusWorld = Math.min(drumSizeWorld.x, drumSizeWorld.y, drumSizeWorld.z) * 0.58;

    const centerLocal = drumCenterWorld.clone();
    const centerOffset = new THREE.Vector3(0, 0, 0);
    centerLocal.add(centerOffset);
    parent.worldToLocal(centerLocal);

    const rimWorld = drumCenterWorld.clone().add(new THREE.Vector3(drumRadiusWorld, 0, 0));
    const rimLocal = rimWorld.clone();
    parent.worldToLocal(rimLocal);
    const radiusLocal = rimLocal.distanceTo(centerLocal);

    const topWorld = drumBox.max.clone();
    const topLocal = topWorld.clone();
    parent.worldToLocal(topLocal);
    const yHalfLocal = Math.abs(topLocal.y - centerLocal.y);

    return {
      drumMesh,
      parent,
      centerLocal,
      drumCenterWorld,
      drumRadiusWorld,
      radiusLocal,
      yHalfLocal,
      drumBox,
    };
  }, [scene]);

  useImperativeHandle(ref, () => ({
    startDraw,
  }));

  function startDraw(resultArray) {
    if (!Array.isArray(resultArray) || resultArray.length === 0) return;
    sequenceRef.current = resultArray;
    seqIndexRef.current = 0;
    animStartRef.current = null;
    lastSeqRef.current = -1;
    finalPositionsRef.current = [];
  }

  function randomInsideUnitSphere() {
    const v = new THREE.Vector3();
    do {
      v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    } while (v.lengthSq() > 1);
    return v;
  }

  function extractSingleBallMesh(ballScene, texture, sizeMultiplier = 1) {
    let mesh = null;
    ballScene.traverse((node) => {
      if (node.isMesh && !mesh) mesh = node;
    });
    if (!mesh) throw new Error("No ball mesh found in ball GLB");

    const geometry = mesh.geometry.clone();
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);
    geometry.scale(sizeMultiplier, sizeMultiplier, sizeMultiplier);
    geometry.translate(center.x, center.y, center.z);
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();

    const material = Array.isArray(mesh.material) ? mesh.material[0].clone() : mesh.material.clone();
    if (texture) {
      material.map = texture;
      material.needsUpdate = true;
    }
    material.side = THREE.FrontSide;
    material.transparent = material.transparent ?? true;
    material.depthWrite = true;

    if (material.map) {
      material.map.encoding = THREE.sRGBEncoding;
      material.map.anisotropy = Math.min(16, material.map.anisotropy || 1);
    }
    return { geometry, material, originalMesh: mesh };
  }

  useEffect(() => {
    if (!drumInfo || !scene) return;
    const { parent, centerLocal } = drumInfo;

    const drumAnchor = new THREE.Group();
    drumAnchor.name = "DrumAnchor";
    drumAnchor.position.copy(centerLocal);
    parent.add(drumAnchor);

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

  useEffect(() => {
    if (!ballScene || !drumInfo || !drumAnchorRef.current) return;
    if (!Array.isArray(ballTextures) || ballTextures.length === 0) {
      console.warn("No ballTextures provided — fallback to single texture behavior.");
    }

    // Reuse geometry but clone base material once
    const { geometry, material: baseMaterial } = extractSingleBallMesh(ballScene, null);

    const textures = ballTextures || [];
    const texturesCount = Math.max(1, textures.length); // at least 1

    // Count how many instances will go to each texture (round-robin)
    const perTextureCountByTextureIndex = new Array(texturesCount).fill(0);
    for (let i = 0; i < count; i++) {
      const texIdx = i % texturesCount; // round-robin assignment
      perTextureCountByTextureIndex[texIdx]++;
    }

    const container = drumAnchorRef.current.container;

    // Create InstancedMesh for each texture that has >0 instances
    const meshes = []; // actual InstancedMesh objects in order
    const textureIndexToMeshIndex = new Array(texturesCount).fill(-1);
    for (let t = 0; t < texturesCount; t++) {
      const n = perTextureCountByTextureIndex[t];
      if (n <= 0) continue;

      const mat = baseMaterial.clone();
      if (textures[t]) {
        mat.map = textures[t];
        mat.needsUpdate = true;
        if (mat.map) {
          mat.map.encoding = THREE.sRGBEncoding;
        }
      }
      mat.side = THREE.FrontSide;
      mat.transparent = mat.transparent ?? true;
      mat.depthWrite = true;

      const instMesh = new THREE.InstancedMesh(geometry, mat, n);
      instMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      instMesh.castShadow = true;
      instMesh.receiveShadow = true;

      container.add(instMesh);
      textureIndexToMeshIndex[t] = meshes.length;
      meshes.push(instMesh);
    }

    // Build mapping from global instance index -> { meshIndex, localIndex }
    const instanceMap = new Array(count);
    const localIndexCounters = new Array(meshes.length).fill(0);
    const visualScale = new THREE.Vector3(ballScale, ballScale, ballScale);
    const states = [];
    const { parent, drumCenterWorld, centerLocal, drumRadiusWorld } = drumInfo;

    for (let i = 0; i < count; i++) {
      const texIdx = i % texturesCount; // round-robin (important)
      const meshIdx = textureIndexToMeshIndex[texIdx];
      if (meshIdx === -1) {
        console.warn('No mesh for texture index', texIdx);
        continue; // defensive — should not usually happen
      }
      const localIndex = localIndexCounters[meshIdx]++;

      // calculate position/velocity etc (same as before)
      const randWorld = randomInsideUnitSphere().multiplyScalar(drumRadiusWorld * (0.9 - Math.random() * 0.05));
      const ballWorld = drumCenterWorld.clone().add(randWorld);

      const ballLocalParent = ballWorld.clone();
      parent.worldToLocal(ballLocalParent);
      const posLocal = ballLocalParent.clone().sub(centerLocal);

      // ===== initial velocity scaled by global speed =====
      const initialVelScale = (initialVelBase + Math.random() * initialVelBase) * speed;
      const velWorld = randomInsideUnitSphere().multiplyScalar(initialVelScale);
      const velWorldPoint = drumCenterWorld.clone().add(velWorld);
      const velLocalPoint = velWorldPoint.clone();
      parent.worldToLocal(velLocalPoint);
      const velLocal = velLocalPoint.clone().sub(centerLocal);

      const ang = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const angVel = new THREE.Vector3(
        (Math.random() - 0.5) * 2.0 * speed,
        (Math.random() - 0.5) * 2.0 * speed,
        (Math.random() - 0.5) * 2.0 * speed
      );

      let baseRadius = 0.5;
      if (geometry.boundingSphere) {
        baseRadius = geometry.boundingSphere.radius;
      } else {
        geometry.computeBoundingSphere();
        baseRadius = geometry.boundingSphere ? geometry.boundingSphere.radius : 0.5;
      }
      const ballRadiusLocal = baseRadius * ballScale;

      states.push({
        pos: posLocal,
        vel: velLocal,
        ang,
        angVel,
        radius: ballRadiusLocal,
        mode: "drum",
      });

      // set instance matrix on the right mesh with local index
      tempMatrix.position.copy(posLocal);
      tempMatrix.quaternion.copy(tempQuat.setFromEuler(ang));
      tempMatrix.scale.copy(visualScale);

      const tmp = new THREE.Object3D();
      tmp.position.copy(posLocal);
      tmp.quaternion.copy(tempQuat);
      tmp.scale.copy(visualScale);
      tmp.updateMatrix();

      const instMesh = meshes[meshIdx];
      instMesh.setMatrixAt(localIndex, tmp.matrix);

      // store mapping so useFrame can update correct mesh/local index
      instanceMap[i] = { meshIndex: meshIdx, localIndex };
    }

    meshes.forEach((m) => (m.instanceMatrix.needsUpdate = true));

    instRef.current = { meshes, instanceMap, geometry, baseMaterial };

    ballsStateRef.current = states;

    // cleanup
    return () => {
      if (instRef.current && instRef.current.meshes) {
        instRef.current.meshes.forEach((m) => {
          if (m.parent) m.parent.remove(m);
          try {
            if (m.material) {
              m.material.dispose();
            }
          } catch (e) { }
        });
      }
      try {
        geometry.dispose();
        baseMaterial.dispose();
      } catch (e) { }
      instRef.current = null;
      ballsStateRef.current = [];
    };
  }, [ballScene, drumInfo, count, ballScale, ballTextures, speed, initialVelBase]);

  const pipeCurveRef = useRef(null);
  const pipeTStartRef = useRef(0);
  const exitedBallsRef = useRef([]); // store ball indices in exit order
  const pipeExitRef = useRef(new THREE.Vector3()); // cached exit point
  const stackDirRef = useRef(new THREE.Vector3()); // direction to stack backwards
  const pipeOffset = new THREE.Vector3(-0.5, -0.25, -0.55); // same offset you used before
  const resetTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!scene || !drumInfo || !drumAnchorRef.current) return;
    if (pipeCurveRef.current) return;

    const pipe = scene.getObjectByName("Line001001");
    if (!pipe || !pipe.geometry) return;

    const anchor = drumAnchorRef.current.anchor;

    pipe.updateWorldMatrix(true, false);

    let geom = pipe.geometry.clone();
    if (geom.index) geom = geom.toNonIndexed();

    const pos = geom.attributes.position;
    const v = new THREE.Vector3();

    const bbox = new THREE.Box3().setFromObject(pipe);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    const axis =
      size.x > size.y && size.x > size.z ? "x" :
        size.y > size.z ? "y" : "z";

    const slices = new Map();
    const sliceSize = size[axis] / 10; // 👈 resolution (increase = smoother)

    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      v.applyMatrix4(pipe.matrixWorld);
      anchor.worldToLocal(v);

      const key = Math.round(v[axis] / sliceSize);
      if (!slices.has(key)) slices.set(key, []);
      slices.get(key).push(v.clone());
    }

    const curve = new THREE.CatmullRomCurve3(PIPE_CENTER_POINTS);
    curve.curveType = "centripetal";
    curve.closed = false;

    pipeCurveRef.current = curve;

  }, [scene, drumInfo]);

  useFrame((_, dt) => {
    const instData = instRef.current;
    const states = ballsStateRef.current;
    if (!(instData && states && states.length > 0 && drumInfo && drumAnchorRef.current)) return;

    const { radiusLocal, yHalfLocal } = drumInfo;
    const safetyRadius = radiusLocal * 0.1;
    // separation strength scaled by speed
    const separationStrength = 100 * speed;

    const sequence = sequenceRef.current;
    // animationTime is shorter when speed > 1 (faster)
    const animationTime = Math.max(0.05, animationTimeProp / speed);
    const phaseADuration = animationTime * 0.25;
    const phaseBDuration = animationTime * 0.75;
    const zOffset = 0.209;

    const seqIndex = seqIndexRef.current;
    const isDone = seqIndex >= sequence.length;
    const CONTROL_INDEX = isDone ? -1 : sequence[seqIndex];

    // ensure exited balls queue exists
    if (!exitedBallsRef.current) exitedBallsRef.current = [];

    if (lastSeqRef.current !== seqIndex && CONTROL_INDEX !== -1) {
      if (states[CONTROL_INDEX]) {
        animStartRef.current = performance.now();
        startPosRef.current.copy(states[CONTROL_INDEX].pos);
        lastSeqRef.current = seqIndex;
      }
    }

    const { meshes, instanceMap } = instData;

    // --- compute pipe exit & stack direction once per frame if available --- //
    const curve = pipeCurveRef.current;
    if (curve) {
      const exitPt = curve.getPoint(1).clone();
      exitPt.add(pipeOffset);
      pipeExitRef.current.copy(exitPt);

      const tangent = curve.getTangent(1).clone().normalize();
      stackDirRef.current.copy(tangent.clone().negate());
    }

    for (let i = 0; i < states.length; i++) {
      const b = states[i];

      // ---------- if this ball has already exited (stacked) ---------- //
      const exitIndex = exitedBallsRef.current.indexOf(i);
      if (exitIndex !== -1) {
        const spacing = Math.max((b.radius || 0.12) * 2, 0.10);
        const finalPos = pipeExitRef.current.clone().addScaledVector(stackDirRef.current, exitIndex * spacing);

        b.pos.copy(finalPos);
        b.vel.set(0, 0, 0);
        b.ang.set(0, 0, 0);
        tempObj.position.copy(b.pos);
        tempObj.quaternion.identity();
        tempObj.scale.set(ballScale, ballScale, ballScale);
        tempObj.updateMatrix();

        const map = instanceMap[i];
        if (map) meshes[map.meshIndex].setMatrixAt(map.localIndex, tempObj.matrix);
        continue;
      }

      // ---------- handle control index (active animated ball) ---------- //
      if (i === CONTROL_INDEX) {
        if (animStartRef.current === null) {
          animStartRef.current = performance.now();
          startPosRef.current.copy(b.pos);
          lastSeqRef.current = seqIndex;
        }

        const elapsed = (performance.now() - animStartRef.current) / 1000;

        if (elapsed < phaseADuration) {
          const rawT = Math.min(elapsed / phaseADuration, 1);
          const t = rawT * rawT * (3 - 2 * rawT); // smoothstep

          const anchor = drumAnchorRef.current.anchor;
          const holeLocalOnMirror = new THREE.Vector3(0, 0, 0);
          const holeWorld = holeLocalOnMirror.applyMatrix4(drumInfo.drumMesh.matrixWorld);

          const vec = new THREE.Vector3(-0.091, 1.5632, -0.3703);

          anchor.worldToLocal(vec);
          b.pos.lerpVectors(startPosRef.current, vec, t);
        } else {
          const phaseElapsed = Math.min(elapsed - phaseADuration, phaseBDuration);
          const rawT = Math.min(phaseElapsed / phaseBDuration, 1);
          const t01 = rawT * rawT * (3 - 2 * rawT);

          const alreadyExited = exitedBallsRef.current.length;
          const spacing = Math.max((b.radius || 0.12) * 2.05, 0.18);

          const pipeLengthPortion = 0.024;
          const maxT = 1 - (alreadyExited * pipeLengthPortion);

          const tStart = pipeTStartRef.current || 0;
          const tGlobal = tStart + (maxT - tStart) * t01;

          const curvePos = curve.getPoint(tGlobal);
          b.pos.copy(curvePos).add(pipeOffset);
          b.ang.y = 1;
          b.ang.z = 1;
          tempObj.quaternion.setFromEuler(b.ang);
        }

        b.vel.set(0, 0, 0);

        tempObj.position.copy(b.pos);
        tempObj.quaternion.identity();
        tempObj.scale.set(ballScale, ballScale, ballScale);
        tempObj.updateMatrix();

        const map = instanceMap[i];
        if (map) meshes[map.meshIndex].setMatrixAt(map.localIndex, tempObj.matrix);

        if (elapsed >= animationTime) {
          animStartRef.current = null;
          lastSeqRef.current = seqIndex + 1;
          seqIndexRef.current = seqIndex + 1;

          exitedBallsRef.current.push(i);

          if (seqIndexRef.current >= sequence.length) {
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);

            resetTimeoutRef.current = setTimeout(() => {
              seqIndexRef.current = 0;
              animStartRef.current = null;
              lastSeqRef.current = -1;
              exitedBallsRef.current = [];
              sequenceRef.current = [];
              resetTimeoutRef.current = null;
            }, 2000);
          }
        }

        continue;
      }

      // ---------- normal physics for other balls ---------- //
      const jitter = randomInsideUnitSphere().multiplyScalar(jitterScale * dt * speed);
      const radial = b.pos.clone().normalize();
      if (radial.lengthSq() === 0) radial.set(1, 0, 0);
      const tangentialJitter = jitter.sub(radial.multiplyScalar(jitter.dot(radial)));
      b.vel.add(tangentialJitter);

      b.vel.addScaledVector(b.pos, -0.02 * dt);

      for (let j = i + 1; j < states.length; j++) {
        const b2 = states[j];
        const diff = b.pos.clone().sub(b2.pos);
        const distSq = diff.lengthSq();
        const minDist = (b.radius + b2.radius) * 0.95;
        if (distSq > 0 && distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq) || 0.0001;
          diff.normalize();
          const overlap = minDist - dist;
          const push = diff.multiplyScalar(overlap * separationStrength * 0.05 * dt * speed);
          b.vel.add(push);
          b2.vel.sub(push);
        }
      }

      // update position: multiply by speed to make balls move faster
      b.pos.addScaledVector(b.vel, dt * speed);

      const maxDist = safetyRadius - b.radius;
      const distFromCenter = b.pos.length();
      if (distFromCenter > maxDist) {
        const normal = b.pos.clone().normalize();
        b.pos.copy(normal.multiplyScalar(maxDist));
        b.vel.reflect(normal);
      }

      // apply damping (should be close to 1.0 to preserve speed)
      b.vel.multiplyScalar(damping);

      b.ang.x += b.angVel.x * dt * speed;
      b.ang.y += b.angVel.y * dt * speed;
      b.ang.z += b.angVel.z * dt * speed;

      tempObj.position.copy(b.pos);
      tempObj.quaternion.setFromEuler(b.ang);
      tempObj.scale.set(ballScale, ballScale, ballScale);
      tempObj.updateMatrix();

      const map = instanceMap[i];
      if (map) meshes[map.meshIndex].setMatrixAt(map.localIndex, tempObj.matrix);
    }

    // mark all meshes as updated
    meshes.forEach((m) => (m.instanceMatrix.needsUpdate = true));
  });

  return null;
});

export default SpinningBalls;
