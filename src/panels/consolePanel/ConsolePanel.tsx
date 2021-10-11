import React, { useState } from 'react';
import './style.scss';
import Console from '../../components/console/Console';
import ConsoleHeader from '../../components/console/consoleHeader/consoleHeader';

function ConsolePanel() {
  const [mode, setMode] = useState<'IN' | 'OUT'>('OUT');

  const changeMode = (mode: 'IN' | 'OUT') => {
    setMode(mode);
  }

  return (
    <div id="ConsolePanel" className="panel">
      <ConsoleHeader mode={mode} changeMode={changeMode}/>
      <div className="console-area">
        <Console lang="en" mode={mode} />
      </div>
    </div>
  );
}

export default ConsolePanel;
