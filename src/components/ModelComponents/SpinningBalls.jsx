import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, } from "@react-three/drei";
import * as THREE from "three";


export const SpinningBalls = ({ scene, count = 25, ballScale = 1, ballUrl = '', ballTexture }) => {

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

    function extractSingleBallMesh(ballScene, texture) {
        let mesh = null;
        ballScene.traverse((node) => {
            if (node.isMesh && !mesh) mesh = node;
        });
        if (!mesh) throw new Error("No ball mesh found in ball GLB");

        // clone geometry & material for instanced usage
        const geometry = mesh.geometry.clone();
        const material = Array.isArray(mesh.material) ? mesh.material[0].clone() : mesh.material.clone();

        // apply the texture if provided
        if (texture) {
            material.map = texture;
            material.needsUpdate = true;
        }

        // material tweaks
        material.side = THREE.FrontSide;
        material.transparent = material.transparent ?? true;
        material.depthWrite = true;
        if (material.map) {
            material.map.encoding = THREE.sRGBEncoding;
            material.map.anisotropy = Math.min(16, material.map.anisotropy || 1);
        }
        material.needsUpdate = true;

        mesh.scale.setScalar(1);
        geometry.computeBoundingSphere();

        return { geometry, material, originalMesh: mesh };
    }

    // compute drum info using Glass_Mdl_01 and create an anchor group placed correctly in the same parent
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

        console.log("🚀 ~ SpinningBalls ~ drumSizeWorld:", drumSizeWorld);

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
        const safetyRadius = radiusLocal * 0.1;// allow small margin
        const separationStrength = 100;
        const swirlStrength = 0 * dt; // small tangential addition (scaled by dt)
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

            const distFromCenter = b.pos.length();
            const maxDist = safetyRadius - b.radius;
            if (distFromCenter > maxDist) {
                const normal = b.pos.clone().normalize();
                b.pos.copy(normal.multiplyScalar(maxDist));
                const vDotN = b.vel.dot(normal);
                b.vel.addScaledVector(normal, -2 * vDotN);
                b.vel.multiplyScalar(1);
            }

            // const planeX = safetyRadius * 0.65; // 🔴 adjust to match mirror position

            // if (b.pos.x > planeX - b.radius) {
            //     b.pos.x = planeX - b.radius;
            //     b.vel.x = -Math.abs(b.vel.x) * 20; // bounce inward
            // }
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
            b.vel.multiplyScalar(0.1);

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