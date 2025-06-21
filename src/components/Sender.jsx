import { useRef, useState } from "react";
import send from "../assets/send.png"
import ChatBubble from "./ChatBubble";

const Sender=({vayoRa,press})=>{

    const[text,settext]=useState("");
    let senderText=useRef("");

const buttonClick = () => {
  if (text.trim().length === 0) {
    senderText.current = "Null text achievement unlocked!";
  } else {
    senderText.current = text;
  }

  settext("");           // Clear input
  vayoRa(prev => !prev);
};


    return <>
    {press?<ChatBubble text={senderText.current} />:null}
      <div className="flex  items-center gap-4 absolute bottom-1.5 inset-x-3 " >
    <input name="input" placeholder="Aa Send some texts" value={text} onChange={e=>settext(e.target.value)} autoFocus className=" z-10 text-black dark:text-white w-full bg-gray-300 dark:bg-neutral-700 rounded-full h-7 pl-4 focus:outline-none " ></input>
    <button onClick={buttonClick}  ><img src={send} className="z-10 w-6 h-6 opacity-70 hover:opacity-100 " /></button>
    </div>
   </> 

}
export default Sender;