import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Model from "./Model";
import { announceNumbers } from "../../hooks/ttsAnnouncer";

const ModelRenderer = ({ secondsLeft }) => {
    const [isActive, setIsActive] = useState(false);
    const triggeredRef = useRef(false);

    // useEffect(() => {
    //     if (secondsLeft === 0 && !triggeredRef.current) {
    //         triggeredRef.current = true;
    //         setIsActive(true);
    //         announceNumbers([2, 3, 4, 5, 6, 7]);

    //         const timer = setTimeout(() => {
    //             setIsActive(false);
    //             triggeredRef.current = false;
    //         }, 10000);

    //     }
    // }, [secondsLeft]);
    // ${isActive ? "bg-[#ffffff29] backdrop-blur-sm scale-[3.5] " : "scale-100 backdrop-blur-none bg-transparent "}
    return (
        <div className={`w-100 h-150 relative flex items-start justify-start transition-all duration-[1.5s] z-1000 origin-[90%_60%] `}>
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ fov: 50 }}
                onCreated={({ gl }) => {
                    gl.outputEncoding = THREE.sRGBEncoding;
                    gl.toneMapping = THREE.ACESFilmicToneMapping;
                    gl.toneMappingExposure = 1.2;
                    gl.physicallyCorrectLights = true;
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <Suspense fallback={null}>
                    <Environment preset="studio" background={false} intensity={1.0} />
                    <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
                    <ambientLight intensity={0.12} />
                    <Model />
                    <ContactShadows position={[0, -0.05, 0]} opacity={0.6} width={4} blur={2.5} far={1.5} />
                    {/* <OrbitControls/> */}
                </Suspense>
            </Canvas>
        </div>
    );
};

export default ModelRenderer;