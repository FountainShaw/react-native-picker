/**
 * @flow
 * author: Fountain Shaw
 * desc: 该组件为滑动选择器组件，适用于android与ios平台。
 *   ./index目录中其他所有组件都以该组件为基础，在./CommonPicker原型上实现。
 */
import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';

// 每一展示条目的高度
const dimHeight = Dimensions.get('window').height;
const ITEM_HEIGHT = Math.floor((dimHeight * 11) / 150);

const styles = StyleSheet.create({
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
  },
  scrollView: {
    flex: 1,
  },
});

const DEFAULT_ITEM = { id: -1, name: '无' };
const MAX_FONT_SIZE = 18;

type PickerItemData = {
  id: any;
  name: any;
  node?: any;
};

type State = {
  layoutWidth: number;
  pickerData: Array<PickerItemData>;
  selected: any;
};

type Props = {
  selectedValue: any; // 选中的数据，必须为Array，必传属性，初始值可以为[]
  pickerData: Array<PickerItemData>; // 选择器数据，必须为Array，必传属性
  onValueChange: ?Function; // 滚动到当前选中项时触发的回调事件
  itemHeight: ?number; // 每个选中项的高度
  selectedColor: ?any; // 选中项文字的颜色
  unselectedColor: ?any; // 未被选中项的文字颜色
  selectedFontSize: ?number; // 选中项文字的大小
  selectedBarShow: ?boolean; // 是否显示选中条
  selectedBarColor: ?any; // 选中条的颜色
};

export default class WheelPicker extends Component {
  state: State = { layoutWidth: 0, selected: -1, pickerData: [] };

  // 给选中项赋初值
  componentWillMount() {
    this._itemHeight = this.props.itemHeight || ITEM_HEIGHT;
    this._maxFontSize = this.props.selectedFontSize || MAX_FONT_SIZE;

    const { selectedValue, pickerData } = this.props;
    this.initPickerState(selectedValue, pickerData);

    this._animatedValue = new Animated.Value(0);
    this._event = Animated.event([
      {
        nativeEvent: { contentOffset: { y: this._animatedValue } },
      },
    ], {
      useNativeDrive: true,
    });
  }

  // 根据最新传入的props值来改变该组件的对应状态值
  componentWillReceiveProps(nextProps: any) {
    // pickerData或selectedValue属性改变时的处理
    if (nextProps && (nextProps.selectedValue || nextProps.pickerData)) {
      const preSelStr = this.state.selected;
      const nextSelStr = nextProps.selectedValue;
      if (preSelStr !== nextSelStr || this.props.pickerData !== nextProps.pickerData) {
        this.initPickerState(nextProps.selectedValue, nextProps.pickerData);
      }
    }
  }

  componentDidUpdate() {
    if (this._shouldUpdateScroll) {
      const { selected } = this.state;
      const { pickerData } = this.props;
      const item = this.getItemById(selected);
      if (item.id !== -1) {
        const index = pickerData.indexOf(item);
        this.scrollToItem(index);
      } else {
        console.log('此选中项重复或不存在');
      }

      this._shouldUpdateScroll = false;
    }
  }

  getLayout = ({ nativeEvent }: any) => this.setState({
    layoutWidth: nativeEvent.layout.width,
  })

  // 根据ID值来找到相应的选中项
  getItemById = (id: any) => {
    const tempArr = this.props.pickerData.filter(item => item.id === id);

    return tempArr.length === 1 ? tempArr[0] : DEFAULT_ITEM;
  }

  // 为选中项赋初值，value为数据源中某一项的ID值
  initPickerState = (selected: any, pickerData: Array<PickerItemData>) => {
    // 首先判断是否存在数据源
    if (pickerData && pickerData.length) {
      // 如果选中项存在值
      if (selected !== undefined && selected !== null && selected !== '' && selected !== -1) {
        this.setState({ selected, pickerData });
        this._shouldUpdateScroll = true;
      } else {
        this.setState({ selected: pickerData[0].id, pickerData });
      }
    } else {
      this.setState({ selected: DEFAULT_ITEM.id, pickerData: [DEFAULT_ITEM] });
    }
  }

