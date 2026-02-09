import { useAnimations } from "@react-three/drei";
import { forwardRef, useEffect, useMemo, useRef } from "react";
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
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 100;

  const textures = useMemo(() => {
    const texArr = [];
    for (let i = 1; i <= 50; i++) {
      const no = i;
      const tex = new THREE.TextureLoader().load(`/Compelet_Machine_Model_Textures/Ball_Model_Textures/${no}.png`);
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = 100;
      texArr.push(tex);
    }
    return texArr;
  }, []);


  const getMirrorMaterial = (oldMat, isBackground) => {
    // 1. Create the new material
    const newMat = new THREE.MeshPhysicalMaterial();

    // 2. Copy properties from the old material safely
    newMat.copy(oldMat);

    // 3. Override specific properties for the mirror effect
    // newMat.color.set(0xffffff);
    // newMat.metalness = isBackground ? 1 : 4; // Note: metalness max is usually 1
    // newMat.opacity = isBackground ? 0.1 : 1;
    // newMat.transparent = true; // Ensure transparency is on if opacity < 1
    // newMat.ior = 1;
    // newMat.roughness = 0; // Essential for a mirror effect

    return newMat;
  };


  useEffect(() => {
    console.log("🚀 ~ scene:", scene)
    if (!scene) return;

    // scene.traverse((node) => {
    //   if (node.isMesh && (node.name === "pipe" || node.name === "Glass_Bowl" || node.name === "Glass_Mdl_01")) {
    //     node.material = getMirrorMaterial(node.material, node.name === "pipe");
    //   }
    // });
    scene.traverse((node) => {
      if (node.isMesh && /^Ball_\d+$/.test(node.name)) {
        console.log("🚀 ~ node:", node)
        // node.parent.remove(node);
        node.visible = false;
        // if (node.parent) node.parent.remove(node);
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
      <FitAndPrepareModel gltfScene={scene} desiredSize={100} />
      <SpinningBalls
        ballScale={1}
        count={51}
        scene={scene}
        ballScene={ball.scene}
        ballTexture={texture}
        ballTextures={textures}
        ref={ref}
      />
    </group>
  );
});

export default Model;
