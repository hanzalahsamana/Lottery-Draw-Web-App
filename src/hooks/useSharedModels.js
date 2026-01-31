import { useGLTF } from '@react-three/drei';
import { BALL_URL, MACHINE_URL } from '../constants/constant';

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
