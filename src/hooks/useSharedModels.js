import { useGLTF } from '@react-three/drei';

const MACHINE_URL = '/Compelet_Machine_Model_Textures/Machine_Model_Textures/Lottery Simulator6.glb';
const BALL_URL = '/Compelet_Machine_Model_Textures/Ball_Model_Textures/Ball_Mdl_001.glb';

// global cache
let machineCache = null;
let ballCache = null;

export function useSharedModels() {
  if (!machineCache) machineCache = useGLTF(MACHINE_URL);
  if (!ballCache) ballCache = useGLTF(BALL_URL);
  return { machine: machineCache, ball: ballCache };
}

// optional preload
useGLTF.preload(MACHINE_URL);
useGLTF.preload(BALL_URL);
