import * as React from 'react';
import Alert from 'react-bootstrap/lib/Alert';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Checkbox from 'react-bootstrap/lib/Checkbox';
// tslint:disable-next-line:import-name
import AceEditor from 'react-ace';

import 'ace-builds/src-min-noconflict/mode-c_cpp';
import 'ace-builds/src-min-noconflict/snippets/c_cpp';
import 'ace-builds/src-min-noconflict/theme-textmate';
import 'ace-builds/src-min-noconflict/theme-monokai';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import * as d3 from 'd3';

import './editor.scss';
import { signal, slot, remove } from '../emitter';
import {
  Request,
  CONTROL_EVENT,
  server,
  Response,
  DEBUG_STATE,
} from '../server';
import translate from '../../locales/translate';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { LangProps, ProgLangProps, Theme } from '../Props';
import { SyntaxErrorData } from 'unicoen.ts/dist/interpreter/mapper/SyntaxErrorData';
import { connect } from 'react-redux';
import {
  addHighlightStatement,
  removeHighlightStatement,
  removeMultipleHighlight,
  getColor,
} from '../../store/reducers/highlight';
import { message } from 'antd';

type Props = LangProps &
  ProgLangProps & {
    addHighlightStatement: Function;
    removeHighlightStatement: Function;
    removeMultipleHighlight: Function;
    inputText: string;
  };
interface State {
  fontSize: number;
  showAlert: boolean;
  theme: Theme;
}

interface TextRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface GutterMousedownEventTarget
  extends React.BaseHTMLAttributes<HTMLElement> {
  getBoundingClientRect: () => TextRectangle;
}
interface GutterMousedownEvent extends React.MouseEvent {
  domEvent: React.MouseEvent<GutterMousedownEventTarget>;
  editor: AceAjax.Editor;
  getDocumentPosition: () => AceAjax.Position;
  stop: () => void;
}

class Editor extends React.Component<Props, State> {
  private sentSourcecode: string;
  private preventedCommand: CONTROL_EVENT = 'Stop';
  private controlEvent: CONTROL_EVENT = 'Stop';
  private sourcecode: string;
  private ace: any = null;
  private editorRef = React.createRef<any>();
  private lineNumOfBreakpoint: number[] = [];
  private isDebugging = false;
  private checkbox: HTMLInputElement | null = null;
  private noAlert = false;
  private highlightIds: number[] = [];
  // ?????????????????????????????????\n?????????
  private lineCnt: number = 0;

  constructor(props: Props) {
    super(props);
    this.state = {
      fontSize: 14,
      showAlert: false,
      theme: 'light',
    };
    const { lang, progLang } = props;

    const sourceCode = sessionStorage.getItem('sourceCode');

    if (sourceCode) {
      this.sourcecode = sourceCode;
    } else {
      this.sourcecode = translate(lang, this.sourceCodeKey(progLang));
    }
    this.sentSourcecode = '';

    this.hideAlert = this.hideAlert.bind(this);
    this.setHighlightOnCode = this.setHighlightOnCode.bind(this);
  }

  componentDidMount() {
    const progLang = this.props.progLang;
    slot('debug', (controlEvent: CONTROL_EVENT, stdinText?: string) => {
      this.send(controlEvent, stdinText);
      if (
        controlEvent === 'StepBack' ||
        controlEvent === 'BackAll' ||
        controlEvent === 'StepAll'
      ) {
        sessionStorage.setItem('exec', 'step');
      } else {
        sessionStorage.setItem('exec', 'debug');
      }
    });
    slot('jumpTo', (step: number) => {
      const request: Request = {
        sourcecode: this.sourcecode,
        controlEvent: 'JumpTo',
        progLang,
        step: step,
      };
      server
        .send(request)
        .then((response: Response) => {
          this.recieve(response);
        })
        .catch((e) => {
          alert('constructor: ' + e);
        });
      sessionStorage.setItem('exec', 'step');
    });
    slot('EOF', (response: Response) => {
      this.recieve(response);
    });
    slot('stdin', (response: Response) => {
      this.recieve(response);
    });
    slot('Breakpoint', (response: Response) => {
      this.recieve(response);
    });
    slot('zoom', (command: string) => {
      if (command === 'In') {
        this.setState({ fontSize: this.state.fontSize + 1 });
      } else if (command === 'Out') {
        this.setState({ fontSize: Math.max(this.state.fontSize - 1, 10) });
      } else if (command === 'Reset') {
        this.setState({ fontSize: 14 });
      }
    });
    slot('changeTheme', async (theme: Theme) => {
      this.setState({ theme });
    });

    // Enable breakpoint
    const editor: AceAjax.Editor = this.editorRef.current.editor;
    editor.on('keydown', (e: any) => {
      // console.log(e);
    });
    editor.on('guttermousedown', (e: GutterMousedownEvent) => {
      //  mousedown
      const AceRange = this.ace.acequire('ace/range').Range;
      const target: GutterMousedownEventTarget = e.domEvent.currentTarget;
      if (
        typeof target.className !== 'undefined' &&
        target.className.indexOf('ace_gutter') === -1
      ) {
        return;
      }
      if (!editor.isFocused()) {
        return;
      }
      if (e.clientX > 25 + target.getBoundingClientRect().left) return;

      const row: number = e.getDocumentPosition().row;

      const session: AceAjax.IEditSession = e.editor.getSession();
      if (this.lineNumOfBreakpoint.includes(row)) {
        session.clearBreakpoint(row);
        //signal('cancelStatementHighlight', row);
        //const line = d3.selectAll('.ace_line').filter((d, i) => i === row);
        //line.classed('highlight' + row, false);
        this.lineNumOfBreakpoint = this.lineNumOfBreakpoint.filter(
          (n) => n !== row
        );

        const line = d3
          .selectAll('.ace_gutter-cell')
          .filter((d, i) => i === row)
          .style('background', '#f3f7f9')
          .style('border-left', 'none');

        // console.log(row);
        this.props.removeHighlightStatement(row);
      } else {
        const color = getColor();
        if (color === 'DISABLE') {
          message.warning('????????????????????????');
        } else {
          session.setBreakpoint(row, 'ace_breakpoint');
          this.lineNumOfBreakpoint.push(row);
          const line = d3
            .selectAll('.ace_gutter-cell')
            .filter((d, i) => i === row)
            .style('background', color + '33')
            .style('border-left', '3px solid ' + color);
          // line.classed('highlight' + row, true);
          //signal('statementHighlight', row);
          // console.log(row)
          this.props.addHighlightStatement(row, color);
        }
      }
      e.stop();
    });
  }

