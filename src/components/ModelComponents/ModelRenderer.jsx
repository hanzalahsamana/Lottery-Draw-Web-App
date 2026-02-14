import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { forwardRef, Suspense } from "react";
import * as THREE from "three";
import Model from "./Model";

const ModelRenderer = forwardRef(({ secondsLeft, ballCount, openingDraw }, ref) => {
    return (
        <div className={`w-[300px] h-[500px] md:w-[400px] md:h-[700px] 2xl:h-[700px] overflow-visible ${openingDraw ? 'scale-120 fixed origin-top top-0 left-1/2 -translate-x-1/2 md:-mt-[50px] ' : 'relative scale-100 translate-0 md:-mt-[50px] '}  flex items-start justify-start transition-all duration-[1s] z-1000 `}>
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ fov: 50, near: 0.01, far: 1000 }}
                onCreated={({ gl, scene }) => {
                    gl.outputEncoding = THREE.SRGBColorSpace;
                    gl.toneMapping = THREE.LinearToneMapping;
                    gl.toneMappingExposure = 1;
                    gl.physicallyCorrectLights = true;
                    scene.fog = new THREE.Fog(0x000000, 0.10, 10000);
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <Suspense fallback={null}>
                    {/* <JPEGEnvironment url="/images/my-room.jpg" /> */}
                    <Environment preset={'city'} environmentIntensity={2} background={false} intensity={1} />
                    {/* <directionalLight position={[22, 30, 88]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} /> */}
                    <ambientLight intensity={1} />
                    <Model ref={ref} ballCount={ballCount} />
                    <ContactShadows position={[0, 0.05, 0]} opacity={1} width={40} blur={2.5} far={1.5} />
                    {/* <OrbitControls /> */}
                </Suspense>
            </Canvas>
        </div>
    );
});

export default ModelRenderer;