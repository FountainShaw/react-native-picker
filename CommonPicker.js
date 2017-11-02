/**
 * @flow
 * author: Fountain Shaw
 * desc: 该组件为通用的选滑动选择器组件，适用于android与ios平台。
 *   该组件基于./WheelPicker组件实现，而又是./index中除WheelPicker外的所有组件的基础。
 */
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  PixelRatio,
  TouchableOpacity,
} from 'react-native';
import WheelPicker from './WheelPicker';

// 每一展示条目的高度
const dimHeight = Dimensions.get('window').height;
const dimWidth = Dimensions.get('window').width;
const ITEM_HEIGHT = Math.floor((dimHeight * 11) / 150);

const minBorder = 1 / PixelRatio.get();

const styles = StyleSheet.create({
  modalStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  spaceTouchable: {
    width: dimWidth,
    height: 0,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: minBorder,
  },
  controlTitle: {
    flex: 3,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  scrollBox: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    backgroundColor: 'white',
  },
  textStyle: {
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  selectedBar: {
    zIndex: -1,
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  allScrollView: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  btnStyle: {
    flex: 1,
    marginHorizontal: 15,
    marginVertical: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 4,
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});

export type PickerItemData = {
  id: any;
  name: any;
  node?: any;
};

export const DEFAULT_ITEM: PickerItemData = { id: -1, name: '无' };

type State = {
  display: boolean;
  selected: any;
};

type Props = {
  display: boolean; // 是否显示picker组件，必传属性
  selectedValue: Array<any>; // 选中的数据，必须为Array，必传属性，初始值可以为[]
  pickerData: Array<Array<PickerItemData>>; // 选择器数据，必须为Array，必传属性
  onPickerCancel: ?Function; // 点击取消按钮
  onPickerConfirm: ?Function; // 点击确认按钮
  onValueChange: ?Function; // 滚动到当前选中项时触发的回调事件
  pickerTitle: ?string; // picker组件的标题
  confirmBtnText: ?string; // 确认按钮显示文字
  cancelBtnText: ?string; // 取消按钮显示文字
  confirmBtnStyle: ?Text.propTypes.style; // 确认按钮样式
  cancelBtnStyle: ?Text.propTypes.style; // 取消按钮样式
  btnStyle: ?Text.propTypes.style; // 按钮样式
  pickerTitle: ?string; // 选择器标题
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

export default class CommonTest extends Component {
  state: State = { display: false, selected: [] };

  componentWillMount() {
    this._itemHeight = this.props.itemHeight || ITEM_HEIGHT;
    const { display } = this.props;
    if (display) {
      this.setState({ display });
    }
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps && nextProps.display) {
      const { display } = this.state;

      if (display !== nextProps.display) {
        this.setState({ display: nextProps.display });
      }
    }

    if (nextProps && nextProps.selectedValue) {
      const { selected } = this.state;

      if (selected !== nextProps.selectedValue) {
        // 在被选中项改变，并且被选数据源存在时，讲临时的被选中数组的值改变
        if (nextProps.pickerData.length && nextProps.pickerData.every(item => item.length)) {
          const temp = this._getElementByIdArr(nextProps.selectedValue, nextProps.pickerData);

          if (temp.length === nextProps.selectedValue.length) {
            this._tempSelected = temp.map(item => ({ id: item.id, item }));
          } else {
            console.warn('选中数据与备选数据源匹配错误');
          }
        }

        this.setState({ selected: nextProps.selectedValue });
      }
    }
  }

  // 通过id值，获取当前pickerData中的元素
  _getElementByIdArr = (idArr: Array<any>, pickerData: Array<Array<PickerItemData>>) => {
    const tempIdArr = [].concat(idArr);
    const tempData = [].concat(pickerData);

    return tempIdArr.map((item, index) => tempData[index].filter(data => data.id === item)[0]);
  }

  // 获取_tempSelected中idArr或itemArr的数组数据
  _getSelectedArr = (type: 'id' | 'item' = 'item') => {
    const arr = [].concat(this._tempSelected);
    const len = this.props.pickerData.length;
    if (len) {
      const tempArr: Array<PickerItemData> = [];
      this.props.pickerData.forEach((item, index) => {
        const arrItem = arr[index];
        if (arrItem && arrItem.id && arrItem.item) {
          tempArr[index] = arrItem.item;
        } else {
          tempArr[index] = item[0];
        }
      });
      this._tempSelected = tempArr.map(item => ({ id: item.id, item }));
      return type === 'id' ? tempArr.map(item => item.id) : tempArr;
    }
    this._tempSelected = [{ id: DEFAULT_ITEM.id, item: DEFAULT_ITEM }];
    return type === 'id' ? [DEFAULT_ITEM.id] : [DEFAULT_ITEM];
  }

  // 点击取消按钮
  _onCancel = () => {
    if (!this._preConfirmSelected.length) {
      const { pickerData, selectedValue } = this.props;

      if (pickerData.length && pickerData.every(data => data.length)) {
        if (selectedValue.length) {
          this._preConfirmSelected = [].concat(selectedValue);
        } else {
          this._preConfirmSelected = pickerData.map(data => data[0].id);
        }
      }
    }

    this.setState({ display: false });
    if (this.props.onPickerCancel) {
      this.props.onPickerCancel(this._preConfirmSelected);
    }
  }

  // 点击确认按钮
  _onConfirm = () => {
    const selected = this._getSelectedArr('id');
    const selectedItem = this._getSelectedArr();
    this.setState({ display: false, selected }, () => {
      this._preConfirmSelected = selected;
    });
    if (selected.every(item => item !== -1)) {
      if (this.props.onPickerConfirm) {
        this.props.onPickerConfirm(selected, selectedItem);
      }
      console.log(selectedItem, '选中项');
    } else {
      console.log('此选中项重复或不存在');
    }
  }

  // 单个picker改变
  _onValueChange = (id: any, item: Array<PickerItemData>, index: number) => {
    if (!this._preConfirmSelected.length) {
      const { pickerData, selectedValue } = this.props;

      if (pickerData.length && pickerData.every(data => data.length)) {
        if (selectedValue.length) {
          this._preConfirmSelected = [].concat(selectedValue);
        } else {
          this._preConfirmSelected = pickerData.map(data => data[0].id);
        }
      }
    }

    this._tempSelected[index] = { id, item };
    if (this.props.onValueChange) {
      this.props.onValueChange(this._tempSelected, index);
    }
  }

  // 点击遮罩层时的事件
  _onModalEvent = () => {
    const { clickModalOut, showSelectOrderBar } = this.props;

    if (clickModalOut) {
      if (showSelectOrderBar === false) {
        this._onConfirm();
      } else {
        this._onCancel();
      }
    }
  }

  _tempSelected: Array<any> = [];
  _event: Array<any> = [];
  _value: Array<number> = [];
  _scrollView: Array<any> = [];
  _animatedValue: Array<any> = [];
  _itemHeight: number;
  _shouldUpdateScroll: boolean = false;
  _initSelected: Array<any> = [];
  _spaceTouchable: any;
  _preConfirmSelected: Array<any> = [];

  props: Props;

  render() {
    const { display, selected } = this.state;
    const {
      pickerTitle,
      confirmBtnText,
      cancelBtnText,
      confirmBtnStyle,
      cancelBtnStyle,
      btnStyle,
      titleStyle,
      itemHeight,
      selectedColor,
      unselectedColor,
      selectedBarColor,
      selectedBarShow,
      selectedFontSize,
      modalColor,
    } = this.props;

    return (
      <Modal
        animationType={'slide'}
        transparent
        visible={display}
        onRequestClose={() => {}}
      >
        <View style={[styles.modalStyle, { backgroundColor: modalColor || 'rgba(0,0,0,0.3)' }]}>
          <TouchableOpacity
            ref={(touchable) => { this._spaceTouchable = touchable; }}
            style={styles.spaceTouchable}
            onPress={this._onModalEvent}
          />
          <View
            pointerEvents={'box-none'}
            style={styles.container}
            onLayout={({ nativeEvent }: any) => {
              this._spaceTouchable.setNativeProps({
                style: { height: dimHeight - nativeEvent.layout.height },
              });
            }}
          >
            {
              this.props.showSelectOrderBar === false ? null : (
                <View style={[styles.controlBar, { height: this._itemHeight * 1.3 }]}>
                  <Text
                    style={[styles.btnStyle, btnStyle, cancelBtnStyle]}
                    onPress={this._onCancel}
                  >{cancelBtnText || '取消'}</Text>
                  <Text style={[styles.controlTitle, titleStyle]}>{pickerTitle || ''}</Text>
                  <Text
                    style={[styles.btnStyle, btnStyle, confirmBtnStyle]}
                    onPress={this._onConfirm}
                  >{confirmBtnText || '确认'}</Text>
                </View>
              )
            }
            <View style={styles.allScrollView}>
              {
                this.props.pickerData.map((data, index) => (
                  <WheelPicker
                    key={JSON.stringify(data[0])}
                    pickerData={data}
                    selectedValue={selected[index]}
                    onValueChange={(id, item) => this._onValueChange(id, item, index)}
                    itemHeight={itemHeight}
                    selectedColor={selectedColor}
                    selectedBarColor={selectedBarColor}
                    selectedBarShow={selectedBarShow}
                    selectedFontSize={selectedFontSize}
                    unselectedColor={unselectedColor}
                  />
                ))
              }
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
