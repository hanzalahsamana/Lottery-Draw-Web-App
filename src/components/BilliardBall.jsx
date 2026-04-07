import React from "react";

const getBallColor = (ballNo) => {
    const num = Number(ballNo);
    if ([1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96].includes(num)) return 'red';
    if ([2, 7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57, 62, 67, 72, 77, 82, 87, 92, 97].includes(num)) return 'yellow';
    if ([3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58, 63, 68, 73, 78, 83, 88, 93, 98].includes(num)) return 'green';
    if ([4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69, 74, 79, 84, 89, 94, 99].includes(num)) return 'blue';
    if ([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].includes(num)) return 'orange';
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
