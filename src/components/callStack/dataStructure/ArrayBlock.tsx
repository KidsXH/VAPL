import React, { useEffect, useState } from 'react';
import { DataStructureInfo } from './DataStructureDrawer';

interface ArrayBlockProps {
  info: DataStructureInfo;
}

function ArrayBlock({ info }: ArrayBlockProps) {
  return (
    <>
      <text x={info.getPos()[0]} y={info.getPos()[1]} fontSize="15">
        {info.getVarName()}
      </text>
      {info.getValue().map((v: string, i: number) => {
        return (
          <g key={i}>
            <rect
              x={info.getPos()[0] + 50 * i}
              y={info.getPos()[1] + 15}
              width={50}
              height={50}
              fill="white"
              style={{ stroke: '#979797', strokeWidth: '1.5px' }}
              className="data_structure"
            ></rect>
            <text
              x={info.getPos()[0] + 10 + 50 * i}
              y={info.getPos()[1] + 45}
              fontSize="18"
            >
              {v}
            </text>
          </g>
        );
      })}
    </>
  );
}

export default ArrayBlock;
