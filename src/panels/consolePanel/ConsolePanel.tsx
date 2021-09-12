import React from 'react';
import './style.scss';
import Console from '../../components/console/Console';
import PanelHeader from '../../components/panelHeader/PanelHeader';

function ConsolePanel() {
  return (
    <div id='ConsolePanel' className='panel'>
      <PanelHeader title='Console' />
      <div className='editor-area'>
        <Console lang='en' />
      </div>
    </div>
  );
}

export default ConsolePanel;
