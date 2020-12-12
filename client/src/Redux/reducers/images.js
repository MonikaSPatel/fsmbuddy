import { LOAD_SUCESS } from '../../Common/ActionTypes';

export default (state = [], action) => {
    switch (action.type) {
        case LOAD_SUCESS:
            return [...state, ...action.images];
        default:
            return state;
    }
}