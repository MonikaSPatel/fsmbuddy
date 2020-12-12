import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

//import monitorReducersEnhancer from '../../enhancers/monitorReducers';
//import loggerMiddleware from '../../middleware/logger';
import rootReducer from '../reducers/index';
import { routerMiddleware } from "react-router-redux";
import { createBrowserHistory as createHistory} from "history";
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../../Saga/index';

const history = createHistory();
const routeMiddleware = routerMiddleware(history);

const sagaMiddleware = createSagaMiddleware();

export default function configureAppStore(preloadedState) {
  const store = configureStore({
    reducer: rootReducer,
    middleware: [sagaMiddleware, routeMiddleware,  ...getDefaultMiddleware()],
    preloadedState,
    enhancers: []
  })

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('../reducers/index', () => store.replaceReducer(rootReducer))
  }

  sagaMiddleware.run(rootSaga);

  // store.dispatch({ type: "LOAD" });
  // store.dispatch({ type: "LOGIN" });
  // store.dispatch({ type: "LOGOUT" });

  return store
}