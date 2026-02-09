import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/Lottery_Simulator12.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Glass_Mdl_BG.geometry} material={materials.Glass} position={[0.591, 3.033, 0.148]} rotation={[-3.14, 0, 0]} />
      <mesh geometry={nodes.Glass_Bowl.geometry} material={materials.Glass} position={[-0.027, 3.419, 0.715]} rotation={[Math.PI / 2, 0, Math.PI / 2]} scale={0.025} />
      <mesh geometry={nodes.Circle001.geometry} material={materials.Body} position={[0.64, 3.142, 0.321]} rotation={[0.869, 0, Math.PI / 2]} scale={[0.02, 0.02, 0.018]} />
      <mesh geometry={nodes.Pipe.geometry} material={materials.Glass} position={[-0.027, 3.419, 0.715]} rotation={[Math.PI / 2, 0, Math.PI / 2]} scale={0.025} />
      <mesh geometry={nodes.Ball_9.geometry} material={materials['9.001']} position={[0.068, 2.106, -0.073]} rotation={[-2.742, -0.124, -0.08]} />
      <mesh geometry={nodes.Ball_7.geometry} material={materials['7.001']} position={[-0.583, 2.445, -0.008]} rotation={[-0.342, 0.441, -2.5]} />
      <mesh geometry={nodes.Ball_60.geometry} material={materials['60.001']} position={[0.185, 2.274, 0.097]} rotation={[1.63, 0.098, 1.737]} />
      <mesh geometry={nodes.Ball_6.geometry} material={materials['6.001']} position={[-0.423, 2.291, 0.235]} rotation={[1.872, 0.738, -0.453]} />
      <mesh geometry={nodes.Ball_59.geometry} material={materials['59.001']} position={[0.269, 2.3, -0.086]} rotation={[2.156, 0.627, 3.112]} />
      <mesh geometry={nodes.Ball_58.geometry} material={materials['58.001']} position={[0.516, 2.23, -0.201]} rotation={[-0.799, 1.058, -3.064]} />
      <mesh geometry={nodes.Ball_57.geometry} material={materials['57.001']} position={[0.381, 2.26, -0.309]} rotation={[-2.238, -0.9, -2.532]} />
      <mesh geometry={nodes.Ball_56.geometry} material={materials['56.001']} position={[0.407, 2.276, 0.291]} rotation={[2.532, 0.561, -1.835]} />
      <mesh geometry={nodes.Ball_54.geometry} material={materials['54.001']} position={[0.538, 2.299, 0.376]} rotation={[-2.99, 0.871, 1.242]} />
      <mesh geometry={nodes.Ball_53.geometry} material={materials['53.001']} position={[0.283, 2.334, 0.206]} rotation={[-1.277, -0.305, 1.336]} />
      <mesh geometry={nodes.Ball_52.geometry} material={materials['52.001']} position={[0.563, 2.348, -0.108]} rotation={[-2.614, -0.865, 0.743]} />
      <mesh geometry={nodes.Ball_51.geometry} material={materials['51.001']} position={[0.124, 2.253, -0.046]} rotation={[-2.024, -0.629, -1.584]} />
      <mesh geometry={nodes.Ball_5.geometry} material={materials['5.001']} position={[-0.247, 2.176, 0.04]} rotation={[-1.087, -0.372, -1.09]} />
      <mesh geometry={nodes.Ball_49.geometry} material={materials['49.001']} position={[-0.072, 2.201, -0.339]} rotation={[2.028, 0.974, -1.203]} />
      <mesh geometry={nodes.Ball_48.geometry} material={materials['48.001']} position={[0.113, 2.195, 0.339]} rotation={[0.544, -1.008, 1.561]} />
      <mesh geometry={nodes.Ball_47.geometry} material={materials['47.001']} position={[-0.037, 2.245, 0.352]} rotation={[-2.516, -0.585, 0.002]} />
      <mesh geometry={nodes.Ball_46.geometry} material={materials['46.001']} position={[0.087, 2.294, 0.218]} rotation={[-2.769, 0.031, 1.522]} />
      <mesh geometry={nodes.Ball_45.geometry} material={materials['45.001']} position={[0.432, 2.357, 0.157]} rotation={[2.047, -0.479, 1.244]} />
      <mesh geometry={nodes.Ball_44.geometry} material={materials['44.001']} position={[-0.032, 2.269, -0.071]} rotation={[-2.236, -0.909, -0.257]} />
      <mesh geometry={nodes.Ball_43.geometry} material={materials['43.001']} position={[-0.063, 2.148, -0.19]} rotation={[3.117, -1.049, 1.058]} />
      <mesh geometry={nodes.Ball_42.geometry} material={materials['42.001']} position={[-0.106, 2.328, -0.197]} rotation={[0.088, -0.872, 1.248]} />
      <mesh geometry={nodes.Ball_41.geometry} material={materials['41.001']} position={[0.229, 2.25, -0.415]} rotation={[-2.864, -0.745, -0.188]} />
      <mesh geometry={nodes.Ball_40.geometry} material={materials['40.001']} position={[0.265, 2.207, 0.298]} rotation={[1.446, -0.688, -0.742]} />
      <mesh geometry={nodes.Ball_4.geometry} material={materials['4.001']} position={[-0.401, 2.42, -0.143]} rotation={[-2.198, 0.308, -1.827]} />
      <mesh geometry={nodes.Ball_39.geometry} material={materials['39.001']} position={[0, 2.153, 0.23]} rotation={[-0.933, -1.093, -0.654]} />
      <mesh geometry={nodes.Ball_38.geometry} material={materials['38.001']} position={[-0.295, 2.213, 0.186]} rotation={[-0.428, 0.735, -2.794]} />
      <mesh geometry={nodes.Ball_37.geometry} material={materials['37.001']} position={[-0.118, 2.304, 0.134]} rotation={[-0.213, 0.621, 2.65]} />
      <mesh geometry={nodes.Ball_35.geometry} material={materials['35.001']} position={[-0.183, 2.229, -0.094]} rotation={[-0.238, -1.24, 0.769]} />
      <mesh geometry={nodes.Ball_33.geometry} material={materials['33.001']} position={[0.085, 2.206, -0.368]} rotation={[1.618, -1.121, -2.051]} />
      <mesh geometry={nodes.Ball_32.geometry} material={materials['32.001']} position={[0.538, 2.231, 0.212]} rotation={[1.933, 0.065, 2.735]} />
      <mesh geometry={nodes.Ball_31.geometry} material={materials['31.001']} position={[0.563, 2.317, 0.079]} rotation={[-0.953, -0.494, 0.737]} />
      <mesh geometry={nodes.Ball_30.geometry} material={materials['30.001']} position={[-0.119, 2.146, 0.126]} rotation={[0.672, 0.349, 1.175]} />
      <mesh geometry={nodes.Ball_3.geometry} material={materials['3.001']} position={[0.183, 2.129, 0.034]} rotation={[-2.029, -0.052, 2.622]} />
      <mesh geometry={nodes.Ball_29.geometry} material={materials['29.001']} position={[-0.171, 2.358, -0.005]} rotation={[2.452, -0.32, -3.084]} />
      <mesh geometry={nodes.Ball_28.geometry} material={materials['28.001']} position={[-0.318, 2.416, -0.009]} rotation={[-1.515, 0.077, -0.027]} />
      <mesh geometry={nodes.Ball_27.geometry} material={materials['27.001']} position={[0.538, 2.209, -0.04]} rotation={[2.988, -0.746, 2.672]} />
      <mesh geometry={nodes.Ball_26.geometry} material={materials['26.001']} position={[0.001, 2.338, -0.387]} rotation={[0.895, 1.149, 1.877]} />
      <mesh geometry={nodes.Ball_25.geometry} material={materials['25.001']} position={[-0.259, 2.35, -0.166]} rotation={[2.017, 0.597, 2.453]} />
      <mesh geometry={nodes.Ball_24.geometry} material={materials['24.001']} position={[-0.288, 2.261, 0.339]} rotation={[0.78, 0.374, 1.279]} />
      <mesh geometry={nodes.Ball_21.geometry} material={materials['21.001']} position={[-0.267, 2.358, 0.129]} rotation={[-0.222, 0.566, 0.617]} />
      <mesh geometry={nodes.Ball_20.geometry} material={materials['20.001']} position={[0.418, 2.312, -0.035]} rotation={[-0.605, 0.164, -0.997]} />
      <mesh geometry={nodes.Ball_2.geometry} material={materials['2.001']} position={[0.032, 2.114, 0.08]} rotation={[1.755, -0.725, -2.306]} />
      <mesh geometry={nodes.Ball_19.geometry} material={materials['19.001']} position={[0.327, 2.173, -0.012]} rotation={[1.787, 0.493, -0.351]} />
      <mesh geometry={nodes.Ball_18.geometry} material={materials['18.001']} position={[0.362, 2.2, -0.164]} rotation={[3.016, 0.413, -1.685]} />
      <mesh geometry={nodes.Ball_17.geometry} material={materials['17.001']} position={[0.094, 2.151, -0.221]} rotation={[-0.28, -0.208, -1.537]} />
      <mesh geometry={nodes.Ball_16.geometry} material={materials['16.001']} position={[0.443, 2.215, 0.087]} rotation={[3.085, 0.503, -2.042]} />
      <mesh geometry={nodes.Ball_13.geometry} material={materials['13.001']} position={[0.301, 2.177, 0.146]} rotation={[3.004, 0.015, 1.331]} />
      <mesh geometry={nodes.Ball_12.geometry} material={materials['12.001']} position={[-0.477, 2.332, -0.036]} rotation={[0.58, 0.475, -2.38]} />
      <mesh geometry={nodes.Ball_11.geometry} material={materials['11.001']} position={[-0.335, 2.262, -0.06]} rotation={[2.87, 0.404, 2.025]} />
      <mesh geometry={nodes.Ball_1.geometry} material={materials['1.001']} position={[-0.083, 2.127, -0.027]} rotation={[-3.027, -0.418, -0.115]} />
    </group>
  )
}

useGLTF.preload('/Lottery_Simulator12.glb')
