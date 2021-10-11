import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { Stack } from 'unicoen.ts/dist/interpreter/Engine/Stack';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import { Vector } from 'vector2d';

export type BlockCellContainer = BlockCell[];
export type BlockTable = BlockCellContainer[];

export function arrayToString(value: number | any[], type: string) {
  console.log(value, type);

  const array = valueToArray(value, type);
  if (Array.isArray(value)) {
    if (
      type.startsWith('char') ||
      type.startsWith('unsignedchar')
      // type.split('[').length === 2
    ) {
      return '"' + array.toString() + '"';
    }
    return '[' + array.toString() + ']';
  }
  return array.toString();
}

export function valueToArray(value: number | any[], type: string) {
  const res: string[] = [];
  if (Array.isArray(value)) {
    value.forEach((v) => {
      res.push(arrayToString(v.value, v.type));
    });
  } else {
    if (type === 'char' || type === 'unsignedchar') {
      switch (value) {
        case undefined:
          return ``;
        case 0:
          return ``;
        default:
          return `${String.fromCharCode(value)}`;
      }
    } else {
      return value ? value : 0;
    }
  }
  if (
    type.startsWith('char') ||
    type.startsWith('unsignedchar')
    // type.split('[').length === 2
  ) {
    return [res.join('')];
  }
  return res;
}

export class BlockDrawer {
  private blockStacks: BlockStack[] = [];
  private blockArrows: any = [null, null];
  private execState: ExecState | null = null;
  constructor(execState?: ExecState) {
    if (typeof execState === 'undefined') return;
    this.execState = execState;
    this.reset();
    this.update();
    this.calcPos();
  }
  private reset() {
    this.blockStacks = [];
  }

  private update() {
    if (this.execState === null) return;
    const stacks = this.execState.getStacks();
    stacks.forEach((stack, i) => {
      if (stack.name !== 'GLOBAL') {
        const blockStack = new BlockStack(stack);
        blockStack.setColor('#979797');
        this.blockStacks.push(blockStack);
        blockStack.setIndex(i);
      }
    });
  }

  private calcPos() {
    const originX = 300;
    const originY = 5;
    const offsetX = 40;
    const offsetY = 40;
    const x = originX;
    let y = originY;
    this.blockStacks.slice(-2).forEach((blockStack, index) => {
      this.blockArrows[index] = blockStack.getName();
      const height = this.calcStackPos(x, y, blockStack);
      y += height + offsetY;
    });

    this.blockStacks.slice(0, -2).forEach((blockStack) => {
      this.calcStackPos(0, 0, blockStack);
    });
  }

  private calcStackPos(x: number, y: number, blockStack: BlockStack) {
    blockStack.setPos(x, y);
    const offsetX = 20;
    const offsetY = 40;
    const originX = x + offsetX;
    const originY = y + 20;
    let row = 1;
    let count = 0;
    const blockTable = blockStack.getBlockTable();
    blockTable.forEach((blockCellContainer) => {
      const len = 1;
      if (count + len > 2) {
        row++;
        count = 0;
      }
      const _x = originX + (offsetX + BlockCell.WIDTH) * count + offsetX;
      const _y =
        originY + (offsetY + BlockCell.HEIGHT) * row - BlockCell.HEIGHT;
      this.calcVariablePos(_x, _y, blockCellContainer);
      count += len;
    });
    blockStack.setHeight((BlockCell.HEIGHT + offsetY) * row + offsetY * 2);
    blockStack.setWidth((BlockCell.WIDTH + offsetX) * 2 + offsetX * 3);

    return (BlockCell.HEIGHT + offsetY) * row + offsetY * 2;
  }

  private calcVariablePos(
    x: number,
    y: number,
    blockCellContainer: BlockCellContainer
  ) {
    const offsetX = 20 + BlockCell.WIDTH;
    blockCellContainer[0].setPos(x, y);
  }

  // private calcVariablePos(
  //   x: number,
  //   y: number,
  //   blockCellContainer: BlockCellContainer
  // ) {
  //   const offsetX = 20 + BlockCell.WIDTH;
  //   if (blockCellContainer.length === 1) {
  //     blockCellContainer[0].setPos(x, y);
  //   } else {
  //     blockCellContainer[0].setPos(x - 10, y - 10);
  //     blockCellContainer[0].setWidth(
  //       offsetX * Math.min(getCellsByDepth(blockCellContainer, 1).length, 3)
  //     );
  //     blockCellContainer[0].setHeight(BlockCell.HEIGHT + 20);
  //     const depth = getDepth(blockCellContainer);
  //     for (let i = 1; i <= depth; i++) {
  //       const blockCells = getCellsByDepth(blockCellContainer, i);
  //       blockCells.forEach((blockCell) => {});
  //     }
  //   }
  // }

  public getBlockStacks() {
    return this.blockStacks;
  }

  public getBlockArrows() {
    return this.blockArrows;
  }

