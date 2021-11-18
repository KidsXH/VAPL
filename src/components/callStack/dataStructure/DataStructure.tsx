import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import ArrayBlock from './ArrayBlock';
import Point from './Point';
import { DataStructureDrawer } from './DataStructureDrawer';
import { remove, signal, slot } from '../../emitter';
import { ExecState } from 'unicoen.ts';
import StringBlock from './StringBlock';
import VariableBlock from './VariableBlock';

export function dragged(this: any, d: any) {
  d3.select(this).attr('transform', function () {
    let source = this.attributes.transform.value.replace(')', '');
    source = source.split(',');
    let tx = d.dx + Number(source[4]);
    let ty = d.dy + Number(source[5]);
    return 'matrix(1,0,0,1,' + tx + ',' + ty + ')';
  });
}

interface dataStructureProps {
  execState: ExecState | undefined;
}

function DataStructure({ execState }: dataStructureProps) {
  const [dataStructureDrawer, setDataStructureDrawer] = useState(
    new DataStructureDrawer(execState)
  );
  const [update, setUpdate] = useState(0);

  useEffect(() => {
    slot(
      'addDataStructure',
      (funcName: string, varName: string, type: string) => {
        dataStructureDrawer.addDataStructure(funcName, varName, type);
        setDataStructureDrawer(dataStructureDrawer);
        setUpdate(update + 1);
        d3.selectAll('.dragable').call(d3.drag().on('drag', dragged) as any);
      }
    );
    slot('updateDataStructure', (execState: ExecState) => {
      if (execState) dataStructureDrawer.setExecState(execState);
      dataStructureDrawer.update();
      setDataStructureDrawer(dataStructureDrawer);
      setUpdate(update + 1);
      d3.selectAll('.dragable').call(d3.drag().on('drag', dragged) as any);
    });
    slot(
      'updatePointPos',
      (funcName: string, varName: string, posX: number, posY: number) => {
        dataStructureDrawer.updatePointPos(funcName, varName, posX, posY);
        setDataStructureDrawer(dataStructureDrawer);
        d3.selectAll('.dragable').call(d3.drag().on('drag', dragged) as any);
      }
    );
    return () => {
      remove('addDataStructure');
      remove('updateDataStructure');
      remove('updatePointPos');
    };
  }, [dataStructureDrawer, update]);

  return (
    <>
      {dataStructureDrawer.getDataStructures().map((info) => {
        if (info.getType() === 'array') {
          return (
            <g
              className="dragable"
              transform="matrix(1,0,0,1,0,0)"
              key={info.getFuncName() + '-' + info.getVarName()}
            >
              <ArrayBlock info={info}></ArrayBlock>
            </g>
          );
        } else if (info.getType() === 'string') {
          return (
            <g
              className="dragable"
              transform="matrix(1,0,0,1,0,0)"
              key={info.getFuncName() + '-' + info.getVarName()}
            >
              <StringBlock info={info}></StringBlock>
            </g>
          );
        } else if (info.getType() === 'variable') {
          return (
            <g
              className="dragable"
              transform="matrix(1,0,0,1,0,0)"
              key={info.getFuncName() + '-' + info.getVarName()}
            >
              <VariableBlock info={info}></VariableBlock>
            </g>
          );
        }
      })}
      {dataStructureDrawer.getPoints().map((info) => {
        return (
          <g
            className="dragable"
            transform={`matrix(1,0,0,1,${info.getPos()[0]},${
              info.getPos()[1]
            })`}
            key={info.getFuncName() + '-' + info.getVarName()}
            id={`point-arrow-${info.getFuncName()}-${info.getVarName()}`}
          >
            <Point info={info}></Point>
          </g>
        );
      })}
    </>
  );
}

export default DataStructure;
