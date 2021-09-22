import React from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import MemoryCell from './MemoryCell';
import './style.scss';

interface MemoryBlockProps {
  funcName: string;
  variables: Variable[];
  selectedVar: Variable | undefined;
  handleClick: (variable: Variable) => void;
  // memoryCells: {varName: string; dataType: string; value: string}[];
}

function MemoryBlock({
  funcName,
  variables,
  selectedVar,
  handleClick,
}: MemoryBlockProps) {
  return (
    <div className="memory-block">
      <div className="highlight-bar"></div>
      <div className="main-content">
        <div className="function-name">{funcName}</div>
        <div className="cells">
          {variables.map((variable) => {
            const value = variable.getValue();

            return value instanceof Array ? (
              <MemoryCell
                key={variable.name}
                variable={Object.assign(variable, { parentName: funcName })}
                selectedVar={selectedVar}
                handleClick={handleClick}
              />
            ) : (
              <MemoryCell
                key={variable.name}
                variable={Object.assign(variable, { parentName: funcName })}
                selectedVar={selectedVar}
                handleClick={handleClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MemoryBlock;