  public addBlockStack(blockStack: BlockStack) {
    this.blockStacks.push(blockStack);
  }

  public addArrow(stackName: any) {
    this.blockArrows.push(stackName);
  }
}

export class BlockStack {
  public readonly key: string;
  private pos: Vector = new Vector(0, 0);
  private blockTable: BlockTable;
  private stack: Stack;
  private width = 0;
  private height = 0;
  private color: string | undefined;
  private index = 0;

  constructor(stack: Stack) {
    this.stack = stack;
    this.blockTable = this.makeBlockTable();
    this.key = stack.name;
  }

  public setPos(x: number, y: number) {
    this.pos.setAxes(x, y);
  }

  public setWidth(width: number) {
    this.width = width;
  }

  public setHeight(height: number) {
    this.height = height;
  }

  public setColor(color: string) {
    this.color = color;
  }

  public setIndex(index: number) {
    this.index = index;
  }

  private makeBlockTable(): BlockTable {
    const blockTable: BlockTable = [];
    const variables = this.stack.getVariables();
    const stackName = this.stack.name;
    variables.forEach((variable) => {
      const value = variable.getValue();
      const isArrayVariable = Array.isArray(value);
      const blockVariable = isArrayVariable
        ? new BlockArrayVariable(variable, stackName)
        : new BlockVariable(variable, stackName);
      const cellss = blockVariable.getBlockCellContainer();
      blockTable.push(cellss);
    });
    return blockTable;
  }

  public getBlockTable() {
    return this.blockTable;
  }

  public x() {
    return this.pos.getX();
  }

  public y() {
    return this.pos.getY();
  }

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }

  public getName() {
    const res = this.key.replace(/[&|\\*:^%$@()[\].]/g, '_');
    return res;
  }

  public getColor() {
    return this.color;
  }

  public getIndex() {
    return this.index;
  }
}

export class BlockVariable {
  public readonly key: string;
  protected blockCellContainer: BlockCellContainer = [];
  protected readonly variable: Variable;
  protected readonly stackName: string;
  constructor(variable: Variable, stackName: string) {
    this.variable = variable;
    this.stackName = stackName;
    this.key = `${stackName}-${variable.name}`;
    this.key = this.key.replace(/[&|\\*:^%$@()[\].]/g, '_');
    this.init();
  }

  protected init() {
    const { type, name, address } = this.variable;
    const cell = this.pushCell(name, this.variable.getValue());
    cell.setType(type);
    cell.setAddress(address);
  }

  protected pushCell(name: string, value: any): BlockCell {
    const cell = new BlockCell(name, this.key, value);
    this.blockCellContainer.push(cell);
    return cell;
  }

  public getBlockCellContainer(): BlockCellContainer {
    return this.blockCellContainer;
  }
}

export class BlockArrayVariable extends BlockVariable {
  constructor(variable: Variable, stackName: string) {
    super(variable, stackName);
  }

  public getBlockCellContainer(): BlockCellContainer {
    const children: BlockCellContainer = [];
    const value: Variable[] = this.variable.getValue();
    for (const v of value) {
      const blockVariable = Array.isArray(v.getValue())
        ? new BlockArrayVariable(v, this.stackName)
        : new BlockVariable(v, this.stackName);
      const table = blockVariable.getBlockCellContainer();
      children.push(...table);
    }
    return this.blockCellContainer.concat(children);
  }
}

export class BlockCell {
  public static readonly FONT_SIZE: number = 20;
  public static readonly HEIGHT: number = 50;
  public static readonly WIDTH: number = 150;
  private address: number | undefined;
  public readonly key: string;
  private type: string | undefined;
  private name: string;
  private pos: Vector = new Vector(-1, -1);
  private value: any;
  private depth = 0;
  private width: number = BlockCell.WIDTH;
  private height: number = BlockCell.HEIGHT;
  constructor(name: string, parentKey: string, value: any) {
    this.name = name;
    this.key = parentKey;
    this.key = this.key.replace(/[&|\\*:^%$@()[\].]/g, '_');
    this.value = value;
    this.depth = this.name.split('[').length - 1;
  }

  public setAddress(address: number) {
    this.address = address;
  }

  public setType(type: string) {
    this.type = type;
  }

  public setPos(x: number, y: number) {
    this.pos.setAxes(x, y);
  }

  public setWidth(width: number) {
    this.width = width;
  }

  public setHeight(height: number) {
    this.height = height;
  }

  public getAddress() {
    return this.address;
  }

  public getType() {
    return this.type;
  }

  public getName() {
    return this.name;
  }

  public x() {
    return this.pos.getX();
  }

  public y() {
    return this.pos.getY();
  }

  public getValue() {
    if (this.type!.split('[').length > 1) {
      return arrayToString(this.value, this.type!.split('[')[0]);
    }

    return this.value.toString();
  }

  public getDepth() {
    return this.depth;
  }

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }
}
