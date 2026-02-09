import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export const FitAndPrepareModel = ({ gltfScene, desiredSize = 40 }) => {
  const scene = gltfScene;
  const { camera } = useThree();

  useEffect(() => {
    if (!scene) return;

    // bounding box in model space
    const bbox = new THREE.Box3().setFromObject(scene);
    const size = bbox.getSize(new THREE.Vector3());
    // const center = bbox.getCenter(new THREE.Vector3());

    // // keep your desiredSize logic (you used a constant desiredSize before)
    const scale = desiredSize;
    // scene.scale.setScalar(scale);

    // // center the model at origin (after scaling)
    // scene.position.x = -center.x * scale;
    // scene.position.y = -center.y * scale;
    // scene.position.z = -center.z * scale;

    // // small lift so machine sits nicely on ground plane (optional)
    // scene.position.y += (size.y * scale) / 2;

    // // ensure meshes cast/receive shadows and use sRGB for textures
    // scene.traverse((child) => {
    //   if (child.isMesh) {
    //     child.castShadow = true;
    //     child.receiveShadow = true;
    //     const mat = child.material;
    //     if (mat) {
    //       if (mat.map) mat.map.encoding = THREE.sRGBEncoding;
    //       if (mat.emissiveMap) mat.emissiveMap.encoding = THREE.sRGBEncoding;
    //       if (typeof mat.metalness === "number") mat.metalness = Math.min(1, mat.metalness + 0.02);
    //       if (typeof mat.roughness === "number") mat.roughness = Math.max(0.08, mat.roughness - 0.03);
    //       if (mat.envMapIntensity === undefined) mat.envMapIntensity = 1.0;
    //       mat.needsUpdate = true;
    //     }
    //   }
    // });

    // position camera to front face and look at the model center

    const liftDown = 2.5; // increase this value to move it lower
    scene.position.y -= liftDown;

    const camY = size.y * 0.7;
    const camZ = Math.max(size.x, size.z) * 0.8 + 0.5;
    camera.position.set(-camZ, camY -5, 0);
    camera.lookAt(0, size.y * 0.60, 0);
    camera.updateProjectionMatrix();

  }, [scene, camera, desiredSize]);

  return null;
}


