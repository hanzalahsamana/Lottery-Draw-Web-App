import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export const FitAndPrepareModel = ({ gltfScene }) => {
  const scene = gltfScene;
  const { camera } = useThree();

  useEffect(() => {
    if (!scene) return;

    const bbox = new THREE.Box3().setFromObject(scene);
    const size = bbox.getSize(new THREE.Vector3());

    const liftDown = 2.4; // increase this value to move it lower
    scene.position.y -= liftDown;

    camera.position.set(-6.55, 0.395, 0.300);
    // camera.rotation.set(7, 87, 7);
    camera.lookAt(1, 0, 0);
    camera.updateProjectionMatrix();

  }, [scene, camera]);

  return null;
}


