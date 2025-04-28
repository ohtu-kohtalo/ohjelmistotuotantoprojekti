import { motion } from "framer-motion";

const PageTransition = ({ children }) => (
  <motion.div
    className="w-full h-full"
    initial={{ opacity: 0, y: 20 }} // fade in + slide up
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }} // fade out + slide up
    transition={{ duration: 0.45, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
