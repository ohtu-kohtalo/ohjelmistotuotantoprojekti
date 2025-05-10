/**
 * @file PageTransition.jsx
 *
 * Thin wrapper around **framer-motion** that adds a smooth fade / slide
 * animation when a React component mounts and unmounts—useful for page-level
 * route transitions in a single-page app.
 *
 * Animation details
 * -----------------
 * `opacity: 0 → 1`, `y: 20px → 0` (slide up & fade in)
 * `opacity: 1 → 0`, `y: 0 → -20px` (slide up & fade out)
 * 0.45 s with `"easeInOut"` easing.
 *
 * Usage
 * -----
 * Wrap the content of each route:
 *
 * ```jsx
 * import PageTransition from "./PageTransition";
 *
 * const HomePage = () => (
 *   <PageTransition>
 *     <h1>Home</h1>
 *     …
 *   </PageTransition>
 * );
 * ```
 *
 * Props
 * -----
 * @prop {React.ReactNode} children – Whatever you want to animate in/out.
 *
 * @module PageTransition
 */

import { motion } from "framer-motion";

/** Page-level transition container. */
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
