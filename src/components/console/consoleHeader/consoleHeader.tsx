import React from 'react';
import './style.scss';
import classNames from 'classnames';

interface ConsoleHeaderProps {
  mode: 'IN' | 'OUT';
  changeMode: (mode: 'IN' | 'OUT') => void;
}

const ConsoleHeader = ({ mode, changeMode }: ConsoleHeaderProps) => {
  return (
    <div id="consoleHeader" className="panel-header">
      <div className="text-title">
        <div
          className={classNames('input-title clickable', {
            active: mode === 'IN',
          })}
          onClick={() => {
            changeMode('IN');
          }}
        >
          Input
        </div>
        <div className="vertical-line" />
        <div
          className={classNames('output-title clickable', {
            active: mode === 'OUT',
          })}
          onClick={() => {
            changeMode('OUT');
          }}
        >
          Output
        </div>
      </div>
    </div>
  );
};

export default ConsoleHeader;
