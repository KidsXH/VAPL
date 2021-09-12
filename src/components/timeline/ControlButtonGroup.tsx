import React, {useEffect, useState} from 'react';

import {DEBUG_STATE} from '../server';
import {showEvents, signal} from '../emitter';
import * as d3 from 'd3';

import check from '../../assets/check.svg';
import ControlButton from './ControButton';

import './style.scss'

function ControlButtonGroup({debugState}: {debugState: DEBUG_STATE}) {
  const [start, setStart] = useState(false);
  const [stop, setStop] = useState(false);
  const [backAll, setBackAll] = useState(false);
  const [stepBack, setStepBack] = useState(false);
  const [step, setStep] = useState(true);
  const [stepAll, setStepAll] = useState(false);

  useEffect(() => {
    
    switch (debugState) {
      case 'Stop':
        setStart(false);
        setStop(false);
        setBackAll(false);
        setStepBack(false);
        setStep(true);
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
  }, [debugState]);

  return (
    <div className='control-btn-group'>
      <ControlButton
        iconHref={check}
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
          sessionStorage.clear();
        }}
        disabled={!start}
      />
      <ControlButton
        iconHref={check}
        onClick={() => signal('debug', 'BackAll')}
        disabled={!backAll}
      />
      <ControlButton
        iconHref={check}
        onClick={() => signal('debug', 'StepBack')}
        disabled={!stepBack}
      />
      <ControlButton
        iconHref={stop ? check : check}
        onClick={() => signal('debug', stop ? 'Step' : 'Start')}
        disabled={!step}
      />
      <ControlButton
        iconHref={check}
        onClick={() => signal('debug', stop ? 'StepAll' : 'Exec')}
        disabled={!stepAll}
      />
    </div>
  );
}

export default ControlButtonGroup;
