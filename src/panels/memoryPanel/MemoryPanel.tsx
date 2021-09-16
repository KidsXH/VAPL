import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import LogicalView from '../../components/memory/LogicalView';
import MemoryDetail, { MemoryInfo } from '../../components/memory/MemoryDetail';
import PhysicalView from '../../components/memory/PhysicalView';
import PanelHeader from '../../components/panelHeader/PanelHeader';
import SubtitleBlock from '../../components/subtitleBlock/SubtitleBlock';
import './style.scss';

const example_memory: MemoryInfo = {
  funcName: 'recursiveToThree',
  varName: 'n',
  address: '0xc35f',
  type: 'int',
  value: '-1',
  binaryCode0: '1000 0001',
  binaryCode1: '1000 0001',
  binaryCode2: '1000 0001',
  // binaryCode0: '1000 0000 0000 0000 0000 0000 0000 0001',
  // binaryCode1: '1111 1111 1111 1111 1111 1111 1111 1110',
  // binaryCode2: '1111 1111 1111 1111 1111 1111 1111 1111',
};

interface MemoryPanelProps {
  execState: ExecState | undefined;
}

function MemoryPanel({ execState }: MemoryPanelProps) {
  const [viewMode, setViewMode] = useState('logical');
  const [selectedMemory, setSelectedMemory] = useState<MemoryInfo | null>(null);
  const [lastMemory, setLastMemory] = useState<MemoryInfo | null>(null);

  const handleModeChange = (mode: 'logical' | 'physical') => {
    setViewMode(mode);
  };

  const handleSelectMemory = (newSelectedMemory: MemoryInfo) => {
    setLastMemory(selectedMemory);
    setSelectedMemory(newSelectedMemory);
  };

  const hideDetail = () => {
    setLastMemory(selectedMemory);
    setSelectedMemory(null);
  };


  return (
    <div
      id="MemoryPanel"
      className={classNames('panel', {
        'show-detail': selectedMemory !== null,
        'hide-detail': selectedMemory === null,
      })}
    >
      <PanelHeader title="Memory" />
      <div className="subtitle-1">
        <div className="subtitle-area">
          <SubtitleBlock
            title="Logical View"
            isActive={viewMode === 'logical'}
            handleClick={() => handleModeChange('logical')}
          />
        </div>
        <div className="subtitle-area">
          <SubtitleBlock
            title="Physical View"
            isActive={viewMode === 'physical'}
            handleClick={() => handleModeChange('physical')}
          />
        </div>
      </div>
      <div className="main-area">
        {viewMode === 'logical' ? (
          <LogicalView execState={execState} />
        ) : (
          <PhysicalView execState={execState} />
        )}
      </div>
      <div className="subtitle-area">
        <SubtitleBlock
          title="Memory Detail"
          isActive={selectedMemory !== null}
          handleClick={() => {
            if (selectedMemory !== null) {
              hideDetail();
            } else {
              if (lastMemory !== null) {
                setSelectedMemory(lastMemory);
              } else {
                setSelectedMemory(example_memory);
                // alert('Click a memory cell to start')
              }
            }
          }}
        />
      </div>
      <div className="detail-area">
        <MemoryDetail
          memoryInfo={selectedMemory ? selectedMemory : lastMemory}
        />
      </div>
    </div>
  );
}

export default MemoryPanel;