  // 生成textSize的插值器
  genInterSize = (index: number) => {
    const init = index * this._itemHeight;
    const border = this._itemHeight * 3;
    const start = this._maxFontSize / ((index * 0.2) + 1);
    const end = this._maxFontSize / 1.6;

    if (index > 2) {
      return this._animatedValue.interpolate({
        inputRange: [0, init - border, init, init + border],
        outputRange: [start, end, this._maxFontSize, end],
        extrapolate: 'clamp',
      });
    }

    return this._animatedValue.interpolate({
      inputRange: [0, init, init + border],
      outputRange: [start, this._maxFontSize, end],
      extrapolate: 'clamp',
    });
  }

  // 将picker滚动到指定item的位置
  scrollToItem = (index: number) => {
    if (index !== -1) {
      this._scrollView.scrollTo({ y: index * this._itemHeight, animated: true });
      this._animatedValue.setValue(index * this._itemHeight);
      const { pickerData, selected } = this.state;
      const id = pickerData[index].id;
      if (id !== selected) {
        this.setState({ selected: id });
        const selectedItem = this.getItemById(id);
        if (this.props.onValueChange) {
          if (!selectedItem.id !== -1) {
            this.props.onValueChange(id, selectedItem);
          } else {
            console.log('此选中项重复或不存在');
          }
        }
      }
    }
  }

  // 拖动结束时，触发的事件，让没有对其的item自动对齐
  dragEndToFix = ({ nativeEvent }: any) => {
    const offsetY = nativeEvent.contentOffset.y;
    const initIndex = parseInt(offsetY / this._itemHeight, 10);
    const flag = offsetY % this._itemHeight;
    const index = flag > this._itemHeight / 2 ? initIndex + 1 : initIndex;

    this.scrollToItem(index);
  }

  // 滚动结束时执行
  moveEndToFix = ({ nativeEvent }: any) => {
    const dragEle = this.props.pickerData.filter(item => item.id === this.state.selected)[0];
    const index = this.props.pickerData.indexOf(dragEle);
    const dragEndY = index * this._itemHeight;
    const moveEndY = nativeEvent.contentOffset.y;

    if (Math.abs(moveEndY - dragEndY) > this._itemHeight) {
      this._event({ nativeEvent });
      this.dragEndToFix({ nativeEvent });
    }
  }

  _event: any;
  _scrollView: any;
  _animatedValue: any;
  _itemHeight: number;
  _maxFontSize: number;
  _shouldUpdateScroll: boolean = false;

  props: Props;

  render() {
    const { pickerData, selectedBarColor, selectedBarShow, selectedColor, unselectedColor } = this.props;
    const { selected } = this.state;
    const tempFontSize = pickerData.map((item, index) => this.genInterSize(index));
    return (
      <View
        style={styles.scrollBox}
        onLayout={this.getLayout}
      >
        {
          selectedBarShow ? (
            <View
              style={[
                styles.selectedBar,
                {
                  width: this.state.layoutWidth,
                  height: this._itemHeight,
                  top: this._itemHeight * 2,
                  backgroundColor: selectedBarColor || 'rgba(0,0,0,0.1)',
                },
              ]}
            />
          ) : null
        }
        <ScrollView
          ref={(scroll) => { this._scrollView = scroll; }}
          style={[styles.scrollView, { height: this._itemHeight * 5 }]}
          onScroll={this._event}
          scrollEventThrottle={1}
          showsVerticalScrollIndicator={false}
          onScrollEndDrag={this.dragEndToFix}
          onMomentumScrollEnd={this.moveEndToFix}
        >
          <Text style={[styles.textStyle, { height: this._itemHeight }]} />
          <Text style={[styles.textStyle, { height: this._itemHeight }]} />
          {
            pickerData.map((item, index) => (
              <Animated.Text
                key={item.id}
                style={[
                  styles.textStyle,
                  {
                    height: this._itemHeight,
                    fontSize: tempFontSize[index],
                    color: selected === item.id ? (selectedColor || 'black') : (unselectedColor || 'gray'),
                  },
                ]}
                onPress={() => this.scrollToItem(index)}
              >
                {item.name}
              </Animated.Text>
            ))
          }
          <Text style={[styles.textStyle, { height: this._itemHeight }]} />
          <Text style={[styles.textStyle, { height: this._itemHeight }]} />
        </ScrollView>
      </View>
    );
  }
}
