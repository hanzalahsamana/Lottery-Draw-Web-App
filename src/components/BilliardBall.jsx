import React from "react";

const getBallColor = (ballNo) => {
    const num = Number(ballNo);
    if ([1, 6, 11, 16, 21, 26, 31, 36, 41, 46].includes(num)) return 'red';
    if ([2, 7, 12, 17, 22, 27, 32, 37, 42, 47].includes(num)) return 'yellow';
    if ([3, 8, 13, 18, 23, 28, 33, 38, 43, 48].includes(num)) return 'green';
    if ([4, 9, 14, 19, 24, 29, 34, 39, 44, 49].includes(num)) return 'blue';
    if ([5, 10, 15, 20, 25, 30, 35, 40, 45, 50].includes(num)) return 'orange';
    return 'purple'; // fallback
};

const BilliardBall = ({ ballNo, className }) => {
    const color = getBallColor(ballNo);

    return (
        <div
            className={`billiard-ball w-[28px] h-[28px]  2xl:w-[32px] 2xl:h-[32px] rounded-full flex justify-center items-center ${className}`}
            data-snooker={color}
        >
            <div className="w-[14px] h-[14px] 2xl:w-[16px] 2xl:h-[16px] bg-white rounded-full  flex items-center justify-center">
                <p className="!text-[10px]/[10px] h-[10px] text-black font-bold">{ballNo}</p>
            </div>
        </div>
    );
};

export default BilliardBall;
