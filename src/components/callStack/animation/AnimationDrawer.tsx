import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { Stack } from 'unicoen.ts/dist/interpreter/Engine/Stack';
import { UniVariableDef } from 'unicoen.ts/dist/node/UniVariableDef';
import { arrayToString } from '../blockDrawer/BlockDrawer';
import { inArray } from 'jquery';

export class AnimationDrawer {
  private execState: ExecState | undefined = undefined;
  private lastState: ExecState | undefined = undefined;
  private state!: string;
  private variableKeys!: string[];
  private variableTypes!: string[];
  private variableValues!: any[];
  private postArgs!: any[];
  private stack: Stack | undefined = undefined;
  constructor(execState?: ExecState, lastState?: ExecState) {
    if (typeof execState === 'undefined') return;
    this.execState = execState;
    if (typeof lastState === 'undefined') return;
    this.lastState = lastState;
    this.reset();
    this.getCurrentStack();
    this.parseExe();
  }

  public reset() {
    this.state = '';
    this.stack = undefined;
    this.postArgs = [];
    this.variableKeys = [];
    this.variableTypes = [];
    this.variableValues = [];
  }

  private parseExe() {
    const currentExpr = this.execState!.getCurrentExpr();
    const currentClassName = currentExpr.constructor.name;
    let lastClassName = '';
    let lastExpr = undefined;
    let flag = true;
    if (this.lastState) {
      if (
        this.execState!.getStacks().length < this.lastState.getStacks().length
      ) {
        // flag = false;
      }
      lastExpr = this.lastState.getNextExpr();
      lastClassName = lastExpr.constructor.name;
    }
    if (flag) {
      switch (currentClassName) {
        case 'UniProgram':
          this.state = 'programInit';
          break;
        case 'UniVariableDec':
          this.state = 'variablesInit';
          this.variableDec(currentExpr);
          break;
        case 'UniMethodCall':
          this.methodCall(currentExpr);
          break;
        case 'UniBinOp':
          this.binOp(currentExpr);
          break;
      }
      switch (lastClassName) {
        case 'UniBinOp':
          this.binOp(lastExpr);
          break;
        case 'UniReturn':
          this.state = 'uniReturn';
          this.uniReturn(lastExpr);
          break;
        case 'UniVariableDec':
          this.variableKeys = [];
          this.variableTypes = [];
          this.variableValues = [];
          this.state = 'variablesInit';
          this.variableDec(lastExpr);
          break;
      }
    }
    // console.log(this);
  }

  public binOp(uniBinOp: any) {
    const operator = uniBinOp.operator;
    const right = uniBinOp.right;
    if (!right) {
      return;
    }
    const rightClassName = right.constructor.name;
    switch (rightClassName) {
      case 'UniMethodCall':
        this.methodCall(right);
        break;
      case 'UniBinOp':
        this.binOp(right);
        break;
    }
    if (operator !== '=') {
      const left = uniBinOp.left;
      const leftClassName = left.constructor.name;
      switch (leftClassName) {
        case 'UniMethodCall':
          this.methodCall(left);
          break;
        case 'UniBinOp':
          this.binOp(left);
          break;
      }
    }
  }

  public methodCall(uniMethodCall: any) {
    const methodName = uniMethodCall.methodName.name;
    this.execState!.getStacks().forEach((stack) => {
      if (methodName === stack.name) {
        this.state = 'methodCall';
        this.postArgs = [];
        this.getMethodArgs(uniMethodCall);
        return;
      }
    });
    this.lastState!.getStacks().forEach((stack) => {
      if (methodName === stack.name) {
        this.state = 'methodCall';
        this.postArgs = [];
        this.getMethodArgs(uniMethodCall);
        return;
      }
    });
  }

  public variableDec(uniVariableDec: any) {
    const variables = uniVariableDec.variables;
    if (variables) {
      variables.forEach((variable: UniVariableDef) => {
        this.variableDef(variable);
      });
    }
  }

