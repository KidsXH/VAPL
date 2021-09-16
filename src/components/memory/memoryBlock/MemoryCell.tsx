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
  const address = variable.address;

  const getValue = () => {
    const value = variable.getValue();
    if (dataType === 'char') {
      return "'" + value.toString() + "'";
    }
    if (value instanceof Array) {
      const fv = firstVarInArr(value);
      return '0x' + fv.address.toString(16);
    }
    return value.toString();
  };

  return dataType[-1] !== ']' ? (
    <div
      className={classNames('memory-cell', {
        active: selectedVar?.address === address,
        'in-heap': varName === '',
      })}
      onClick={() => {
        handleClick(variable);
      }}
    >
      <div className="col-name variable-name">{varName}</div>
      <div className="col-value">
        <div className="col-1">{dataType}</div>
        <div className="col-2">{getValue()}</div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}

export default MemoryCell;

function firstVarInArr(arr: Array<Variable>) {
  while (arr[0].getValue() instanceof Array) {
    arr = arr[0].getValue();
  }
  return arr[0];
}
