import React from 'react';
import PanelHeader from '../../components/panelHeader/PanelHeader';
import './style.scss';

function TimelinePanel() {
  return (
  <div id='TimelinePanel' className='panel'>
      <PanelHeader title='Timeline'/>
      <div className='mainContent'>
        <div className='col-1'>first</div>
        <div className='col-2'>second</div>
        <div className='col-3'>third</div>
      </div>
  </div>
  );
}

export default TimelinePanel;
