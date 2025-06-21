import Sender from "./components/Sender.jsx";
import Text from "./components/Text.jsx";
import { useState } from "react";

const App = () => {

  return (
    <div className="bg-white dark:bg-neutral-800 p-8 h-screen relative">
      <Sender/>
      <Text />
    </div>
  );
};

export default App;
