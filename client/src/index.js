import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'antd/dist/antd.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import configureStore from './Redux/stores/configureStore'
const store = configureStore()

ReactDOM.render(
  <React.Fragment>
    <Provider store={store}>
      <App />
    </Provider>
  </React.Fragment>,
  document.getElementById('root')
);
if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./App', App)
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
