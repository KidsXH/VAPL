import React from 'react';
import './App.scss';
import EditorPanel from './panels/editorPanel/EditorPanel';
import ConsolePanel from './panels/consolePanel/ConsolePanel';
import TimelinePanel from './panels/timelinePanel/TimelinePanel';
import CallStackPanel from './panels/callStackPanel/CallStackPanel';
import MemoryPanel from './panels/memoryPanel/MemoryPanel';
import ContainerDimensions from 'react-container-dimensions';
import AppHeader from './components/appHeader/AppHeader';

function App() {
  return (
    <div className="App">
      <div className="Row-1">
        <AppHeader/>
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
                <CallStackPanel width={width} height={height} />
              </React.Fragment>
            )}
          </ContainerDimensions>
        </div>
        <div className="Col-3">
          <MemoryPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
