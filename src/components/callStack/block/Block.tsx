import * as React from 'react';
import { BlockStack, BlockCell } from '../blockDrawer/BlockDrawer';
import * as d3 from 'd3';

interface Props {
  blockStack: BlockStack;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface State {}

export function wrapWord(
  text: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  width: number,
  className:
    | string
    | number
    | boolean
    | d3.ValueFn<SVGTSpanElement, unknown, string | number | boolean | null>
    | null
) {
  text.each(function () {
    const text = d3.select(this),
      words = text.text().split('').reverse();
    let word;
    const line = [],
      x = text.attr('x'),
      y = text.attr('y'),
      tspan = text
        .text(null)
        .append('tspan')
        .attr('class', className)
        .attr('x', x)
        .attr('y', y);
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(''));
      if (tspan.node()!.getComputedTextLength() > width) {
        line.pop();
        line.splice(line.length - 2, 3, '.', '.', '.');
        tspan.text(line.join(''));
        break;
      }
    }
  });
}

export default class Block extends React.Component<Props, State> {
  componentDidUpdate() {
    wrapWord(d3.selectAll('.value'), BlockCell.WIDTH - 10, 'value');
  }

  renderBlockBackground() {
    const { blockStack } = this.props;
    return (
      <React.Fragment>
        <rect
          x={blockStack.x()}
          y={blockStack.y()}
          width={blockStack.getWidth()}
          height={blockStack.getHeight()}
          rx={10}
          ry={10}
          fill="white"
          style={{ stroke: '#979797', strokeWidth: '1.5px' }}
        ></rect>
        <g className="block-left"></g>
        <text
          x={blockStack.x() + 15}
          y={blockStack.y() + BlockCell.FONT_SIZE + 7}
          fontSize={BlockCell.FONT_SIZE + 2}
          fill={blockStack.getColor()}
          className="function-name"
        >
          {blockStack.key.split('.')[0]}
        </text>
        <text
          x={blockStack.x() + blockStack.getWidth() - 15}
          y={blockStack.y() + 20}
          fontSize="15"
          textAnchor="end"
          className="function-name"
          fill={'rgb(139, 139, 139)'}
        >
          {`(${blockStack.getIndex()})`}
        </text>
      </React.Fragment>
    );
  }

  renderBlockContent() {
    const { blockStack } = this.props;
    const list: JSX.Element[] = [];
    const blockTable = blockStack.getBlockTable();
    blockTable.forEach((blockCellContainer) => {
      for (let i = 0; i < 1; i++) {
        if (i >= 3) break;
        const blockCell = blockCellContainer[i];
        list.push(
          <g
            className={`block-${
              blockStack.key.split('.')[0]
            }-${blockCell.getName()}`}
            id={`block-${blockStack.key.replace(
              '.',
              '_'
            )}-${blockCell.getName()}`}
            key={`block-${blockStack.key.replace(
              '.',
              '_'
            )}-${blockCell.getName()}`}
            transform="matrix(1,0,0,1,0,0)"
          >
            <text
              x={blockCell.x() + 5}
              y={blockCell.y() - 5}
              fontSize={BlockCell.FONT_SIZE}
              fontWeight="blod"
              fill={blockStack.getColor()}
              className="variable-name"
            >
              {blockCell.getName()}
            </text>
            <rect
              x={blockCell.x()}
              y={blockCell.y()}
              width={blockCell.getWidth()}
              height={blockCell.getHeight()}
              fill="white"
              style={{ stroke: blockStack.getColor(), strokeWidth: '1.5px' }}
            />
            <text
              className="value variable-value"
              x={blockCell.x() + 10}
              y={blockCell.y() + BlockCell.FONT_SIZE + 10}
              fontSize={BlockCell.FONT_SIZE}
              fill={blockStack.getColor()}
            >
              {blockCell.getValue()}
            </text>
          </g>
        );
      }
    });
    return list;
  }

  render() {
    const backgroud = this.renderBlockBackground();
    const content = this.renderBlockContent();
    return (
      <g
        className="block"
        transform="matrix(1,0,0,1,0,0)"
        id={`block_${this.props.blockStack.getName()}`}
      >
        {backgroud}
        {content}
      </g>
    );
  }
}
