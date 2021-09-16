import React from 'react';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';

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
  return <div className="physical-view"></div>;
}

export default PhysicalView;
