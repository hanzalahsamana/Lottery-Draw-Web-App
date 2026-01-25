import React from "react";


const BilliardBall = ({ ballNo, color = 'purple', className }) => {

    return (
        <div
            className={`billiard-ball w-[28px] h-[28px] rounded-full flex justify-center items-center ${className}`}
            data-snooker={color}
        >
            <div className="w-[14px] h-[14px] bg-white rounded-full text-black flex items-center justify-center font-bold">
                <p className="!text-[9px]/[10px] h-[10px]">
                    {ballNo}
                </p>
            </div>
        </div>
    );
};

export default BilliardBall;
