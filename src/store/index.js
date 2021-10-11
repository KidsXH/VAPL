import { combineReducers } from 'redux';
import highlight from './reducers/highlight';
import compiler from './reducers/compiler';


const reducer = combineReducers({highlight, compiler});

export default reducer;