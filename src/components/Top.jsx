import logo from "../assets/user-circles-set.png";
import * as motion from "motion/react-client";

const Top = () => {
  return (
    <div className="flex pl-5 items-center gap-4 dark:shadow-xl dark:border-none inset-shadow-2xs w-full basis-3/40 border-gray-200 border-b-1 ">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 1],
          repeat: Infinity,
        }}
      >
        {
          <a
            href="https://github.com/sumit-poudel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <img src={logo} className="w-10 h-10" />
            <h1 className="dark:text-white">Sumit Poudel</h1>
          </a>
        }
      </motion.div>
    </div>
  );
};

export default Top;

