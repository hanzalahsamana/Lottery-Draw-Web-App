import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { responseCodeList } from '../constants/constant';

const ErrorPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const errorCode = searchParams.get('errorcode');

    const matchedError = responseCodeList.find(
        (item) => String(item.responseCode) === String(errorCode)
    );

    const errorMessage = matchedError?.message || 'Unknown error';
    const displayCode = matchedError?.responseCode || errorCode || 'N/A';

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-3xl bg-linear-to-b from-[#0b1220] to-[#071124]/60 shadow-2xl border-2 border-[#6b728d75] p-8 text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-600/15">
                    <svg
                        className="h-10 w-10 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01M10.29 3.86l-7.42 12.84A2 2 0 004.6 20h14.8a2 2 0 001.73-3.3L13.71 3.86a2 2 0 00-3.42 0z"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-white">Something went wrong</h1>
                <p className="mt-1 text-sm text-slate-300">
                    The server returned an error response.
                </p>

                <div className="mt-6 rounded-2xl bg-[#270C53]/30 p-4 text-left">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Error Code
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-100">{displayCode}</p>

                    <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                        Message
                    </p>
                    <p className="mt-1 text-base text-slate-100">{errorMessage}</p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-linear-to-b cursor-pointer hover:opacity-85 text-center flex items-center justify-center from-[#3c049d] to-[#2b0370] text-white px-4 h-11 rounded-md text-lg flex gap-2 w-full items-center"
                    >
                        Go Back
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ErrorPage;