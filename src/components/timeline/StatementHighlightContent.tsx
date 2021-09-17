import React from 'react';
import { StatementHighlight } from '../../panels/timelinePanel/TimelinePanel';

interface StatementHighlightContentProps {
  // changeStatementColor: (lineNumber: number, color: string) => void;
  // statementHighlights: StatementHighlight[];
  // changeStatementVisible: (lineNumber: number) => void;
}

function StatementHighlightContent(props: StatementHighlightContentProps) {
  return <div>
    
    <div id='StatementHighlightContent'>
      <div className='title'>Hightlight Statements</div>
      <div></div>
    </div>
    </div>;
}

export default StatementHighlightContent;
