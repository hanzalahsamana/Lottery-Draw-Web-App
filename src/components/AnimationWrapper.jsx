import React from 'react'
import { motion } from 'framer-motion';

const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 1.5, ease: "easeInOut" }
    }
};
const AnimationWrapper = ({ children, className }) => {
    return (
        <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className={`${className}`}
        >
            {children}
        </motion.div>
    )
}

export default AnimationWrapper