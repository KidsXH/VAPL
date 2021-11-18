import { EventEmitter } from 'events';
export const emitter = new EventEmitter();
emitter.setMaxListeners(20);
export type event =
  | 'debug'
  | 'changeTheme'
  | 'changeLang'
  | 'changeProgLang'
  | 'changeState'
  | 'changeOutput'
  | 'zoom'
  | 'draw'
  | 'redraw'
  | 'EOF'
  | 'stdin'
  | 'Breakpoint'
  | 'files'
  | 'changeStep'
  | 'jumpTo'
  | 'init'
  | 'statementHighlight'
  | 'initAllVariables'
  | 'cancelStatementHighlight'
  | 'dragArrow'
  | 'addDataStructure'
  | 'updateDataStructure'
  | 'updatePointPos';
export const slot = (
  event: event,
  listener: (...args: any[]) => void
): EventEmitter => {
  return emitter.on(event, listener);
};
export const signal = (event: event, ...args: any[]): boolean => {
  // console.log('Log | signal: ' + event + ' ' + args);
  return emitter.emit(event, ...args);
};
export const remove = (event: event) => {
  emitter.removeAllListeners(event);
};

export const showEvents = () => {
  const eventNames = emitter.eventNames();
  console.log('Eventnames: ' + eventNames);
};
