import React, { useEffect } from 'react';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import BinaryCodeSvg from './binaryCodeSvg/BinaryCodeSvg';
import './style.scss';

export interface MemoryInfo {
  funcName: string;
  varName: string;
  address: string;
  type: string;
  value: string;
}

const defaultMemoryInfo: MemoryInfo = {
  funcName: 'X',
  varName: 'X',
  address: 'X',
  type: 'X',
  value: 'X',
};

interface MemoryDetailProps {
  variable: Variable;
}

function MemoryDetail({ variable }: MemoryDetailProps) {
  const memoryInfo: MemoryInfo =
    variable.address > 0
      ? {
          funcName: 'main',
          varName: variable.name,
          address: '0x' + variable.address.toString(16),
          type: variable.type,
          value: variable.getValue().toString(),
        }
      : defaultMemoryInfo;
  // console.log('DEBUG|'+variable.address);
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
        <div id="BinaryCodeSvg">
          <BinaryCodeSvg variable={variable} />
        </div>
        {/* <div className="detail-item binary-item">
          <div className="item-name">Sign-Magnitude</div>
          <div className="item-value binary-code">{memoryInfo.binaryCode0}</div>
        </div>
        <div className="detail-item binary-item">
          <div className="item-name">One's Complement</div>
          <div className="item-value binary-code">{memoryInfo.binaryCode1}</div>
        </div>
        <div className="detail-item binary-item">
          <div className="item-name">Two's Complement</div>
          <div className="item-value binary-code">{memoryInfo.binaryCode2}</div>
        </div> */}
      </div>
    </div>
  );
}

export default MemoryDetail;
