import { motion } from "framer-motion";
import loader from "../../assets/images/2.png";

const LoginLoader = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 flex flex-col items-center justify-center z-50">
      {/* Logo */}
     

      <div className="flex items-center justify-center " >
        <img src={loader} alt="loader" className="object-contain w-full h-full" />
      </div>

      <h1 className="mt-4 text-3xl font-bold text-amber-600">EXPENSE TRACKER</h1>

      <p className="text-slate-500 mt-2">Signing you in...</p>

      {/* Animated Dots */}
      <div className="flex gap-2 mt-20">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="w-3 h-3 rounded-full bg-amber-600/80"
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
