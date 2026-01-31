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
    for (let i = 1; i <= 5; i++) {
      const no = i;
      const tex = new THREE.TextureLoader().load(`/Compelet_Machine_Model_Textures/Ball_Model_Textures/${no}.png`);
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = 100;
      texArr.push(tex);
    }
    return texArr;
  }, []);


  const addBorderToMesh = (mesh) => {
    const borderMaterial = new THREE.MeshBasicMaterial({
      color: 0x0066ff,
      side: THREE.BackSide,
      transparent: true,
      opacity: 1,
    });

    const borderMesh = new THREE.Mesh(mesh.geometry, borderMaterial);

    borderMesh.position.copy(mesh.position);
    borderMesh.rotation.copy(mesh.rotation);
    borderMesh.scale.copy(mesh.scale).multiplyScalar(1.03); // border thickness

    borderMesh.renderOrder = -1; // render behind
    mesh.parent.add(borderMesh);
  };
  const getMirrorMaterial = (oldMat, isBackground) => {
    // 1. Create the new material
    const newMat = new THREE.MeshPhysicalMaterial();

    // 2. Copy properties from the old material safely
    newMat.copy(oldMat);

    // 3. Override specific properties for the mirror effect
    newMat.color.set(0xffffff);
    newMat.metalness = isBackground ? 1 : 4; // Note: metalness max is usually 1
    newMat.opacity = isBackground ? 0.1 : 0.07;
    newMat.transparent = true; // Ensure transparency is on if opacity < 1
    newMat.ior = 1;
    newMat.roughness = 0; // Essential for a mirror effect

    return newMat;
  };


  useEffect(() => {
    if (!scene) return;

    scene.traverse((node) => {
      if (node.isMesh && (node.name === "pipe" || node.name === "Glass_Mdl_01006" || node.name === "Glass_Mdl_01")) {
        node.material = getMirrorMaterial(node.material, node.name === "pipe");
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
