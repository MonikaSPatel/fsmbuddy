import { LOAD, LOAD_SUCESS, LOAD_FAIL } from '../../Common/ActionTypes';

export const loadImages = () => {
    return {
        type: LOAD,
    };
}
export const setImages = images => {
    return {
        type: LOAD_SUCESS,
        images,
    };
}

export const setError = error => {
    return {
        type: LOAD_FAIL,
        error
    };
}