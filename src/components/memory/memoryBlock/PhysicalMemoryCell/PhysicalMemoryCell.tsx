import React from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import classNames from 'classnames';
import { getValue } from '../MemoryCell';
import './style.scss';
import PhysicArrayMemoryCell from '../PhysicArrayMemoryCell';

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

  return dataType.indexOf('[') === -1 ? (
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
        <div className="col-2">{getValue(variable)}</div>
      </div>
      <div className="col-address">{dataType ? address : ''}</div>
    </div>
  ) : (
    <PhysicArrayMemoryCell
      variable={variable}
      selectedVar={selectedVar}
      handleClick={handleClick}
    />
  );
};

export default PhysicalMemoryCell;
