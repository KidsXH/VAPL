import * as React from 'react';
import { signal } from '../emitter';
import * as d3 from 'd3';
import { VariableWithSteps, StatementHighlight } from '../../panels/timelinePanel/TimelinePanel';

interface Props {
  step: number;
  max: number;
  scale: any;
  width: number;
  height: number;
  variableHighlights: VariableWithSteps[];
  statementHighlights: StatementHighlight[];
  maxDepth: number;
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

  rectScale = () => {
    const {maxDepth} = this.props;
    const range = 40;

    if(maxDepth > 20) {
      return d3.scaleLog().range([0, range]).domain([1e-15, maxDepth])
    } else {
      return d3.scaleLinear().range([0, range]).domain([0, maxDepth])
    }
  }

  dragStart = (e: any) => {
    e.stopPropagation();
    if (!this.state.dragging) {
      this.setState(
        {
          dragging: true,
        },
        () => {
          this.setState({ dragging: true });
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
        this.setState({ dragging: false });
      }
    );
  };

  dragFromSVG = (e: React.MouseEvent) => {
    if (this.props.max === 0) return;
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
          this.setState({ dragging: true });
        }
      );
    }
  };

  mouseMove = (e: React.MouseEvent) => {
    if (this.props.max === 0) return;
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

    // const contenWidth = width > 250 ? width - 60 : width;
    const contentWidth = width;
    const activeWidth = max ? (step / max) * contentWidth : 0;

    // console.log(contentWidth, activeWidth, step, max);

    return (
      <div>
        <svg
          style={{
            display: 'block',
            // paddingBottom: '8px',
            zIndex: 6,
            overflow: 'visible',
          }}
          height={height}
          width={contentWidth}
          onMouseDown={this.dragFromSVG}
          onMouseMove={this.mouseMove}
        >
          <rect
            className="timeline"
            height={8}
            x={0}
            y={height / 2 - 4}
            width={contentWidth}
            rx="4"
            ry="4"
          />
          <rect
            className="timeline active"
            height={8}
            x={0}
            y={height / 2 - 4}
            width={activeWidth}
            rx="4"
            ry="4"
          />

           <g>
          {variableHighlights.map((m) => {
            return (
              <g key={m.funcName + '_' + m.name}>
                {m['steps'].map((_step, i) => {
                  if (m['visible']) {
                    return (
                      <rect
                        key={i}
                        height={30}
                        x={scale(_step) - 1.5}
                        y={-30}
                        width={3}
                        fill={m['color']}
                      />
                    );
                  }
                  return null
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
                    return (
                      <rect
                        height={this.rectScale()(m['depth'][i])}
                        x={scale(_step) - 1.5}
                        y={height/2 + 4}
                        width={3}
                        fill={m['color']}
                      ></rect>
                    );
                  }
                  return null
                })}
              </g>
            );
          })}
         </g> 
          <g>
            <text
              className="timeline-legend"
              x={contentWidth}
              y={height / 2 - 20}
              fontSize="15"
            >
              Variables
            </text>
            <text
              className="timeline-legend"
              x={contentWidth}
              y={height / 2 + 35}
              fontSize="15"
            >
              Statements
            </text>
          </g>
        </svg>
      </div>
    );
  }
}
