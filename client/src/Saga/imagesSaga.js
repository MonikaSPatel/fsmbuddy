//import { takeEvery } from 'redux-saga/effects';
import { takeEvery, select, call, put } from 'redux-saga/effects';

import { LOAD } from '../Common/ActionTypes';
import { fetchImages } from '../Apis/index';
import { setImages, setError } from '../Redux/actions/images'

const getPage = state => state.nextPage;

function* handleImageLoad() {
    try {
        const page = yield select(getPage);
        const images = yield call(fetchImages, page);
        //const images = fetchedImages.map(fetchedImage => fetchedImage.urls.small);
        yield put(setImages(images));
    } catch (error) {
        yield put(setError(error.toString()));
    }

}

export default function* watchImagesLoad() {
    yield takeEvery(LOAD, handleImageLoad);
}
