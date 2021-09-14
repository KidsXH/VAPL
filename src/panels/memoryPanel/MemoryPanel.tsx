import classNames from 'classnames';
import React, { useState } from 'react';
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
  binaryCode1: '1111 1110',
  binaryCode2: '1111 1111',
};

function MemoryPanel() {
  const [viewMode, setViewMode] = useState('logical');
  const [selectedMemory, setSelectedMemory] = useState<MemoryInfo | null>(null);

  const onModeChange = (mode: 'logical' | 'physical') => {
    setViewMode(mode);
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
            handleClick={() => onModeChange('logical')}
          />
        </div>
        <div className="subtitle-area">
          <SubtitleBlock
            title="Physical View"
            isActive={viewMode === 'physical'}
            handleClick={() => onModeChange('physical')}
          />
        </div>
      </div>
      <div className="main-area">
        {viewMode === 'logical' ? <LogicalView /> : <PhysicalView />}
      </div>
      <div className="subtitle-area">
        <SubtitleBlock
          title="Memory Detail"
          isActive={selectedMemory !== null}
          handleClick={() => {
            setSelectedMemory(selectedMemory !== null ? null : example_memory);
          }}
        />
      </div>
      <div className="detail-area">
        <MemoryDetail memoryInfo={selectedMemory} handleClick={() => {}} />
      </div>
    </div>
  );
}

export default MemoryPanel;
