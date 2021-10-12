import * as React from 'react';
import { BlockDrawer, BlockStack } from './/blockDrawer/BlockDrawer';
import Block from './block/Block';
import * as d3 from 'd3';
import { inArray } from 'jquery';
import { select, Selection } from 'd3-selection';
import 'd3-clone';

interface Props {
  blockDrawer: BlockDrawer;
}

interface State {
  blockStacks: BlockStack[];
}

// function dragged(d: any) {
//   const temp = d3.select(this).attr('id').split('_');
//   temp.shift();
//   const stackName = temp.join('_');
//   d3.select(this).attr('transform', function () {
//     let source = this.attributes.transform.value.replace(')', '');
//     source = source.split(',');
//     const tx = d.dx + Number(source[4]);
//     const ty = d.dy + Number(source[5]);
//     return 'matrix(1,0,0,1,' + tx + ',' + ty + ')';
//   });
//   d3.select('#svg').select(`#arrow_${stackName}`).remove();
//   renderArrow(stackName, stackName);
// }

export function renderArrow(sourceStackName: string, targetStackName: string) {
  d3.select('#svg').select(`#arrow_${targetStackName}`).remove();
  const source = d3
    .select('#svg')
    .select(`#stack_${sourceStackName}`)
    .select('rect');
  let target = d3.select('#svg').select(`#block_${targetStackName}`);
  if (target.empty()) {
    return;
  }
  const sourceX =
    Number(source.attr('x')) +
    Number(source.attr('width')) -
    0.36 * 0.2 * Number(source.attr('height'));
  const sourceY =
    Number(source.attr('y')) + 0.2 * Number(source.attr('height'));
  const transform = target.attr('transform').replace(')', '').split(',');
  target = target.select('rect');
  const targetX = Number(target.attr('x')) + Number(transform[4]);
  const height = d3
    .select(target as any)
    .node()
    .node()
    .getBBox().height;
  const targetY = Number(target.attr('y')) + Number(transform[5]) + height / 2;
  let temp = sourceX - targetX;
  temp = Math.max(temp, -temp);
  d3.select('#svg')
    .select('#path')
    .append('path')
    .attr('style', 'stroke:#858585; fill:none; stroke-width:2;')
    .attr('id', `arrow_${targetStackName}`)
    .attr(
      'd',
      'M' +
        sourceX +
        ',' +
        sourceY +
        ' C' +
        (targetX - temp / 3) +
        ',' +
        sourceY +
        ' ' +
        (sourceX + temp / 3) +
        ',' +
        targetY +
        ' ' +
        targetX +
        ',' +
        targetY
    )
    .attr('marker-end', 'url(#end)')
    .attr('marker-start', 'url(#start)');
}

