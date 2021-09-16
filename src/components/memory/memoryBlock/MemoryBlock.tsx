import React from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import MemoryCell from './MemoryCell';
import './style.scss';

interface MemoryBlockProps {
  funcName: string;
  variables: Variable[];
  // memoryCells: {varName: string; dataType: string; value: string}[];
}

function MemoryBlock({ funcName, variables }: MemoryBlockProps) {
  return (
    <div className="memory-block">
      <div className="highlight-bar"></div>
      <div className="main-content">
        <div className="function-name">{funcName}</div>
        <div className="cells">
          {variables.map((variable) => {
            const value = variable.getValue();

            return value instanceof Array ? (
              <MemoryCell key={variable.name} variable={variable} />
            ) : (
              <MemoryCell key={variable.name} variable={variable} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MemoryBlock;
