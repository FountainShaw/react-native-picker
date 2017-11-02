/**
 * @flow
 * author: Fountain Shaw
 * desc: 该组件为定制的日期滑动选择器组件，适用于android与ios平台。
 */
import React, { Component } from 'react';
import { Text } from 'react-native';
import CommonPicker, { type PickerItemData, DEFAULT_ITEM } from './CommonPicker';

type State = {
  selected: Array<any>;
  pickerData: Array<Array<PickerItemData>>;
};

type Props = {
  display: boolean; // 是否显示picker组件，必传属性
  selectedValue: Array<number>; // 选中项必须与传入格式一致，如[2017, 8, 17, 13, 59]，如果为当前时间，则可直接传入空数组，必传属性
  onPickerConfirm: Function; // 点击确认按钮
  format: ?Array<string>; // 选中的日期项的格式，默认格式为['Y', 'M', 'D', 'H', 'm']，也可根据需求增减展示字段，交换顺序，输出格式将与输入格式保持一致
  onPickerCancel: ?Function; // 点击取消按钮
  onValueChange: ?Function; // 滚动到当前选中项时触发的回调事件
  pickerTitle: ?string; // picker组件的标题
  confirmBtnText: ?string; // 确认按钮显示文字
  cancelBtnText: ?string; // 取消按钮显示文字
  confirmBtnStyle: ?Text.propTypes.style; // 确认按钮样式
  cancelBtnStyle: ?Text.propTypes.style; // 取消按钮样式
  btnStyle: ?Text.propTypes.style; // 按钮样式
  titleStyle: ?Text.propTypes.style; // 标题样式
  itemHeight: ?number; // 每个选中项的高度
  selectedColor: ?any; // 选中项文字的颜色
  unselectedColor: ?any; // 未被选中项的文字颜色
  selectedFontSize: ?number; // 选中项文字的大小
  selectedBarShow: ?boolean; // 是否显示选中条
  selectedBarColor: ?any; // 选中条的颜色
  modalColor: ?any; // 遮罩层颜色
  clickModalOut: ?boolean; // 是否需要在点击遮罩层时让picker组件消失，类似点击取消的效果
  showSelectOrderBar: ?boolean; // 是否显示先择菜单条，默认为true

  yearFromInterval: ?number; // 初始生成时，选中年份（默认为当前年份）与最小年份的差值
  yearToInterval: ?number; // 是否显示先择菜单条，默认为true，但强行设置为false时，选择菜单不显示，此时遮罩层显示属性必须为true，否则功能不完全；当该属性为false，显示遮罩层为true时，点击遮罩层执行onPickerConfirm方法
};

export default class CommonDatePicker extends Component {
  state: State;

