import React, { useEffect, useState } from 'react';
import { DataStructureInfo } from './DataStructureDrawer';

interface ArrayBlockProps {
  info: DataStructureInfo;
}

function ArrayBlock({ info }: ArrayBlockProps) {
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
              x={
                info.getPos()[0] +
                60 * i +
                (60 - Math.min(v.length, 5) * 10) / 2
              }
              y={info.getPos()[1] + 47}
              fontSize="18"
              fill={'rgb(139, 139, 139)'}
              className="variable-name"
            >
              {v.length > 5 ? v.substring(0, 4) + '...' : v.substring(0, 5)}
            </text>
          </g>
        );
      })}
    </>
  );
}

export default ArrayBlock;
