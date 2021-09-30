import classNames from 'classnames';
import React from 'react';
import './style.scss';

interface ControlButtonProps {
  iconHrefLight: string;
  iconHrefDark: string;
  onClick: () => void;
  disabled: boolean;
}

function ControlButton({iconHrefLight, iconHrefDark, onClick, disabled}: ControlButtonProps) {
  return (
    <div
      className={classNames('control-button', {disabled: disabled})}
      onClick={onClick}
    >
      <svg width={40} height={40}>
        <image xlinkHref={disabled ? iconHrefLight : iconHrefDark} height='40' width='40' cursor='pointer' />
      </svg>
    </div>
  );
}

export default ControlButton;
