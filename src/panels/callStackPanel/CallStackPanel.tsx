import React from 'react';
import PanelHeader from '../../components/panelHeader/PanelHeader';
import CallStack from '../../components/callStack/CallStack';
import Animation from '../../components/callStack/animation/Animation';
import { AnimationDrawer } from '../../components/callStack/animation/AnimationDrawer';
import { slot, remove } from '../../components/emitter';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { BlockDrawer } from '../../components/callStack/blockDrawer/BlockDrawer';

import './style.scss';
import { VariableWithSteps } from '../timelinePanel/TimelinePanel';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import * as d3 from 'd3';

interface Props {
  height: number;
  width: number;
  execState?: ExecState;
  lastState?: ExecState;
  variableShowUps: VariableWithSteps[] | undefined;
}
interface State {}

class CallStackPanel extends React.Component<Props, State> {
  componentDidUpdate() {
    const variableShowUps = this.props.variableShowUps;
    const execState = this.props.execState;
    const lastState = this.props.lastState;
    if (lastState && execState && variableShowUps) {
      variableShowUps.forEach((variableWithSteps) => {
        if (variableChanged(variableWithSteps, lastState, execState)) {
          // console.log(
          //   'CHANGE|' +
          //     variableWithSteps.funcName +
          //     ': ' +
          //     variableWithSteps.name
          // );
          highlightChangedVariable(
            variableWithSteps.funcName,
            variableWithSteps.name
          );
        } else {
          resetVariableColor(
            variableWithSteps.funcName,
            variableWithSteps.name
          );
        }
      });
    }
  }

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
          <Animation
            animationDrawer={
              new AnimationDrawer(this.props.execState, this.props.lastState)
            }
          ></Animation>
        </div>
      </div>
    );
  }
}

export default CallStackPanel;

const variableChanged = (
  variableWithSteps: VariableWithSteps,
  lastState: ExecState,
  execState: ExecState
) => {
  const stackName = variableWithSteps.funcName;
  const variable = variableWithSteps.variable;
  const lastStacks = lastState.getStacks();
  const execStacks = execState.getStacks();
  let lastValue: any = undefined;
  let curValue: any = undefined;
  lastStacks.forEach((stack) => {
    if (stackName !== stack.name) return;
    // console.log('FIND');
    // console.log(variable);
    // console.log(stack.getVariables());
    lastValue = getValueFromStack(variable, stack.getVariables());
    // console.log('GOT');
    // console.log(lastValue);
    if (lastValue !== undefined) return;
  });
  execStacks.forEach((stack) => {
    if (stackName !== stack.name) return;
    curValue = getValueFromStack(variable, stack.getVariables());
    if (curValue !== undefined) return;
  });
  // console.log('last| ' + lastStacks);
  // console.log('exec| ' + execStacks);
  // console.log(
  //   'VC| find ' +
  //     stackName +
  //     ' | ' +
  //     variableWithSteps.name +
  //     ' last: ' +
  //     lastValue +
  //     ' cur: ' +
  //     curValue
  // );
  // console.log(lastValue, curValue);
  // console.log(
  //   lastValue !== undefined,
  //   curValue !== undefined,
  //   lastValue === curValue,
  //   lastValue !== curValue,
  // );
  return (
    lastValue !== undefined &&
    curValue !== undefined &&
    lastValue.toString() !== curValue.toString()
  );
};

const getValueFromStack = (targetVariable: Variable, variables: Variable[]) => {
  let ret = undefined;
  variables.forEach((variable) => {
    const value = variable.getValue();
    if (value instanceof Array) {
      const v = getValueFromStack(targetVariable, value);
      if (v !== undefined) {
        return v;
      }
    } else {
      // console.log('CMP');
      // console.log(targetVariable.address);
      // console.log(variable.address);
      if (targetVariable.address === variable.address) {
        ret = value;
        return;
      }
    }
  });
  return ret;
};

const highlightChangedVariable = (funcName: string, varName: string) => {
  const blockElement = d3.select('#block-' + funcName + '-' + varName);
  const highlightColor = 'rgb(74, 140, 227)';

  blockElement.select('.variable-name').attr('fill', highlightColor);
  blockElement.select('.variable-value').attr('fill', highlightColor);
  blockElement.select('rect').attr('style', 'stroke: ' + highlightColor);
};

const resetVariableColor = (funcName: string, varName: string) => {
  const defaultColor = 'rgb(139, 139, 139)';
  const blockElement = d3.select('#block-' + funcName + '-' + varName);

  blockElement.select('.variable-name').attr('fill', defaultColor);
  blockElement.select('.variable-value').attr('fill', defaultColor);
  blockElement.select('rect').attr('style', 'stroke: ' + defaultColor);
};
