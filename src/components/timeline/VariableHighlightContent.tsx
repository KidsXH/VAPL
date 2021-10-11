import React, { useCallback, useState } from 'react';
import { VariableWithSteps } from '../../panels/timelinePanel/TimelinePanel';
import { Popover, Cascader } from 'antd';
import { CascaderValueType } from 'antd/lib/cascader';
import { useDispatch } from 'react-redux';
import { addVariable } from '../../store/reducers/highlight';
interface VariableHighlightContentProps {
  variableHighlights: VariableWithSteps[]
  // options: any;
  // addVariableHighlight: (funcName: string, varName: string) => void;
  // changeVariableColor: (funcName: string, varName: string, color: string) => void;
  // changeVariableVisible: (funcName: string, varName: string) => void;
  // removeVariableHighlight: (funcName: string, varName: string) => void;
  options: Object[]
}


function VariableHighlightContent({options, variableHighlights}: VariableHighlightContentProps) {
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();
  
  const addVar = useCallback((value) => dispatch(addVariable(value)), [dispatch])

  const onChange = (value: CascaderValueType) => {
    // console.log(value)
    addVar(value)
  }

  const clickContent = <Cascader
    options={options}
    onChange={onChange}
  />;

  return (
    <div id="VariableHighlightContent">
      <div className="header">
        <p>Highlight Variables</p>
     
        <Popover
          content={
            <div>
              {clickContent}
            </div>
          }
          title="Select variables"
          trigger="click"
          visible={show}
          onVisibleChange={() => setShow(!show)}
        >
          <span className="circle-btn">+</span>
        </Popover>
      </div>
      
      <div className="content">
        <div className='wrapper'>
          {
            variableHighlights.map(({funcName, name, color}, i) => (
              <div key={i} className="item">
                <span style={{background: color}}></span>
                <p>{funcName+'/'+name}</p>

                {/* <span className="circle-btn">-</span> */}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default VariableHighlightContent;
