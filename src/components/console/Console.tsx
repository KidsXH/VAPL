import * as React from 'react';
// tslint:disable-next-line:import-name
import AceEditor from 'react-ace';

import 'ace-builds/src-min-noconflict/mode-text';
import 'ace-builds/src-min-noconflict/theme-textmate';
import 'ace-builds/src-min-noconflict/theme-monokai';
import * as d3 from 'd3';

import './console.scss';
import { slot, signal, remove } from '../emitter';
import { LangProps } from '../Props';
import { DEBUG_STATE } from '../server';
type Props = LangProps;

interface State {
  output: string;
  isReadOnly: boolean;
  outputChange: boolean;
}

export default class Console extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { output: '', isReadOnly: true, outputChange: false };
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    slot('changeOutput', (output: string, outputChange: boolean) => {
      this.setState({ output, outputChange });
    });
    slot('changeState', async (debugState: DEBUG_STATE) => {
      if (debugState === 'stdin') {
        this.setState({ isReadOnly: false });
      }
    });
  }

  componentWillUnmount() {
    remove('changeOutput');
    remove('changeState');
  }

  onChange(text: string) {
    if (text.endsWith('\n')) {
      const sendText = text.slice(0, -1).replace(this.state.output, '');
      this.setState({ output: text, isReadOnly: true });
      signal('debug', 'Step', sendText);
    }
  }

  componentDidUpdate() {
    if (this.state.outputChange) {
      d3.select('#ConsolePanel')
        // .selectAll('.panel-header')
        .transition()
        .duration(1000)
        .tween('number', function () {
          let i = d3.interpolateNumber(8, 16);
          let j = d3.interpolateRgb('#ffffff', '#4A8CE3');
          return function (t) {
            d3.select('#ConsolePanel')
              // .selectAll('.panel-header')
              .style('box-shadow', `0px 0px ${i(t)}px ${j(t)}`);
          };
        });
      // d3.select('#ConsolePanel')
      //   // .selectAll('.panel-header')
      //   .transition()
      //   .delay(1000)
      //   .duration(1000)
      //   .tween('number', function () {
      //     let i = d3.interpolateNumber(16, 8);
      //     let j = d3.interpolateRgb('#4A8CE3', '#ffffff');
      //     return function (t) {
      //       d3.select('#ConsolePanel')
      //         // .selectAll('.panel-header')
      //         .style('box-shadow', `0px 0px ${i(t)}px ${j(t)}`);
      //     };
      //   });
    }
  }

  render() {
    return (
      <AceEditor
        mode="text"
        theme="light"
        value={this.state.output}
        onChange={this.onChange}
        name="IO"
        fontSize={14}
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          showLineNumbers: false,
          readOnly: this.state.isReadOnly,
          showGutter: false,
        }}
        style={{ height: '100%', width: '100%', marginTop: '.25rem' }}
        className="console"
      />
    );
  }
}
