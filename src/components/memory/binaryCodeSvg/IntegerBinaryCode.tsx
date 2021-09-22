import React from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import './style.scss';
import intLegend1 from '../../../assets/icon/binaryCode/intLegend1.svg';
import intLegend2 from '../../../assets/icon/binaryCode/intLegend2.svg';
import intLegend3 from '../../../assets/icon/binaryCode/intLegend3.svg';
import intLegend4 from '../../../assets/icon/binaryCode/intLegend4.svg';
import intMark1 from '../../../assets/icon/binaryCode/intMark1.svg';
import intMark2 from '../../../assets/icon/binaryCode/intMark2.svg';
import classNames from 'classnames';

interface IntegerBinaryCodeProps {
  variable: Variable;
}

const IntegerBinaryCode = ({ variable }: IntegerBinaryCodeProps) => {
  const binaryCode0 = signMagn(variable);
  const binaryCode1 = oneComp(variable);
  const binaryCode2 = twoComp(variable);
  const sign = binaryCode0[0] === '1';
  return (
    <svg id="IntegerBinaryCode" height="100%" width="100%" fill="#8b8b8b">
      <text y={16}>Binary Code</text>
      <g id="legend" transform="translate(110 5)">
        <image xlinkHref={intLegend1} />
        <image x={80} xlinkHref={intLegend2} />
        <image x={165} y={2} xlinkHref={intLegend3} />
        <image x={205} y={2} xlinkHref={intLegend4} />
      </g>
      <g id="bianryCode0" className="value-text" transform="translate(0 45)">
        <text>Sign-Magnitude</text>
        <text
          className={classNames(
            'variable-value',
            sign ? 'sign-bit-neg' : 'sign-bit-pos'
          )}
          y={20}
        >
          {binaryCode0.substring(0, 1)}
        </text>
        <text className="variable-value" x={8} y={20}>
          {binaryCode0.substring(1)}
        </text>
      </g>

      <g id="bianryCode1" className="value-text" transform="translate(0 90)">
        <text>One's Complement</text>
        <text
          className={classNames(
            'variable-value',
            sign ? 'sign-bit-neg' : 'sign-bit-pos'
          )}
          y={20}
        >
          {binaryCode1.substring(0, 1)}
        </text>
        <text className="variable-value" x={8} y={20}>
          {binaryCode1.substring(1)}
        </text>
      </g>

      <g id="bianryCode2" className="value-text" transform="translate(0 135)">
        <text>Two's Complement</text>
        <text
          className={classNames(
            'variable-value',
            sign ? 'sign-bit-neg' : 'sign-bit-pos'
          )}
          y={20}
        >
          {binaryCode2.substring(0, 1)}
        </text>
        <text className="variable-value" x={8} y={20}>
          {binaryCode2.substring(1)}
        </text>
      </g>

      <defs>
        <marker
          id="arrow-tip"
          refX="8"
          refY="6"
          viewBox="0 0 16 16"
          markerWidth="8"
          markerHeight="8"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <path d="M 0 0 12 6 0 12 3 6 Z" />
        </marker>
      </defs>
      {sign ? (
        <g>
          <g id="underline">
            <line x1={9} y1={69} x2={250} y2={69}></line>
            <line x1={9} y1={114} x2={250} y2={114}></line>
            <line x1={1} y1={120} x2={250} y2={120}></line>
            <line x1={9} y1={159} x2={250} y2={159}></line>
          </g>
          <g id="arrows">
            <polyline
              points="260,69 280,69 280,114 260,114"
              markerEnd="url(#arrow-tip)"
              fill="none"
            />
            <polyline
              points="260,120 280,120 280,159 260,159"
              markerEnd="url(#arrow-tip)"
              fill="none"
            />
          </g>

          <g id="mark">
            <image x={290} y={85} xlinkHref={intMark1} />
            <image x={290} y={132} xlinkHref={intMark2} />
          </g>
        </g>
      ) : (
        <g></g>
      )}
    </svg>
  );
};

export default IntegerBinaryCode;

function twoComp(variable: Variable) {
  if (variable.type === 'int') {
    const num = variable.getValue();
    if (num >= 0) return signMagn(variable);
    const oneC = oneComp(variable);
    const twoC = '1' + d2b(parseInt(oneC, 2) + 1, 31);
    return twoC;
  }
  return 'X';
}

function d2b(num: number, width: number) {
  return (Array(width).join('0') + num.toString(2))
    .slice(-width)
    .replace('-', '0');
}

function signMagn(variable: Variable) {
  if (variable.type === 'int') {
    const num = variable.getValue();
    const binary = d2b(num, 31);
    return (num >= 0 ? '0' : '1') + binary;
  }
  return 'X';
}

function oneComp(variable: Variable) {
  if (variable.type === 'int') {
    const num = variable.getValue();

    if (num >= 0) {
      return signMagn(variable);
    }

    const binary = d2b(num, 31);
    const reg = /1|0/g;
    const oneC = binary.replace(reg, (x: string) => {
      return x === '0' ? '1' : '0';
    });
    return '1' + oneC;
  }
  return 'X';
}
