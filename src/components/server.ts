import {SyntaxErrorData} from 'unicoen.ts/dist/interpreter/mapper/SyntaxErrorData';
import {ExecState} from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import {signal} from './emitter';
import {Interpreter} from 'unicoen.ts/dist/interpreter/Interpreter';
import {inArray} from 'jquery';
import {UniBinOp} from 'unicoen.ts/dist/node/UniBinOp';
import {UniNode} from 'unicoen.ts/dist/node/UniNode';
import {UniExpr, UniMethodCall, UniIdent, UniUnaryOp} from 'unicoen.ts';

export type CONTROL_EVENT =
  | 'Exec'
  | 'Start'
  | 'Stop'
  | 'BackAll'
  | 'StepBack'
  | 'Step'
  | 'StepAll'
  | 'SyntaxCheck'
  | 'JumpTo';
export type DEBUG_STATE =
  | 'First'
  | 'Debugging'
  | 'stdin'
  | 'EOF'
  | 'Stop'
  | 'Executing';
export class Request {
  constructor(
    public controlEvent: CONTROL_EVENT,
    public sourcecode: string,
    public stdinText?: string,
    public lineNumOfBreakpoint?: number[],
    public progLang?: string,
    public step?: number
  ) {}
}

export class Response {
  constructor(
    public output: string,
    public sourcecode: string,
    public debugState: DEBUG_STATE,
    public step: number,
    public errors: SyntaxErrorData[],
    public files: Map<string, ArrayBuffer>,
    public execState?: ExecState,
    public lastState?: ExecState,
    public stepCount?: number,
    public linesShowUp?: any,
    public allVariables?: any,
    public variableShowUp?: any
  ) {}
}

class Server {
  private timer: NodeJS.Timeout | null = null;
  private isExecuting = false;
  private files: Map<string, ArrayBuffer> = new Map();
  private count = 0;
  private interpreter: Interpreter | null = null;
  private stateHistory: ExecState[] = [];
  private outputsHistory: string[] = [];

  private async dynamicLoadInterpreter(progLang?: string) {
    if (typeof progLang === 'undefined') {
      throw new Error('Selected programming language is invalid.');
    } else if (progLang === 'c_cpp') {
      // prettier-ignore
      const module = await import(/* webpackChunkName: "CPP14" */ 'unicoen.ts/dist/interpreter/CPP14/CPP14Interpreter');
      this.interpreter = new module.CPP14Interpreter();
    } else if (progLang === 'java') {
      // prettier-ignore
      const module = await import(/* webpackChunkName: "Java8" */ 'unicoen.ts/dist/interpreter/Java8/Java8Interpreter');
      this.interpreter = new module.Java8Interpreter();
    } else if (progLang === 'python') {
      // prettier-ignore
      const module = await import(/* webpackChunkName: "Python3" */ 'unicoen.ts/dist/interpreter/Python3/Python3Interpreter');
      this.interpreter = new module.Python3Interpreter();
    }
  }
  private async reset(progLang?: string) {
    this.count = 0;
    await this.dynamicLoadInterpreter(progLang);
    if (this.interpreter === null) {
      throw new Error('Interpreter is not found');
    }
    this.interpreter.setFileList(this.files);
    this.stateHistory = [];
    this.outputsHistory = [];
  }

