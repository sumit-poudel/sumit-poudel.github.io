import Sender from "./components/Sender.jsx";
import Text from "./components/Text.jsx";
import { useState } from "react";

const App = () => {
  const [press, setPress] = useState(false);

  return (
    <div className="bg-white dark:bg-neutral-800 p-8 h-screen relative">
      <Sender vayoRa={setPress} press={press} />
      {press ? <Text /> : null}
    </div>
  );
};

export default App;
