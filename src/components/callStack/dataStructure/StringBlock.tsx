import React from 'react';
import { DataStructureInfo } from './DataStructureDrawer';

interface StringBlockProps {
  info: DataStructureInfo;
}

function StringBlock({ info }: StringBlockProps) {
  return (
    <>
      <text
        x={info.getPos()[0]}
        y={info.getPos()[1]}
        fontSize="20"
        fill={'rgb(139, 139, 139)'}
        className="variable-name"
        fontWeight="blod"
      >
        {info.getVarName()}
      </text>
      <rect
        x={info.getPos()[0]}
        y={info.getPos()[1] + 15}
        width={60}
        height={50}
        fill="white"
        style={{
          stroke: '#979797',
          strokeWidth: '1.5px',
          opacity: `${info.getValue().length === 0 ? 0.2 : 0}`,
        }}
      ></rect>
      {info.getValue().map((v: string, i: number) => {
        return (
          <g key={i}>
            <rect
              x={info.getPos()[0] + 60 * i}
              y={info.getPos()[1] + 15}
              width={60}
              height={50}
              fill="white"
              style={{ stroke: '#979797', strokeWidth: '1.5px' }}
              className="data_structure"
            ></rect>
            <text
              x={info.getPos()[0] + 28 + 60 * i}
              y={info.getPos()[1] + 45}
              fontSize="15"
              fill={'rgb(139, 139, 139)'}
              className="variable-name"
            >
              {v !== '0' ? String.fromCharCode(Number.parseInt(v)) : ' '}
            </text>
          </g>
        );
      })}
    </>
  );
}

export default StringBlock;
