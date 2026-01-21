import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { FitAndPrepareModel } from "./FitAndPrepareModel";
import { SpinningBalls } from "./SpinningBalls";
import * as THREE from "three";

const Model = ({ machineUrl, ballUrl, playSequence = [] }) => {
  const ref = useRef();
  const { scene, animations } = useGLTF(machineUrl);
  const { actions } = useAnimations(animations, ref);

  const texture = new THREE.TextureLoader().load(`/Compelet_Machine_Model_Textures/Ball_Model_Textures/${51}.png`);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 16;

  const GetMirrorMaterial = (oldMat, isbackground) => {
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      ...oldMat,
      map: oldMat.map,
      normalMap: oldMat.normalMap,
      roughnessMap: oldMat.roughnessMap,
      metalnessMap: oldMat.metalnessMap,
      envMap: oldMat.envMap,
      transmissionMap: 1,
      roughness: 0,
      color: 0xdadada,
      metalness: 1.5,
      opacity: isbackground ? 0.1 : 0.3,
      ior: 1.4,
    });
    return glassMaterial
  }

  useEffect(() => {
    if (!scene) return;
    scene.traverse((node) => {
      if (node.isMesh && (node.name === 'Glass_Mdl_01002' || node.name === 'Glass_Mdl_01')) {
        const oldMat = node.material;
        node.material = GetMirrorMaterial(oldMat, node.name === 'Glass_Mdl_01');
      }
    });


    const names = Object.keys(actions || {});

    if (names.length && playSequence.length === 0) {
      actions[names[0]]?.reset()?.play();
    }

  }, [scene, actions, playSequence]);

  return (
    <group ref={ref} dispose={null}>
      <primitive object={scene} />
      <FitAndPrepareModel gltfScene={scene} desiredSize={40} />
      <SpinningBalls ballUrl={ballUrl} ballScale={1} count={40} scene={scene} ballTexture={texture} />
    </group>
  );
}

export default Model;