  componentWillMount() {
    const { selectedValue, format } = this.props;

    this._initPicker(selectedValue, format || []);
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps) {
      const nextSelected = nextProps.selectedValue;
      const preSelected = this.props.selectedValue;
      const nextFormat = nextProps.format;
      const preFormat = this.props.format;

      if (nextSelected !== preSelected || nextFormat !== preFormat) {
        this._initPicker(nextSelected, nextFormat || []);
      }
    }
  }

  // 初始化日期picker组件，主要是格式化选中项和picker数据
  _initPicker = (selected: Array<number>, format: Array<string>) => {
    format = format.length ? format : ['Y', 'M', 'D', 'H', 'm'];
    const tempSelected = [].concat(selected);
    const temp = this._formatSelected(tempSelected, format);

    if (!temp) {
      console.warn('选中项与格式匹配出错');
      this.setState({ selected: [-1], pickerData: [[DEFAULT_ITEM]] });
      return;
    }

    this._preValue = temp;
    this._initPickerData(temp, format);
  }

  // 判断selected与format是否匹配，若不匹配返回null，若selected不存在则匹配默认，否则返回匹配后的值
  _formatSelected = (selected: Array<number>, format: Array<string> = ['Y', 'M', 'D', 'H', 'm']) => {
    const tempSelected = [].concat(selected);
    if (selected && selected.length === format.length) {
      let match = false;
      format.forEach((item, index) => {
        switch (item) {
        case 'Y': match = tempSelected[index] > 1900 && tempSelected[index] < 2100; break;
        case 'M': match = tempSelected[index] > 0 && tempSelected[index] < 13; break;
        case 'D': match = tempSelected[index] > 0 && tempSelected[index] < 32; break;
        case 'H': match = tempSelected[index] >= 0 && tempSelected[index] < 24; break;
        case 'm': match = tempSelected[index] >= 0 && tempSelected[index] < 60; break;
        default: return null;
        }
      });

      if (!match) return null;

      const yearIndex = format.indexOf('Y');
      const monthIndex = format.indexOf('M');

      if (yearIndex !== -1 && monthIndex !== -1) {
        const dateIndex = format.indexOf('D');
        const monthLastDate = this._getMonthLastDate(selected[yearIndex], selected[monthIndex]);

        if (dateIndex !== -1 && selected[dateIndex] > monthLastDate) {
          return null;
        }
      }

      return tempSelected;
    }

    const date = new Date();

    format.forEach((item, index) => {
      switch (item) {
      case 'Y': tempSelected[index] = date.getFullYear(); break;
      case 'M': tempSelected[index] = date.getMonth() + 1; break;
      case 'D': tempSelected[index] = date.getDate(); break;
      case 'H': tempSelected[index] = date.getHours(); break;
      case 'm': tempSelected[index] = date.getMinutes(); break;
      default: return null;
      }
    });

    return tempSelected;
  }

  // 根据传入选中项和format还初始化pickerData数据
  _initPickerData = (selected: Array<number>, format: Array<string>) => {
    const pickerData = [];
    const tempSelected = [].concat(selected);

    format.forEach((item, index) => {
      switch (item) {
      case 'Y': {
        // 生成年份数据，若已经存在，直接使用，否则重新生成
        if (this._yearData && this._yearData.length) {
          pickerData[index] = this._yearData;
        } else {
          // 如果传入年份不存在，则使用当前年份
          const value = selected[index] || new Date().getFullYear();
          const temp = [];
          const yearFrom = this.props.yearFromInterval || 10;
          const yearTo = this.props.yearToInterval || 10;

          for (let i = -yearFrom; i < yearTo; i++) {
            temp.push({ id: value + i, name: `${value + i}年` });
          }

          const tempArr = [].concat(temp);
          this._yearData = tempArr;
          pickerData[index] = tempArr;
        }
        break;
      }
      case 'M': {
        // 生成月份数据，若已经存在，直接使用，否则重新生成
        if (this._monthData && this._monthData.length) {
          pickerData[index] = this._monthData;
        } else {
          const temp = [];

          for (let i = 1; i < 13; i++) {
            temp.push({ id: i, name: `${i}月` });
          }

          const tempArr = [].concat(temp);
          this._monthData = tempArr;
          pickerData[index] = tempArr;
        }
        break;
      }
      case 'D': {
        // 首先判断传入的选中项的天数
        const temp = [];
        const yearIndex = format.indexOf('Y');
        const monthIndex = format.indexOf('M');
        let monthLastDate = 30;
        if (yearIndex !== -1 && monthIndex !== -1) {
          monthLastDate = this._getMonthLastDate(selected[yearIndex], selected[monthIndex]);
        }

        // 生成天数数据，若已经存在，直接使用，否则重新生成
        if (this._dateData && this._dateData.length === monthLastDate) {
          pickerData[index] = this._dateData;
        } else {
          for (let i = 1; i <= monthLastDate; i++) {
            temp.push({ id: i, name: `${i}日` });
          }

          const tempArr = [].concat(temp);
          this._dateData = tempArr;
          pickerData[index] = tempArr;

          // 对选中项的日期大于该月实际长度的做特殊处理
          if (selected[index] > monthLastDate) {
            tempSelected[index] = monthLastDate;
          }
        }
        break;
      }
      case 'H': {
        // 生成小时数据，若已经存在，直接使用，否则重新生成
        if (this._hourData && this._hourData.length) {
          pickerData[index] = this._hourData;
        } else {
          const temp = [];

          for (let i = 0; i < 24; i++) {
            temp.push({ id: i, name: `${i}时` });
          }

          const tempArr = [].concat(temp);
          this._hourData = tempArr;
          pickerData[index] = tempArr;
        }
        break;
      }
      case 'm': {
        // 生成月份数据，若已经存在，直接使用，否则重新生成
        if (this._minuteData && this._minuteData.length) {
          pickerData[index] = this._minuteData;
        } else {
          const temp = [];

          for (let i = 0; i < 60; i++) {
            temp.push({ id: i, name: `${i}分` });
          }

          const tempArr = [].concat(temp);
          this._minuteData = tempArr;
          pickerData[index] = tempArr;
        }
        break;
      }
      default: return null;
      }
    });

    this.setState({ selected: tempSelected, pickerData });
  }

  // 获取当前年份月份的最后一天，如year=2017,month=2，return的值为28
  _getMonthLastDate = (year: number, month: number) => {
    const tempYear = month === 12 ? year + 1 : year;
    const tempMonth = month === 12 ? 0 : month;
    const tempDate = new Date(tempYear, tempMonth, 1);
    return new Date(tempDate - (1000 * 60 * 60 * 24)).getDate();
  }

  _onPickerCancel = (selected: Array<any>) => {
    this.setState({ selected: this._preValue });

    if (this.props.onPickerCancel) {
      this.props.onPickerCancel(selected);
    }
  }

  _onPickerConfirm = (selected: Array<any>, selectedItem: Array<PickerItemData>) => {
    this._preValue = selected;
    this.setState({ selected: this._preValue });

    if (this.props.onPickerConfirm) {
      this.props.onPickerConfirm(selected, selectedItem);
    }
  }

  _onValueChange = (selectedArr: Array<{id: any; item: any}>) => {
    const format = this.props.format || ['Y', 'M', 'D', 'H', 'm'];
    const selected = [].concat(selectedArr.map(item => item.id));

    this._initPickerData(selected, format);
    // 执行onValueChange方法
    const id = selectedArr[0].id;
    const item = selectedArr[0].item;
    if (this.props.onValueChange) {
      this.props.onValueChange(id, item);
    }
  }

  _yearData: Array<PickerItemData> = [];
  _monthData: Array<PickerItemData> = [];
  _dateData: Array<PickerItemData> = [];
  _hourData: Array<PickerItemData> = [];
  _minuteData: Array<PickerItemData> = [];
  _preValue: Array<number> = [];
  props: Props;

  render() {
    const { selected, pickerData } = this.state;

    return (
      <CommonPicker
        selectedValue={selected}
        pickerData={pickerData}
        onPickerCancel={this._onPickerCancel}
        onPickerConfirm={this._onPickerConfirm}
        onValueChange={this._onValueChange}
        display={this.props.display}
        confirmBtnText={this.props.confirmBtnText}
        cancelBtnText={this.props.cancelBtnText}
        confirmBtnStyle={this.props.confirmBtnStyle}
        cancelBtnStyle={this.props.cancelBtnStyle}
        btnStyle={this.props.btnStyle}
        pickerTitle={this.props.pickerTitle}
        titleStyle={this.props.titleStyle}
        itemHeight={this.props.itemHeight}
        selectedColor={this.props.selectedColor}
        unselectedColor={this.props.unselectedColor}
        selectedFontSize={this.props.selectedFontSize}
        selectedBarShow={this.props.selectedBarShow}
        selectedBarColor={this.props.selectedBarColor}
        modalColor={this.props.modalColor}
        clickModalOut={this.props.clickModalOut}
        showSelectOrderBar={this.props.showSelectOrderBar}
      />
    );
  }
}
