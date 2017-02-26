import React from 'react';
import './App.css';

const App = () => (
  <div className="app">
    <h2>Hello, World.</h2>
  </div>
);

export default App;

function INVALID_FUNC() {
  return (`
    INVALID_FUNC
    INVALID_FUNC
    INVALID_FUNC
    INVALID_FUNC
    INVALID_FUNC
  `);
}

class Unused extends React.Component {
  render() {
    return (
      <div>
        <div>UNUSED component</div>
        <div>UNUSED component</div>
        <div>UNUSED component</div>
        <div>UNUSED component</div>
        <div>UNUSED component</div>
      </div>
    );
  }
}

export class Unexported extends React.Component {
  render() {
    return (
      <div>
        <div>UNEXPORTED component</div>
        <div>UNEXPORTED component</div>
        <div>UNEXPORTED component</div>
        <div>UNEXPORTED component</div>
        <div>UNEXPORTED component</div>
      </div>
    );
  }
}
