import { ChatBubble } from "./components/chatBubble"


const App=()=>{

let things=["Hello! Mero nam sumit ho.",
            "Ma birendra ma padhxu",
            "I am doing BCA",
            "Coding is fun",
            "Penguins hate me T_T"
]
 

return (<div className="bg-white dark:bg-gray-800 p-8 h-screen ">
  {
    things.map(element =>
     <ChatBubble text={element} />
    )
  }
  </div>)

}
export default App