import { ContactShadows, Environment, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import Model from "./Model";

const MACHINE_URL = "/Compelet_Machine_Model_Textures/Machine_Model_Textures/Lottery Simulator6.glb";
const Ball_URL = "/Compelet_Machine_Model_Textures/Ball_Model_Textures/Ball_Mdl_001.glb";

const ModelRenderer = ({ playSequence = [] }) => {

    return (
        <div className="w-[400px] h-[600px] flex items-start justify-start">
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ fov: 50 }}
                onCreated={({ gl }) => { gl.outputEncoding = THREE.sRGBEncoding; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.2; gl.physicallyCorrectLights = true; }}
                style={{ width: "100%", height: "100%" }}
            >
                <Suspense fallback={null}>
                    <Environment preset="studio" background={false} intensity={1.0} />
                    <directionalLight position={[5, 8, 5]} intensity={1.2} castShadowshadow-mapSize-width={2048} shadow-mapSize-height={2048} />
                    <ambientLight intensity={0.12} />
                    <Model machineUrl={MACHINE_URL} ballUrl={Ball_URL} playSequence={playSequence} />
                    <ContactShadows position={[0, -0.05, 0]} opacity={0.6} width={4} blur={2.5} far={1.5} />
                </Suspense>

            </Canvas>
        </div>
    );
}
export default ModelRenderer;

useGLTF.preload(MACHINE_URL);
useGLTF.preload(Ball_URL);
