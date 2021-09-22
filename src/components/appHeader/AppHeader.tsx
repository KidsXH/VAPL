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
      <p> Console 代码输出框：程序输出结果</p>
      <p>Timeline 时间线面板：点击按钮或时间轴控制流程，显示高亮语句位置</p>
      <p>Call Stack 调用栈面板：展示程序执行过程与变量变化</p>
      <p>Memory 内存面板：展示内存的逻辑视图、内存细节信息、以及int与float类型的二进制表达</p>
      <p>快捷键：开始/重新开始 "Ctrl + Enter" | 上一步 "←" | 下一步 "→" </p>
      <hr />
      <p>！负数浮点数声明需要在负号前加 0，例如"float a= 0 - 1.0"</p>
      <p>！本工具仅提供可视化功能，编译器能力较弱，请在本地IDE中确认编译通过后再使用本工具执行。</p>
      <p>* 推荐至少在 1920×1080 分辨率下使用 （可在浏览器使用 'Ctrl' + '+'/'-' 调节缩放）</p>
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
