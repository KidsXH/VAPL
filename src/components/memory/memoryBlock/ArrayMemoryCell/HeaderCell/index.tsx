// @flow
import * as React from 'react';
import classNames from 'classnames';
import { getValue, MemoryCellProps } from '../../MemoryCell';

import '../../style.scss';
import './style.scss';

type Props = MemoryCellProps & {
  isFolded: boolean;
  foldArray: () => void;
};

export const HeaderCell = ({
  variable,
  selectedVar,
  handleClick,
  isFolded,
  foldArray,
}: Props) => {
  const address = variable.address;
  const varName = variable.name;
  const dataType = variable.type;

  return (
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
      <div
        className="col-arrow"
        onClick={() => {
          foldArray();
        }}
      >
        {isFolded ? '▼' : '▲'}
      </div>
    </div>
  );
};

export default HeaderCell;
