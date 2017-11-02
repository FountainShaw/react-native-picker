/**
 * @flow
 * author: Fountain Shaw
 * desc: 该组件为定制的多选滑动选择器组件，适用于android与ios平台。
 */
import React, { Component } from 'react';
import { Text } from 'react-native';
import CommonPicker, { DEFAULT_ITEM } from './CommonPicker';

type PickerItemData = {
  id: any;
  name: string;
  node: any;
};

type State = {
  selected: Array<any>;
  pickerData: Array<Array<PickerItemData>>;
};

type Props = {
  display: boolean; // 是否显示picker组件，必传属性
  selectedValue: Array<any>; // 选中的数据的id值构成的数组，必传属性，初始值可以为[]
  pickerData: Array<any>; // 选择器数据，必须为Array，必传属性
  onPickerConfirm: Function; // 点击确认按钮，必传属性
  rootNode: ?any; // 根节点的节点代码值，默认为-1
  field: ?{ id: string; name: string, node: string }; // 数据源中表示id、name和node（节点层次）的key值
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
  showSelectOrderBar: ?boolean; // 是否显示先择菜单条，默认为true，但强行设置为false时，选择菜单不显示，此时遮罩层显示属性必须为true，否则功能不完全；当该属性为false，显示遮罩层为true时，点击遮罩层执行onPickerConfirm方法
};

export default class CommonMultiplePicker extends Component {
  state: State;

  componentWillMount() {
    const { selectedValue, pickerData } = this.props;

    this._initMultiplePicker(selectedValue, pickerData);
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps) {
      const nextData = nextProps.pickerData;
      const preData = this.props.pickerData;
      const nextSelected = nextProps.selectedValue;
      const preSelected = this.props.selectedValue;

      if (nextData !== preData || nextSelected !== preSelected) {
        this._initMultiplePicker(nextSelected, nextData);
      }
    }
  }

  _initMultiplePicker = (selected: Array<any>, pickerData: Array<any>) => {
    // 首先判断是否存在数据源
    let tempSelected = [];
    let tempFormatData = [];
    if (pickerData && pickerData.length > 3) {
      if (selected && selected.length && selected.every(item => item !== '')) {
        tempFormatData = this._formatPickerData(pickerData, selected);
        if (tempFormatData && tempFormatData.length && tempFormatData.every(item => item.length)) {
          tempSelected = selected;
        } else {
          tempSelected = [DEFAULT_ITEM.id];
          tempFormatData = [[DEFAULT_ITEM]];
        }
      } else {
        tempFormatData = this._formatPickerData(pickerData);
        if (tempFormatData && tempFormatData.length && tempFormatData.every(item => item.length)) {
          tempSelected = tempFormatData.map(item => item[0].id);
        } else {
          tempSelected = [DEFAULT_ITEM.id];
          tempFormatData = [[DEFAULT_ITEM]];
        }
      }
    } else {
      tempSelected = [DEFAULT_ITEM.id];
      tempFormatData = [[DEFAULT_ITEM]];
    }

    this.setState({
      selected: tempSelected,
      pickerData: tempFormatData,
    });
  }

  _formatPickerData = (pickerData: Array<any>, selected: Array<any> = []) => {
    const { id, name, node } = this._getFieldString();
    let hasError = false;

    const tempData = [].concat(pickerData.map((item) => {
      if (!(item && item[id] && item[name] && item[node])) {
        hasError = true;
      }

      return { id: item[id], name: item[name], node: item[node] };
    }));

    if (hasError) {
      console.warn('picker数据与field字段匹配存在错误');
    }

    let { rootNode } = this.props;
    if (rootNode === undefined || rootNode === null || rootNode === '') {
      rootNode = -1;
    }

    const tempFormatData = [];
    let index = 0;
    let isEnd = false; // 如果层级关系执行到最后或者在执行中出现问题
    do {
      tempFormatData[index] = tempData.filter(item => item[node] === rootNode);

      if (tempFormatData[index] && tempFormatData[index].length) {
        rootNode = tempFormatData[index][0][id];
        if (selected && selected.length) {
          const tempArr = [].concat(tempFormatData[index]);
          const selectedItem = tempArr.filter(item => item[id] === selected[index])[0];
          if (selectedItem && selectedItem[id]) {
            rootNode = selectedItem[id];
          }
        }
        index += 1;
      } else {
        isEnd = true;
      }
    } while (!isEnd);

    if (index) tempFormatData.pop();

    return tempFormatData;
  }

  _restoreData = (item: PickerItemData) => {
    const { id, name, node } = this._getFieldString();

    return { [id]: item.id, [name]: item.name, [node]: item.node };
  }

  _getFieldString = () => {
    let id = 'id';
    let name = 'name';
    let node = 'node';

    const { field } = this.props;
    if (field) {
      id = field.id;
      name = field.name;
      node = field.node;
    }

    return { id, name, node };
  }

  _onPickerCancel = (selected: Array<any>) => {
    this._initMultiplePicker(selected, this.props.pickerData);
    if (this.props.onPickerCancel) {
      this.props.onPickerCancel(selected);
    }
  }

  _onPickerConfirm = (selected: Array<any>, selectedItem: Array<PickerItemData>) => {
    if (this.props.onPickerConfirm) {
      this.props.onPickerConfirm(selected, selectedItem);
    }
  }

  _onValueChange = (selectedArr: Array<{id: any; item: any}>, index: number) => {
    const idArr = selectedArr.map(item => item.id);
    const itemArr = selectedArr.map(item => this._restoreData(item.item));

    const tempSelected = [].concat(this.state.selected);
    tempSelected[index] = idArr[index];
    const temp = this._isNeedToResetSelected(tempSelected, index);
    if (temp.isNeed) {
      const { pickerData } = this.props;
      const tempFormatData = this._formatPickerData(pickerData, temp.selected);
      if (tempFormatData && tempFormatData.length && tempFormatData.every(item => item.length)) {
        const tempSelArr = tempFormatData.map(item => item[0].id);
        const tempArr = temp.selected.concat(tempSelArr.splice(index + 1, tempSelArr.length - index));
        this._scrollSelected = tempArr;
        this.setState({ selected: tempArr, pickerData: tempFormatData });
      } else {
        console.warn('滚动时数据重置出现错误');
      }
    }

    if (this.props.onValueChange) {
      this.props.onValueChange(idArr, itemArr);
    }
  }

  _isNeedToResetSelected = (selected: Array<any>, index: number) => {
    const len = selected.length;

    if (index === len - 1) {
      return { isNeed: false, selected };
    }

    const tempArr = [].concat(selected);
    tempArr.splice(index + 1, len - index);

    return { isNeed: true, selected: tempArr };
  }

  _confirmSelected: Array<any> = [];
  _confirmPickerData: Array<Array<any>> = [];
  _scrollSelected: Array<any> = [];
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
