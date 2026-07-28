import { motion } from "framer-motion";
import loader from "../../assets/images/2.jpg";

const LoginLoader = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Logo */}
     

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
        className="flex items-center justify-center w-25 h-25 rounded-full bg-sky-500/10"
      >
        <img src={loader} alt="loader" className="w-20 h-20" />
      </motion.div>

      <h1 className="mt-4 text-3xl font-bold text-slate-800">EXPENSE TRACKER</h1>

      <p className="text-slate-500 mt-2">Signing you in...</p>

      {/* Animated Dots */}
      <div className="flex gap-2 mt-20">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="w-3 h-3 rounded-full bg-slate-600"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              repeat: Infinity,
              delay: dot * 0.2,
              duration: 0.6,
            }}
          />
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-400">Preparing your workspace...</p>
    </div>
  );
};

export default LoginLoader;
