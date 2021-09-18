const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const ADD_VAR = 'ADD_VAR';
const REMOVE_VAR = 'REMOVE_VAR';

const initState = {
  // line numbers of the highlight statments: color
  statements: {},
  variables: {},
}

const palette = ['#4d7cfe', '#f35c9b', '#feb74b', '#ca78ff'];
const variablesPalette = ['#5E8B7E', '#FFC288', '#A19882'];

let id = 0;
const existColor = new Set();

const getHashColor = (index) => {
  const color = palette[index % palette.length];
  if (existColor.has(color)) {
    return getHashColor(index + 1);
  } else {
    existColor.add(color)
    return color;
  }
};

export const getColor = () => {
  if (existColor.size === palette.length) return 'DISABLE';
  return getHashColor(id++);
};

export const addHighlightStatement = (lineNumber, color) => {
  return {
    type: ADD_ITEM,
    data: { [lineNumber]: color }
  }
}

export const removeHighlightStatement = (lineNumber) => {
  return {
    type: REMOVE_ITEM,
    data: lineNumber
  }
}

export const addVariable = (variable) => {
  return {
    type: ADD_VAR,
    data: variable
  }
}

const reducer = (state = initState, action) => {
  switch (action.type) {
    case ADD_ITEM:
      return { ...state, statements: { ...state.statements, ...action.data } }
    case REMOVE_ITEM:
      const { [action.data]: old, ...rest } = state.statements;
      console.log(old)
      existColor.delete(old);
      return { ...state, statements: rest }
    case ADD_VAR:
      return {
        ...state, variables: {
          ...state.variables,
          ...{ [action.data.join('-')]: variablesPalette[Object.keys(state.variables).length % variablesPalette.length] }
        }
      }
    default:
      return state
  }
}

export default reducer;