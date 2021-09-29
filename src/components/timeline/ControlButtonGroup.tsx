import React, { useEffect, useState } from 'react';

import { DEBUG_STATE } from '../server';
import { showEvents, signal } from '../emitter';
import * as d3 from 'd3';
import gifshot from '../../assets/script/gifshot';

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
import ControlButton from './ControButton';

import playGIF from '../../assets/icon/play.svg';
import pauseGIF from '../../assets/icon/pause.svg';
import downloadGIF from '../../assets/icon/download.svg';

import './style.scss';

function ControlButtonGroup({ debugState }: { debugState: DEBUG_STATE }) {
  const [start, setStart] = useState(false);
  const [stop, setStop] = useState(false);
  const [backAll, setBackAll] = useState(false);
  const [stepBack, setStepBack] = useState(false);
  const [step, setStep] = useState(true);
  const [stepAll, setStepAll] = useState(false);
  const [frameInterval, setFrameInterval] = useState(
    setInterval(() => {}, 1000)
  );
  const [isRecording, setIsRecording] = useState(false);
  const [imageList, setImageList] = useState<Array<String>>([]);
  const [downloadURL, setDownloadURL] = useState('');

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
      {/* <ControlButton
        iconHrefLight={backAllLight}
        iconHrefDark={backAllDark}
        // onClick={() => signal('debug', 'BackAll')}
        onClick={() => {}}
        disabled={!backAll}
      /> */}
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
        }}
        disabled={!start}
      />
      <ControlButton
        iconHrefLight={stepLight}
        iconHrefDark={stepDark}
        onClick={() => {
          signal('debug', stop ? 'Step' : 'Start');
        }}
        disabled={!step}
      />
      {/* <ControlButton
        iconHrefLight={stepAllLight}
        iconHrefDark={stepAllDark}
        // onClick={() => signal('debug', stop ? 'StepAll' : 'Exec')}
        onClick={() => {}}
        disabled={!stepAll}
      /> */}
      <ControlButton
        iconHrefLight={!isRecording ? playGIF : pauseGIF}
        iconHrefDark={!isRecording ? playGIF : pauseGIF}
        onClick={() => {
          if (!isRecording) {
            setImageList([]);
            setIsRecording(true);
            setFrameInterval(
              setInterval(() => {
                let html = (
                  d3
                    .select('#svg')
                    .attr('version', 1.1)
                    .attr('xmlns', 'http://www.w3.org/2000/svg')
                    .node() as any
                ).parentNode.innerHTML;
                let imgsrc =
                  'data:image/svg+xml;base64,' +
                  btoa(unescape(encodeURIComponent(html)));
                imageList.push(imgsrc);
                setImageList(imageList);
                var a = d3
                  .select('#image-container')
                  .append('img')
                  .attr('src', imgsrc);
                a.remove();
              }, 100)
            );
          } else {
            let svg = d3.select('#svg');
            setIsRecording(false);
            clearInterval(frameInterval);
            console.log(imageList);

            gifshot.createGIF(
              {
                gifWidth: svg.attr('width'),
                gifHeight: svg.attr('height'),
                images: imageList,
                numWorkers: 4,
                frameDuration: 0.1,
                numFrames: imageList.length,
              },
              function (obj: any) {
                console.log('finish');
                if (!obj.error) {
                  var image = obj.image;
                  setDownloadURL(image);
                }
              }
            );
          }
        }}
        disabled={false}
      />
      <ControlButton
        iconHrefLight={downloadGIF}
        iconHrefDark={downloadGIF}
        onClick={() => {
          var a = document.createElement('a');
          a.download = 'action.gif';
          a.href = downloadURL;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }}
        disabled={downloadURL === ''}
      />
    </div>
  );
}

export default ControlButtonGroup;
