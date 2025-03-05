import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Provider } from 'react-redux';
import store from './redux/store';  // Import your store

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
     <Provider store={store}>  {/* Wrap the App with Provider to give access to Redux store */}
      <App />
    </Provider>
  </React.StrictMode>,
)
