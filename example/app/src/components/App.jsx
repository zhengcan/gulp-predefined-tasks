import React from 'react';
import './App.css';
import libA from 'libA';
import libB from 'libB';
// import libA1 from 'libA1';

const App = () => (
  <div className="app">
    <h2>Hello, World.</h2>
    <ul>
      <li>{libA}</li>
      <li>{libB}</li>
      {/* <li>{libA1}</li> */}
    </ul>
  </div>
);

export default App;
