import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import LogicalView from '../../components/memory/LogicalView';
import MemoryDetail, { MemoryInfo } from '../../components/memory/MemoryDetail';
import PhysicalView from '../../components/memory/PhysicalView';
import PanelHeader from '../../components/panelHeader/PanelHeader';
import SubtitleBlock from '../../components/subtitleBlock/SubtitleBlock';
import './style.scss';

// const example_memory: MemoryInfo = {
//   funcName: 'recursiveToThree',
//   varName: 'n',
//   address: '0xc35f',
//   type: 'int',
//   value: '-1',
//   binaryCode0: '1000 0001',
//   binaryCode1: '1000 0001',
//   binaryCode2: '1000 0001',
//   // binaryCode0: '1000 0000 0000 0000 0000 0000 0000 0001',
//   // binaryCode1: '1111 1111 1111 1111 1111 1111 1111 1110',
//   // binaryCode2: '1111 1111 1111 1111 1111 1111 1111 1111',
// };

interface MemoryPanelProps {
  execState: ExecState | undefined;
}

function MemoryPanel({ execState }: MemoryPanelProps) {
  const [viewMode, setViewMode] = useState('logical');
  const [selectedVar, setSelectedVar] = useState<Variable>();
  const [lastVar, setLastVar] = useState<Variable>();

  const handleModeChange = (mode: 'logical' | 'physical') => {
    setViewMode(mode);
  };

  const handleSelectMemory = (newSelectedVar: Variable) => {
    if (newSelectedVar.address === selectedVar?.address) {
      hideDetail();
    } else {
      setLastVar(selectedVar);
      setSelectedVar(newSelectedVar);
    }
  };

  const hideDetail = () => {
    setLastVar(selectedVar);
    setSelectedVar(undefined);
  };

  return (
    <div
      id="MemoryPanel"
      className={classNames('panel', {
        'show-detail': selectedVar !== undefined,
        'hide-detail': selectedVar === undefined,
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
          <LogicalView
            execState={execState}
            selectedVar={selectedVar}
            handleClick={handleSelectMemory}
          />
        ) : (
          <PhysicalView
            execState={execState}
            selectedVar={selectedVar}
            handleClick={handleSelectMemory}
          />
        )}
      </div>
      <div className="subtitle-area">
        <SubtitleBlock
          title="Memory Detail"
          isActive={selectedVar !== undefined}
          handleClick={() => {
            if (selectedVar !== undefined) {
              hideDetail();
            } else {
              if (lastVar !== undefined) {
                setSelectedVar(lastVar);
              } else {
                // setSelectedVar(example_memory);
                alert('Click a memory cell to start');
              }
            }
          }}
        />
      </div>
      <div className="detail-area">
        <MemoryDetail variable={selectedVar ? selectedVar : lastVar} />
      </div>
    </div>
  );
}

export default MemoryPanel;
