import React, {useState} from 'react';
import LogicalView from '../../components/memory/LogicalView';
import PhysicalView from '../../components/memory/PhysicalView';
import PanelHeader from '../../components/panelHeader/PanelHeader';
import SubtitleBlock from '../../components/subtitleBlock/SubtitleBlock';
import './style.scss';

function MemoryPanel() {
  const [viewMode, setViewMode] = useState('logical');

  const onModeChange = (mode: 'logical' | 'physical') => {
    setViewMode(mode);
  };

  return (
    <div id='MemoryPanel' className='panel'>
      <PanelHeader title='Memory' />
      <div className='subtitle-1'>
        <div className='subtitle-area'>
          <SubtitleBlock
            title='Logical View'
            isActive={viewMode === 'logical'}
            handleClick={() => onModeChange('logical')}
          />
        </div>
        <div className='subtitle-area'>
          <SubtitleBlock
            title='Physical View'
            isActive={viewMode === 'physical'}
            handleClick={() => onModeChange('physical')}
          />
        </div>
      </div>
      <div>
        {viewMode === 'logical' ? <LogicalView />: <PhysicalView />}
      </div>
      <div className='subtitle-area'>
        <SubtitleBlock
          title='Memory Detail'
          isActive={false}
          handleClick={() => {}}
        />
      </div>
    </div>
  );
}

export default MemoryPanel;
