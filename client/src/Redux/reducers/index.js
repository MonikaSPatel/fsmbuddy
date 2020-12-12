import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import issues from "./issues";
import pageReducer from "./pageReducer";
import images from "./images";
import increments from "./increments";
import { reducer as reduxFormReducer } from 'redux-form';

const reducers = combineReducers({
    routerReducer,
    issues,
    images,
    increments,
    form: reduxFormReducer,
    nextPage: pageReducer
});

export default reducers;
