import React from 'react';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import './style.scss';

interface PhysicalViewProps {
  execState: ExecState | undefined;
  selectedVar: Variable | undefined;
  handleClick: (variable: Variable) => void;
}

function PhysicalView({
  execState,
  selectedVar,
  handleClick,
}: PhysicalViewProps) {
  // const a = allVariables ;
  return <div id="PhysicalView">Coming Soon...</div>;
}

export default PhysicalView;
