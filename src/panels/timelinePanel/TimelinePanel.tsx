import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { scaleLinear as linear } from 'd3-scale';
import PanelHeader from '../../components/panelHeader/PanelHeader';
import StatementHighlightContent from '../../components/timeline/StatementHighlightContent';
import VariableHighlightContent from '../../components/timeline/VariableHighlightContent';
import './style.scss';
import '../../styles/colors.scss';
import * as d3 from 'd3';
import { inArray } from 'jquery';
import Slider from '../../components/timeline/Slider';
import ControlButtonGroup from '../../components/timeline/ControlButtonGroup';
import { DEBUG_STATE } from '../../components/server';
import { remove, slot } from '../../components/emitter';
import { unstable_batchedUpdates } from 'react-dom';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';

import { useSelector } from 'react-redux'
import '../../components/timeline/timeline.scss';
interface OptionItem {
  value: string;
  label: string;
  children: { value: string; label: string }[];
}

export interface StatementHighlight {
  color: string;
  lineNumber: number;
  visible: boolean;
  steps: number[];
  depth: number[];
}

export interface VariableWithSteps {
  color: string;
  funcName: string;
  name: string;
  visible: boolean;
  steps: number[];
  variable: Variable;
}

interface TimelinePanelProps {
  variableShowUps: VariableWithSteps[];
  updVariableShowUps: (variableShowUps: VariableWithSteps[]) => void;
}

