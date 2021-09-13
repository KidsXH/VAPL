import * as React from 'react';
// tslint:disable-next-line:import-name
import AceEditor from 'react-ace';

import 'ace-builds/src-min-noconflict/mode-text';
import 'ace-builds/src-min-noconflict/theme-textmate';
import 'ace-builds/src-min-noconflict/theme-monokai';

import './console.scss';
import {slot, signal, remove} from '../emitter';
import {LangProps, Theme} from '../Props';
import {DEBUG_STATE} from '../server';
type Props = LangProps;

interface State {
  output: string;
  theme: Theme;
  isReadOnly: boolean;
}

export default class Console extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {output: '', theme: 'light', isReadOnly: true};

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    slot('changeOutput', (output: string) => {
      this.setState({output});
    });
    slot('changeTheme', async (theme: Theme) => {
      this.setState({theme});
    });
    slot('changeState', async (debugState: DEBUG_STATE) => {
      if (debugState === 'stdin') {
        this.setState({isReadOnly: false});
      }
    });
  }

  componentWillUnmount() {
    remove('changeOutput');
    remove('changeTheme');
    remove('changeState');
  }

  onChange(text: string) {
    if (text.endsWith('\n')) {
      // 改行文字削除&今回入力部分のみ残す
      const sendText = text.slice(0, -1).replace(this.state.output, '');
      this.setState({output: text, isReadOnly: true});
      signal('debug', 'Step', sendText);
    }
  }
  render() {
    const {theme} = this.state;
    return (
      <AceEditor
        mode='text'
        theme={theme === 'light' ? 'textmate' : 'monokai'}
        value={this.state.output}
        onChange={this.onChange}
        name='IO'
        fontSize={14}
        editorProps={{$blockScrolling: true}}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          showLineNumbers: false,
          readOnly: this.state.isReadOnly,
          showGutter: false,
        }}
        style={{height: '100%', width: '100%'}}
        className='console'
      />
    );
  }
}
