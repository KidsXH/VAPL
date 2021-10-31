import React from 'react';
import { Popover } from 'antd';
import logo from '../../assets/icon/logo.svg';
import menuIcon1 from '../../assets/icon/info.svg';
import menuIcon2 from '../../assets/icon/icon2.svg';
import './style.scss';

const title = '提示';
const content =  () => {
  return (
    <>
      <p>Source Editor 编辑器面板：源代码输入，点击左侧行号高亮相应语句</p>
      <p>Input / Output 代码输入输出：Input 需要在程序执行前输入内容，程序执行后更改 Input 需要重新运行</p>
      <p>Timeline 时间线面板：点击控制按钮或时间轴控制流程；展示高亮语句执行步骤，可点击右侧面板显示/隐藏高亮</p>
      <p>Call Stack 调用栈面板：展示程序执行过程与变量变化</p>
      <p>Memory 内存面板：展示内存的逻辑视图、内存细节信息、以及int与float类型的二进制表达</p>
      <p>快捷键：开始/重新开始 "Ctrl + Enter" | 上一步 "←" | 下一步 "→" </p>
      <hr />
      <p>！scanf 每次只能读入一个参数，如果需要一次读入多个参数，建议写多个 scanf</p>
      <p>！负数浮点数声明需要在负号前加 0，例如"float a= 0 - 1.0"</p>
      <p>！本工具仅提供可视化功能，编译器能力较弱，请在本地IDE中确认编译通过后再使用本工具执行。</p>
      <p>* 推荐在 Chrome/Edge 浏览器至少 1920×1080 分辨率下使用 （内容显示不全可在浏览器使用 'Ctrl' + '+'/'-' 调节缩放）</p>
      <hr />
      <h4 style={{fontWeight: 600}}>关于无法判断 EOF 的问题及解决办法</h4>
      <p>当前的工具无法判断EOF，建议使用特殊的写法替代。</p>
      <p>
        不支持的写法：while (scanf("%d", &x) != EOF)
      </p>
      <p>
        建议的写法：while (scanf("%d", &x) && x == x)
      </p>
      <hr />
      <h4 style={{fontWeight: 600}}>2021/10/13 更新</h4>
      <p>1. Console 窗口修改为 Input / Output，支持输入</p>
      <p>2. Memory 视图中支持数组类型</p>
      <p>3. 新增 自定义动画速度</p>
      <h4 style={{fontWeight: 600}}>2021/10/08 更新</h4>
      <p>1. 新增 Call Stack 动画的 GIF 录制/下载功能</p>
      <p>2. 新增 Physical View</p>
      <p>3. 更新 Call Stack 样式</p>
    </>
  )
}

function AppHeader() {
  return (
    <div id="AppHeader">
      <div className="logo">
        <svg width={400} height={64}>
          <image xlinkHref={logo} height="64" width="400" />
        </svg>
      </div>
      <div className="menu">
          <div></div>
        <div className="menu-item">
          <Popover placement="bottom" title={title} content={content} trigger="click" 
         overlayClassName="info-popover">
            <svg width={22} height={22}>
              <image xlinkHref={menuIcon1} height="22" width="22" />
            </svg>
          </Popover>
        </div>
        <div className="menu-item">
          <svg width={20} height={20}>
            <image xlinkHref={menuIcon2} height="20" width="20" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default AppHeader;
