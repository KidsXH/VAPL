import React from 'react';
import AceEditor from 'react-ace';
import { useDispatch, useSelector } from 'react-redux';
import { changeInput } from '../../../store/reducers/compiler';

const InputEditor = () => {
  const inputText = useSelector((state) => (state as any).compiler.inputText);
  const dispatch = useDispatch();

  return (
    <AceEditor
      className="console"
      mode="text"
      value={inputText}
      onChange={(text) => {
        dispatch(changeInput(text));
      }}
      fontSize={14}
      editorProps={{ $blockScrolling: true }}
      setOptions={{
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        showLineNumbers: false,
        // readOnly: this.state.isReadOnly,
        showGutter: false,
      }}
      style={{ height: '100%', width: '100%', marginTop: '.25rem' }}
    />
  );
};

export default InputEditor;
