export const MACHINE_URL = '/Compelet_Machine_Model_Textures/Machine_Model_Textures/Lottery_Simulator13.glb';
export const BALL_URL = '/Compelet_Machine_Model_Textures/Ball_Model_Textures/Ball_Mdl_001.glb';

export const MGPE_URL = import.meta.env.VITE_REACT_APP_MGPE;
export const MGPE_TOKEN = import.meta.env.VITE_REACT_APP_MGPE_AUTH_TOKEN;
export const RABBIT_WS = import.meta.env.VITE_REACT_APP_RABBITMQ_WS;
export const RABBIT_TOPIC = import.meta.env.VITE_REACT_APP_RABBITMQ_STOMP_TOPIC;
export const RABBIT_USER = import.meta.env.VITE_REACT_APP_RABBITMQ_USER;
export const RABBIT_PASS = import.meta.env.VITE_REACT_APP_RABBITMQ_PASS;
export const RABBIT_HOST = import.meta.env.VITE_REACT_APP_RABBITMQ_HOST;
export const PROTO_PATH = ['/protos/GameResult.proto', '/protos/GameEnquery.proto'];

export const Control_Ball_Index = 0;

// pipeCenterPath.js
import * as THREE from 'three';

export const PIPE_CENTER_POINTS = [
  new THREE.Vector3(-0.091, 1.0132, -0.0703),
  new THREE.Vector3(-0.091, 1.1532, -0.0653),
  new THREE.Vector3(-0.091, 1.2832, 0.0053),
  new THREE.Vector3(-0.091, 1.2932, 0.2053),
  new THREE.Vector3(-0.0976, 1.1727, 0.4697),
  new THREE.Vector3(-0.0976, 0.9027, 0.7497),
  new THREE.Vector3(-0.1309, 0.6354, 0.9376),
  new THREE.Vector3(-0.2031, 0.3203, 1.0593),
  new THREE.Vector3(-0.249, -0.0045, 1.0933),
  new THREE.Vector3(-0.2885, -0.3296, 1.0901),
  new THREE.Vector3(-0.2536, -0.6566, 0.9736),
  new THREE.Vector3(-0.192, -0.9898, 0.7343),
  new THREE.Vector3(-0.1929, -1.269, 0.3407),
  new THREE.Vector3(-0.26, -1.4492, -0.1193),
  new THREE.Vector3(-0.2989, -1.5592, -0.5193),
  new THREE.Vector3(-0.3277, -1.6688, -0.9962),
];