export default class CallStack extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      blockStacks: props.blockDrawer.getBlockStacks(),
    };
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson!);
    props.blockDrawer.getBlockArrows().forEach((name: string | number) => {
      if (!arrowList) {
        arrowList = {};
      }
      if (name) {
        arrowList[name] = '';
      }
    });
    sessionStorage.setItem('arrowList', JSON.stringify(arrowList));
  }

  componentWillUpdate(nextProps: {
    blockDrawer: { getBlockStacks: () => any; getBlockArrows: () => any[] };
  }) {
    d3.select('#stack__cloned').remove();
    d3.select('#block__cloned').remove();
    d3.select('#arrow__cloned').remove();
    const blockStacks = this.props.blockDrawer.getBlockStacks();
    const nextBlockStacks = nextProps.blockDrawer.getBlockStacks();

    if (sessionStorage.getItem('exec') !== 'step') {
      const blockStacksLen = blockStacks.length;
      const nextBlockStacksLen = nextBlockStacks.length;
      if (blockStacksLen > nextBlockStacksLen) {
        for (let i = nextBlockStacksLen; i < blockStacksLen; i++) {
          const clonedStack = (
            d3.select('#svg').select('#clone') as any
          ).appendClone(
            d3.select('#stack_' + blockStacks[i].key.replace('.', '_'))
          );
          clonedStack.attr('id', 'stack__cloned');
          const clonedBlock = (
            d3.select('#svg').select('#clone') as any
          ).appendClone(
            d3.select('#block_' + blockStacks[i].key.replace('.', '_'))
          );
          clonedBlock.select('rect').style('stroke', '#979797');
          clonedBlock.select('text').style('fill', '#979797');
          let offsetY = 0;
          if (i > 1) {
            offsetY = blockStacks[i].getHeight() + 40;
          }
          clonedBlock.selectAll('rect').attr('y', function (this: any) {
            return Number(d3.select(this).attr('y')) + offsetY;
          });
          clonedBlock.selectAll('text').attr('y', function (this: any) {
            return Number(d3.select(this).attr('y')) + offsetY;
          });
          clonedBlock.selectAll('tspan').attr('y', function (this: any) {
            return Number(d3.select(this).attr('y')) + offsetY;
          });
          const block = d3.select(
            '#block_' + blockStacks[i].key.replace('.', '_')
          );
          clonedBlock.attr('id', 'block__cloned');
          const list: string[] = [];
          block.selectAll('g').attr('copy', function () {
            return list.push(d3.select(this).attr('id'));
          });
          clonedBlock.selectAll('g').attr('id', function (d: any, i: number) {
            return 'cloned-' + list[i];
          });
        }
      } else if (nextBlockStacksLen > blockStacksLen && blockStacksLen >= 2) {
        const clonedBlock = (
          d3.select('#svg').select('#clone') as any
        ).appendClone(
          d3.select(
            '#block_' + blockStacks[blockStacksLen - 2].key.replace('.', '_')
          )
        );
        clonedBlock.attr('id', 'block__cloned');
      }
    }
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson!);
    if (!arrowList) {
      arrowList = {};
    }
    nextProps.blockDrawer.getBlockArrows().forEach((name) => {
      if (inArray(name, Object.keys(arrowList)) >= 0) {
        delete arrowList[name];
        d3.select('#svg')
          .select(`#block_${name}`)
          .attr('transform', 'matrix(1,0,0,1,0,0)');
      }
    });
    sessionStorage.setItem('arrowList', JSON.stringify(arrowList));
  }

  componentDidUpdate() {
    // 计算点击生成的block位置
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson!);
    if (!arrowList) {
      arrowList = {};
    }
    const x = 750;
    let y = 5;
    const offsetY = 40;
    this.props.blockDrawer.getBlockStacks().forEach((stack: BlockStack) => {
      if (inArray(stack.getName(), Object.keys(arrowList)) >= 0) {
        d3.select('#svg')
          .select('#block_' + stack.getName())
          .attr('transform', `matrix(1,0,0,1,${x},${y})`);
        y += stack.getHeight() + offsetY;
      }
    });

    // 绘制block左部黑色边框
    d3.select('#svg').selectAll('.block-left').selectAll('path').remove();
    d3.select('#svg')
      .selectAll('.block-left')
      .append('path')
      .attr('d', function (this: any) {
        const block_node = d3
          .select(this.parentNode.parentNode)
          .node()
          .getBBox();
        const x = block_node.x;
        const y = block_node.y;
        const height = block_node.height;
        return (
          'M ' +
          x +
          ' ' +
          (y + 10) +
          ' L ' +
          x +
          ' ' +
          (y + height - 10) +
          ' A 10 10 0 0 0 ' +
          (x + 10) +
          ' ' +
          (y + height) +
          ' L ' +
          (x + 10) +
          ' ' +
          y +
          ' A 10 10 0 0 0 ' +
          x +
          ' ' +
          (y + 10)
        );
      });

    // d3.select('#svg').selectAll('.block').call(d3.drag().on('drag', dragged));
    d3.select('#svg').select('#path').selectAll('path').remove();

    const { blockDrawer } = this.props;
    const blockArrows = blockDrawer.getBlockArrows();
    blockArrows.forEach((stackName: string) => {
      if (!d3.select('#svg').select(`#block_${stackName}`).empty()) {
        renderArrow(stackName, stackName);
      }
    });
    // const arrowListJson = sessionStorage.getItem('arrowList');
    // let arrowList = JSON.parse(arrowListJson!);
    // if (!arrowList) {
    //   arrowList = {};
    // }
    // Object.keys(arrowList).forEach((stackName) => {
    //   if (!d3.select('#svg').select(`#block_${stackName}`).empty()) {
    //     renderArrow(stackName, stackName);
    //   }
    // });
    // const variablesMapJson = sessionStorage.getItem('variablesMap');
    // let variablesMap = JSON.parse(variablesMapJson!);
    // if (!variablesMap) {
    //   variablesMap = {};
    // }
    // Object.keys(variablesMap).forEach((key) => {
    //   if (variablesMap[key]['visible']) {
    //     const stackName = key.split('_')[0];
    //     const name = key.split('_')[1];
    //     const cells = d3
    //       .select('#svg')
    //       .selectAll(`.block-${stackName}-${name}`);
    //     cells.select('rect').style('stroke', variablesMap[key]['color']);
    //     cells.selectAll('text').attr('fill', variablesMap[key]['color']);
    //   }
    // });
    const blocks = d3.select('#svg').selectAll('.block');
    blocks.select('rect').style('stroke', '#979797');
    blocks.select('text').style('fill', '#979797');
  }

  renderBlocks() {
    const { blockDrawer } = this.props;
    const blockStacks = blockDrawer.getBlockStacks();
    const blockArrows = blockDrawer.getBlockArrows();
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson!);
    if (!arrowList) {
      arrowList = {};
    }
    const list: JSX.Element[] = [];
    blockStacks.forEach((blockStack) => {
      if (
        inArray(blockStack.getName(), blockArrows) >= 0 ||
        inArray(blockStack.getName(), Object.keys(arrowList)) >= 0
      ) {
        list.push(
          <g key={blockStack.key}>
            <Block blockStack={blockStack} />
          </g>
        );
      }
    });
    return list;
  }

  drawOrRemoveBlock(name: string) {
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson!);
    if (!arrowList) {
      arrowList = {};
    }
    if (inArray(name, Object.keys(arrowList)) < 0) {
      arrowList[name] = '';
    } else {
      delete arrowList[name];
    }
    sessionStorage.setItem('arrowList', JSON.stringify(arrowList));
    this.setState({});
  }

  renderStackView() {
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson!);
    if (!arrowList) {
      arrowList = {};
    }
    const { blockDrawer } = this.props;
    const blockStacks = blockDrawer.getBlockStacks();
    const blockArrows = blockDrawer.getBlockArrows();
    const list: JSX.Element[] = [];
    const x = 50;
    let y = 50;
    const offsetY = 60;
    const width = 202;
    const height = 108;
    blockStacks.forEach((blockStack, i) => {
      const transform = `matrix(1,0,-0.36,1,0,0)`;
      list.push(
        <g
          key={`stack_${blockStack.getName()}`}
          id={`stack_${blockStack.getName()}`}
          // onClick={() => {
          //   const res = inArray(blockStack.getName(), blockArrows);
          //   if (res < 0) {
          //     this.drawOrRemoveBlock(blockStack.getName());
          //   }
          // }}
        >
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            transform={transform}
            fill="white"
            stroke="#979797"
            strokeWidth={2}
            transform-origin={x + ' ' + y}
          ></rect>
          <text
            x={x + 10}
            y={y + 20}
            fontSize="15"
            className="function-name"
            fill={'rgb(139, 139, 139)'}
          >
            {blockStack.getName().split('_')[0]}
          </text>
          <text
            x={x + width - 15}
            y={y + 20}
            fontSize="15"
            textAnchor="end"
            className="function-name"
            fill={'rgb(139, 139, 139)'}
          >
            {`(${blockStack.getIndex()})`}
          </text>
        </g>
      );
      y = y + offsetY;
    });
    return list;
  }

  render() {
    const stacks = this.renderStackView();
    const blocks = this.renderBlocks();
    const { blockDrawer } = this.props;
    const blockArrows = blockDrawer.getBlockArrows();
    blockArrows.forEach((stackName: string) => {
      if (stackName) {
        sessionStorage.setItem('activeStack', stackName);
      }
    });
    return (
      <React.Fragment>
        {stacks}
        {blocks}
      </React.Fragment>
    );
  }
}