  // componentDidUpdate() {
  // d3.selectAll('.ace_line')
  //   // .filter((d, i) => inArray(i, this.lineNumOfBreakpoint) >= 0)
  //   .attr('class', (d, i) => {
  //     return `ace_line highlight${i}`;
  //   });
  // }

  componentWillUnmount() {
    remove('debug');
    remove('jumpTo');
    remove('EOF');
    remove('stdin');
    remove('Breakpoint');
    remove('zoom');
    remove('changeTheme');
  }

  sourceCodeKey = (prog: string) =>
    'sourceCode' +
    prog.replace(/_/g, '').replace(/^[a-z]/g, (char) => char.toUpperCase());

  // UNSAFE_componentWillReceiveProps(nextProps: Props) {
  //   const { lang, progLang } = this.props;
  //   const nextLang = nextProps.lang;
  //   const nextProgLang = nextProps.progLang;

  //   if (nextLang !== lang) {
  //     if (this.sourcecode === translate(lang, this.sourceCodeKey(progLang))) {
  //       this.sourcecode = translate(nextLang, this.sourceCodeKey(nextProgLang));
  //     }
  //   } else if (nextProgLang !== progLang) {
  //     this.sourcecode = translate(nextLang, this.sourceCodeKey(nextProgLang));
  //   }
  // }

  send(controlEvent: CONTROL_EVENT, stdinText?: string) {
    const sourcecode = this.sourcecode;
    const lineNumOfBreakpoint = this.lineNumOfBreakpoint;
    const progLang = this.props.progLang;
    const inputText = this.props.inputText + '\t';
    const request: Request = {
      sourcecode,
      controlEvent,
      inputText,
      stdinText,
      lineNumOfBreakpoint,
      progLang,
    };
    this.controlEvent = controlEvent;
    if (controlEvent === 'SyntaxCheck') {
      server
        .send(request)
        .then((response: Response) => {
          const { errors } = response;
          this.setSyntaxError(errors);
        })
        .catch((e) => {
          alert('SyntaxCheck: ' + e);
        });
    } else if (
      !this.noAlert &&
      this.isDebugging &&
      (controlEvent === 'BackAll' ||
        controlEvent === 'StepBack' ||
        controlEvent === 'Step' ||
        controlEvent === 'StepAll') &&
      sourcecode !== this.sentSourcecode
    ) {
      this.preventedCommand = controlEvent;
      this.setState({ showAlert: true });
    } else {
      this.setState({ showAlert: false });
      server
        .send(request)
        .then((response: Response) => {
          this.recieve(response);
        })
        .catch((e) => {
          alert('Other controlEvent' + e);
        });
    }
  }

  recieve(response: Response) {
    try {
      const {
        debugState,
        execState,
        output,
        step,
        sourcecode,
        files,
        lastState,
        stepCount,
        linesShowUp,
        allVariables,
        variableShowUp,
        outputChange,
      } = response;

      // console.log('REC: ', response);

      this.isDebugging = debugState !== 'Stop';
      this.sentSourcecode = sourcecode;
      if (debugState === 'Executing') {
        return;
      }
      if (debugState === 'First') {
        signal('init', stepCount, linesShowUp, allVariables, variableShowUp);
        signal('initAllVariables', allVariables);
        signal('updateDataStructure', execState);
      }
      if (this.controlEvent !== 'JumpTo') {
        signal('changeStep', step);
      }
      signal('changeState', debugState, step);
      signal('changeOutput', output, outputChange);
      signal('draw', execState, lastState);
      signal('files', files);
      this.setHighlightOnCode(debugState, execState);
      // this.lineCnt = linesShowUp.length;
    } catch (e) {
      // alert('recieve: ' + e);
      console.log(e);
    }
  }

