import React from 'react';
import './App.scss';
import EditorPanel from './panels/editorPanel/EditorPanel';
import ConsolePanel from './panels/consolePanel/ConsolePanel';
import TimelinePanel from './panels/timelinePanel/TimelinePanel';
import CallStackPanel from './panels/callStackPanel/CallStackPanel';
import MemoryPanel from './panels/memoryPanel/MemoryPanel';

function App() {
  return (
    <div className='App'>
      <div className='Row-1'></div>
      <div className='Row-2'>
        <div className='Col-1'>
          <EditorPanel />
          <ConsolePanel />
        </div>
        <div className='Col-2'>
          <TimelinePanel />
          <CallStackPanel />
        </div>
        <div className='Col-3'>
          <MemoryPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
