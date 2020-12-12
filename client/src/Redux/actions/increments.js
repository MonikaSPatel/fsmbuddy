import { INCREMENT, DECREASE } from "../../Common/ActionTypes";

export function incrementAction() {
    return {
        type: INCREMENT,
    };
}
export function decreaseAction() {
    return {
        type: DECREASE,
    };
}