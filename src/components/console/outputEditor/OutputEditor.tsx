import React from 'react';
import AceEditor from 'react-ace';

interface OutputEditorProps {
  outputText: string;
}

const OutputEditor = ({ outputText }: OutputEditorProps) => {
  return (
    <AceEditor
      className="console"
      mode="text"
      value={outputText}
      // onChange={this.onChange}
      name="IN"
      fontSize={14}
      editorProps={{ $blockScrolling: true }}
      setOptions={{
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        showLineNumbers: false,
        readOnly: true,
        showGutter: false,
      }}
      style={{ height: '100%', width: '100%', marginTop: '.25rem' }}
    />
  );
};

export default OutputEditor;
