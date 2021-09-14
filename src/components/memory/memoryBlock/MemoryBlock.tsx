import React from 'react';
import MemoryCell from './MemoryCell';
import './style.scss';

interface MemoryBlockProps {
  funcName: string;
  memoryCells: {varName: string; dataType: string; value: string}[];
}

function MemoryBlock({funcName, memoryCells}: MemoryBlockProps) {
  return (
    <div className='memory-block'>
      <div className='highlight-bar'></div>
      <div className='main-content'>
        <div className='function-name'>{funcName}</div>
        <div className='cells'>
          {memoryCells.map((m) => {
            return (
              <MemoryCell
                key={m.varName}
                varName={m.varName}
                dataType={m.dataType}
                value={m.value}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MemoryBlock;
