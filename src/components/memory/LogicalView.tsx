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
}

const example_var1 = new Variable('int', '', 2100000000, 10004, 2);
const example_var2 = new Variable('char', 'a', 'x', 10004, 2);
const example_var3 = new Variable('int', 'b', 10, 10004, 2);

function LogicalView({ execState }: LogicalViewProps) {
  const [allStacks, setAllStacks] = useState<Stack[]>([]);
  const [heap, setHeap] = useState<Variable[]>([]);
  const [global, setGlobal] = useState<Variable[]>([]);

  useEffect(() => {
    if (execState === undefined) {
      return;
    }

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
  }, [execState]);

  return (
    <div id="LogicalView">
      <div id="StackView" className="content-view">
        <div className="title"> Stack</div>
        <div className="content">
          {allStacks.map((stack) => {
            const p = stack.name.indexOf('.');
            const stackName = p > 0 ? stack.name.substring(0, p) : stack.name;
            return (
              <MemoryBlock
                key={stackName}
                funcName={stackName}
                variables={stack.getVariables()}
              />
            );
          })}
          {/* <MemoryBlock funcName="functionX" memoryCells={memoryCells} /> */}
        </div>
      </div>
      <div id="HeapView" className="content-view">
        <div className="title">Heap</div>
        <div className="content">
          <MemoryCell variable = {example_var1} />
        </div>
      </div>
      <div id="GlobalStaticView" className="content-view">
        <div className="title">Global / Static</div>
        <div className="content">
          <MemoryCell variable={example_var2} />
          <MemoryCell variable={example_var3} />
        </div>
      </div>
    </div>
  );
}

export default LogicalView;
