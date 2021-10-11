const CHANGE_INPUT = 'CHANGE_INPUT';
const CHANGE_OUTPUT = 'CHANGE_OUTPUT';

const initState = {
  inputText: '',
  outputText: '',
};

export const changeInput = (inputText) => {
  return {
    type: CHANGE_INPUT,
    data: inputText,
  };
};

const compiler = (state = initState, action) => {
  switch (action.type) {
    case CHANGE_INPUT:
      return {...state, inputText: action.data}
    default:
      return state;
  }
}

export default compiler;