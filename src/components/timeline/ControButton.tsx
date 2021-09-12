import classNames from 'classnames';
import React from 'react';
import './style.scss';

interface ControlButtonProps {
  iconHref: string;
  onClick: () => void;
  disabled: boolean;
}

function ControlButton({iconHref, onClick, disabled}: ControlButtonProps) {
  return (
    <div
      className={classNames('control-button', {disabled: disabled})}
      onClick={onClick}
    >
      <svg width={25} height={25}>
        <image xlinkHref={iconHref} height='25' width='25' cursor='pointer' />
      </svg>
    </div>
  );
}

export default ControlButton;
