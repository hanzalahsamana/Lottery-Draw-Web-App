import { useAnimations } from "@react-three/drei";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import { FitAndPrepareModel } from "./FitAndPrepareModel";
import SpinningBalls from "./SpinningBalls";
import * as THREE from "three";
import { useSharedModels } from "../../hooks/useSharedModels";

const Model = forwardRef(({ playSequence = [], ballCount }, ref) => {
  const animationRef = useRef();
  const modelRef = useRef(); // for mouse tilt
  const mouse = useRef({ x: 0, y: 0 });

  const { machine, ball } = useSharedModels();
  const { scene, animations } = machine;
  const { actions } = useAnimations(animations, animationRef);

  const texture = new THREE.TextureLoader().load(`/Compelet_Machine_Model_Textures/Ball_Model_Textures/${51}.png`);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 100;

  const textures = useMemo(() => {
    const texArr = [];
    for (let i = 1; i <= 30; i++) {
      const tex = new THREE.TextureLoader().load(`/Compelet_Machine_Model_Textures/Ball_Model_Textures/${i}.png`);
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = 100;
      texArr.push(tex);
    }
    return texArr;
  }, []);

  const fakeEnv = new THREE.TextureLoader().load('/environment.jpeg');
  fakeEnv.mapping = THREE.EquirectangularReflectionMapping;

  const getMirrorMaterial = (oldMat) => {
    const newMat = new THREE.MeshPhysicalMaterial();
    newMat.copy(oldMat);
    newMat.roughness = 1.5;
    return newMat;
  };

  // Mouse tracking
  useEffect(() => {
    const handleMouse = (e) => {
      const { innerWidth, innerHeight } = window;
      mouse.current.x = (e.clientX / innerWidth) * 2 - 1; // -1 to 1
      mouse.current.y = (e.clientY / innerHeight) * 2 - 1; // -1 to 1
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // Apply tilt every frame
  useEffect(() => {
    if (!modelRef.current) return;
    const tick = () => {
      if (!modelRef.current) return;

      const targetRotY = mouse.current.x * 0.20;
      const targetPosY = mouse.current.x * 0.20;

      const targetRotX = mouse.current.y * 0.20;
      const targetPosX = mouse.current.y * 0.20;


      modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, targetRotY, 0.05);
      modelRef.current.position.x = THREE.MathUtils.lerp(modelRef.current.position.x, targetPosY, 0.05);
      modelRef.current.rotation.z = THREE.MathUtils.lerp(modelRef.current.rotation.z, targetRotX, 0.05);
      modelRef.current.position.z = THREE.MathUtils.lerp(modelRef.current.position.z, targetPosX, 0.05);


      requestAnimationFrame(tick);
    };
    tick();
  }, []);

  useEffect(() => {
    if (!scene) return;

    scene.traverse((node) => {
      if (node.isMesh && node.name === "Line001") {
        node.material = getMirrorMaterial(node.material);
      }
    });

    const animNames = Object.keys(actions || {});
    if (animNames.length && playSequence.length === 0) {
      actions[animNames[0]]?.reset()?.play();
    }
  }, [scene, actions, playSequence]);

  return (
    <group ref={animationRef} dispose={null}>
      <group ref={modelRef}>
        <primitive object={scene} />
        <FitAndPrepareModel gltfScene={scene} />
        <SpinningBalls
          ballScale={1}
          count={ballCount}
          scene={scene}
          ballScene={ball.scene}
          ballTexture={texture}
          ballTextures={textures}
          ref={ref}
        />
      </group>
    </group>
  );
});

export default Model;
