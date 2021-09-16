import React, { useEffect } from 'react';
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

interface MemoryDetailProps {
  memoryInfo: MemoryInfo | null;
}

function MemoryDetail({ memoryInfo }: MemoryDetailProps) {
  return (
    <div id="MemoryDetail">
      {memoryInfo === null ? (
        <div></div>
      ) : (
        <div>
          <div className="detail-item"></div>
          <div className="detail-item">
            <div className="item-name">Function Name</div>
            <div className="item-value">
              {memoryInfo.funcName}
            </div>
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
              <div className="item-value">
                {memoryInfo.type}
              </div>
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
      )}
    </div>
  );
}

export default MemoryDetail;
