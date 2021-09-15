import React from 'react';
import PanelHeader from '../../components/panelHeader/PanelHeader';
import CallStack from '../../components/callStack/CallStack';
import Animation from '../../components/callStack/animation/Animation';
import { AnimationDrawer } from '../../components/callStack/animation/AnimationDrawer';
import { slot } from '../../components/emitter';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { BlockDrawer } from '../../components/callStack/blockDrawer/BlockDrawer';

import './style.scss';

interface Props {
  height: number;
  width: number;
}
interface State {
  execState?: ExecState;
  lastState?: ExecState;
}

class CallStackPanel extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      execState: undefined,
      lastState: undefined,
    };
  }

  componentDidMount() {
    slot('draw', (execState: ExecState, lastState: ExecState) =>
      this.setState({ execState, lastState })
    );
  }

  render() {
    return (
      <div id="CallStackPanel" className="panel">
        <PanelHeader title="Call Stack" />
        <div className="callStack-area">
          <svg
            id="svg"
            width={this.props.width - 20}
            height={this.props.height * 0.75 - 28 - 39.2}
          >
            <marker
              id="end"
              viewBox="-10 -10 20 20"
              refX="0"
              refY="0"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
            >
              <circle
                cx={0}
                cy={0}
                style={{ stroke: '#483647', strokeWidth: 2, fill: 'white' }}
                r={8}
              ></circle>
            </marker>
            <marker
              id="start"
              viewBox="-10 -10 20 20"
              refX="0"
              refY="0"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
            >
              <circle
                cx={0}
                cy={0}
                style={{ stroke: '#979797', strokeWidth: 2, fill: 'white' }}
                r={8}
              ></circle>
            </marker>
            <CallStack
              blockDrawer={new BlockDrawer(this.state.execState)}
            ></CallStack>
            <g id="clone"></g>
            <g id="path"></g>
          </svg>
          <Animation
            animationDrawer={
              new AnimationDrawer(this.state.execState, this.state.lastState)
            }
          ></Animation>
        </div>
      </div>
    );
  }
}

export default CallStackPanel;