  public variableDef(uniVariableDef: UniVariableDef) {
    let key = this.stack!.name + '-' + uniVariableDef.name;
    key = key.replace(/[&\|\\\*:^%$@()\[\].]/g, '_');
    const variableValue = uniVariableDef.value;
    if (!variableValue) return;
    const valueClass = variableValue.constructor.name;
    switch (valueClass) {
      case 'UniMethodCall':
        this.methodCall(variableValue);
        break;
      case 'UniBinOp':
        this.binOp(variableValue);
        break;
    }
    const variables = this.stack!.getVariables();
    for (let i = 0; i < variables.length; i++) {
      if (variables[i].getName() === uniVariableDef.name) {
        const type = variables[i].type;
        const value = variables[i].getValue();
        this.variableKeys.push(key);
        this.variableTypes.push(type);
        if (type.split('[').length > 1) {
          this.variableValues.push(arrayToString(value, type.split('[')[0]));
        } else {
          if (inArray(type.split('[')[0], ['char', 'unsignedchar']) < 0) {
            this.variableValues.push(value);
          } else {
            this.variableValues.push(String.fromCharCode(value));
          }
        }
        break;
      }
    }
  }

  public uniReturn(uniReturn: any) {
    const currentExpr = this.execState!.getCurrentExpr();
    const currentClassName = currentExpr.constructor.name;
    // if (currentClassName !== 'UniVariableDec') {
    //   return;
    // }
    const returnValue = uniReturn.value;
    if (!returnValue) {
      return;
    }
    this.postArgs = [];
    this.travelValue(returnValue);
    // this.variableDec(currentExpr);
  }

  private travelValue(returnValue: any) {
    let returnValueClass = returnValue.constructor.name;
    if (returnValueClass === 'UniIdent') {
      this.postArgs.push(
        (
          this.lastState!.getStacks()[this.lastState!.getStacks().length - 1]
            .name +
          '-' +
          returnValue.name
        ).replace(/[&\|\\\*:^%$@()\[\].]/g, '_')
      );
      return;
    } else if (returnValueClass === 'UniBinOp') {
      this.travelValue(returnValue.left);
      this.travelValue(returnValue.right);
    }
  }

  private travelArg(arg: any, idx: number) {
    let returnValueClass = arg.constructor.name;
    if (this.postArgs.length === idx) {
      this.postArgs.push(undefined);
    }
    if (returnValueClass === 'UniIdent') {
      if (this.postArgs[idx] === undefined) {
        this.postArgs[idx] = (
          this.lastState!.getStacks()[this.lastState!.getStacks().length - 1]
            .name +
          '-' +
          arg.name
        ).replace(/[&\|\\\*:^%$@()\[\].]/g, '_');
      }
      return;
    } else if (returnValueClass === 'UniBinOp') {
      this.travelArg(arg.left, idx);
      this.travelArg(arg.right, idx);
    }
  }

  public getMethodArgs(uniMethodCall: any) {
    const args = uniMethodCall.args;
    const variables = this.stack!.getVariables();
    args.forEach((arg: any, idx: number) => {
      this.travelArg(arg, idx);
      const type = variables[idx].type;
      const value = variables[idx].getValue();
      this.variableKeys.push(
        (this.stack!.name + '-' + variables[idx].name).replace(
          /[&\|\\\*:^%$@()\[\].]/g,
          '_'
        )
      );
      this.variableTypes.push(type);
      if (type.split('[').length > 1) {
        this.variableValues.push(arrayToString(value, type.split('[')[0]));
      } else {
        if (inArray(type.split('[')[0], ['char', 'unsignedchar']) < 0) {
          this.variableValues.push(value);
        } else {
          this.variableValues.push(String.fromCharCode(value));
        }
      }
    });
  }

  public getCurrentStack() {
    const stacks = this.execState!.getStacks();
    const stack = stacks[stacks.length - 1];
    this.stack = stack;
    return stack;
  }

  public getState() {
    return this.state;
  }

  public getVariableKeys() {
    return this.variableKeys;
  }

  public getVariableTypes() {
    return this.variableTypes;
  }

  public getVariableValues() {
    return this.variableValues;
  }

  public getStackName() {
    if (this.stack) {
      let res = this.stack.name.replace(/[&\|\\\*:^%$@()\[\].]/g, '_');
      return res;
    }
    return '';
  }

  public getStacks() {
    if (this.execState) {
      return this.execState.getStacks();
    }
    return [];
  }

  public getPostArgs() {
    return this.postArgs;
  }
}
