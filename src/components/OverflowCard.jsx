import React from "react";

export default function OverflowCard() {
    return (
        <>
            <div className="wrap">
                <div className="card">
                    {/* overflowing decorative shapes */}
                    <div className="shape shape-left" />
                    <div className="shape shape-right" />

                    <div className="content">
                        <div className="meta">Time left</div>
                        <div className="countdown">00:23:30:56</div>
                    </div>

                    {/* bottom dark strip like your screenshot */}
                    <div className="bottom-strip" />
                </div>
            </div>

            <style>{`
        .wrap{
          display:flex;
          justify-content:center;
          padding:40px;
          background: #0b0d12;
          min-height:240px;
        }

        .card{
          position:relative;
          width:900px;
          height:180px;
          border-radius:20px;
          background: linear-gradient(180deg, #232636 0%, #131318 100%);
          overflow: visible; /* IMPORTANT: allow children to overflow */
          box-shadow: 0 12px 30px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.04);
        }

        /* decorative "blobs" that overflow the card bounds */
        .shape{
          position:absolute;
          top:-48px;               /* negative to overflow above */
          width:420px;
          height:160px;
          border-radius:50%;
          z-index:0;
          filter: blur(16px);
          opacity:0.95;
          background: radial-gradient(circle at 20% 30%,
            rgba(255,110,200,0.18) 0%,
            rgba(124,58,237,0.18) 35%,
            rgba(0,0,0,0) 60%),
            linear-gradient(90deg, rgba(124,58,237,0.22), rgba(255,110,200,0.12));
        }

        .shape-left{ left:-80px; transform: rotate(-8deg) scale(1.02); }
        .shape-right{ right:-80px; transform: rotate(8deg) scale(1.02); }

        .content{
          position:relative; /* above the shapes */
          z-index:2;
          height:100%;
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          color:#fff;
          text-align:center;
          pointer-events:none;
        }

        .meta{
          font-size:13px;
          opacity:0.7;
          margin-bottom:6px;
        }

       

        /* the dark rounded bottom segment overlapping lower area */
        .bottom-strip{
          position:absolute;
          left:12px;
          right:12px;
          bottom:-36px; /* slightly below card */
          height:72px;
          border-radius:14px;
          background: linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.65));
          z-index:1;
          box-shadow: 0 8px 20px rgba(0,0,0,0.6);
        }

        /* responsive tweak */
        @media (max-width:980px){
          .card{ width:92%; }
          .shape{ width:320px; height:120px; top:-34px; filter: blur(12px); }
          .bottom-strip{ bottom:-28px; height:56px; }
          .countdown{ font-size:28px; }
        }
      `}</style>
        </>
    );
}
