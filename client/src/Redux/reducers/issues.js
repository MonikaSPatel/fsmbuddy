const initialState = [];

export default (state = initialState, action) => {

  switch (action.type) {
    case 'ADDISSUE':
      return [...state, action.data];
    case 'REMOVEISSUE':
      const issueId = action.data;
      return state.filter((data, index) => index !== issueId);
    default:
      return state;
  }
}

