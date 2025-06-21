import { useEffect, useState } from "react";
import ChatBubble from "./ChatBubble.jsx";
import useSound from "use-sound";
import ping from "../assets/ping.mp3";

const Text = () => {
  const things = [
    "Hello! Mero nam Sumit ho.",
    "Ma Birendra ma padhxu",
    "I am doing BCA",
    "Coding is fun",
    "Penguins hate me T_T",
  ];

  const [visible, setVisible] = useState(0);
  const [play] = useSound(ping);

  useEffect(() => {
    if (visible < things.length) {
      const timeout = setTimeout(() => {
        setVisible((prev) => prev + 1);
        play();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  return (
    <>
      {things.slice(0, visible).map((text, index) => (
        <ChatBubble text={text} key={index} />
      ))}
    </>
  );
};
export default Text;