  setHighlightOnCode(debugState: DEBUG_STATE, execState?: ExecState) {
    if (debugState === 'Stop') {
      return;
    }
    if (typeof execState === 'undefined') {
      return;
    }
    const codeRange = execState.getNextExpr().codeRange;
    const AceRange = this.ace.acequire('ace/range').Range;
    const editor: AceAjax.Editor = this.editorRef.current.editor;
    if (codeRange) {
      const range: AceAjax.Range = new AceRange(
        codeRange.begin.y - 1,
        codeRange.begin.x,
        codeRange.end.y - 1,
        codeRange.end.x
      );
      editor.resize(true);
      // tslint:disable-next-line:no-empty
      editor.scrollToLine(codeRange.begin.y, true, true, () => {});
      if (debugState === 'EOF') {
        editor.getSelection().setSelectionRange(new AceRange(-1, 0, -1, 1));
      } else {
        editor.getSelection().setSelectionRange(range);
      }
    }
  }

  setSyntaxError(errors: SyntaxErrorData[]) {
    const editor: AceAjax.Editor = this.editorRef.current.editor;
    const annotations = errors.map((error: SyntaxErrorData) => {
      return {
        row: error.line - 1,
        column: error.charPositionInLine - 1,
        text: error.getMsg(),
        type: 'error',
      };
    });
    const session: AceAjax.IEditSession = editor.getSession();
    session.setAnnotations(annotations);
    for (const highlightId of this.highlightIds) {
      session.removeMarker(highlightId);
    }
    this.highlightIds = [];
    for (const annotation of annotations) {
      const range = (session as any).highlightLines(
        annotation.row,
        annotation.row,
        'error_line'
      );
      this.highlightIds.push(range.id);
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.state.showAlert ? this.renderAlert() : null} {this.renderEditor()}
      </React.Fragment>
    );
  }

  renderEditor() {
    const mode = this.props.progLang;
    const { fontSize, theme } = this.state;
    return (
      <AceEditor
        ref={this.editorRef}
        mode={mode}
        theme="textmate"
        value={this.sourcecode}
        name="sourcecode"
        fontSize={fontSize}
        tabSize={2}
        editorProps={{
          $blockScrolling: Infinity,
        }}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          showLineNumbers: true,
          readOnly: false,
        }}
        style={{ height: '100%', width: '100%' }}
        className="editorMain"
        onChange={(text: string) => {
          sessionStorage.setItem('sourceCode', text);

          this.sourcecode = text;

          const delaySyntaxCheck = (code: string) => {
            if (code === this.sourcecode) {
              signal('debug', 'SyntaxCheck');
            }
          };
          const cnt = text.split('\n').length;
          if (cnt < this.lineCnt) {
            this.props.removeMultipleHighlight(cnt);
          }
          this.lineCnt = cnt;
          setTimeout(() => delaySyntaxCheck(text), 1000);
        }}
        onBeforeLoad={(ace) => (this.ace = ace)}
      />
    );
  }

  hideAlert() {
    this.setState({ showAlert: false });
  }

  renderAlert() {
    const { lang } = this.props;
    const warning = translate(lang, 'warning');
    const editInDebug = translate(lang, 'editInDebug');
    const continueDebug = translate(lang, 'continueDebug');
    const restart = translate(lang, 'restart');
    const rememberCommand = translate(lang, 'rememberCommand');
    return (
      <Modal.Dialog
        className="modal-container"
        aria-labelledby="ModalHeader"
        // animation={true}
        tabIndex={-1}
        role="dialog"
      >
        <Modal.Header>
          <Modal.Title>{warning}</Modal.Title>
        </Modal.Header>
        <Alert bsStyle="danger">
          <p>{editInDebug}</p>
        </Alert>
        <Modal.Footer>
          <Button
            bsStyle="danger"
            onClick={() => {
              this.isDebugging = false;
              if (this.checkbox !== null) {
                this.noAlert = this.checkbox.checked;
              }
              signal('debug', this.preventedCommand);
            }}
          >
            {continueDebug}
          </Button>
          <Button
            onClick={() => {
              this.isDebugging = false;
              if (this.checkbox !== null) {
                this.noAlert = this.checkbox.checked;
              }
              signal('debug', 'Start');
            }}
          >
            {restart}
          </Button>
          <Checkbox
            validationState="warning"
            inputRef={(ref) => (this.checkbox = ref)}
          >
            {rememberCommand}
          </Checkbox>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
}

const mapStateToProps = (state: any) => {
  return { inputText: state.compiler.inputText };
};

const mapDispatchToProps = {
  addHighlightStatement: addHighlightStatement,
  removeHighlightStatement: removeHighlightStatement,
  removeMultipleHighlight: removeMultipleHighlight,
};

export default (connect(mapStateToProps, mapDispatchToProps) as any)(Editor);
