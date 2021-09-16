import React, { useEffect, useState } from 'react';
import './App.scss';
import EditorPanel from './panels/editorPanel/EditorPanel';
import ConsolePanel from './panels/consolePanel/ConsolePanel';
import TimelinePanel from './panels/timelinePanel/TimelinePanel';
import CallStackPanel from './panels/callStackPanel/CallStackPanel';
import MemoryPanel from './panels/memoryPanel/MemoryPanel';
import ContainerDimensions from 'react-container-dimensions';
import AppHeader from './components/appHeader/AppHeader';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { remove, slot } from './components/emitter';

interface S {
  execState: ExecState | undefined;
  lastState: ExecState | undefined;
}

function App() {
  // const [execState, setExecState] = useState<ExecState | undefined>();
  // const [lastState, setLastState] = useState<ExecState | undefined>();

  const [states, setStates] = useState<S>({
    execState: undefined,
    lastState: undefined,
  });

  useEffect(() => {
    // console.log('execState: ' + execState);
    slot(
      'draw',
      (execState: ExecState | undefined, lastState: ExecState | undefined) => {
        // alert('draw');
        // console.log('DEBUG| draw');
        // setExecState(execState);
        // setLastState(lastState);
        setStates({ execState, lastState });
      }
    );
    return () => {
      remove('draw');
    };
  }, []);

  return (
    <div className="App">
      <div className="Row-1">
        <AppHeader />
      </div>
      <div className="Row-2">
        <div className="Col-1">
          <EditorPanel />
          <ConsolePanel />
        </div>
        <div className="Col-2">
          <ContainerDimensions>
            {({ width, height }: { width: number; height: number }) => (
              <React.Fragment>
                <TimelinePanel />
                <CallStackPanel
                  width={width}
                  height={height}
                  execState={states.execState}
                  lastState={states.lastState}
                />
              </React.Fragment>
            )}
          </ContainerDimensions>
        </div>
        <div className="Col-3">
          <MemoryPanel execState={states.execState} />
        </div>
      </div>
    </div>
  );
}

export default App;
