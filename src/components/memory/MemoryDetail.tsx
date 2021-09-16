import React, { useEffect } from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import './style.scss';

export interface MemoryInfo {
  funcName: string;
  varName: string;
  address: string;
  type: string;
  value: string;
  binaryCode0: string;
  binaryCode1: string;
  binaryCode2: string;
}

const defaultMemoryInfo: MemoryInfo = {
  funcName: 'X',
  varName: 'X',
  address: 'X',
  type: 'X',
  value: 'X',
  binaryCode0: 'X',
  binaryCode1: 'X',
  binaryCode2: 'X',
};

interface MemoryDetailProps {
  variable: Variable;
}

function MemoryDetail({ variable }: MemoryDetailProps) {
  const memoryInfo: MemoryInfo = variable.address > 0
    ? {
        funcName: variable.name,
        varName: variable.name,
        address: '0x' + variable.address.toString(16),
        type: variable.type,
        value: variable.getValue().toString(),
        binaryCode0: signMagn(variable),
        binaryCode1: oneComp(variable),
        binaryCode2: twoComp(variable),
      }
    : defaultMemoryInfo;
console.log('DEBUG|'+variable.address);
  return (
    <div id="MemoryDetail">
      <div>
        <div className="detail-item"></div>
        <div className="detail-item">
          <div className="item-name">Function Name</div>
          <div className="item-value">{memoryInfo.funcName}</div>
        </div>
        <div className="detail-item">
          <div className="item-name">Variable Name</div>
          <div className="item-value variable-name">{memoryInfo.varName}</div>
        </div>
        <div className="detail-item">
          <div className="item-name">Address</div>
          <div className="item-value">{memoryInfo.address}</div>
        </div>
        <div className="type-value-detail">
          <div className="detail-item dashed-border-right">
            <div className="item-name">Type</div>
            <div className="item-value">{memoryInfo.type}</div>
          </div>
          <div className="detail-item">
            <div className="item-name">Value</div>
            <div className="item-value">{memoryInfo.value}</div>
          </div>
        </div>
        <div className="detail-item binary-item">
          <div className="item-name">Sign-Magnitude</div>
          {/* <div className="item-name">Sign-Magn</div> */}
          <div className="item-value binary-code">{memoryInfo.binaryCode0}</div>
        </div>
        <div className="detail-item binary-item">
          <div className="item-name">One's Complement</div>
          {/* <div className="item-name">1's Comp</div> */}
          <div className="item-value binary-code">{memoryInfo.binaryCode1}</div>
        </div>
        <div className="detail-item binary-item">
          <div className="item-name">Two's Complement</div>
          <div className="item-value binary-code">{memoryInfo.binaryCode2}</div>
        </div>
      </div>
    </div>
  );
}

export default MemoryDetail;

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
    console.log('DEBUG| -1=' + binary);
    const reg = /1|0/g;
    const oneC = binary.replace(reg, (x: string) => {
      return x === '0' ? '1' : '0';
    });
    return '1' + oneC;
  }
  return 'X';
}
