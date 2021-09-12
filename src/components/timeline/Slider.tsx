import * as React from 'react';
import {
  StatementHighlight,
  VariableHighlight,
} from '../../panels/timelinePanel/TimelinePanel';
import {signal, slot} from '../emitter';

interface Props {
  step: number;
  max: number;
  scale: any;
  width: number;
  height: number;
  selectedColor: string;
  unselectedColor: string;
  variableHighlights: VariableHighlight[];
  statementHighlights: StatementHighlight[];
}
interface State {
  dragging: boolean;
  dragIndex?: any;
}

export default class Slider extends React.Component<Props, State> {
  componentDidMount() {
    window.addEventListener('mouseup', this.dragEnd, false);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.dragEnd, false);
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      dragging: false,
    };
  }

  dragStart = (e: any) => {
    e.stopPropagation();
    if (!this.state.dragging) {
      this.setState(
        {
          dragging: true,
        },
        () => {
          this.setState({dragging: true});
        }
      );
    }
  };

  dragEnd = (e: any) => {
    e.stopPropagation();
    this.setState(
      {
        dragging: false,
      },
      () => {
        this.setState({dragging: false});
      }
    );
  };

  dragFromSVG = (e: React.MouseEvent) => {
    if (!this.state.dragging) {
      let step = this.props.scale.invert(e.nativeEvent.offsetX);
      step = Math.min(step, this.props.max);
      step = Math.max(step, 0);
      step = Math.round(step);
      signal('changeStep', step);
      signal('jumpTo', step);
      this.setState(
        {
          dragging: true,
        },
        () => {
          this.setState({dragging: true});
        }
      );
    }
  };

  mouseMove = (e: React.MouseEvent) => {
    if (this.state.dragging) {
      let step = this.props.scale.invert(e.nativeEvent.offsetX);
      step = Math.min(step, this.props.max);
      step = Math.max(step, 0);
      step = Math.round(step);
      signal('changeStep', step);
      signal('jumpTo', step);
    }
  };

  render() {
    const {
      step,
      max,
      scale,
      width,
      height,
      selectedColor,
      unselectedColor,
      variableHighlights,
      statementHighlights,
    } = this.props;
    const selectionWidth = width - (step / max) * width;

    return (
      <svg
        style={{
          display: 'block',
          paddingBottom: '8px',
          zIndex: 6,
          overflow: 'visible',
        }}
        height={height}
        width={width + 100}
        onMouseDown={this.dragFromSVG}
        onMouseMove={this.mouseMove}
      >
        <defs>
          <marker
            id='arrow'
            markerUnits='strokeWidth'
            markerWidth='12'
            markerHeight='12'
            viewBox='0 0 12 12'
            refX='6'
            refY='6'
            orient='auto'
          >
            <path d='M2,2 L10,6 L2,10 L6,6 L2,2' style={{fill: '#000000'}} />
          </marker>
        </defs>
        <rect height={4} fill={unselectedColor} x={0} y={48} width={width} />
        <rect
          height={4}
          fill={selectedColor}
          x={scale(step)}
          y={48}
          width={selectionWidth}
        />
        <g
          tabIndex={0}
          transform={`translate(${scale(step)}, 0)`}
          key={`handle`}
          style={{outline: 'none'}}
        >
          <circle
            style={{
              cursor: 'move',
              MozUserSelect: 'none',
              KhtmlUserSelect: 'none',
              WebkitUserSelect: 'none',
            }}
            r={10}
            cx={0}
            cy={50.5}
            fill='#ddd'
            strokeWidth='1'
          />
          <circle
            style={{
              cursor: 'move',
              MozUserSelect: 'none',
              KhtmlUserSelect: 'none',
              WebkitUserSelect: 'none',
            }}
            onMouseDown={this.dragStart.bind(this)}
            r={9}
            cx={0}
            cy={50}
            fill='white'
            stroke='#ccc'
            strokeWidth='1'
          />
        </g>
        <g>
          {variableHighlights.map((m) => {
            return (
              <g key={m.funcName + '_' + m.name}>
                {m['steps'].map((_step) => {
                  if (m['visible']) {
                    return (
                      <rect
                        height={30}
                        x={scale(_step) - 1.5}
                        y={18}
                        width={3}
                        fill={m['color']}
                      />
                    );
                  }
                })}
              </g>
            );
          })}
        </g>
        <g>
          {statementHighlights.map((m) => {
            return (
              <g key={m.lineNumber}>
                {m['steps'].map((_step, i) => {
                  if (m['visible']) {
                    let h = 5;
                    if (m['depth'][i] < 5) {
                      h = m['depth'][i] * 7 + h;
                    } else {
                      h = 40;
                    }
                    return (
                      <rect
                        height={h}
                        x={scale(_step) - 1.5}
                        y={52}
                        width={3}
                        fill={m['color']}
                      ></rect>
                    );
                  }
                })}
              </g>
            );
          })}
        </g>
        <g>
          <line
            x1={620}
            x2={620}
            y1={10}
            y2={90}
            stroke='black'
            strokeWidth={2}
            markerEnd='url(#arrow)'
          ></line>
          <line
            x1={620}
            x2={730}
            y1={50}
            y2={50}
            stroke='black'
            strokeWidth={2}
          ></line>
          <text x={630} y={40} fontSize='15'>
            Variables
          </text>
          <text x={630} y={75} fontSize='15'>
            Statements
          </text>
        </g>
      </svg>
    );
  }
}
