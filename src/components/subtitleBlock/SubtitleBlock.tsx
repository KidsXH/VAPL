import React from 'react';
import classNames from 'classnames';
import './style.scss';
interface SubtitleBlockProps {
  title: string;
  isActive: boolean;
  handleClick: () => void;
}

function SubtitleBlock({title, isActive, handleClick}: SubtitleBlockProps) {
  const onChange = () => {
    if (!isActive) {
      handleClick();
    }
  };

  return (
    <div
      className={classNames('subtitle-block', {'subtitle-active': isActive})}
      onClick={onChange}
    >
      {title}
    </div>
  );
}

export default SubtitleBlock;
