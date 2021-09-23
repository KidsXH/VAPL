import * as React from 'react';
import { AnimationDrawer } from './AnimationDrawer';
import * as d3 from 'd3';
import { renderArrow } from '../CallStack';
import { select, Selection } from 'd3-selection';
import 'd3-clone';

interface Props {
  animationDrawer: AnimationDrawer;
}

interface State {}

export default class Animation extends React.Component<Props, State> {
  shouldComponentUpdate(nextProps: any) {
    if (sessionStorage.getItem('exec') === 'step') {
      return false;
    }
    return true;
  }

  componentDidUpdate() {
    const { animationDrawer } = this.props;
    const exeState = animationDrawer.getState();

    switch (exeState) {
      case 'programInit':
        this.programInit();
        break;
      case 'uniReturn':
        this.uniReturn();
        break;
      case 'methodCall':
        this.methodCall();
        break;
      default:
        this.variablesInit();
    }
  }

  programInit() {
    d3.select('#block_main')
      .style('fill-opacity', 1)
      .style('stroke-opacity', 1)
      .style('display', 'inline');
    this.showUp('block_main', 0);
  }

  variablesInit() {
    const { animationDrawer } = this.props;
    const keys = animationDrawer.getVariableKeys();
    const types = animationDrawer.getVariableTypes();
    const values = animationDrawer.getVariableValues();
    if (keys === undefined) {
      return;
    }
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      this.showUp('block-' + key, 0);
      // this.variableChange(key, types[i], values[i], 0, 0);
    }
  }

  methodCall() {
    const { animationDrawer } = this.props;
    const stackName = animationDrawer.getStackName();
    const postArgs = animationDrawer.getPostArgs();
    const keys = animationDrawer.getVariableKeys();
    const stacks = animationDrawer.getStacks();
    let height = 0;
    const block1 = stacks[stacks.length - 2].name.replace(
      /[&\|\\\*:^%$@()\[\].]/g,
      '_'
    );
    const block2 = stacks[stacks.length - 1].name.replace(
      /[&\|\\\*:^%$@()\[\].]/g,
      '_'
    );
    const svgblock1 = d3.select('#block_' + block1);
    const svgblock2 = d3.select('#block_' + block2);
    if (stacks.length > 3) {
      height =
        (d3.select('#block__cloned').node() as any).getBBox().height + 40;
    }
    this.showUp('block_' + stackName, height);
    const stack = d3.select('#stack_' + stackName);
    stack.attr('tansform', 'matrix(1,0,0,1,0,300)');
    stack
      .transition()
      .duration(1000)
      .tween('number', function () {
        let i = d3.interpolateNumber(300, 0);
        return function (t) {
          stack.attr('transform', `matrix(1,0,0,1,0,${i(t)})`);
        };
      });

    if (stacks.length > 3) {
      const cloned = stacks[stacks.length - 3].name.replace(
        /[&\|\\\*:^%$@()\[\].]/g,
        '_'
      );
      svgblock1.attr('transform', 'matrix(1,0,0,1,0,' + height + ')');
      svgblock2.attr('transform', 'matrix(1,0,0,1,0,' + height + ')');
      renderArrow(cloned, '_cloned');
    }
    renderArrow(block1, block1);
    renderArrow(stackName, stackName);
    const arrow = d3.select('#arrow_' + stackName);
    arrow.style('opacity', 0);
    arrow
      .transition()
      .duration(500)
      .delay(500)
      .tween('number', function () {
        let i = d3.interpolateNumber(0, 1);
        return function (t) {
          arrow.style('opacity', i(t));
        };
      });
    postArgs.forEach((arg, idx) => {
      if (arg !== undefined) {
        const cloned = (d3.select('#svg').select('#clone') as any).appendClone(
          d3.select('#block-' + keys[idx])
        );
        cloned.select('text').remove();
        const source = d3.select('#block-' + postArgs[idx]);
        const transform = d3
          .select('#block_' + postArgs[idx].split('-')[0])
          .attr('transform')
          .replace('matrix(', '')
          .replace(')', '')
          .split(',');
        cloned
          .select('rect')
          .attr(
            'x',
            Number(transform[4]) + Number(source.select('rect').attr('x'))
          );
        cloned
          .select('rect')
          .attr(
            'y',
            Number(transform[5]) + Number(source.select('rect').attr('y'))
          );
        cloned
          .selectAll('.value')
          .attr(
            'x',
            Number(transform[4]) + Number(source.select('.value').attr('x'))
          );
        cloned
          .selectAll('.value')
          .attr(
            'y',
            Number(transform[5]) + Number(source.select('.value').attr('y'))
          );
        const target = d3.select('#block-' + keys[idx]);
        const targetTransform = d3
          .select('#block_' + keys[idx].split('-')[0])
          .attr('transform')
          .replace('matrix(', '')
          .replace(')', '')
          .split(',');
        target
          .select('rect')
          .style('display', 'none')
          .transition()
          .delay(1000)
          .style('display', 'inline');
        target
          .selectAll('.value')
          .style('display', 'none')
          .transition()
          .delay(1000)
          .style('display', 'inline');
        cloned
          .select('rect')
          .transition()
          .duration(1000)
          .attr(
            'x',
            Number(target.select('rect').attr('x')) + Number(targetTransform[4])
          )
          .attr(
            'y',
            Number(target.select('rect').attr('y')) + Number(targetTransform[5])
          );
        cloned
          .selectAll('.value')
          .transition()
          .duration(1000)
          .attr(
            'x',
            Number(target.selectAll('.value').attr('x')) +
              Number(targetTransform[4])
          )
          .attr(
            'y',
            Number(target.selectAll('.value').attr('y')) +
              Number(targetTransform[5])
          );
        cloned.transition().delay(1000).remove();
      }
    });
    if (stacks.length > 3) {
      const cloned = stacks[stacks.length - 3].name.replace(
        /[&\|\\\*:^%$@()\[\].]/g,
        '_'
      );
      d3.select('#block__cloned')
        .transition()
        .delay(1000)
        .duration(1000)
        .tween('number', function () {
          let i = d3.interpolateNumber(0, -height);
          return function (t) {
            d3.select('#block__cloned').attr(
              'transform',
              `matrix(1,0,0,1,0,${i(t)})`
            );
            renderArrow(cloned, '_cloned');
            if (t === 1) {
              d3.select('#svg')
                .select('#arrow_' + cloned)
                .remove();
            }
          };
        });
      svgblock1
        .transition()
        .delay(1000)
        .duration(1000)
        .tween('number', function () {
          let i = d3.interpolateNumber(height, 0);
          return function (t) {
            svgblock1.attr('transform', `matrix(1,0,0,1,0,${i(t)})`);
            renderArrow(block1, block1);
          };
        });
      svgblock2
        .transition()
        .delay(1000)
        .duration(1000)
        .tween('number', function () {
          let i = d3.interpolateNumber(height, 0);
          return function (t) {
            svgblock2.attr('transform', `matrix(1,0,0,1,0,${i(t)})`);
            renderArrow(block2, block2);
          };
        });
      d3.select('#block__cloned').transition().delay(2000).remove();
    }
  }

  showUp(id: string, offsetY: string | number) {
    const block = d3.select('#svg').select('#' + id);
    const svg = d3.select('#svg');
    const rect = block.select('rect');
    const transform = block
      .attr('transform')
      .replace('matrix(', '')
      .replace(')', '')
      .split(',');
    const transformOriginX =
      (Number(transform[4]) + Number(rect.attr('x'))) /
      Number(svg.attr('width'));
    const transformOriginY =
      (Number(transform[5]) + Number(rect.attr('y'))) /
      Number(svg.attr('height'));
    block.attr(
      'transform-origin',
      `${transformOriginX * 100}% ${transformOriginY * 100}%`
    );
    block
      .transition()
      .duration(1000)
      .tween('number', function () {
        let i = d3.interpolateNumber(0, 1);
        return function (t) {
          block.attr(
            'transform',
            `matrix(${i(t)},0,0,${i(t)},${transform[4]},${
              transform[5] + offsetY
            })`
          );
        };
      });
  }

  uniReturn() {
    const { animationDrawer } = this.props;
    const postArgs = animationDrawer.getPostArgs();
    if (postArgs.length < 1) return;
    const len = animationDrawer.getVariableKeys().length;
    if (len === 0) return;
    const key = animationDrawer.getVariableKeys()[len - 1];
    renderArrow('_cloned', '_cloned');
    const target = d3.select('#block-' + key);
    target
      .select('rect')
      .style('display', 'none')
      .transition()
      .delay(1000)
      .style('display', 'inline');
    target
      .selectAll('.value')
      .style('display', 'none')
      .transition()
      .delay(1000)
      .style('display', 'inline');
    const cloned = (d3.select('#svg').select('#clone') as any).appendClone(
      d3.select('#cloned-block-' + postArgs[0])
    );
    cloned.select('rect').style('fill-opacity', 1).style('stroke-opacity', 1);
    cloned
      .selectAll('.value')
      .style('fill-opacity', 1)
      .style('stroke-opacity', 1);
    cloned.select('text').remove();
    cloned
      .select('rect')
      .transition()
      .duration(1000)
      .attr('x', target.select('rect').attr('x'))
      .attr('y', target.select('rect').attr('y'));
    cloned
      .selectAll('.value')
      .transition()
      .duration(1000)
      .attr('x', target.selectAll('.value').attr('x'))
      .attr('y', target.selectAll('.value').attr('y'));
    d3.select('#stack__cloned').transition().delay(1000).remove();
    d3.select('#block__cloned').transition().delay(1000).remove();
    cloned.transition().delay(1000).remove();
    d3.select('#arrow__cloned').transition().delay(1000).remove();
  }

  compareProps(prevProps: Props, newProps: Props) {
    const stacks = prevProps.animationDrawer.getStacks();
    const newStacks = newProps.animationDrawer.getStacks();
    const destroyList = [];
    const addList = [];
    const stacksLen = stacks.length;
    const newStacksLen = newStacks.length;
    if (stacksLen > newStacksLen) {
      for (let i = newStacksLen; i < stacksLen; i++) {
        const stack = stacks[i];
        const stackName = stack.name.replace(/[&\|\\\*:^%$@()\[\].]/g, '_');
        destroyList.push(stackName);
      }
    } else if (stacksLen !== 0 && stacksLen < newStacksLen) {
      for (let i = stacksLen; i < newStacksLen; i++) {
        const stack = newStacks[i];
        const stackName = stack.name.replace(/[&\|\\\*:^%$@()\[\].]/g, '_');
        addList.push(stackName);
      }
    }
    return { destroyList, addList };
  }

  render() {
    return <React.Fragment></React.Fragment>;
  }
}
