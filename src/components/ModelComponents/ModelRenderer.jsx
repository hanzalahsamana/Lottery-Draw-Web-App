import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { forwardRef, Suspense } from "react";
import * as THREE from "three";
import Model from "./Model";

const ModelRenderer = forwardRef(({ secondsLeft }, ref) => {
    return (
        <div className={`w-[300px] h-[500px] md:w-[400px] md:h-[600px] 2xl:h-[700px] md:-mt-[50px] relative flex items-start justify-start transition-all duration-[1.5s] z-1000 origin-[90%_60%] `}>
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ fov: 55 }}
                onCreated={({ gl }) => {
                    gl.outputEncoding = THREE.sRGBEncoding;
                    gl.toneMapping = THREE.ACESFilmicToneMapping;
                    gl.toneMappingExposure = 0.4;
                    gl.physicallyCorrectLights = true;
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <Suspense fallback={null}>
                    <Environment preset="studio" background={false} intensity={1.0} />
                    <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
                    <ambientLight intensity={0.12} />
                    <Model ref={ref} />
                    <ContactShadows position={[0, -0.05, 0]} opacity={0.6} width={4} blur={2.5} far={1.5} />
                    {/* <OrbitControls/> */}
                </Suspense>
            </Canvas>
        </div>
    );
});

export default ModelRenderer;