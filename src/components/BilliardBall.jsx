import React from "react";


const BilliardBall = ({ ballNo, color = 'purple' }) => {

    return (
        <div
            className="billiard-ball w-6.25 h-6.25 rounded-full flex justify-center items-center"
            data-snooker={color}
        >
            <div className="w-3.75 h-3.75 bg-white rounded-full text-black flex items-center justify-center text-[9px]/[6px] font-bold">
                {ballNo}
            </div>
        </div>
    );
};

export default BilliardBall;
