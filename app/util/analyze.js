/**
 * Created by xiaobxia on 2018/1/29.
 */
const numberUtil = require('./number');
// 获去连续相同正负的信息
function getSame(list, index) {
  let end = index;
  let start = index;
  let values = [list[index]];
  if (list[index]['valuation_rate'] > 0 || list[index]['valuation_rate'] === 0) {
    for (let k = index + 1; k < list.length; k++) {
      if (list[k]['valuation_rate'] > 0 || list[k]['valuation_rate'] === 0) {
        values.push(list[k]);
        end = k;
      } else {
        break;
      }
    }
    for (let k = index - 1; k >= 0; k--) {
      if (list[k]['valuation_rate'] > 0 || list[k]['valuation_rate'] === 0) {
        values.unshift(list[k]);
        start = k;
      } else {
        break;
      }
    }
  } else {
    for (let k = index + 1; k < list.length; k++) {
      if (list[k]['valuation_rate'] < 0 || list[k]['valuation_rate'] === 0) {
        values.push(list[k]);
        end = k;
      } else {
        break;
      }
    }
    for (let k = index - 1; k >= 0; k--) {
      if (list[k]['valuation_rate'] < 0 || list[k]['valuation_rate'] === 0) {
        values.unshift(list[k]);
        start = k;
      } else {
        break;
      }
    }
  }
  return {
    start,
    end,
    values
  };
}

// 删除头尾的脏数据
function deleteStartAndEnd(list) {
  let start = getSame(list, 0).end + 1;
  let end = getSame(list, list.length - 1).start;
  return list.slice(start, end);
}

// 计算涨跌的个数各是多少
exports.getUpAndDownCount = function (list) {
  let up = 0;
  let down = 0;
  let equal = 0;
  for (let i = 0; i < list.length; i++) {
    let a = list[i]['valuation_rate'];
    if (a > 0) {
      up++;
    } else if (a === 0) {
      equal++;
    } else {
      down++;
    }
  }
  return {
    total: list.length,
    //涨的天数
    up,
    //平的天数
    equal,
    //跌的天数
    down
  };
};

// 获取涨跌值分布
exports.getUpAndDownDistribution = function (list) {
  const step = 0.5;
  let map = {};
  for (let i = 0; i < list.length; i++) {
    let ratio = list[i]['valuation_rate'];
    for (let k = 0; k < 20; k++) {
      const start = k * step;
      const end = (k + 1) * step;
      // 正的, 不包括0
      if (start < ratio && (ratio <= end)) {
        const key = `${start}~${end}`;
        // 在某一区间出现次数
        if (map[key]) {
          // 记录
          map[key].times++;
          map[key].values.push(ratio);
        } else {
          map[key] = {
            start,
            end,
            times: 1,
            values: [ratio],
            continues: {
              times: 0,
              values: []
            }
          };
        }
        if (list[i + 1] && list[i + 1]['valuation_rate'] > 0) {
          if (map[key].continues) {
            map[key].continues.times++;
            map[key].continues.values.push(list[i + 1]['valuation_rate']);
          }
        }
        break;
        // 负的，包括零
      } else if (-end < ratio && ratio <= -start) {
        const key = `-${end}~-${start}`;
        if (map[key]) {
          map[key].times++;
          map[key].values.push(ratio);
        } else {
          map[key] = {
            start: -end,
            end: -start,
            times: 1,
            values: [ratio],
            continues: {
              times: 0,
              values: []
            }
          };
        }
        if (list[i + 1] && list[i + 1]['valuation_rate'] < 0) {
          if (map[key].continues) {
            map[key].continues.times++;
            map[key].continues.values.push(list[i + 1]['valuation_rate']);
          }
        }
        break;
      }
    }
  }
  let list1 = [];
  let len = 0;
  for (let k in map) {
    len += map[k].times;
    list1.push({
      start: map[k].start,
      end: map[k].end,
      range: k,
      values: map[k].values,
      times: map[k].times,
      continues: map[k].continues
    });
  }
  if (len !== list.length) {
    console.error('数据丢失');
  }
  list1.sort(function (a, b) {
    return parseFloat(a.range.split('~')[0]) - parseFloat(b.range.split('~')[0]);
  });
  return {
    list: list1,
    map
  };
};

