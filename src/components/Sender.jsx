import { useState } from "react"
import send from "../assets/send.png"
import emailjs from '@emailjs/react-native'

const Sender = () => {
  const serviceid = import.meta.env.VITE_APP_SERVICE_ID
  const templateid = import.meta.env.VITE_TEMPLATE_ID
  const publicid = import.meta.env.VITE_PUBLIC_ID
  console.log(serviceid);
  const [messages, setMessage] = useState("");
  console.log(messages);

  function sending() {
    const tempateParams = {
      name: prompt("Your mail"),
      message: messages
    }
    if (messages.length > 0) {
      const verify = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (verify.test(tempateParams.name)) {
        emailjs.send('service_l3l0w5u', 'template_gzjvm2n', tempateParams,
          {
            publicKey: 'ut-OoYr0wjQgF3V7X'
          }).then(
            (response) => {
              alert("message send");
              setMessage("");
            },
            (err) => {
              alert("error occured" + err);
            },
          );
      } else alert("enter valid email");
    }
    else alert("write something first")
  }

  return <>
    <div className="flex  items-center gap-4 absolute bottom-1.5 inset-x-3 " >
      <input onChange={e => setMessage(e.target.value)} name="input" placeholder="Aa Send some texts" autoFocus className=" z-10 text-black dark:text-white w-full bg-gray-300 dark:bg-neutral-700 rounded-full h-7 pl-4 focus:outline-none " ></input>
      <button onClick={sending} ><img src={send} className="z-10 w-6 h-6 opacity-70 hover:opacity-100 " /></button>
    </div>
  </>

}
export default Sender;
