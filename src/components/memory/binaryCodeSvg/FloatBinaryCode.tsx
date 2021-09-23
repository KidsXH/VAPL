import classNames from 'classnames';
import React from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import './style.scss';
interface FloatBinaryCodeProps {
  variable: Variable;
}

const FloatBinaryCode = ({ variable }: FloatBinaryCodeProps) => {
  const { sign, exponent, mantissa } = float2binary(variable);

  return (
    <svg id="FloatBinaryCode" height="100%" width="100%" fill="#8b8b8b">
      <text y={16}>Binary Code</text>
      <g transform="translate(20, 0)">
        <text
          y={60}
          className={classNames(
            'variable-value',
            sign === '1' ? 'sign-bit-neg' : 'sign-bit-pos'
          )}
        >
          {sign}
        </text>
        <text x={12} y={60} className="variable-value">
          {exponent}
        </text>
        <text x={80} y={60} className="variable-value">
          {mantissa}
        </text>
        <g id="underline">
          <line x1={0} y1={64} x2={8} y2={64}></line>
          <line x1={12} y1={64} x2={74} y2={64}></line>
          <line x1={80} y1={64} x2={258} y2={64}></line>
        </g>
      </g>
      <g id="arrows">
        <polyline points="24,69 12,84" fill="none" />
        <polyline points="63,69 63,84" fill="none" />
        <polyline points="183,69 183,84" fill="none" />
        <text x={0} y={100}>
          sign
        </text>
        <text x={33} y={100}>
          exponent
        </text>
        <text x={155} y={100}>
          mantissa
        </text>
      </g>
    </svg>
  );
};

export default FloatBinaryCode;

const float2binary = (variable: Variable) => {
  const value = variable.getValue();
  let binary: string = value.toString(2);
  const sign = binary[0] === '-' ? '1' : '0';
  binary = binary.replace('-', '');
  const pointPos = binary.indexOf('.');
  const firstOne = binary.indexOf('1');
  const exponent = (
    Array(8).join('0') + (pointPos - firstOne - 1 + 127).toString(2)
  ).slice(-8);
  const mantissa = (
    binary.substring(firstOne + 1).replace('.', '') + Array(24).join('0')
  ).slice(0, 23);
  return { sign, exponent, mantissa };
};