// 获取单日最大跌涨幅
exports.getMaxUpAndDown = function (list) {
  let newList = [];
  for (let i = 0; i < list.length; i++) {
    newList.push(list[i]);
  }
  // 大的在右边
  newList.sort(function (a, b) {
    return parseFloat(a['valuation_rate']) - parseFloat(b['valuation_rate'])
  });
  return {
    // 单日最大涨幅
    maxUp: newList[newList.length - 1]['valuation_rate'],
    // 单日最大跌幅
    maxDown: newList[0]['valuation_rate']
  };
};
// 连涨和连跌天数
exports.getMaxUpIntervalAndMaxDownInterval = function (list) {
  let newList = [];
  // 翻转
  for (let i = list.length - 1; i >= 0; i--) {
    newList.push(list[i]);
  }
  let maxUpInterval = 0;
  let maxUpTemp = 0;
  let maxDownInterval = 0;
  let maxDownTemp = 0;
  let upInterval = {};
  let downInterval = {};

  let index = 0;
  // 涨
  for (let i = 0; i < newList.length; i++) {
    if (i === index) {
      // console.log(index)
      // 包括0
      if (newList[i]['valuation_rate'] > 0 || newList[i]['valuation_rate'] === 0) {
        maxUpTemp = 1;
        let sum = newList[i]['valuation_rate'];
        for (let j = i + 1; j < newList.length; j++) {
          index = j;
          if (newList[j]['valuation_rate'] > 0 || newList[j]['valuation_rate'] === 0) {
            sum += newList[j]['valuation_rate'];
            maxUpTemp++;
          } else {
            break;
          }
        }
        sum = parseInt(sum * 100) / 100;
        if (upInterval[maxUpTemp]) {
          upInterval[maxUpTemp].times++;
          upInterval[maxUpTemp].rates.push(sum);
        } else {
          upInterval[maxUpTemp] = {};
          upInterval[maxUpTemp].times = 1;
          upInterval[maxUpTemp].rates = [sum];
        }
        if (maxUpInterval < maxUpTemp) {
          maxUpInterval = maxUpTemp;
        }
      }

      if (newList[i]['valuation_rate'] < 0 || newList[i]['valuation_rate'] === 0) {
        maxDownTemp = 1;
        let sum = newList[i]['valuation_rate'];
        for (let j = i + 1; j < newList.length; j++) {
          index = j;
          if (newList[j]['valuation_rate'] < 0 || newList[j]['valuation_rate'] === 0) {
            sum += newList[j]['valuation_rate'];
            maxDownTemp++;
          } else {
            break;
          }
        }
        sum = parseInt(sum * 100) / 100;
        if (downInterval[maxDownTemp]) {
          downInterval[maxDownTemp].times++;
          downInterval[maxDownTemp].rates.push(sum);
        } else {
          downInterval[maxDownTemp] = {};
          downInterval[maxDownTemp].times = 1;
          downInterval[maxDownTemp].rates = [sum];
        }
        if (maxDownInterval < maxDownTemp) {
          maxDownInterval = maxDownTemp
        }
      }
    }
  }
  return {
    days: newList.length,
    // 最多连涨天数
    maxUpInterval,
    // 最多连跌天数
    maxDownInterval,
    // 涨的天数的分布统计
    upInterval,
    // 跌的天数的分布统计
    downInterval
  };
};

// 获得当前趋势已经延续的天数
exports.continueDays = function (now, list) {
  let maxUpTemp = 0;
  maxUpTemp = 1;
  if (now > 0 || now === 0) {
    for (let j = 0; j < list.length; j++) {
      if (list[j]['valuation_rate'] > 0 || list[j]['valuation_rate'] === 0) {
        maxUpTemp++;
      } else {
        break;
      }
    }
  } else {
    for (let j = 0; j < list.length; j++) {
      if (list[j]['valuation_rate'] < 0 || list[j]['valuation_rate'] === 0) {
        maxUpTemp++;
      } else {
        break;
      }
    }
  }
  return maxUpTemp;
};

// 通过估值源准确性统计，获取更好的估值源
exports.getBetterValuation = function (fund) {
  let valuationInfo = null;
  // 如果有统计
  if (fund['better_count']) {
    const betterCount = JSON.parse(fund['better_count']).data;
    let haomaiCount = 0;
    let tiantianCount = 0;
    const totalCount = betterCount.length;
    const standard = (totalCount * 2) / 3;
    //统计
    betterCount.forEach(function (item) {
      if (item.type === 'tiantian') {
        tiantianCount++;
      } else {
        haomaiCount++;
      }
    });
    // 超过3分之2
    if (haomaiCount >= standard) {
      valuationInfo = {
        sourceType: 'haomai',
        sourceName: '好买',
        valuation: fund[`valuation_haomai`]
      };
    } else if (tiantianCount >= standard) {
      valuationInfo = {
        sourceType: 'tiantian',
        sourceName: '天天',
        valuation: fund[`valuation_tiantian`]
      };
    } else {
      valuationInfo = {
        sourceType: 'tiantian/haomai',
        sourceName: '天天/好买',
        valuation: (fund[`valuation_tiantian`] + fund[`valuation_haomai`]) / 2
      };
    }
  } else {
    valuationInfo = {
      sourceType: 'tiantian',
      sourceName: '天天',
      valuation: fund[`valuation_tiantian`]
    };
  }
  return valuationInfo;
};

