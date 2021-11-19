import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';

export class DataStructureDrawer {
  private execState: ExecState | null = null;
  private dataStructures: DataStructureInfo[] = [];
  private arrayCount: number = 0;
  private pointCount: number = 0;
  private arrayStartPos: Array<number> = [800, 50];
  private pointStartPos: Array<number> = [911.5, 50];
  constructor(execState?: ExecState) {
    if (typeof execState === 'undefined') return;
    this.execState = execState;
  }

  public update() {
    let dataStructures = this.dataStructures;
    for (let dataStructure of dataStructures) {
      let value = dataStructure.getValue();
      if (this.execState) {
        let stacks = this.execState.getStacks();
        let flag = false;
        for (let stack of stacks) {
          if (stack.name === dataStructure.getFuncName()) {
            let variables = stack.getVariables();
            for (let variable of variables) {
              if (variable.name === dataStructure.getVarName()) {
                flag = true;
                if (
                  dataStructure.getType() === 'array' ||
                  dataStructure.getType() === 'string'
                ) {
                  value = [];
                  let values = variable.getValue();
                  for (let i = 0; i < values.length; i++) {
                    value.push(values[i].getValue().toString());
                  }
                } else if (dataStructure.getType() === 'point') {
                  value = variable.getValue().valueOf();
                  let lastValue = dataStructure.getValue();
                  if (lastValue !== null && lastValue !== undefined) {
                    let pos = dataStructure.getPos();
                    dataStructure.setPos(
                      pos[0] + 60 * (value - lastValue),
                      pos[1]
                    );
                    console.log(pos, pos[0] + 60 * (value - lastValue), pos[1]);
                  }
                } else if (dataStructure.getType() === 'variable') {
                  let v = variable.getValue();
                  switch (variable.type) {
                    case 'int': {
                      value = v.valueOf();
                      break;
                    }
                    case 'char': {
                      value = String.fromCharCode(Number.parseInt(v));
                      break;
                    }
                    case 'float': {
                      value = v;
                    }
                  }
                }
                dataStructure.setValue(value);
                break;
              }
            }
          }
        }
        if (!flag) {
          if (
            dataStructure.getType() === 'array' ||
            dataStructure.getType() === 'string'
          ) {
            dataStructure.setValue([]);
          } else if (
            dataStructure.getType() === 'point' ||
            dataStructure.getType() === 'variable'
          ) {
            dataStructure.setValue(null);
          }
        }
      } else {
        if (
          dataStructure.getType() === 'array' ||
          dataStructure.getType() === 'string'
        ) {
          dataStructure.setValue([]);
        } else if (
          dataStructure.getType() === 'point' ||
          dataStructure.getType() === 'variable'
        ) {
          dataStructure.setValue(null);
        }
      }
    }
    this.dataStructures = dataStructures;
  }

  public removeAll() {
    this.dataStructures = [];
    this.arrayCount = 0;
    this.pointCount = 0;
  }

  public addDataStructure(funcName: string, varName: string, type: string) {
    for (let v of this.dataStructures) {
      if (v.getFuncName() === funcName && v.getVarName() === varName) {
        return;
      }
    }
    let value;
    let pos = [];
    if (type === 'array' || type === 'string') {
      value = [];
      pos[0] = this.arrayStartPos[0];
      pos[1] = this.arrayStartPos[1] + this.arrayCount * 85;
      this.arrayCount = this.arrayCount + 1;
    } else if (type === 'point') {
      value = null;
      pos[0] = this.pointStartPos[0];
      pos[1] = this.pointStartPos[1] + this.pointCount * 85;
      this.pointCount = this.pointCount + 1;
    } else if (type === 'variable') {
      value = null;
      pos[0] = this.arrayStartPos[0];
      pos[1] = this.arrayStartPos[1] + this.arrayCount * 85;
      this.arrayCount = this.arrayCount + 1;
    }
    if (this.execState) {
      let stacks = this.execState.getStacks();
      for (let stack of stacks) {
        if (stack.name === funcName) {
          let variables = stack.getVariables();
          for (let variable of variables) {
            if (variable.name === varName) {
              if (type === 'array' || type === 'string') {
                value = [];
                let values = variable.getValue();
                for (let i = 0; i < values.length; i++) {
                  value.push(values[i].getValue().toString());
                }
              } else if (type === 'point') {
                value = variable.getValue().valueOf();
              } else if (type === 'variable') {
                value = variable.getValue().valueOf();
              }
            }
          }
          break;
        }
        break;
      }
    }

    let dataStructureInfo = new DataStructureInfo(
      funcName,
      varName,
      type,
      value
    );
    dataStructureInfo.setPos(pos[0], pos[1]);

    this.dataStructures.push(dataStructureInfo);
  }

  public setExecState(execState: ExecState) {
    this.execState = execState;
  }

  public getDataStructures() {
    return this.dataStructures;
  }

  public getPoints() {
    let res = [];
    let dataStructures = this.dataStructures;
    for (let dataStructure of dataStructures) {
      if (dataStructure.getType() === 'point') {
        res.push(dataStructure);
      }
    }
    return res;
  }

  public updatePointPos(
    funcName: string,
    varName: string,
    posX: number,
    posY: number
  ) {
    let dataStructures = this.dataStructures;
    for (let i = 0; i < dataStructures.length; i++) {
      if (
        dataStructures[i].getFuncName() === funcName &&
        dataStructures[i].getVarName() === varName &&
        dataStructures[i].getType() === 'point'
      ) {
        dataStructures[i].setPos(posX, posY);
        break;
      }
    }
    this.dataStructures = dataStructures;
  }
}

export class DataStructureInfo {
  private funcName: string = '';
  private varName: string = '';
  private value: any;
  private type: string = '';
  private pos: Array<number> = [0, 0];
  constructor(funcName: string, varName: string, type: string, value: any) {
    this.funcName = funcName;
    this.varName = varName;
    this.type = type;
    this.value = value;
  }

  public getFuncName() {
    return this.funcName;
  }

  public getVarName() {
    return this.varName;
  }

  public getValue() {
    return this.value;
  }

  public getType() {
    return this.type;
  }

  public getPos() {
    return this.pos;
  }

  public setValue(value: any) {
    this.value = value;
  }

  public setPos(posX: number, posY: number) {
    this.pos[0] = posX;
    this.pos[1] = posY;
  }
}
