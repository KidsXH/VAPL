import classNames from 'classnames';
import React from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import './style.scss';

export interface MemoryCellProps {
  variable: Variable;
  selectedVar: Variable | undefined;
  handleClick: (variable: Variable) => void;
}

function MemoryCell({ variable, selectedVar, handleClick }: MemoryCellProps) {
  const varName = variable.name;
  const dataType = variable.type;
  const value =
    dataType === 'char' ? "'" + variable.getValue() + "'" : variable.getValue();
  const address = variable.address;

  return (
    <div
      className={classNames('memory-cell', {
        active: selectedVar?.address === address,
      })}
      onClick={() => {
        handleClick(variable);
      }}
    >
      <div className="col-name variable-name">{varName}</div>
      <div className="col-value">
        <div className="col-1">{dataType}</div>
        <div className="col-2">{value.toString()}</div>
      </div>
    </div>
  );
}

export default MemoryCell;
