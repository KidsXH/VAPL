import React, { useEffect } from 'react';
import { DataStructureInfo } from './DataStructureDrawer';
import * as d3 from 'd3';

interface VariableBlockProps {
  info: DataStructureInfo;
}

function VariableBlock({ info }: VariableBlockProps) {
  useEffect(() => {
    return () => {
      let blocks = d3.select('#svg').selectAll('.variable-block');
      blocks.each(function () {
        let block = d3.select(this);
        let width = (
          block.select('.variable-block-text').node() as any
        ).getBBox().width;
        block
          .selectAll('.variable-block-rect')
          .attr('width', Math.max(width + 40, 50));
      });
    };
  });
  return (
    <g className="variable-block">
      <text x={info.getPos()[0]} y={info.getPos()[1]} fontSize="15">
        {info.getVarName()}
      </text>
      <rect
        x={info.getPos()[0]}
        y={info.getPos()[1] + 15}
        width={50}
        height={50}
        fill="white"
        style={{ stroke: '#979797', strokeWidth: '1.5px' }}
        className="variable-block-rect"
      ></rect>
      <text
        x={info.getPos()[0] + 20}
        y={info.getPos()[1] + 45}
        fontSize="18"
        className="variable-block-text"
      >
        {info.getValue() === '\0' ? '\\0' : info.getValue()}
      </text>
    </g>
  );
}

export default VariableBlock;
