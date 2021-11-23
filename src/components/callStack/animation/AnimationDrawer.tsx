import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { Stack } from 'unicoen.ts/dist/interpreter/Engine/Stack';
import { UniVariableDef } from 'unicoen.ts/dist/node/UniVariableDef';
import { arrayToString } from '../blockDrawer/BlockDrawer';
import { inArray } from 'jquery';
import {
  UniBinOp,
  UniIdent,
  UniMethodCall,
  UniProgram,
  UniReturn,
  UniVariableDec,
} from 'unicoen.ts';

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
    console.log(this);
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
    let lastExpr = undefined;
    let flag = true;
    if (this.lastState) {
      if (
        this.execState!.getStacks().length < this.lastState.getStacks().length
      ) {
        // flag = false;
      }
      lastExpr = this.lastState.getNextExpr();
    }
    if (flag) {
      if (currentExpr instanceof UniProgram) {
        this.state = 'programInit';
      } else if (currentExpr instanceof UniVariableDec) {
        this.state = 'variablesInit';
        this.variableDec(currentExpr);
      } else if (currentExpr instanceof UniMethodCall) {
        this.methodCall(currentExpr);
      } else if (currentExpr instanceof UniBinOp) {
        this.binOp(currentExpr);
      }
      if (lastExpr instanceof UniMethodCall) {
        this.methodCall(lastExpr);
      } else if (lastExpr instanceof UniBinOp) {
        this.binOp(lastExpr);
      } else if (lastExpr instanceof UniReturn) {
        if (
          currentExpr instanceof UniMethodCall &&
          (currentExpr as any).methodName.name === 'printf' &&
          (currentExpr as any).args.length > 1 &&
          (currentExpr as any).args[1] instanceof UniMethodCall
        ) {
          this.initMethodCall();
        }
        this.state = 'uniReturn';
        this.uniReturn(lastExpr);
      } else if (lastExpr instanceof UniVariableDec) {
        this.variableKeys = [];
        this.variableTypes = [];
        this.variableValues = [];
        this.state = 'variablesInit';
        this.variableDec(lastExpr);
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
    if (right instanceof UniMethodCall) {
      this.methodCall(right);
    } else if (right instanceof UniBinOp) {
      this.binOp(right);
    }
    if (operator !== '=') {
      const left = uniBinOp.left;
      if (left instanceof UniMethodCall) {
        this.methodCall(left);
      } else if (left instanceof UniBinOp) {
        this.binOp(left);
      }
    }
  }

  private initMethodCall() {
    this.postArgs = [];
    this.variableKeys = [];
    this.variableTypes = [];
    this.variableValues = [];
  }

  public methodCall(uniMethodCall: any) {
    const methodName = uniMethodCall.methodName.name;
    this.execState!.getStacks().forEach((stack) => {
      if (methodName === stack.name) {
        this.state = 'methodCall';
        this.initMethodCall();
        this.getMethodArgs(uniMethodCall);
        return;
      } else if (
        methodName === 'printf' &&
        uniMethodCall.args.length > 1 &&
        uniMethodCall.args[1] instanceof UniMethodCall
      ) {
        if (this.state === 'uniReturn') {
          this.initMethodCall();
          return;
        }
        this.state = 'methodCall';
        this.initMethodCall();
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
    if (variableValue instanceof UniMethodCall) {
      this.methodCall(variableValue);
    } else if (variableValue instanceof UniBinOp) {
      this.binOp(variableValue);
    }
    const variables = this.stack!.getVariables();
    for (let i = 0; i < variables.length; i++) {
      if (variables[i].name === uniVariableDef.name) {
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
    if (returnValue instanceof UniIdent) {
      this.postArgs.push(
        (
          this.lastState!.getStacks()[this.lastState!.getStacks().length - 1]
            .name +
          '-' +
          returnValue.name
        ).replace(/[&\|\\\*:^%$@()\[\].]/g, '_')
      );
      return;
    } else if (returnValue instanceof UniBinOp) {
      this.travelValue(returnValue.left);
      this.travelValue(returnValue.right);
    }
  }

  private travelArg(arg: any, idx: number) {
    if (this.postArgs.length === idx) {
      this.postArgs.push(undefined);
    }
    if (arg instanceof UniIdent) {
      if (this.postArgs[idx] === undefined) {
        this.postArgs[idx] = (
          this.lastState!.getStacks()[this.lastState!.getStacks().length - 1]
            .name +
          '-' +
          arg.name
        ).replace(/[&\|\\\*:^%$@()\[\].]/g, '_');
      }
      return;
    } else if (arg instanceof UniBinOp) {
      this.travelArg(arg.left, idx);
      this.travelArg(arg.right, idx);
    } else if (arg instanceof UniMethodCall) {
      this.methodCall(arg);
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
