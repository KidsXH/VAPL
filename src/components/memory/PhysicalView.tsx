import React from 'react';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import './style.scss';
import MemoryCell from './memoryBlock/MemoryCell';
import PhysicalMemoryCell from './memoryBlock/PhysicalMemoryCell/PhysicalMemoryCell';
import { formatGSVariable, formatHeapVariable } from './LogicalView';

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
  const allVariables: Variable[] = [];
  let nextAddress: number = 0;

  if (execState !== undefined) {
    const stacks = execState.getStacks();

    stacks.forEach((stack) => {
      const variables = stack.getVariables();
      variables.forEach((v) => {
        if (nextAddress !== v.address) {
          allVariables.push(new Variable('', '', '...', nextAddress, 0));
        }
        if (stack.name === 'GLOBAL') {
          if (v.address >= 50000) {
            allVariables.push(formatGSVariable(v));
          }
          else {
            allVariables.push(formatHeapVariable(v));
          }
        }
        else {
          allVariables.push(v);
        }
        nextAddress = v.address + v.getByteSize();
      });
    });
  }

  return (
    <div id="PhysicalView">
      {allVariables.map((v) => {
        return (
          <PhysicalMemoryCell
            key={v.address}
            variable={v}
            selectedVar={selectedVar}
            handleClick={handleClick}
          />
        );
      })}
    </div>
  );
}

export default PhysicalView;
