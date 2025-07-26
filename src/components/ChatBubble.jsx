import * as motion from "motion/react-client";
import user from "/logo.png";
import { AnimatePresence } from "motion/react";

const ChatBubble = ({ text }) => {
  return (
    <div className="flex flex-col w-fit relative h-fit ">
      <AnimatePresence>
        <motion.div
          className="flex items-center gap-2 my-5"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <img src={user} className="w-7 h-7 p-0 m-0 rounded-full" />

          <motion.div
            className="py-1 px-5 bg-slate-300 dark:bg-blue-500 rounded-full w-fit dark:text-white flex-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{
              marginLeft: 30,
              scale: [null, 1.3],
              transition: {
                duration: 0.4,
                times: [0, 1],
                ease: ["easeInOut", "easeOut"],
              },
            }}
            transition={{
              delay: 0.1,
              duration: 0.4,
              type: "spring",
              stiffness: 150,
              ease: "easeOut",
            }}
          >
            {text}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ChatBubble;

