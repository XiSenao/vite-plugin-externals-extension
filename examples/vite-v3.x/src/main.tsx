import React from 'react';
import lodash from 'lodash';
import redux from 'redux';

import htm from 'htm';

import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

console.log('Module: React, info: ', React);
console.log('Module: lodash, info: ', lodash);
console.log('Module: htm, info: ', htm);
console.log('Module: redux, info: ', redux);
console.log('Module: ReactDOM, info: ', ReactDOM);

ReactDOM.render((
  <React.StrictMode>
    <App></App>
  </React.StrictMode>
), document.getElementById('root') as HTMLElement);
