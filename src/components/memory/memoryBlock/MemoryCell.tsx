import classNames from 'classnames';
import React from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import './style.scss';
import ArrayMemoryCell from './ArrayMemoryCell';

export interface MemoryCellProps {
  variable: Variable;
  selectedVar: Variable | undefined;
  handleClick: (variable: Variable) => void;
}

function MemoryCell({ variable, selectedVar, handleClick }: MemoryCellProps) {
  const varName = variable.name;
  const dataType = variable.type;
  const address = variable.address;

  if (varName === 'pd_arr') {
    console.log('TYPE', dataType, dataType[6]);
  }

  return dataType.indexOf('[') === -1 ? (
    <div
      className={classNames('memory-cell', {
        active: selectedVar?.address === address,
        'in-heap': varName === '',
      })}
    >
      <div className="col-name variable-name">{varName}</div>
      <div
        className="col-value"
        onClick={() => {
          handleClick(variable);
        }}
      >
        <div className="col-1">{dataType}</div>
        <div className="col-2">{getValue(variable)}</div>
      </div>
    </div>
  ) : (
    <ArrayMemoryCell
      variable={variable}
      selectedVar={selectedVar}
      handleClick={handleClick}
    />
  );
}

export default MemoryCell;

export function firstVarInArr(arr: Array<Variable>) {
  while (arr[0].getValue() instanceof Array) {
    arr = arr[0].getValue();
  }
  return arr[0];
}

export const getValue = (variable: Variable) => {
  const value = variable.getValue();
  const dataType = variable.type;

  if (dataType === 'char') {
    return "'" + String.fromCharCode(value) + "'";
  }
  if (value instanceof Array) {
    // const fv = firstVarInArr(value);
    // return '0x' + fv.address.toString(16);
    return 'Array';
  }
  return value.toString();
};
