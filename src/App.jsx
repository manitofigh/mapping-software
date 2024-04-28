import React, {useState} from 'react';
import AdminPanel from './components/AdminPanel';
import DriverPanel from './components/DriverPanel';
import './assets/css/style.css';
import './assets/css/styleLeaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';



function App() {
  const [appState, setApplicationState] = useState(1);

  const changeState = (state) => {
    setApplicationState(state);
  }

  if(appState == 1)
    return <div><AdminPanel changeState={changeState}/></div>;
  else if (appState == 2)
    return <div><DriverPanel changeState={changeState}/></div>;
  else
    return <div>login</div>
}

export default App;
