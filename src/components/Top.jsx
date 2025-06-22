import logo from "../assets/user-circles-set.png"

const Top=()=>{
    return (
<div className="flex pl-3 items-center gap-4 dark:shadow-xl dark:border-none inset-shadow-2xs w-full basis-3/40 border-gray-200 border-b-1 " >
        <a href="https://github.com/sumit-poudel" target="_blank" rel="noopener noreferrer"  className="flex items-center gap-2" >
          <img src={logo} className="w-10 h-10" />
          <p className="dark:text-white" >Sumit Poudel</p>
        </a>
        </div>
    )
}
                export default Top;