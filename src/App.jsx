import Sender from "./components/Sender.jsx";
import Text from "./components/Text.jsx";
import Top from "./components/Top.jsx";


const App = () => {

  return (
    <div className="bg-white dark:bg-neutral-800 h-dvh flex flex-col ">
      <Top  />
      <div className="px-8 relative basis-37/40 ">
      <Sender/>
      <Text />
      </div>
    </div>
  );
};

export default App;
