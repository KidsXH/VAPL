import React from 'react';
import './style.scss';

interface PanelHeaderProps {
    title: string;
}

function PanelHeader({title}: PanelHeaderProps) {
  return (
      <div className='panel-header'>
        <div className='text-title'>{title}</div>
      </div>
  );
}

export default PanelHeader;
