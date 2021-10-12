import * as React from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import classNames from 'classnames';
import { useState } from 'react';
import HeaderCell from './HeaderCell';
import MemoryCell from '../MemoryCell';

type Props = {
  variable: Variable;
  selectedVar: Variable | undefined;
  handleClick: (variable: Variable) => void;
};

export const ArrayMemoryCell = ({
  variable,
  selectedVar,
  handleClick,
}: Props) => {
  const [isFolded, setIsFolded] = useState(true);
  const arr = variable.getValue();

  const foldArray = () => {
    setIsFolded(!isFolded);
  };

  return (
    <>
      <HeaderCell
        variable={variable}
        selectedVar={selectedVar}
        handleClick={handleClick}
        isFolded={isFolded}
        foldArray={foldArray}
      />
      {isFolded ? (
        <></>
      ) : (
        arr.map((v: Variable) => {
          return (
            <MemoryCell
              key={v.address}
              variable={v}
              selectedVar={selectedVar}
              handleClick={handleClick}
            />
          );
        })
      )}
    </>
  );
};

export default ArrayMemoryCell;
