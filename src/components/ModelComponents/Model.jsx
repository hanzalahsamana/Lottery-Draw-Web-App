import { useAnimations } from "@react-three/drei";
import { forwardRef, useEffect, useRef } from "react";
import { FitAndPrepareModel } from "./FitAndPrepareModel";
import SpinningBalls from "./SpinningBalls";
import * as THREE from "three";
import { useSharedModels } from "../../hooks/useSharedModels";

const Model = forwardRef(({ playSequence = [] }, ref) => {
  const animationRef = useRef();
  const { machine, ball } = useSharedModels();
  const { scene, animations } = machine;
  const { actions } = useAnimations(animations, animationRef);

  const texture = new THREE.TextureLoader().load(`/Compelet_Machine_Model_Textures/Ball_Model_Textures/${51}.png`);
  // texture.encoding = THREE.sRGBEncoding;
  // texture.anisotropy = 100;


  const getMirrorMaterial = (oldMat, isBackground) =>
    new THREE.MeshPhysicalMaterial({
      ...oldMat,
      map: oldMat.map,
      normalMap: oldMat.normalMap,
      roughnessMap: oldMat.roughnessMap,
      metalnessMap: oldMat.metalnessMap,
      envMap: oldMat.envMap,
      roughness: 0,
      color: 0xdadada,
      metalness: 1.5,
      opacity: isBackground ? 0.1 : 0.3,
      ior: 1.4,
    });

  useEffect(() => {
    if (!scene) return;

    scene.traverse((node) => {
      if (node.isMesh && (node.name === "Glass_Mdl_01002" || node.name === "Glass_Mdl_01")) {
        node.material = getMirrorMaterial(node.material, node.name === "Glass_Mdl_01");
      }
    });

    const animNames = Object.keys(actions || {});
    if (animNames.length && playSequence.length === 0) {
      actions[animNames[0]]?.reset()?.play();
    }
  }, [scene, actions, playSequence]);

  return (
    <group ref={animationRef} dispose={null}>
      <primitive object={scene} />
      <FitAndPrepareModel gltfScene={scene} desiredSize={40} />
      <SpinningBalls
        ballScale={1}
        count={51}
        scene={scene}
        ballScene={ball.scene}
        ballTexture={texture} // reuse
        ref={ref}
      />
    </group>
  );
});

export default Model;
