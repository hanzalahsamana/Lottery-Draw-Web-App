import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { FitAndPrepareModel } from "./FitAndPrepareModel";
import { SpinningBalls } from "./SpinningBalls";

const Model = ({ machineUrl, ballUrl, playSequence = [] }) => {
  const ref = useRef();
  const { scene, animations } = useGLTF(machineUrl);
  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    if (!scene) return;
    const names = Object.keys(actions || {});

    if (names.length && playSequence.length === 0) {
      actions[names[0]]?.reset()?.play();
    }

  }, [scene, actions, playSequence]);

  return (
    <group ref={ref} dispose={null}>
      <primitive object={scene} />
      <FitAndPrepareModel gltfScene={scene} desiredSize={40} />
      <SpinningBalls ballUrl={ballUrl} ballScale={1} count={40} scene={scene} />
    </group>
  );
}

export default Model;