  private addFile(file: File) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException('Problem parsing input file.'));
      };

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          this.files.set(file.name, reader.result);
          resolve(reader.result);
        } else {
          reject(new DOMException('Problem loading input file.'));
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  public async upload(files: FileList) {
    await Promise.all(Array.from(files).map((file) => this.addFile(file)));
    return this.files;
  }

  public delete(filename: string) {
    this.files.delete(filename);
    return this.files;
  }

  public async send(request: Request): Promise<Response> {
    const {
      controlEvent,
      sourcecode,
      stdinText,
      lineNumOfBreakpoint,
      progLang,
      step = 0,
    } = request;

    switch (controlEvent) {
      case 'Start': {
        return this.Start(sourcecode, progLang);
      }
      case 'Stop': {
        return this.Stop(sourcecode);
      }
      case 'BackAll': {
        return this.BackAll(sourcecode);
      }
      case 'StepBack': {
        return this.StepBack(sourcecode);
      }
      case 'Step': {
        return this.Step(sourcecode, stdinText);
      }
      case 'StepAll': {
        return this.StepAll(sourcecode, lineNumOfBreakpoint);
      }
      case 'JumpTo': {
        return this.JumpTo(sourcecode, step);
      }
      case 'Exec': {
        return this.Exec(sourcecode, progLang, lineNumOfBreakpoint);
      }
      case 'SyntaxCheck': {
        return this.SyntaxCheck(sourcecode, progLang);
      }
    }
  }

  private async Start(sourcecode: string, progLang?: string) {
    await this.reset(progLang);
    if (this.interpreter === null) {
      throw new Error('interpreter is not found');
    }
    const lineCount = sourcecode.split(/\r\n|\r|\n/).length;
    const state = this.interpreter.startStepExecution(sourcecode);
    const execState = this.recordExecState(state);
    const stdout = this.interpreter.getStdout();
    const output = this.recordOutputText(stdout);
    const linesShowUp: {
      lineNumber: number;
      steps: number[];
      color: string;
      depth: number[];
      visible: boolean;
    }[] = [];
    const allVariables: {[key: string]: any} = {};
    const variableShowUp: {
      function: string;
      name: string;
      steps: number[];
      color: string;
      visible: boolean;
    }[] = [];
    for (let i = 1; i <= lineCount; i++) {
      linesShowUp.push({
        lineNumber: i,
        steps: [],
        color: '',
        depth: [],
        visible: true,
      });
    }
    let ret: Response = {
      execState,
      output,
      sourcecode,
      debugState: 'First',
      step: this.count,
      errors: [],
      files: this.files,
    };
    this.isExecuting = true;
    while (ret.debugState !== 'EOF' && ret.debugState !== 'stdin') {
      const currentExpr = this.stateHistory[this.count].getCurrentExpr();
      const nextExpr = this.stateHistory[this.count].getNextExpr();
      const stacks = this.stateHistory[this.count].getStacks();
      const functionName = stacks[stacks.length - 1].name;
      let depth = 1;
      if (functionName.split('.').length > 1) {
        depth = Number(functionName.split('.')[1]);
      }
      const nCodeRange = nextExpr.codeRange;
      linesShowUp[nCodeRange.begin.y - 1]['steps'].push(this.count + 1);
      linesShowUp[nCodeRange.begin.y - 1]['depth'].push(depth);

      stacks.forEach((stack) => {
        const stackName = stack.name.split('.')[0];
        if (!(stackName in allVariables)) {
          allVariables[stackName] = {};
        }
        stack.getVariables().forEach((variable) => {
          if (
            inArray(variable.name, Object.keys(allVariables[stackName])) < 0
          ) {
            allVariables[stackName][variable.name] = variableShowUp.length;
            variableShowUp.push({
              function: stackName,
              name: variable.name,
              steps: [this.count],
              color: '',
              visible: true,
            });
          }
        });
      });
      const currentClassName = currentExpr.constructor.name;
      if (currentExpr instanceof UniBinOp) {
        const res = this.binOp(currentExpr);
        if (res) {
          const stack = stacks[stacks.length - 1];
          const variableName = res;
          variableShowUp[allVariables[stack.name.split('.')[0]][variableName]][
            'steps'
          ].push(this.count);
        }
      }
      let lastExpr = null;
      if (this.count > 0) {
        lastExpr = this.stateHistory[this.count - 1].getNextExpr();
        const nextClassName = lastExpr.constructor.name;
        if ((lastExpr instanceof UniBinOp) && currentClassName !== 'UniBinOp') {
          const res = this.binOp(lastExpr);
          if (res) {
            const stack = stacks[stacks.length - 1];
            const variableName = res;
            variableShowUp[
              allVariables[stack.name.split('.')[0]][variableName]
            ]['steps'].push(this.count + 1);
          }
        } else if (
          nextClassName === 'UniReturn' &&
          currentClassName === 'UniVariableDec'
        ) {
          const stack = stacks[stacks.length - 1];
          variableShowUp[
            allVariables[stack.name.split('.')[0]][this.uniReturn(currentExpr)]
          ]['steps'].push(this.count);
        } else if (
          nextClassName === 'UniReturn' &&
          (currentExpr instanceof UniBinOp)
        ) {
          const res = this.returnBinOp(currentExpr);
          if (res) {
            const stack = stacks[stacks.length - 1];
            const variableName = res;
            variableShowUp[
              allVariables[stack.name.split('.')[0]][variableName]
            ]['steps'].push(this.count);
          }
        }
      }

      ret = this.Step(sourcecode);
    }

    console.log(this.stateHistory);

    const step = this.count + 1;
    this.isExecuting = true;
    const res = this.BackAll(sourcecode);
    res.stepCount = step;
    res.linesShowUp = linesShowUp;
    res.allVariables = allVariables;
    res.variableShowUp = variableShowUp;
    return res;
  }

  private binOp(uniBinOp: UniBinOp) {
    const operator = uniBinOp.operator;
    const right: UniBinOp | UniExpr | UniMethodCall = uniBinOp.right;

    if (right instanceof UniMethodCall) {
      if (right.methodName.name !== 'malloc') {
        return false;
      }
    }
    else if (right instanceof UniBinOp) {
      this.binOp(right);
    }

    if (operator !== '=') {
      const left = uniBinOp.left;

      if (left instanceof UniMethodCall) {
        return false;
      }
      else if (left instanceof UniBinOp) {
        this.binOp(left);
      }
    }
    let left = uniBinOp.left;
    if (!left) {
      return false;
    }
    while (!(left instanceof UniIdent)) {
      if (left instanceof UniUnaryOp) {
        left = left.expr;
      } else if (left instanceof UniBinOp) {
        left = left.left;
      }
    }
    return left.name;
  }

  private uniReturn(expr: any) {
    return expr.variables[0].name;
  }
  private returnBinOp(uniBinOp: UniBinOp) {
    const operator = uniBinOp.operator;
    if (operator === '=') {
      const left: any = uniBinOp.left;
      return left.name;
    }
    return false;
  }

  private Stop(sourcecode: string) {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.interpreter = null;
    const ret: Response = {
      sourcecode,
      execState: undefined,
      debugState: 'Stop',
      output: '',
      step: this.count,
      errors: [],
      files: this.files,
    };
    return ret;
  }

  private BackAll(sourcecode: string) {
    this.count = 0;
    const execState = this.stateHistory[this.count];
    const output = this.outputsHistory[this.count];
    const ret: Response = {
      execState,
      output,
      sourcecode,
      debugState: 'First',
      step: this.count,
      errors: [],
      files: this.files,
    };
    return ret;
  }

  private StepBack(sourcecode: string) {
    if (1 <= this.count) {
      this.count -= 1;
    }
    const execState = this.stateHistory[this.count];
    let lastState = undefined;
    if (this.count > 0) {
      lastState = this.stateHistory[this.count - 1];
    }
    const output = this.outputsHistory[this.count];
    const ret: Response = {
      execState,
      lastState: lastState,
      output,
      sourcecode,
      debugState: 'Debugging',
      step: this.count,
      errors: [],
      files: this.files,
    };
    return ret;
  }

  private Step(sourcecode: string, stdinText?: string) {
    ++this.count;
    if (this.count < this.stateHistory.length) {
      const execState = this.stateHistory[this.count];
      let lastState = undefined;
      if (this.count > 0) {
        lastState = this.stateHistory[this.count - 1];
      }
      const output = this.outputsHistory[this.count];
      const ret: Response = {
        execState,
        lastState: lastState,
        output,
        sourcecode,
        debugState: 'Debugging',
        step: this.count,
        errors: [],
        files: this.files,
      };
      return ret;
    }
    if (this.isExecuting) {
      if (this.interpreter === null) {
        throw new Error('engine is not found');
      }
      if (this.interpreter.getIsWaitingForStdin()) {
        if (stdinText !== undefined) {
          this.interpreter.stdin(stdinText);
        }
        //  console.log(`stdin:${stdinText}`);
      }
      const state = this.interpreter.stepExecute();
      // let maxSkip = 10;
      // while (state.getCurrentExpr().codeRange === null && 0 < --maxSkip) {
      //   state = this.engine.stepExecute();
      // }
      const execState = this.recordExecState(state);
      const stdout = this.interpreter.getStdout();
      //  console.log(`stdout:${stdout}`);
      const output = this.recordOutputText(stdout);
      //  console.log(`output:${output}`);
      // let stateText = `Step:${this.count} | Value:${execState.getCurrentValue()}`;
      let debugState: DEBUG_STATE = 'Debugging';
      if (this.interpreter.getIsWaitingForStdin()) {
        debugState = 'stdin';
      } else if (!this.interpreter.isStepExecutionRunning()) {
        debugState = 'EOF';
        this.isExecuting = false;
      }
      const ret: Response = {
        execState,
        lastState: this.stateHistory[this.stateHistory.length - 2],
        output,
        sourcecode,
        debugState,
        step: this.count,
        errors: [],
        files: this.files,
      };
      return ret;
    }
    this.count = this.stateHistory.length - 1;
    const output = this.outputsHistory[this.count];
    const ret: Response = {
      output,
      sourcecode,
      execState: this.getLastHistory(),
      debugState: 'EOF',
      step: this.count,
      errors: [],
      files: this.files,
    };
    return ret;
  }

  private StepAll(sourcecode: string, lineNumOfBreakpoint?: number[]) {
    const currentCount = this.count;
    const loop = () => {
      const ret: Response = this.Step(sourcecode);
      if (ret.debugState === 'EOF') {
        signal('EOF', ret);
        return;
      } else if (ret.debugState === 'stdin') {
        signal('stdin', ret);
        return;
      } else if (typeof lineNumOfBreakpoint !== 'undefined') {
        if (typeof ret.execState !== 'undefined') {
          const nextExpr = ret.execState.getNextExpr();
          const {codeRange} = nextExpr;
          if (codeRange) {
            if (lineNumOfBreakpoint.includes(codeRange.begin.y - 1)) {
              signal('Breakpoint', ret);
              return;
            }
          }
        }
      }
      this.timer = global.setTimeout(loop.bind(this), 1);
    };
    loop();
    const execState = this.stateHistory[currentCount];
    const output = this.outputsHistory[currentCount];
    const debugState: DEBUG_STATE = 'Executing';
    return {
      execState,
      output,
      sourcecode,
      debugState,
      step: currentCount,
      errors: [],
      files: this.files,
    };
  }

  private JumpTo(sourcecode: string, step: number) {
    this.count = step;
    const execState = this.stateHistory[this.count];
    let lastState = undefined;
    if (this.count > 0) {
      lastState = this.stateHistory[this.count - 1];
    }
    const output = this.outputsHistory[this.count];
    const ret: Response = {
      execState,
      lastState: lastState,
      output,
      sourcecode,
      debugState: 'Debugging',
      step: this.count,
      errors: [],
      files: this.files,
    };
    return ret;
  }

  private async Exec(
    sourcecode: string,
    progLang?: string,
    lineNumOfBreakpoint?: number[]
  ) {
    await this.Start(sourcecode, progLang);
    return this.StepAll(sourcecode, lineNumOfBreakpoint);
  }

  private async SyntaxCheck(code: string, progLang?: string) {
    await this.dynamicLoadInterpreter(progLang);
    if (this.interpreter === null) {
      throw new Error('Interpreter is not found');
    }
    const errors: SyntaxErrorData[] = this.interpreter.checkSyntaxError(code);
    const ret: Response = {
      errors,
      sourcecode: code,
      execState: undefined,
      debugState: 'Stop',
      output: '',
      step: this.count,
      files: this.files,
    };
    return ret;
  }

  private recordOutputText(output: string) {
    this.outputsHistory.push(output);
    return output;
  }

  private recordExecState(execState: ExecState) {
    this.stateHistory.push(execState);
    return execState;
  }

  private getLastHistory() {
    return this.stateHistory[this.stateHistory.length - 1];
  }
}

export const server = new Server();
