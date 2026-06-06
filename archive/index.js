#!/usr/bin/env node

/**
 * 汉字拼音和笔顺工具
 * 使用方法: 
 *   node index.js "汉字"      - 获取拼音
 *   node index.js "汉字" --all  - 获取拼音+笔顺
 */

const pinyin = require('pinyin').pinyin;

// 简单的笔画数据（常用汉字）
const strokeData = {
  '一': { strokes: 1, order: ['横'] },
  '二': { strokes: 2, order: ['横', '横'] },
  '三': { strokes: 3, order: ['横', '横', '横'] },
  '十': { strokes: 2, order: ['横', '竖'] },
  '人': { strokes: 2, order: ['撇', '捺'] },
  '大': { strokes: 3, order: ['横', '撇', '捺'] },
  '小': { strokes: 3, order: ['竖钩', '撇', '点'] },
  '山': { strokes: 3, order: ['竖', '竖折', '竖'] },
  '水': { strokes: 4, order: ['竖钩', '横撇', '撇', '捺'] },
  '火': { strokes: 4, order: ['点', '点', '撇', '捺'] },
  '木': { strokes: 4, order: ['横', '竖', '撇', '捺'] },
  '土': { strokes: 3, order: ['横', '竖', '横'] },
  '日': { strokes: 4, order: ['竖', '横折', '横', '横', '竖'] },
  '月': { strokes: 4, order: ['撇', '横折钩', '横', '横', '横'] },
  '口': { strokes: 3, order: ['竖', '横折', '横', '竖', '横'] },
  '中': { strokes: 4, order: ['竖', '横折', '横', '横', '竖'] },
  '国': { strokes: 8, order: ['竖', '横折', '横', '竖', '横折', '横', '横', '横'] },
  '爱': { strokes: 10, order: ['撇', '点', '横撇', '横', '横撇', '捺', '点', '斜钩', '点', '点'] },
  '学': { strokes: 8, order: ['点', '点', '撇', '横', '竖钩', '点', '撇', '点'] },
  '我': { strokes: 7, order: ['撇', '横', '竖钩', '横', '竖', '撇', '捺'] },
  '你': { strokes: 7, order: ['撇', '竖', '横', '竖钩', '点', '斜钩', '点'] },
  '他': { strokes: 5, order: ['撇', '竖', '横折钩', '横', '竖弯钩'] },
  '她': { strokes: 6, order: ['撇点', '撇', '横', '竖折钩', '横', '竖弯钩'] },
  '们': { strokes: 5, order: ['撇', '竖', '横折钩', '横', '竖弯钩'] },
  '的': { strokes: 8, order: ['撇', '横', '横折钩', '横', '竖', '横折', '横', '横'] },
  '了': { strokes: 2, order: ['横折钩', '竖弯钩'] },
  '在': { strokes: 6, order: ['横', '竖', '横折钩', '横', '点', '横'] },
  '有': { strokes: 6, order: ['横', '撇', '横折钩', '横', '竖', '横'] },
  '和': { strokes: 8, order: ['撇', '横', '竖', '横折钩', '横', '竖弯钩', '点', '点'] },
  '是': { strokes: 9, order: ['竖', '横折', '横', '竖', '横折钩', '横', '竖', '点', '横'] },
  '来': { strokes: 7, order: ['横', '竖', '横折钩', '横', '竖', '撇', '捺'] },
  '不': { strokes: 4, order: ['横', '竖', '点', '捺'] },
  '就': { strokes: 12, order: ['点', '横', '竖', '横折钩', '横', '竖', '横折', '横', '横折钩', '点', '斜钩', '点'] },
  '这': { strokes: 7, order: ['点', '横折', '横', '撇', '点', '捺', '点'] },
  '个': { strokes: 3, order: ['撇', '横', '竖'] },
  '上': { strokes: 3, order: ['竖', '横', '横'] },
  '下': { strokes: 3, order: ['横', '竖', '点'] },
  '多': { strokes: 6, order: ['撇', '点', '撇', '横折钩', '点', '点'] },
  '少': { strokes: 4, order: ['竖', '撇', '点', '撇'] },
  '吗': { strokes: 6, order: ['竖', '横折钩', '横', '横', '斜钩', '点'] },
  '呢': { strokes: 8, order: ['竖', '横折钩', '横', '横', '斜钩', '点', '撇', '点'] },
  '吧': { strokes: 7, order: ['竖', '横折钩', '横', '横', '斜钩', '点', '捺'] },
  '啊': { strokes: 10, order: ['横', '竖折', '竖', '横折钩', '横', '竖', '横折', '横', '竖', '点'] },
  '谁': { strokes: 10, order: ['点', '横折钩', '横', '横', '点', '横', '竖', '横', '竖弯钩', '点'] },
};

// 获取拼音
function getPinyin(char) {
  try {
    const result = pinyin(char, {
      style: require('pinyin').STYLE_TONE,
      heteronym: false
    });
    
    if (result && result.length > 0 && result[0]) {
      return result[0][0] || '?';
    }
    return '?';
  } catch (e) {
    console.error('拼音获取失败:', e);
    return '?';
  }
}

// 获取笔顺数据
function getStrokeOrder(char) {
  if (strokeData[char]) {
    return strokeData[char];
  }
  
  return {
    strokes: '未知',
    order: ['请查询专业笔顺数据库'],
    note: '基础笔顺数据有限，建议使用 hanzi-writer 在线查询'
  };
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方法:');
    console.log('  node index.js "汉字"        - 获取拼音');
    console.log('  node index.js "汉字" --all   - 获取拼音+笔顺');
    console.log('');
    console.log('示例:');
    console.log('  node index.js "爱"');
    console.log('  node index.js "中国" --all');
    process.exit(0);
  }
  
  const char = args[0];
  
  console.log(`\n🔤 汉字: ${char}`);
  console.log(`📝 拼音: ${getPinyin(char)}`);
  
  if (args.includes('--all') || args.includes('--stroke')) {
    const strokes = getStrokeOrder(char);
    console.log(`\n🖊️ 笔顺信息:`);
    console.log(`   总笔画: ${strokes.strokes}`);
    console.log(`   笔顺: ${strokes.order.join(' → ')}`);
    if (strokes.note) {
      console.log(`   ⚠️ ${strokes.note}`);
    }
  }
  
  console.log('');
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = { getPinyin, getStrokeOrder };
