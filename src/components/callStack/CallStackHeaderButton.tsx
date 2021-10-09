import React, { useEffect, useState } from 'react';
import './callstack.scss';

import * as d3 from 'd3';
import { Select } from 'antd';
import gifshot from '../../assets/script/gifshot';
import ControlButton from '../timeline/ControlButton';

import playGIF from '../../assets/icon/kaishi.svg';
import pauseGIF from '../../assets/icon/zanting.svg';
import downloadGIF from '../../assets/icon/xiazai.svg';
import loadingGIF from '../../assets/icon/jiazai.svg';

const { Option } = Select;

interface CallStackHeaderButtonProps {
  handleChange: any;
}

function CallStackHeaderButton({ handleChange }: CallStackHeaderButtonProps) {
  const [frameInterval, setFrameInterval] = useState(
    setInterval(() => {}, 1000)
  );
  const [isRecording, setIsRecording] = useState(false);
  const [imageList, setImageList] = useState<Array<String>>([]);
  const [downloadURL, setDownloadURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="header-btn">
      <div className="header-select">
        <span>Animation speed: </span>
        <Select
          defaultValue="1.0"
          style={{ width: 80 }}
          onChange={handleChange}
        >
          <Option value="2.0">2.0x</Option>
          <Option value="1.5">1.5x</Option>
          <Option value="1.25">1.25x</Option>
          <Option value="1.0">1.0x</Option>
          <Option value="0.75">0.75x</Option>
          <Option value="0.5">0.5x</Option>
        </Select>
      </div>
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
              }, 100)
            );
          } else {
            let svg = d3.select('#svg');
            setIsRecording(false);
            clearInterval(frameInterval);
            setIsLoading(true);
            setDownloadURL('');
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
                setIsLoading(false);
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
        iconHrefLight={isLoading ? loadingGIF : downloadGIF}
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

export default CallStackHeaderButton;
