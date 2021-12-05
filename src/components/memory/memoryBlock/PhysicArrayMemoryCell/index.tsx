import * as React from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import { useState } from 'react';
import PhysicalMemoryCell from '../PhysicalMemoryCell/PhysicalMemoryCell';

type Props = {
  variable: Variable;
  selectedVar: Variable | undefined;
  handleClick: (variable: Variable) => void;
};

export const PhysicArrayMemoryCell = ({ variable, selectedVar, handleClick }: Props) => {
  const [isFolded, setIsFolded] = useState(false);
  const arr = variable.getValue();

  const foldArray = () => {
    setIsFolded(!isFolded);
  };

  return (
    <>
      {/*<HeaderCell*/}
      {/*  variable={variable}*/}
      {/*  selectedVar={selectedVar}*/}
      {/*  handleClick={handleClick}*/}
      {/*  isFolded={false}*/}
      {/*  foldArray={foldArray}*/}
      {/*  showAddress={true}*/}
      {/*/>*/}
      {isFolded ? (
        <></>
      ) : (
        arr.map((v: Variable) => {
          return (
            <PhysicalMemoryCell
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

export default PhysicArrayMemoryCell;