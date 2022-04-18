import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import modules from './modules';

function App() {
  return (
    <div>
      <Routes>
        {modules.map((module, i) => (
          <Route {...module.routeProps} key={i} />
        ))}
      </Routes>
    </div>
  );
}

export default App;