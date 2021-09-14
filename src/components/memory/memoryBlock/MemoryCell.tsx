import React from 'react';
import './style.scss';

interface MemoryCellProps {
  varName: string;
  dataType: string;
  value: string;
}

function MemoryCell({varName, dataType, value}: MemoryCellProps) {
  return (
    <div className='memory-cell'>
      <div className='col-name'>{varName}</div>
      <div className='col-value'>
        <div className='col-1'>{dataType}</div>
        <div className='col-2'>{value}</div>
      </div>
    </div>
  );
}

export default MemoryCell;
