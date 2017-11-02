/**
 * @flow
 * author: Fountain Shaw
 * desc: 该组件为定制的单选滑动选择器组件，适用于android与ios平台。
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
  selectedValue: any; // 选中的数据的id值，必传属性，初始值可以为'',null,undefined
  pickerData: Array<any>; // 选择器数据，必须为Array，必传属性
  onPickerConfirm: Function; // 点击确认按钮
  field: ?{ id: string; name: string }; // 数据源中表示id和name的key值
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

export default class CommonSinglePicker extends Component {
  state: State;

  componentWillMount() {
    const { selectedValue, pickerData } = this.props;

    this._initSinglePicker(selectedValue, pickerData);
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps) {
      const nextData = nextProps.pickerData;
      const preData = this.props.pickerData;
      const nextSelected = nextProps.selectedValue;
      const preSelected = this.props.selectedValue;

      if (nextData !== preData || nextSelected !== preSelected) {
        this._initSinglePicker(nextSelected, nextData);
      }
    }
  }

  _initSinglePicker = (selected: any, pickerData: Array<any>) => {
    // 首先判断是否存在数据源
    let tempSelected = [];
    let tempFormatData = [];
    if (pickerData && pickerData.length) {
      const formatData = this._formatPickerData(pickerData);
      // 如果选中项存在值
      if (formatData && formatData.length) {
        if (selected !== undefined && selected !== null && selected !== '' && selected !== -1) {
          tempSelected = [selected];
          tempFormatData = [formatData];
        } else {
          tempSelected = [formatData[0].id];
          tempFormatData = [formatData];
        }
      } else {
        tempSelected = [DEFAULT_ITEM.id];
        tempFormatData = [[DEFAULT_ITEM]];
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

  _formatPickerData = (pickerData: Array<any>) => {
    const { id, name } = this._getFieldString();

    return [].concat(pickerData.map(item => ({
      id: item[id], name: item[name],
    })));
  }

  _restoreData = (item: PickerItemData) => {
    const { id, name } = this._getFieldString();

    return { [id]: item.id, [name]: item.name };
  }

  _getFieldString = () => {
    let id = 'id';
    let name = 'name';

    const { field } = this.props;
    if (field) {
      id = field.id;
      name = field.name;
    }

    return { id, name };
  }

  _onPickerCancel = (selected: Array<any>) => {
    const id = selected[0];
    const selectedItem = this.state.pickerData[0].filter(item => item.id === id)[0];
    const item = this._restoreData(selectedItem);
    if (this.props.onPickerCancel) {
      this.props.onPickerCancel(id, item);
    }
  }

  _onPickerConfirm = (selected: Array<any>, selectedItem: Array<PickerItemData>) => {
    const id = selected[0];
    const item = this._restoreData(selectedItem[0]);
    if (this.props.onPickerConfirm) {
      this.props.onPickerConfirm(id, item);
    }
  }

  _onValueChange = (selectedArr: Array<{id: any; item: any}>) => {
    const id = selectedArr[0].id;
    const item = this._restoreData(selectedArr[0].item);
    if (this.props.onValueChange) {
      this.props.onValueChange(id, item);
    }
  }

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
