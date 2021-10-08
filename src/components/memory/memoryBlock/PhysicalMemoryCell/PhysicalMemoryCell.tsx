import React from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import classNames from 'classnames';
import { firstVarInArr } from '../MemoryCell';
import './style.scss';

export interface PhysicalMemoryCellProps {
  variable: Variable;
  selectedVar: Variable | undefined;
  handleClick: (variable: Variable) => void;
}

const PhysicalMemoryCell = ({
  variable,
  selectedVar,
  handleClick,
}: PhysicalMemoryCellProps) => {
  const varName = variable.name;
  const dataType = variable.type;
  const address = variable.address;

  const getValue = () => {
    const value = variable.getValue();
    if (dataType === 'char') {
      return "'" + String.fromCharCode(value) + "'";
    }
    if (value instanceof Array) {
      const fv = firstVarInArr(value);
      return '0x' + fv.address.toString(16);
    }
    return value.toString();
  };

  return dataType[-1] !== ']' ? (
    <div
      className={classNames('memory-cell', 'memory-cell-physic', {
        active: selectedVar?.address === address,
        'in-heap': varName === '',
        'disabled': !dataType,
      })}
      onClick={
        dataType
          ? () => {
              handleClick(variable);
            }
          : () => {}
      }
    >
      <div className="col-name variable-name">{varName}</div>
      <div className="col-value">
        <div className="col-1">{dataType}</div>
        <div className="col-2">{getValue()}</div>
      </div>
      <div className="col-address">{dataType ? address : ''}</div>
    </div>
  ) : (
    <div></div>
  );
};

export default PhysicalMemoryCell;
