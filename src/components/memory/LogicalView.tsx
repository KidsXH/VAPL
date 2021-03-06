import { type } from 'os';
import React, { useEffect, useState } from 'react';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { Stack } from 'unicoen.ts/dist/interpreter/Engine/Stack';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import MemoryBlock from './memoryBlock/MemoryBlock';
import MemoryCell, { MemoryCellProps } from './memoryBlock/MemoryCell';

import './style.scss';

interface LogicalViewProps {
  execState: ExecState | undefined;
  selectedVar: Variable | undefined;
  handleClick: (variable: Variable) => void;
}

function LogicalView({
  execState,
  selectedVar,
  handleClick,
}: LogicalViewProps) {
  const [allStacks, setAllStacks] = useState<Stack[]>([]);
  const [heap, setHeap] = useState<Variable[]>([]);
  const [global, setGlobal] = useState<Variable[]>([]);

  useEffect(() => {
    if (execState !== undefined) {
      const stacks = execState.getStacks();
      const curStacks: Stack[] = [];
      const curHeap: Variable[] = [];
      const curGlobal: Variable[] = [];

      // console.log('DEBUG| Stacks: ' + stacks);

      stacks.forEach((stack) => {
        if (stack.name !== 'GLOBAL') {
          curStacks.push(stack);
        } else {
          const variables = stack.getVariables();
          variables.forEach((variable) => {
            if (variable.address >= 50000) {
              curGlobal.push(variable);
            } else if (variable.address >= 20000) {
              curHeap.push(variable);
            }
          });
        }
      });

      setAllStacks(curStacks);
      setHeap(curHeap);
      setGlobal(curGlobal);
    }
  }, [execState]);

  return (
    <div id="LogicalView">
      <div className="left-content">
        <div id="StackView" className="content-view">
          <div className="title"> Stack</div>
          <>
            <div className="content">
              {allStacks.map((stack) => {
                const p = stack.name.indexOf('.');
                const stackName =
                  p > 0 ? stack.name.substring(0, p) : stack.name;
                return (
                  <MemoryBlock
                    key={stack.name}
                    funcName={stackName}
                    variables={stack.getVariables()}
                    selectedVar={selectedVar}
                    handleClick={handleClick}
                  />
                );
              })}
              {/* <MemoryBlock funcName="functionX" memoryCells={memoryCells} /> */}
            </div>
          </>
        </div>
      </div>
      <div className="right-content">
        <div id="HeapView" className="content-view">
          <div className="title">Heap</div>
          <div className="content">
            {heap.map((variable: Variable) => {
              return (
                <MemoryCell
                  key={variable.address}
                  variable={formatHeapVariable(variable)}
                  selectedVar={selectedVar}
                  handleClick={handleClick}
                />
              );
            })}
          </div>
        </div>
        <div id="GlobalStaticView" className="content-view">
          <div className="title">Global / Static</div>
          <>
            <div className="content">
              {global.map((v: Variable) => {
                return (
                  <MemoryCell
                    key={v.address}
                    variable={formatGSVariable(v)}
                    selectedVar={selectedVar}
                    handleClick={handleClick}
                  />
                );
              })}
            </div>
          </>
        </div>
      </div>
    </div>
  );
}

export default LogicalView;

export const formatHeapVariable = (variable: Variable) => {
  return Object.assign(variable, { name: '', parentName: '"Heap"' });
};

export const formatGSVariable = (variable: Variable) => {
  return Object.assign(variable, { parentName: '"Global / Static"' });
};
