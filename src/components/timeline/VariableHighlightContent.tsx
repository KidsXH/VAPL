import React from 'react';
interface VariableHighlightContentProps {
  // variableHighlights: VariableHighlight[];
  // options: any;
  // addVariableHighlight: (funcName: string, varName: string) => void;
  // changeVariableColor: (funcName: string, varName: string, color: string) => void;
  // changeVariableVisible: (funcName: string, varName: string) => void;
  // removeVariableHighlight: (funcName: string, varName: string) => void;
}

function VariableHighlightContent(props: VariableHighlightContentProps) {
  return (
    <div id="VariableHighlightContent">
      <div className="title">Hightlight Variables</div>
      <div></div>
    </div>
  );
}

export default VariableHighlightContent;
