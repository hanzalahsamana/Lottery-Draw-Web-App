// src/components/DrawList.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DrawList({ draws }) {
  return (
    <div style={{ display:'flex', gap:12, alignItems:'flex-start', flexDirection:'column' }}>
      <AnimatePresence initial={false}>
        {draws.map(draw => (
          <motion.div
            key={draw.draw_no || draw.timestamp}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.35 }}
            style={{ padding: 12, borderRadius: 8, background: '#f7f7f7', minWidth: 320 }}
          >
            <div style={{ fontSize: 12, color: '#444' }}>
              <strong>Draw</strong>: {draw.draw_no} &nbsp; <small>{new Date(draw.timestamp).toLocaleString()}</small>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
              {(draw.presentResultString && draw.presentResultString.length ? draw.presentResultString : (draw.resultNo ? [draw.resultNo] : [])).map((r,i) => (
                <div key={i} style={{
                  width:36, height:36, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700,
                  boxShadow:'0 2px 6px rgba(0,0,0,0.12)'
                }}>
                  {r}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
