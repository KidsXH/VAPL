import React from 'react';
import PanelHeader from '../../components/panelHeader/PanelHeader';
import CallStack from '../../components/callStack/CallStack';
import Animation from '../../components/callStack/animation/Animation';
import { AnimationDrawer } from '../../components/callStack/animation/AnimationDrawer';
import { slot, remove } from '../../components/emitter';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { BlockDrawer } from '../../components/callStack/blockDrawer/BlockDrawer';

import './style.scss';

interface Props {
  height: number;
  width: number;
  execState?: ExecState;
  lastState?: ExecState;
}
interface State {
}

class CallStackPanel extends React.Component<Props, State> {

  render() {
    // console.log('render1');
    const blockDrawer = new BlockDrawer(this.props.execState);
    const animationDrawer = new AnimationDrawer(
      this.props.execState,
      this.props.lastState
    );
    // console.log('render2');
    return (
      <div id="CallStackPanel" className="panel">
        <PanelHeader title="Call Stack" />
        <div className="callStack-area">
          {/* {console.log('DEBUG|'+this.props.execState)} */}
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
            <CallStack blockDrawer={blockDrawer}></CallStack>
            <g id="clone"></g>
            <g id="path"></g>
          </svg>
          {/* <Animation
            animationDrawer={
              new AnimationDrawer(this.props.execState, this.props.lastState)
            }
          ></Animation> */}
        </div>
      </div>
    );
  }
}

export default CallStackPanel;
