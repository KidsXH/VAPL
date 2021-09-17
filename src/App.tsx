import React, { useEffect, useState } from 'react';
import './App.scss';
import EditorPanel from './panels/editorPanel/EditorPanel';
import ConsolePanel from './panels/consolePanel/ConsolePanel';
import TimelinePanel, {
  VariableWithSteps,
} from './panels/timelinePanel/TimelinePanel';
import CallStackPanel from './panels/callStackPanel/CallStackPanel';
import MemoryPanel from './panels/memoryPanel/MemoryPanel';
import ContainerDimensions from 'react-container-dimensions';
import AppHeader from './components/appHeader/AppHeader';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { remove, slot } from './components/emitter';
import { unstable_batchedUpdates } from 'react-dom';

function App() {
  const [execState, setExecState] = useState<ExecState | undefined>();
  const [lastState, setLastState] = useState<ExecState | undefined>();
  const [variableShowUps, setVariableShowUps] = useState<VariableWithSteps[]>([]);

  useEffect(() => {
    slot(
      'draw',
      (execState: ExecState | undefined, lastState: ExecState | undefined) => {
        unstable_batchedUpdates(() => {
          setExecState(execState);
          setLastState(lastState);
        });
      }
    );
    return () => {
      remove('draw');
    };
  }, []);

  const updVariableShowUps = (variableShowUps: VariableWithSteps[]) => {
    setVariableShowUps(variableShowUps);
  };

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
                <TimelinePanel variableShowUps={variableShowUps} updVariableShowUps={updVariableShowUps} />
                <CallStackPanel
                  width={width}
                  height={height}
                  execState={execState}
                  lastState={lastState}
                  variableShowUps={variableShowUps}
                />
              </React.Fragment>
            )}
          </ContainerDimensions>
        </div>
        <div className="Col-3">
          <MemoryPanel execState={execState} />
        </div>
      </div>
    </div>
  );
}

export default App;
