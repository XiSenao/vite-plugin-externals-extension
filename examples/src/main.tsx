// eslint-disable-next-line node/no-missing-import
import React from 'react'
// @ts-ignore
// eslint-disable-next-line node/no-missing-import
import lodash from 'lodash'

// @ts-ignore
// eslint-disable-next-line node/no-missing-import
import redux from 'redux'

// @ts-ignore
// eslint-disable-next-line node/no-missing-import
import confetti from 'confetti'

import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('Module: lodash, info: ', lodash);
console.log('Module: confetti, info: ', confetti);
console.log('Module: redux, info: ', redux);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
