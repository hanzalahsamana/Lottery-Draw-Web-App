import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Control_Ball_Index } from "../../constants/constant";


const SpinningBalls = forwardRef(({ scene, count = 25, ballScale = 1, ballScene, ballTexture }, ref) => {

  const instRef = useRef(null);
  const ballsStateRef = useRef([]);
  const drumAnchorRef = useRef(null);

  const seqIndexRef = useRef(0);
  const animStartRef = useRef(null);
  const startPosRef = useRef(new THREE.Vector3());
  const finalPositionsRef = useRef([]);
  const lastSeqRef = useRef(-1);
  const sequenceRef = useRef([]);

  // const { scene: ballScene } = useGLTF(ballUrl);

  const tempMatrix = useMemo(() => new THREE.Object3D(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempObj = useMemo(() => new THREE.Object3D(), []);


  const drumInfo = useMemo(() => {
    if (!scene) return null;
    const drumMesh = scene.getObjectByName("Glass_Mdl_01002");

    drumMesh.updateWorldMatrix(true, true);

    // world-space bounding box & center/size
    const drumBox = new THREE.Box3().setFromObject(drumMesh, true);
    const drumCenterWorld = new THREE.Vector3();
    drumBox.getCenter(drumCenterWorld);
    const drumSizeWorld = new THREE.Vector3();
    drumBox.getSize(drumSizeWorld);

    const trueDiameter = drumSizeWorld.z;
    drumSizeWorld.set(trueDiameter, trueDiameter, trueDiameter);

    const drumRadiusWorld = Math.min(drumSizeWorld.z, drumSizeWorld.z, drumSizeWorld.z) * 0.58; //0.66

    const parent = drumMesh.parent || scene;

    const centerLocal = drumCenterWorld.clone();
    const centerOffset = new THREE.Vector3(0.35, 0, 0);
    centerLocal.add(centerOffset);
    parent.worldToLocal(centerLocal);


    const rimWorld = drumCenterWorld.clone().add(new THREE.Vector3(drumRadiusWorld, 0, 0));
    const rimLocal = rimWorld.clone();
    parent.worldToLocal(rimLocal);
    const radiusLocal = rimLocal.distanceTo(centerLocal); // 0.74

    // vertical half-size in world -> convert to local to compute y limit
    const topWorld = drumBox.max.clone();
    const topLocal = topWorld.clone();
    parent.worldToLocal(topLocal);
    const yHalfLocal = Math.abs(topLocal.y - centerLocal.y); //0.93

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


  useImperativeHandle(ref, () => ({
    startDraw,
  }));

  function startDraw(resultArray) {
    console.log(resultArray, '🤔🤔');

    // resultArray example: [1, 4, 6, 8, 10, 12]
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

    // ✅ CENTER GEOMETRY FIRST (CRITICAL)
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);

    // ✅ SCALE AROUND CENTER
    geometry.scale(sizeMultiplier, sizeMultiplier, sizeMultiplier);

    // ✅ MOVE BACK TO ORIGINAL POSITION
    geometry.translate(center.x, center.y, center.z);

    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();

    const material = Array.isArray(mesh.material)
      ? mesh.material[0].clone()
      : mesh.material.clone();

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

  useEffect(() => {
    if (!ballScene || !drumInfo || !drumAnchorRef.current) return;

    const { geometry, material } = extractSingleBallMesh(ballScene, ballTexture);

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
    const { parent, drumCenterWorld, centerLocal, drumRadiusWorld } = drumInfo;

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


      // const tex = ballTextures[i % ballTextures.length];
      // const mat = Array.isArray(material) ? material[0].clone() : material.clone();
      // if (tex) {
      //     mat.map = tex;
      //     mat.map.encoding = THREE.sRGBEncoding;
      //     mat.map.anisotropy = Math.min(16, mat.map.anisotropy || 1);
      // }

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
        mode: "drum",
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

  useFrame((_, dt) => {
    const inst = instRef.current;
    const states = ballsStateRef.current;

    if (!(inst && states && states.length > 0 && drumInfo && drumAnchorRef.current)) return;

    const { radiusLocal, yHalfLocal } = drumInfo;
    const safetyRadius = radiusLocal * 0.1;
    const separationStrength = 100;

    // config
    const sequence = sequenceRef.current; // hard-coded for now
    const animationTime = 3.0;              // total per ball in seconds
    const phaseADuration = animationTime * 0.3; // startPos -> path[0]
    const phaseBDuration = animationTime * 0.7; // path[0] -> exit
    const zOffset = 0.149;                    // offset between finished balls on Z

    // path (shared)
    const path = [
      new THREE.Vector3(-0.60, -1.12, -0.625), // hole (path start)
      new THREE.Vector3(-0.60, -1.46, -0.625), // drop down
      new THREE.Vector3(-1.07, -1.46, -0.625), // forward
      new THREE.Vector3(-1.07, -1.54, -2.4),   // passage end (base)
    ];

    const seqIndex = seqIndexRef.current;
    const isDone = seqIndex >= sequence.length;
    const CONTROL_INDEX = isDone ? -1 : sequence[seqIndex];

    // if (!sequence || sequence.length === 0) return;

    // Detect new sequence start and capture the precise start pos
    if (lastSeqRef.current !== seqIndex && CONTROL_INDEX !== -1) {
      // ensure the controlled index exists in states
      if (states[CONTROL_INDEX]) {
        animStartRef.current = performance.now();
        startPosRef.current.copy(states[CONTROL_INDEX].pos);
        lastSeqRef.current = seqIndex;
      }
    }

    for (let i = 0; i < states.length; i++) {
      const b = states[i];

      // If this ball finished earlier, place it at its stored final position (with offset)
      const finishedIndex = sequence.indexOf(i);
      if (finishedIndex !== -1 && finishedIndex < seqIndex) {
        // finishedIndex maps to finalPositionsRef.current[finishedIndex]
        const finalPos = finalPositionsRef.current[finishedIndex];
        if (finalPos) {
          b.pos.copy(finalPos);
          b.vel.set(0, 0, 0);
          tempObj.position.copy(b.pos);
          tempObj.quaternion.identity();
          tempObj.scale.set(ballScale, ballScale, ballScale);
          tempObj.updateMatrix();
          inst.setMatrixAt(i, tempObj.matrix);
          continue;
        }
      }

      // CONTROLLED BALL (the one currently animating)
      if (i === CONTROL_INDEX) {

        // const axis = new THREE.Vector3(0, 0, 1); // local axis of rotation
        // const angle = dt * 40;           // rotation per frame
        // const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);

        // tempObj.quaternion.premultiply(q);

        // Safety: ensure animStart was captured; if not, capture now (fallback)
        if (animStartRef.current === null) {
          animStartRef.current = performance.now();
          startPosRef.current.copy(b.pos);
          lastSeqRef.current = seqIndex;
        }

        const elapsed = (performance.now() - animStartRef.current) / 1000;
        // Phase A: move from startPos -> path[0]
        if (elapsed < phaseADuration) {
          const rawT = Math.min(elapsed / phaseADuration, 1);
          const t = rawT * rawT * (3 - 2 * rawT); // smoothstep
          b.pos.lerpVectors(startPosRef.current, path[0], t);
        } else {
          // Phase B: path[0] -> path[last]
          const phaseElapsed = Math.min(elapsed - phaseADuration, phaseBDuration);
          const rawT = Math.min(phaseElapsed / phaseBDuration, 1);
          const t = rawT * rawT * (3 - 2 * rawT); // smoothstep


          const segments = path.length - 1;
          const segT = t * segments;
          const segIndex = Math.min(Math.floor(segT), segments - 1);
          const localT = segT - segIndex;

          // Compute the final Z offset for this ball
          const zOffsetValue = zOffset * finalPositionsRef.current.length;



          // Clone the path positions to avoid modifying originals
          const startPoint = path[segIndex].clone();
          const endPoint = path[segIndex + 1].clone();
          if (segIndex === segments - 1) {
            endPoint.z += zOffsetValue; // dynamically offset Z
          }

          // interpolate
          b.pos.lerpVectors(startPoint, endPoint, localT);
        }

        // freeze physics for controlled ball
        b.vel.set(0, 0, 0);

        // write controlled instance
        tempObj.position.copy(b.pos);
        tempObj.quaternion.identity();
        tempObj.scale.set(ballScale, ballScale, ballScale);
        tempObj.updateMatrix();
        inst.setMatrixAt(i, tempObj.matrix);

        // on finish: store final position and advance sequence
        if (elapsed >= animationTime) {
          animStartRef.current = null;
          lastSeqRef.current = seqIndex + 1; // so next animation capture logic triggers correctly

          // compute this ball's final position with incremental Z offset to avoid overlap
          const baseFinal = path[path.length - 1];
          const offsetZ = zOffset * finalPositionsRef.current.length; // 0, 0.3, 0.6...
          const finalPos = new THREE.Vector3(baseFinal.x, baseFinal.y, baseFinal.z + offsetZ);
          finalPositionsRef.current.push(finalPos);

          // advance to next ball
          seqIndexRef.current = seqIndex + 1;
          animStartRef.current = null;
          lastSeqRef.current = seqIndex + 1;
          if (seqIndexRef.current >= sequence.length) {
            // Reset everything to allow a new draw
            seqIndexRef.current = 0;
            animStartRef.current = null;
            lastSeqRef.current = -1;
            finalPositionsRef.current = [];
            sequenceRef.current = [];
          }
        }

        continue;
      }

      // ------------- normal physics for other balls -------------
      const jitter = randomInsideUnitSphere().multiplyScalar(0.01 * dt);
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
          const push = diff.multiplyScalar(overlap * separationStrength * 0.05);
          b.vel.add(push);
          b2.vel.sub(push);
        }
      }

      b.pos.addScaledVector(b.vel, dt);

      const maxDist = safetyRadius - b.radius;
      const distFromCenter = b.pos.length();
      if (distFromCenter > maxDist) {
        const normal = b.pos.clone().normalize();
        b.pos.copy(normal.multiplyScalar(maxDist));
        b.vel.reflect(normal);
      }

      const yLimit = Math.max(0.0001, yHalfLocal - b.radius);
      b.pos.y = THREE.MathUtils.clamp(b.pos.y, -yLimit, yLimit);

      b.vel.multiplyScalar(0.1);

      b.ang.x += b.angVel.x * dt;
      b.ang.y += b.angVel.y * dt;
      b.ang.z += b.angVel.z * dt;

      tempObj.position.copy(b.pos);
      tempObj.quaternion.setFromEuler(b.ang);
      tempObj.scale.set(ballScale, ballScale, ballScale);
      tempObj.updateMatrix();
      inst.setMatrixAt(i, tempObj.matrix);
    }

    inst.instanceMatrix.needsUpdate = true;
  });




  return null;
});

export default SpinningBalls