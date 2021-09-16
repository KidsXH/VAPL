import React from 'react';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';

interface PhysicalViewProps {
  execState: ExecState | undefined;
}

function PhysicalView({ execState }: PhysicalViewProps) {
  return <div className="physical-view"></div>;
}

export default PhysicalView;
