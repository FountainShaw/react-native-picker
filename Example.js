/**
 * @flow
 * author: Fountain Shaw
 * desc: 该组件为./index中三种定制组件的测试组件，用于测试其他组件功能，演示某些组件的使用方法。
 */
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CommonDatePicker, CommonMultiplePicker, CommonSinglePicker } from './index';

const multipleData = [
  { id: 1001, name: '土豆烧牛腩', node: 2001 },
  { id: 1002, name: '番茄蛋饭', node: 2001 },
  { id: 1003, name: '清蒸大闸蟹', node: 2001 },
  { id: 1004, name: '糖醋鲤鱼', node: 2002 },
  { id: 1005, name: '宫保鸡丁', node: 2003 },
  { id: 1006, name: '水煮肉片', node: 2002 },
  { id: 1007, name: '北京烤鸭', node: 2003 },
  { id: 1008, name: '扬州炒饭', node: 2006 },
  { id: 1009, name: '兰州拉面', node: 2005 },
  { id: 1010, name: '小鸡炖蘑菇', node: 2005 },
  { id: 1011, name: '清水白菜', node: 2001 },
  { id: 1012, name: '麻婆豆腐', node: 2004 },
  { id: 1013, name: '爆猪肝', node: 2001 },
  { id: 1014, name: '地三鲜', node: 2004 },
  { id: 1015, name: '油闷大虾', node: 2006 },
  { id: 1016, name: '红烧盘鳝', node: 2004 },
  { id: 2001, name: '北京市', node: -1 },
  { id: 2002, name: '上海市', node: -1 },
  { id: 2003, name: '重庆市', node: -1 },
  { id: 2004, name: '天津市', node: -1 },
  { id: 2005, name: '武汉市', node: -1 },
  { id: 2006, name: '广州市', node: -1 },
];

const singleData = [
  { index: 1000, value: '中国' },
  { index: 1001, value: '美国' },
  { index: 1002, value: '俄罗斯' },
  { index: 1003, value: '德国' },
  { index: 1004, value: '法国' },
  { index: 1005, value: '英国' },
  { index: 1006, value: '日本' },
];

const styles = StyleSheet.create({
  pickerView: {
    flex: 1,
    marginTop: 50,
    flexDirection: 'column',
  },
  flex1: { flex: 1 },
  textStyle: {
    height: 50,
    borderColor: 'red',
    borderWidth: 1,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

export default class extends Component {
  state = {
    multipleDisplay: false,
    mutilpleSelected: [],

    dateDisplay: false,
    dateSelected: [],

    singleDisplay: false,
    singleSelected: '',
  };

  onMultipleConfirm = (id: Array<any>) => this.setState({
    mutilpleSelected: id,
    multipleDisplay: false,
  })
  onMultipleCancel = () => this.setState({ multipleDisplay: false })

  onDateConfirm = (id: Array<any>) => this.setState({
    dateSelected: id,
    dateDisplay: false,
  })
  onDateCancel = () => this.setState({ dateDisplay: false })

  onSingleConfirm = (id: any) => this.setState({
    singleSelected: id,
    singleDisplay: false,
  })
  onSingleCancel = () => this.setState({ singleDisplay: false })

  render() {
    const {
      multipleDisplay,
      dateDisplay,
      singleDisplay,
      mutilpleSelected,
      dateSelected,
      singleSelected,
    } = this.state;

    return (
      <View style={styles.pickerView}>
        <View style={styles.flex1}>
          <Text
            style={styles.textStyle}
            onPress={() => this.setState({ singleDisplay: true })}
          >我就是单选picker，你点我啊</Text>
          <CommonSinglePicker
            display={singleDisplay}
            pickerData={singleData}
            field={{ id: 'index', name: 'value' }}
            selectedBarShow
            clickModalOut
            selectedValue={singleSelected}
            onPickerConfirm={this.onSingleConfirm}
            onPickerCancel={this.onSingleCancel}
          />
        </View>
        <View style={styles.flex1}>
          <Text
            style={styles.textStyle}
            onPress={() => this.setState({ multipleDisplay: true })}
          >我就是多选picker，你点我啊</Text>
          <CommonMultiplePicker
            display={multipleDisplay}
            pickerData={multipleData}
            selectedBarShow
            clickModalOut
            selectedValue={mutilpleSelected}
            onPickerConfirm={this.onMultipleConfirm}
            onPickerCancel={this.onMultipleCancel}
          />
        </View>
        <View style={styles.flex1}>
          <Text
            style={styles.textStyle}
            onPress={() => this.setState({ dateDisplay: true })}
          >我就是日期picker，你点我啊</Text>
          <CommonDatePicker
            display={dateDisplay}
            selectedBarShow
            format={['Y', 'M', 'D']}
            clickModalOut
            showSelectOrderBar={false}
            selectedValue={dateSelected}
            onPickerConfirm={this.onDateConfirm}
            onPickerCancel={this.onDateCancel}
          />
        </View>
      </View>
    );
  }
}
