//import { takeEvery } from 'redux-saga/effects';
import { put, take, call } from 'redux-saga/effects';

function* workerSaga() {

    console.log("hi from worker saga");
    yield put({ type: 'ADD_NEW_DATA' });
}

function* byebyeSaga() {
    yield "hi";
    console.log('bye bye saga');
}

function* rootSaga() {
    //yield takeEvery('HELLO', workerSaga);
    yield take('LOGIN');
    yield call(workerSaga);
    // yield take('ADD_TO_CART');
    // yield take('BUY');
    yield take('LOGOUT');
    yield call(byebyeSaga);
    //console.log("hi saga");
}
export default rootSaga;