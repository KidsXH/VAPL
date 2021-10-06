import React, { useEffect, useRef, useState } from 'react';
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
import { remove, slot, showEvents, signal } from './components/emitter';
import { unstable_batchedUpdates } from 'react-dom';

import * as d3 from 'd3';

function App() {
  const [execState, setExecState] = useState<ExecState | undefined>();
  const [lastState, setLastState] = useState<ExecState | undefined>();
  const [variableShowUps, setVariableShowUps] = useState<VariableWithSteps[]>(
    [],
  );
  const app = React.createRef<HTMLDivElement>();

  useEffect(() => {
    slot(
      'draw',
      (execState: ExecState | undefined, lastState: ExecState | undefined) => {
        unstable_batchedUpdates(() => {
          setExecState(execState);
          setLastState(lastState);
        });
      },
    );
    return () => {
      remove('draw');
    };
  }, []);

  const updVariableShowUps = (variableShowUps: VariableWithSteps[]) => {
    setVariableShowUps(variableShowUps);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // console.log('Key: ' + e.key);
    switch (e.key) {
      case 'ArrowRight': {
        e.preventDefault();
        signal('debug', 'Step');
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        signal('debug', 'StepBack');
        break;
      }
    }
    if (e.ctrlKey && e.key === 'Enter') {
      app.current?.focus();
      signal('debug', 'Start');
      const arrowListJson = sessionStorage.getItem('arrowList');
      let arrowList = arrowListJson === null ? {} : JSON.parse(arrowListJson);
      if (!arrowList) {
        arrowList = {};
      }
      Object.keys(arrowList).forEach((name) => {
        d3.select('#svg')
          .select(`#block_${name}`)
          .attr('transform', 'matrix(1,0,0,1,0,0)');
      });
      const sourceCode = sessionStorage.getItem('sourceCode');
      sessionStorage.clear();
      if (sourceCode) sessionStorage.setItem('sourceCode', sourceCode);
    }
  };

  return (
    <div className='App' ref={app} onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className='Row-1'>
        <AppHeader />
      </div>
      <div className='Row-2'>
        <div className='Col-1'>
          <EditorPanel />
          <ConsolePanel />
        </div>
        <div className='Col-2'>
          <ContainerDimensions>
            {({ width, height }: { width: number; height: number }) => (
              <React.Fragment>
                <TimelinePanel
                  variableShowUps={variableShowUps}
                  updVariableShowUps={updVariableShowUps}
                />
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
        <div className='Col-3'>
          <MemoryPanel execState={execState} />
        </div>
      </div>
    </div>
  );
}

export default App;
