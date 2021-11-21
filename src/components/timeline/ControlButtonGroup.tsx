import React, { useEffect, useState } from 'react';

import { DEBUG_STATE } from '../server';
import { showEvents, signal } from '../emitter';
import * as d3 from 'd3';

import stepLight from '../../assets/icon/stepLight.svg';
import stepDark from '../../assets/icon/stepDark.svg';
import stepAllLight from '../../assets/icon/stepAllLight.svg';
import stepAllDark from '../../assets/icon/stepAllDark.svg';
import restartLight from '../../assets/icon/restartLight.svg';
import restartDark from '../../assets/icon/restartDark.svg';

import stepBackLight from '../../assets/icon/stepBackLight.svg';
import stepBackDark from '../../assets/icon/stepBackDark.svg';
import backAllLight from '../../assets/icon/backAllLight.svg';
import backAllDark from '../../assets/icon/backAllDark.svg';

import startLight from '../../assets/icon/kaishi2.svg';
import startDark from '../../assets/icon/kaishi1.svg';
import ControlButton from './ControlButton';

import './style.scss';

function ControlButtonGroup({ debugState }: { debugState: DEBUG_STATE }) {
  const [start, setStart] = useState(false);
  const [stop, setStop] = useState(false);
  const [backAll, setBackAll] = useState(false);
  const [stepBack, setStepBack] = useState(false);
  const [step, setStep] = useState(true);
  const [stepAll, setStepAll] = useState(false);

  useEffect(() => {
    switch (debugState) {
      case 'Stop':
        setStart(true);
        setStop(false);
        setBackAll(false);
        setStepBack(false);
        setStep(false);
        setStepAll(false);
        break;
      case 'First':
        setStart(true);
        setStop(true);
        setBackAll(false);
        setStepBack(false);
        setStep(true);
        setStepAll(true);
        break;
      case 'stdin':
        setBackAll(false);
        setStepBack(false);
        setStep(true);
        setStepAll(true);
        break;
      case 'Debugging':
        setBackAll(true);
        setStepBack(true);
        setStep(true);
        setStepAll(true);
        break;
      case 'Executing':
        setBackAll(false);
        setStepBack(false);
        setStep(false);
        setStepAll(false);
        break;
      case 'EOF':
        setStart(true);
        setStop(true);
        setBackAll(true);
        setStepBack(true);
        setStep(false);
        setStepAll(false);
        break;
      default:
        break;
    }
    return () => {};
  }, [debugState]);

  return (
    <div className="control-btn-group">
      <ControlButton
        iconHrefLight={backAllLight}
        iconHrefDark={backAllDark}
        onClick={() => {
          sessionStorage.clear();
          signal('debug', 'BackAll');
        }}
        disabled={!backAll}
      />
      <ControlButton
        iconHrefLight={stepBackLight}
        iconHrefDark={stepBackDark}
        onClick={() => signal('debug', 'StepBack')}
        disabled={!stepBack}
      />
      <ControlButton
        iconHrefLight={stop ? restartLight : startLight}
        iconHrefDark={stop ? restartDark : startDark}
        onClick={() => {
          signal('debug', 'Start');
          const arrowListJson = sessionStorage.getItem('arrowList');
          let arrowList =
            arrowListJson === null ? {} : JSON.parse(arrowListJson);
          if (!arrowList) {
            arrowList = {};
          }
          Object.keys(arrowList).forEach((name) => {
            d3.select('#svg')
              .select(`#block_${name}`)
              .attr('transform', 'matrix(1,0,0,1,0,0)');
          });
          const sourceCode = sessionStorage.getItem('sourceCode');
          sessionStorage.clear();
          if (sourceCode) sessionStorage.setItem('sourceCode', sourceCode);
          sessionStorage.setItem('exec', 'step');
          signal('updateDataStructure', null);
        }}
        disabled={!start}
      />
      <ControlButton
        iconHrefLight={stepLight}
        iconHrefDark={stepDark}
        onClick={() => {
          signal('debug', 'Step');
        }}
        disabled={!step}
      />
      <ControlButton
        iconHrefLight={stepAllLight}
        iconHrefDark={stepAllDark}
        onClick={() => signal('debug', stop ? 'StepAll' : 'Exec')}
        disabled={!stepAll}
      />
    </div>
  );
}

export default ControlButtonGroup;
