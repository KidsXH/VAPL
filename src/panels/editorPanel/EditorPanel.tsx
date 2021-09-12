import React from 'react';
import './style.scss';
import PanelHeader from '../../components/panelHeader/PanelHeader';
import Editor from '../../components/editor/Editor';

function EditorPanel() {
  return (
    <div id='EditorPanel' className='panel'>
      <PanelHeader title='Source Editor' />
      <div className='editor-area'>
        <Editor lang='en' progLang='c_cpp'/>
      </div>
    </div>
  );
}

export default EditorPanel;
