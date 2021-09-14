import React, { useEffect, useState } from 'react';
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

export interface VariableHighlight {
  color: string;
  funcName: string;
  name: string;
  visible: boolean;
  steps: number[];
}

function TimelinePanel() {
  const [max, setMax] = useState(0);
  const [marks, setMarks] = useState({});
  const [step, setStep] = useState(0);
  const [variableHighlights, setVariableHighlights] = useState<
    VariableHighlight[]
  >([]);
  const [statementHighlights, setStatementHighlights] = useState<
    StatementHighlight[]
  >([]);
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [linesShowUp, setLinesShowUp] = useState<StatementHighlight[]>([]);
  const [variableShowUp, setVariableShowUp] = useState<VariableHighlight[]>([]);
  const [debugStatus, setDebugStatus] = useState('');
  const [debugState, setDebugState] = useState<DEBUG_STATE>('Stop');
  const timelineArea = React.createRef<any>();
  const [timelineWidth, setTimelineWidth] = useState(0);

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
        // console.log(variableShowUp);

        setMax(stepCount);
        setVariableHighlights([]);
        setStatementHighlights([]);
        setLinesShowUp(linesShowUp);
        setVariableShowUp(variableShowUp);
        setOptions(options);
      }
    );
    slot('changeState', (debugState: DEBUG_STATE, step: number) => {
      let debugStatus = '';
      if (debugState === 'Debugging') {
        debugStatus = `Step ${step}`;
      } else {
        debugStatus = debugState;
      }
      setDebugStatus(debugStatus);
      setDebugState(debugState);
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

  const changeStatementVisible = (lineNumber: number) => {
    const len = statementHighlights.length;
    for (let i = 0; i < len; i++) {
      if (statementHighlights[i].lineNumber === lineNumber) {
        statementHighlights[i].visible = !statementHighlights[i].visible;
        break;
      }
    }
    setStatementHighlights(statementHighlights);
  };

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
    for (let i = 0; i < variableShowUp.length; i++) {
      if (
        variableShowUp[i].funcName === funcName &&
        variableShowUp[i].name === varName
      ) {
        variableShowUp[i].color = color;
        temp = variableShowUp[i];
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
      setVariableShowUp(variableShowUp);
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
    for (let i = 0; i < variableShowUp.length; i++) {
      if (
        variableShowUp[i].funcName === funcName &&
        variableShowUp[i].name === varName
      ) {
        variableShowUp[i].visible = true;
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
    setVariableShowUp(variableShowUp);
  };

  const changeVariableColor = (
    funcName: string,
    varName: string,
    color: string
  ) => {
    let i = 0;
    for (; i < variableShowUp.length; i++) {
      if (
        variableShowUp[i].funcName === funcName &&
        variableShowUp[i].name === varName
      ) {
        variableShowUp[i].color = color;
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
    setVariableShowUp(variableShowUp);
  };

  const changeVariableVisible = (funcName: string, varName: string) => {
    for (let i = 0; i < variableShowUp.length; i++) {
      if (
        variableShowUp[i].funcName === funcName &&
        variableShowUp[i]['name'] === varName
      ) {
        if (variableShowUp[i]['visible']) {
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
            .style('stroke', variableShowUp[i]['color']);
          memoryCells
            .selectAll('text')
            .attr('fill', variableShowUp[i]['color']);
          const blockCells = d3
            .select('#svg')
            .selectAll(`.block-${funcName}-${varName}`);
          blockCells.select('rect').style('stroke', variableShowUp[i]['color']);
          blockCells.selectAll('text').attr('fill', variableShowUp[i]['color']);
        }
        variableShowUp[i]['visible'] = !variableShowUp[i]['visible'];
        break;
      }
    }

    setVariableHighlights(variableHighlights);
    setVariableShowUp(variableShowUp);
  };

  useEffect(() => {
    setTimelineWidth(timelineArea.current.clientWidth);
  }, [timelineArea]);

  return (
    <div id="TimelinePanel" className="panel">
      <PanelHeader title="Timeline" />
      <div className="main-content">
        <div className="col-1">
          <StatementHighlightContent
          // changeStatementColor={changeStatementColor}
          // statementHighlights={statementHighlights}
          // changeStatementVisible={changeStatementVisible}
          />
        </div>
        <div className="col-2" ref={timelineArea}>
          <div className="row-1">
            <Slider
              step={step}
              max={max}
              scale={linear().domain([0, max]).range([0, timelineWidth])}
              width={timelineWidth}
              height={8}
              // variableHighlights={variableHighlights}
              // statementHighlights={statementHighlights}
            />
          </div>
          <div className="row-2">
            <ControlButtonGroup debugState={debugState} />
          </div>
        </div>
        <div className="col-3">
          <VariableHighlightContent
          // variableHighlights={variableHighlights}
          // options={options}
          // addVariableHighlight={addVariableHighlight}
          // changeVariableColor={changeVariableColor}
          // changeVariableVisible={changeVariableVisible}
          // removeVariableHighlight={removeVariableHighlight}
          />
        </div>
      </div>
    </div>
  );
}

export default TimelinePanel;
