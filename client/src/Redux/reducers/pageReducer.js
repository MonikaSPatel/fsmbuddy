import { LOAD_SUCESS } from '../../Common/ActionTypes';

export default (state = 1, action) => {
    switch (action.type) {
        case LOAD_SUCESS:
            return state + 1;
        default:
            return state;
    }
}