// 把净值从小到大排序
exports.getNetValueSort = function (list) {
  let listFake = [];
  let listMap = {};
  list.forEach(function (item) {
    if (listMap[item['net_value']]) {
      listMap[item['net_value']]++;
    } else {
      listMap[item['net_value']] = 1;
    }
  });
  for (let key in listMap) {
    listFake.push({
      netValue: parseFloat(key),
      times: listMap[key]
    });
  }
  //左小右打
  listFake.sort(function (a, b) {
    return a.netValue - b.netValue;
  });
  // [{netValue,times}]
  return listFake;
};

// 获取单位净值分布，分为40个区间段
exports.getNetValueDistribution = function (list) {
  let listFake = this.getNetValueSort(list);
  // 最大净值
  const min = parseInt(listFake[0].netValue * 10000);
  // 最小净值
  const max = parseInt(listFake[listFake.length - 1].netValue * 10000);
  let result = [];
  const fluctuate = max - min;
  // 计算步长，大致分成40个区间
  const step = parseInt(fluctuate / 40);
  for (let k = min; k < max + step; k += step) {
    let value = {netValue: k / 10000, times: 0};
    listFake.forEach(function (item) {
      if (item.netValue * 10000 >= k && item.netValue * 10000 < k + step) {
        value.times += item.times;
      }
    });
    result.push(value);
  }
  return result;
};

//判断是否暴跌，并记分
exports.judgeSlump = function (valuation, list) {
  let dayList = [3, 5, 8, 10, 13, 15];
  let rateList = [];
  let count = 0;
  // 之前的数据只要15个
  for (let i = 0; i < 15; i++) {
    //0的时候是近一天的涨跌
    const tempRate = numberUtil.countDifferenceRate(valuation, list[i]['net_value']);
    //记下分数
    count += tempRate;
    if (dayList.indexOf(i + 1) !== -1) {
      rateList.push({day: i + 1, rate: tempRate});
    }
  }
  count = -count;
  return {
    RateList: rateList,
    count
  };
};

// 判断低点
exports.judgeLowPoint = function (valuation, netValueSort) {
  let valuationIndex = 0;
  // 计算当前净值处于的位置
  netValueSort.forEach(function (item, index) {
    if (valuation > item.netValue) {
      valuationIndex += item.times;
    }
  });
  // 幅度20%的位置
  const range = netValueSort[netValueSort.length - 1].netValue - netValueSort[0].netValue;
  const lowLine = netValueSort[0].netValue + 0.2 * range;
  return {
    valuationIndex,
    lowLine,
    count: ((260 * 0.2 - valuationIndex) * 10 + ((lowLine - valuation) / range) * 1000)
  };
};
// 获取支撑线
exports.getSupportLine = function (netValueSort) {
  const start = netValueSort[0].netValue;
  const range = netValueSort[netValueSort.length - 1].netValue - start;
  // 分成5份
  const step = range * 0.2;
  let map = {};
  let list = [];
  netValueSort.forEach(function (item) {
    for (let i = 0; i < 10; i++) {
      const begin = start + (step / 2) * i;
      const end = begin + step;
      if (item.netValue >= begin && item.netValue < end) {
        if (map[`${begin}~${end}`]) {
          map[`${begin}~${end}`]++;
        } else {
          map[`${begin}~${end}`] = 1;
        }
      }
    }
  });
  //TODO 有问题
  for (let k in map) {
    list.push({range: k, times: map[k]});
  }
  let lines = [];
  list.forEach(function (item) {
    if (item.times > 260 * 0.2) {
      let temp = item.range.split('~');
      lines.push({value: (parseFloat(temp[0]) + parseFloat(temp[1])) / 2, times: item.times});
    }
  });
  return lines;
};

exports.getCostLine = function (netValueSort) {
  let value = 0;
  let times = 0;
  netValueSort.forEach(function (item) {
    value += item.netValue * item.times;
    times += item.times;
  });
  return numberUtil.keepFourDecimals(value / times);
};

