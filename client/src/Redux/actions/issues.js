import { ADDISSUE, REMOVEISSUE } from "../../Common/ActionTypes";
export function addIssue(data) {
    return {
        type: ADDISSUE,
        data
    };
}
export function RemoveIssue(data) {
    return {
        type: REMOVEISSUE,
        data
    };
}
