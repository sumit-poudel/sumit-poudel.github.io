import send from "../assets/send.png"
const Sender=()=>{

    return <>
      <div className="flex  items-center gap-4 absolute bottom-1.5 inset-x-3 " >
    <input name="input" placeholder="Aa Send some texts" autoFocus className=" z-10 text-black dark:text-white w-full bg-gray-300 dark:bg-neutral-700 rounded-full h-7 pl-4 focus:outline-none " ></input>
    <button><img src={send} className="z-10 w-6 h-6 opacity-70 hover:opacity-100 " /></button>
    </div>
   </> 

}
export default Sender;