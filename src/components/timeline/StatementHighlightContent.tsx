import React from 'react';
import { StatementHighlight } from '../../panels/timelinePanel/TimelinePanel';

interface StatementHighlightContentProps {
  // changeStatementColor: (lineNumber: number, color: string) => void;
  // statementHighlights: StatementHighlight[];
  // changeStatementVisible: (lineNumber: number) => void;
  statements: {[key: string]: string},
}

function StatementHighlightContent({statements}: StatementHighlightContentProps) {
  return <div className="highlight-statements">
    <p className="header">Highlight Statements</p>
    <div className="content">
      <div>
      {
        Object.keys(statements).map((d, i) => (
          <div key={i} className="item">
            <span style={{background: statements[d]}}></span>
            <p>Line number: {+d+1}</p>
          </div>
        ))
      }
      </div>
    </div>
  </div>;
}

export default StatementHighlightContent;
