import * as React from 'react';
import {
  StatementHighlight,
  VariableHighlight,
} from '../../panels/timelinePanel/TimelinePanel';
import {signal} from '../emitter';

interface Props {
  step: number;
  max: number;
  scale: any;
  width: number;
  height: number;
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
      variableHighlights,
      statementHighlights,
    } = this.props;
    const activeWidth = max ? (step / max) * width : 0;

    return (
      <svg
        style={{
          display: 'block',
          paddingBottom: '8px',
          zIndex: 6,
          overflow: 'visible',
        }}
        height={height}
        width={width}
        onMouseDown={this.dragFromSVG}
        onMouseMove={this.mouseMove}
      >
        <rect
          className='timeline'
          height={8}
          x={0}
          y={height / 2 - 4}
          width={width}
          rx='4'
          ry='4'
        />
        <rect
          className='timeline active'
          height={8}
          x={0}
          y={height / 2 - 4}
          width={activeWidth}
          rx='4'
          ry='4'
        />

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
          <text className='timeline-legend' x={width} y={height / 2 - 20} fontSize='15'>
            Variables
          </text>
          <text className='timeline-legend' x={width} y={height / 2 + 35} fontSize='15'>
            Statements
          </text>
        </g>
      </svg>
    );
  }
}
