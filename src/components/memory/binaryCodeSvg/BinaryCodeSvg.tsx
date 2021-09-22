import React from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import './style.scss';
import classNames from 'classnames';
import IntegerBinaryCode from './IntegerBinaryCode';

interface BinaryCodeSvgProps {
  variable: Variable;
}

const FloatBinaryCode = ({ variable }: BinaryCodeSvgProps) => {
  return (
    <svg id="FloatBinaryCode" height="100%" width="100%">
      <text y={16} fill="#8b8b8b">
        Binary Code
      </text>
    </svg>
  );
};

const DefaultBinayCode = () => {
  return (
    <svg id="DefaultBinayCode" height="100%" width="100%">
      <text y={16} fill="#8b8b8b">
        Binary Code
      </text>
      {/* <g id="legend" transform="translate(110 5)">
        <image xlinkHref={intLegend1} />
        <image x={80} xlinkHref={intLegend2} />
        <image x={165} y={2} xlinkHref={intLegend3} />
        <image x={205} y={2} xlinkHref={intLegend4} />
      </g> */}
    </svg>
  );
};

const getBinaryCodeSvg = (variable: Variable) => {
  switch (variable.type) {
    case 'int':
      return <IntegerBinaryCode variable={variable} />;
    case 'float':
      return <FloatBinaryCode variable={variable} />;
    default:
      return <DefaultBinayCode />;
  }
};

function BinaryCodeSvg({ variable }: BinaryCodeSvgProps) {
  return getBinaryCodeSvg(variable);
}

export default BinaryCodeSvg;

