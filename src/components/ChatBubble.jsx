import user from "../assets/user-circles-set.png"
export const ChatBubble = ({text}) => {
  return (
    <div className=" flex items-center gap-2" >
    <img src={user} className=" w-7 h-7 p-0 m-0 " />
    <div className="py-1 px-5 bg-slate-300  dark:bg-blue-500 rounded-full w-fit dark:text-white flex-none " >  
      {text} </div>
    </div>
  )
}
