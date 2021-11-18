import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { slot, signal, remove } from '../../emitter';
import { DataStructureInfo } from './DataStructureDrawer';

interface PointProps {
  info: DataStructureInfo;
}

function Point({ info }: PointProps) {
  const [offsetX, offsetY] = [24, -4];

  useEffect(() => {
    d3.selectAll('.point-arrow').call(
      d3
        .drag()
        .on('start', function (this: any, d: any) {})
        .on('drag', function (this: any, d: any) {
          d3.select(this).attr('transform', function () {
            let source = this.attributes.transform.value.replace(')', '');
            source = source.split(',');
            let tx = d.dx + Number(source[4]);
            let ty = d.dy + Number(source[5]);
            return 'matrix(0,1,-1,0,' + tx + ',' + ty + ')';
          });
        })
        .on('end', function (this: any, d: any) {
          let p = d3.select(this.parentNode);
          let g = d3.select(this);
          let blocks = d3.select('#svg').selectAll('.data_structure');
          let [dx, dy] = [0, 0];
          let transform = g.attr('transform');
          let pos: number[] = [];
          let t = p.attr('transform');
          pos[0] = Number.parseFloat(t.split(',')[4]);
          pos[1] = Number.parseFloat(t.split(',')[5].split(')')[0]);

          dx = Number.parseFloat(transform.split(',')[4]) + pos[0] - offsetX;
          dy =
            Number.parseFloat(transform.split(',')[5].split(')')[0]) +
            pos[1] -
            offsetY;
          let flag = false;
          blocks.each(function (_, i) {
            if (flag) {
              return;
            }
            const rect = d3.select(this);
            const trans = d3
              .select((this as any).parentNode.parentNode)
              .attr('transform');
            const x =
              Number.parseInt(rect.attr('x')) +
              Number.parseFloat(trans.split(',')[4]);
            const y =
              Number.parseInt(rect.attr('y')) +
              Number.parseFloat(trans.split(',')[5].split(')')[0]);

            if (dx >= x && dx < x + 50 && dy >= y && dy < y + 50) {
              flag = true;
              let [posX, posY] = [x + 25 + offsetX, y + 50 + offsetY];
              signal(
                'updatePointPos',
                info.getFuncName(),
                info.getVarName(),
                posX,
                posY
              );
              p.attr('transform', `matrix(1,0,0,1,${posX},${posY})`);
              g.attr('transform', 'matrix(0,1,-1,0,0,0)');
              return;
            }
          });
        }) as any
    );
    return () => {};
  }, []);

  return (
    <g className="point-arrow" transform="matrix(0,1,-1,0,0,0)">
      <g transform="matrix(0,-1,1,0,0,0)">
        <text x={-27} y={55} fontSize="15">
          {info.getVarName()}
        </text>
      </g>
      <svg
        className="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="1080"
        width="48"
        height="48"
      >
        <path
          d="M926 512.735C926 571.424 878.424 619 819.735 619h-248.47C512.576 619 465 571.424 465 512.735v-0.47C465 453.576 512.576 406 571.265 406h248.47C878.424 406 926 453.576 926 512.265v0.47z"
          fill="#666666"
          p-id="1081"
        ></path>
        <path
          d="M393.253 211.526l-20.039 16.782-123.556 103.274L207 367.183v0.145l-39.684 33.48-25.064 21.12c-22.134 18.592-35.922 41.499-41.51 65.496-5.388 23.137-3.028 47.277 6.944 69.558 7.388 16.509 18.961 32.002 34.772 45.283l20.973 17.595a126.607 126.607 0 0 0 3.903 3.42l40.138 33.612 42.422 35.526 118.205 99.202a133.348 133.348 0 0 0 5.115 4.072l20.039 16.782c36.111 30.193 79.632 36.734 116.905 22.18 24.035-9.384 45.478-27.516 60.637-53.813l2.168-3.765c5.847-12.988 9.483-27.541 10.548-43.261l0.454 0.442s-41.796-154.376-41.796-222.16 41.7-212.588 41.7-212.588c-0.035-19.327-3.918-37.061-10.907-52.586l-2.168-3.765c-14.4-24.98-34.475-42.577-57.051-52.322a110.188 110.188 0 0 0-3.585-1.492c-37.273-14.552-80.794-8.011-116.905 22.182z"
          fill="#666666"
          p-id="1082"
        ></path>
      </svg>
    </g>
  );
}

export default Point;
