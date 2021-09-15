import React, {useState} from 'react';
import MemoryBlock from './memoryBlock/MemoryBlock';
import MemoryCell, {MemoryCellProps} from './memoryBlock/MemoryCell';

import './style.scss';

function LogicalView() {
  const [memoryCells, setMemoryCells] = useState<MemoryCellProps[]>([
    {varName: 'n', dataType: 'int', value: '2100000000'},
    {varName: 'm', dataType: 'int', value: '15'},
  ]);

  return (
    <div id='LogicalView'>
      <div id='StackView' className='content-view'>
        <div className='title'> Stack</div>
        <div className='content'>
          <MemoryBlock funcName='functionX' memoryCells={memoryCells} />
        </div>
      </div>
      <div id='HeapView' className='content-view'>
        <div className='title'>Heap</div>
        <div className='content'>
          <MemoryCell varName='' dataType='int' value='10' />
        </div>
      </div>
      <div id='GlobalStaticView' className='content-view'>
        <div className='title'>Global / Static</div>
        <div className='content'>
          <MemoryCell varName='a' dataType='int' value='10' />
          <MemoryCell varName='b' dataType='int' value='10' />
        </div>
      </div>
    </div>
  );
}

export default LogicalView;
