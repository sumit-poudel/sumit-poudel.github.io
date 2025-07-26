import { useEffect, useState } from "react";
import ChatBubble from "./ChatBubble.jsx";
import useSound from "use-sound";
import ping from "../assets/ping.mp3";
import Loading from "./Loading.jsx";

const Text = () => {
  const things = [
    "Hello! Mero nam Sumit ho.",
    "Ma Birendra ma padhxu",
    "I am doing BCA",
    "Coding is fun",
    "Penguins hate me T_T",
  ];

  const mail = (
    <a
      href="mailto:sumitpoudel325@gmail.com"
      target="_blank"
      rel="noopener noreferrer"
      className=" underline font-bold "
    >
      mail me
    </a>
  );
  const [visible, setVisible] = useState(0);
  const [play] = useSound(ping);
  console.log(visible);

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
      {visible == things.length ? <ChatBubble text={mail} /> : null}
      <ChatBubble text={<Loading />} />
    </>
  );
};
export default Text;
