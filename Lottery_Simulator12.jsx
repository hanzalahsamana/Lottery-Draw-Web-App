import { useGLTF } from "@react-three/drei"
import { MACHINE_URL } from "./src/constants/constant"

export function Model(props) {
  const { nodes, materials } = useGLTF(MACHINE_URL)

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Glass_Mdl_BG.geometry}
        material={materials.Glass}
        position={[0.591, 3.033, 0.148]}
        rotation={[-Math.PI, 0, 0]}
      />

      <mesh
        geometry={nodes.Glass_Bowl.geometry}
        material={materials.Glass}
        position={[-0.027, 3.419, 0.715]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        scale={0.025}
      />

      <mesh
        geometry={nodes.Circle001.geometry}
        material={materials.Body}
        position={[0.64, 3.142, 0.321]}
        rotation={[0.869, 0, Math.PI / 2]}
        scale={[0.02, 0.02, 0.018]}
      />

      <mesh
        geometry={nodes.Pipe.geometry}
        material={materials.Glass}
        position={[-0.027, 3.419, 0.715]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        scale={0.025}
      />

      <mesh
        geometry={nodes.Ball_1.geometry}
        material={materials['1.001']}
        position={[-0.083, 2.127, -0.027]}
        rotation={[-3.027, -0.418, -0.115]}
      />
    </group>
  )
}