function TimelinePanel({ variableShowUps, updVariableShowUps }: TimelinePanelProps) {
  const [max, setMax] = useState(0);
  const [marks, setMarks] = useState({});
  const [step, setStep] = useState(0);
  const [variableHighlights, setVariableHighlights] = useState<
    VariableWithSteps[]
  >([]);
  const [statementHighlights, setStatementHighlights] = useState<
    StatementHighlight[]
  >([]);
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [linesShowUp, setLinesShowUp] = useState<StatementHighlight[]>([]);
  const [debugStatus, setDebugStatus] = useState('');
  const [debugState, setDebugState] = useState<DEBUG_STATE>('Stop');
  const timelineArea = React.createRef<any>();
  const [timelineWidth, setTimelineWidth] = useState(0);

  const statements = useSelector((state) => (state as any).statements);
  const variables = useSelector((state) => (state as any).variables);

  useEffect(() => {
    slot('changeStep', (step: number) => {
      setStep(step);
    });
    slot('statementHighlight', (lineNumber: number) => {
      const statement = linesShowUp[lineNumber];
      const color = d3
        .rgb(
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255)
        )
        .formatRgb();
      alert(linesShowUp);
      statement.color = color;
      statementHighlights.push(statement);
      setStatementHighlights(statementHighlights);
      d3.selectAll(`.highlight${lineNumber}`).style('background-color', color);
    });

    slot('cancelStatementHighlight', (lineNumber: number) => {
      for (let i = 0; i < statementHighlights.length; i++) {
        if (statementHighlights[i]['lineNumber'] == lineNumber + 1) {
          statementHighlights.splice(i, 1);
          break;
        }
      }
      d3.selectAll(`.highlight${lineNumber}`).style('background-color', '#fff');
      setStatementHighlights(statementHighlights);
    });
    slot(
      'init',
      (
        stepCount: number,
        linesShowUp: any,
        allVariables: any,
        variableShowUp: any
      ) => {
        const options: OptionItem[] = [];
        Object.keys(allVariables).forEach((funcName) => {
          const temp: OptionItem = {
            value: funcName,
            label: funcName,
            children: [],
          };
          Object.keys(allVariables[funcName]).forEach((varName) => {
            temp.children.push({
              value: varName,
              label: varName,
            });
          });
          options.push(temp);
        });
        console.log(options, 'options');
        unstable_batchedUpdates(() => {
          setMax(stepCount);
          setVariableHighlights([]);
          setStatementHighlights([]);
          setLinesShowUp(linesShowUp);
          updVariableShowUps(variableShowUp);
          setOptions(options);
        });
        updVariableShowUps(variableShowUp);
      }
    );
    slot('changeState', (debugState: DEBUG_STATE, step: number) => {
      let debugStatus = '';
      if (debugState === 'Debugging') {
        debugStatus = `Step ${step}`;
      } else {
        debugStatus = debugState;
      }
      unstable_batchedUpdates(() => {
        setDebugStatus(debugStatus);
        setDebugState(debugState);
      });
    });

    return () => {
      remove('changeStep');
      remove('statementHighlight');
      remove('cancelStatementHighlight');
      remove('init');
      remove('changeState');
    };
  });

  const changeStatementColor = (lineNumber: number, color: string) => {
    for (let i = 0; i < statementHighlights.length; i++) {
      if (statementHighlights[i].lineNumber === lineNumber) {
        statementHighlights[i].color = color;
        break;
      }
    }
    d3.selectAll(`.highlight${lineNumber - 1}`).style(
      'background-color',
      color
    );
    setStatementHighlights(statementHighlights);
  };

  const changeStatementVisible = useCallback( (lineNumber: number) => {
    if(!linesShowUp[lineNumber]) return;
    
    const lines = [...linesShowUp];
    lines[lineNumber] = {...linesShowUp[lineNumber], visible: !linesShowUp[lineNumber].visible}
    setLinesShowUp(lines);
    // const len = statementHighlights.length;
    // for (let i = 0; i < len; i++) {
    //   if (statementHighlights[i].lineNumber === lineNumber) {
    //     statementHighlights[i].visible = !statementHighlights[i].visible;
    //     break;
    //   }
    // }
    // setStatementHighlights(statementHighlights);
  }, [linesShowUp])

  const addVariableHighlight = (funcName: string, varName: string) => {
    const color = d3
      .rgb(
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255)
      )
      .formatRgb();
    // console.log('addVariableHighlight: ', color);
    let temp = null;
    for (let i = 0; i < variableShowUps.length; i++) {
      if (
        variableShowUps[i].funcName === funcName &&
        variableShowUps[i].name === varName
      ) {
        variableShowUps[i].color = color;
        temp = variableShowUps[i];
        break;
      }
    }
    if (temp === null) {
      alert('Unexcepted Variable');
      return;
    }
    if (inArray(temp, variableHighlights) < 0) {
      variableHighlights.push(temp);
      setVariableHighlights(variableHighlights);
      updVariableShowUps(variableShowUps);
    }
    const memoryCells = d3
      .select('#memory')
      .selectAll(`.memory-${funcName}-${varName}`);
    memoryCells.select('rect').style('stroke', color);
    memoryCells.selectAll('text').attr('fill', color);
    const blockCells = d3
      .select('#svg')
      .selectAll(`.block-${funcName}-${varName}`);
    blockCells.select('rect').style('stroke', color);
    blockCells.selectAll('text').attr('fill', color);
  };

  const removeVariableHighlight = (funcName: string, varName: string) => {
    for (let i = 0; i < variableShowUps.length; i++) {
      if (
        variableShowUps[i].funcName === funcName &&
        variableShowUps[i].name === varName
      ) {
        variableShowUps[i].visible = true;
        break;
      }
    }
    for (let i = 0; i < variableHighlights.length; i++) {
      for (let j = 0; j < variableHighlights.length; j++) {
        if (
          variableHighlights[j].funcName === funcName &&
          variableHighlights[j].funcName === varName
        ) {
          variableHighlights.splice(i, 1);
          break;
        }
      }
    }
    const memoryCells = d3
      .select('#memory')
      .selectAll(`.memory-${funcName}-${varName}`);
    memoryCells.select('rect').style('stroke', 'black');
    memoryCells.selectAll('text').attr('fill', 'black');
    const blockCells = d3
      .select('#svg')
      .selectAll(`.block-${funcName}-${varName}`);
    blockCells.select('rect').style('stroke', 'black');
    blockCells.selectAll('text').attr('fill', 'black');

    setVariableHighlights(variableHighlights);
    updVariableShowUps(variableShowUps);
  };

  const changeVariableColor = (
    funcName: string,
    varName: string,
    color: string
  ) => {
    let i = 0;
    for (; i < variableShowUps.length; i++) {
      if (
        variableShowUps[i].funcName === funcName &&
        variableShowUps[i].name === varName
      ) {
        variableShowUps[i].color = color;
        break;
      }
    }
    for (let j = 0; j < variableHighlights.length; j++) {
      if (
        variableHighlights[j].funcName === funcName &&
        variableHighlights[j].name === varName
      ) {
        variableHighlights[j].color = color;
        break;
      }
    }
    const memoryCells = d3
      .select('#memory')
      .selectAll(`.memory-${funcName}-${varName}`);
    memoryCells.select('rect').style('stroke', color);
    memoryCells.selectAll('text').attr('fill', color);
    const blockCells = d3
      .select('#svg')
      .selectAll(`.block-${funcName}-${varName}`);
    blockCells.select('rect').style('stroke', color);
    blockCells.selectAll('text').attr('fill', color);

    setVariableHighlights(variableHighlights);
    updVariableShowUps(variableShowUps);
  };

  const changeVariableVisible = (funcName: string, varName: string) => {
    for (let i = 0; i < variableShowUps.length; i++) {
      if (
        variableShowUps[i].funcName === funcName &&
        variableShowUps[i]['name'] === varName
      ) {
        if (variableShowUps[i]['visible']) {
          const memoryCells = d3
            .select('#memory')
            .selectAll(`.memory-${funcName}-${varName}`);
          memoryCells.select('rect').style('stroke', 'black');
          memoryCells.selectAll('text').attr('fill', 'black');
          const blockCells = d3
            .select('#svg')
            .selectAll(`.block-${funcName}-${varName}`);
          blockCells.select('rect').style('stroke', 'black');
          blockCells.selectAll('text').attr('fill', 'black');
        } else {
          const memoryCells = d3
            .select('#memory')
            .selectAll(`.memory-${funcName}-${varName}`);
          memoryCells
            .select('rect')
            .style('stroke', variableShowUps[i]['color']);
          memoryCells
            .selectAll('text')
            .attr('fill', variableShowUps[i]['color']);
          const blockCells = d3
            .select('#svg')
            .selectAll(`.block-${funcName}-${varName}`);
          blockCells.select('rect').style('stroke', variableShowUps[i]['color']);
          blockCells.selectAll('text').attr('fill', variableShowUps[i]['color']);
        }
        variableShowUps[i]['visible'] = !variableShowUps[i]['visible'];
        break;
      }
    }

    setVariableHighlights(variableHighlights);
    updVariableShowUps(variableShowUps);
  };

  useEffect(() => {
    setTimelineWidth(timelineArea.current.clientWidth - 60);
  }, [timelineArea]);

  useEffect(() => {
    if(linesShowUp.length) {
      setStatementHighlights(
        Object.keys(statements).map(d => ({
          ...linesShowUp[d as any],
          color: statements[d],
        }))
      )
    }
  }, [linesShowUp, statements])

  const maxDepth = useMemo(() => {
    let max = 0;
    Object.values(linesShowUp).forEach(({depth}) => {
      max = Math.max(max, ...depth)
    })

    return max;
  }, [linesShowUp])

  useEffect(() => {
    if(variableShowUps.length) {
      console.log(variableShowUps, 'varib', variables)
     
      const highlights = variableShowUps.filter(({funcName, name}) => {
        return variables[funcName+'-'+name]
      }).map(d => {
        return ({
          ...d,
          color: variables[d.funcName+'-'+d.name]
        })
      })

      setVariableHighlights(highlights)
    }
  }, [variableShowUps, variables])

  return (
    <div id="TimelinePanel" className="panel">
      <PanelHeader title="Timeline" />
      <div className="main-content">
        <div className="col-2" ref={timelineArea}>
          <div className="row-1">
            <Slider
              step={step}
              max={max}
              scale={linear().domain([0, max]).range([0, timelineWidth])}
              width={timelineWidth}
              height={8}
              maxDepth={maxDepth}
              variableHighlights={variableHighlights}
              statementHighlights={statementHighlights}
            />
          </div>
          <div className="row-2">
            <ControlButtonGroup debugState={debugState} />
          </div>
        </div>
        <div className="col-1">
          <StatementHighlightContent
            statements={statements}
            linesShowUp={linesShowUp}
            // changeStatementColor={changeStatementColor}
            // statementHighlights={statementHighlights}
            changeStatementVisible={changeStatementVisible}
          />
        </div>
        {/* <div className="col-3">
          <VariableHighlightContent
            variableHighlights={variableHighlights}
            options={options}
          // addVariableHighlight={addVariableHighlight}
          // changeVariableColor={changeVariableColor}
          // changeVariableVisible={changeVariableVisible}
          // removeVariableHighlight={removeVariableHighlight}
          />
        </div> */}
      </div>
    </div>
  );
}

export default TimelinePanel;
