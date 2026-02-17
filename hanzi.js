#!/usr/bin/env node

/**
 * 汉字拼音和笔顺工具 v2.0
 * 
 * 功能:
 * 1. 获取汉字拼音
 * 2. 生成笔顺动画 HTML 页面（使用 hanzi-writer）
 * 
 * 使用方法:
 *   node hanzi.js "汉字"                    - 获取拼音
 *   node hanzi.js "汉字" --pinyin-only     - 仅获取拼音
 *   node hanzi.js "汉字" --html             - 生成笔顺动画页面
 *   node hanzi.js "汉字" --all              - 获取拼音+生成动画页面
 */

const pinyin = require('pinyin').pinyin;
const pinyinStyle = require('pinyin').STYLE_TONE;
const fs = require('fs');
const path = require('path');

// 获取拼音
function getPinyin(char) {
  try {
    const result = pinyin(char, {
      style: pinyinStyle,
      heteronym: false
    });
    
    if (result && result.length > 0 && result[0]) {
      return result[0][0] || '?';
    }
    return '?';
  } catch (e) {
    return '?';
  }
}

// 生成 HTML 页面（使用 hanzi-writer）
function generateHTML(char, pinyinChar) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>汉字 "${char}" - 拼音: ${pinyinChar}</title>
    <script src="https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
        }
        
        .container {
            background: white;
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 25px 80px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
            text-align: center;
        }
        
        .char-display {
            font-size: 120px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.1);
        }
        
        .pinyin {
            font-size: 36px;
            color: #e74c3c;
            margin-bottom: 30px;
            font-weight: 500;
        }
        
        #character-target {
            width: 300px;
            height: 300px;
            margin: 20px auto;
            background: #f8f9fa;
            border-radius: 16px;
            border: 3px dashed #dee2e6;
        }
        
        .btn-group {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
            margin-top: 30px;
        }
        
        button {
            padding: 14px 28px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        
        button:active {
            transform: translateY(-1px);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
        }
        
        .btn-warning {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }
        
        .btn-outline {
            background: transparent;
            border: 3px solid #667eea;
            color: #667eea;
        }
        
        .btn-outline:hover {
            background: #667eea;
            color: white;
        }
        
        .info-box {
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
            border-radius: 12px;
            padding: 20px;
            margin-top: 25px;
            text-align: left;
        }
        
        .info-box h3 {
            color: #2c3e50;
            margin-bottom: 12px;
            font-size: 16px;
        }
        
        .info-box p {
            color: #7f8c8d;
            line-height: 1.8;
            font-size: 14px;
        }
        
        .highlight {
            background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 600;
            color: #2c3e50;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .container {
            animation: fadeIn 0.6s ease-out;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="char-display">${char}</div>
        <div class="pinyin">${pinyinChar}</div>
        
        <div id="character-target"></div>
        
        <div class="btn-group">
            <button class="btn-primary" onclick="animateStroke()">
                <span>🎨</span> 显示笔顺
            </button>
            <button class="btn-success" onclick="quizMode()">
                <span>✍️</span> 练习书写
            </button>
            <button class="btn-warning" onclick="slowAnimate()">
                <span>🐌</span> 慢速演示
            </button>
            <button class="btn-outline" onclick="reset()">
                <span>🔄</span> 重置
            </button>
        </div>
        
        <div class="info-box">
            <h3>💡 使用说明</h3>
            <p>
                • <span class="highlight">显示笔顺</span> - 自动演示汉字的书写顺序<br>
                • <span class="highlight">练习书写</span> - 跟着笔画顺序练习书写<br>
                • <span class="highlight">慢速演示</span> - 以较慢的速度演示笔顺<br>
                • 笔顺数据由 <a href="https://hanziwriter.org/" target="_blank">hanzi-writer</a> 提供
            </p>
        </div>
    </div>

    <script>
        // 创建 hanzi-writer 实例
        const writer = HanziWriter.create('character-target', '${char}', {
            width: 300,
            height: 300,
            padding: 20,
            showOutline: true,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 300,
            strokeColor: '#2c3e50',
            radicalColor: '#667eea',
            outlineColor: '#bdc3c7',
            drawingWidth: 20,
        });

        // 获取当前显示的汉字
        function getCurrentChar() {
            return '${char}';
        }

        // 正常速度演示
        function animateStroke() {
            writer.animateCharacter({
                onComplete: function() {
                    console.log('✅ 笔顺演示完成！');
                }
            });
        }

        // 慢速演示
        function slowAnimate() {
            writer.animateCharacter({
                strokeAnimationSpeed: 0.5,
                delayBetweenStrokes: 500,
                onComplete: function() {
                    console.log('✅ 慢速演示完成！');
                }
            });
        }

        // 练习模式
        function quizMode() {
            writer.quiz({
                strokeAnimationSpeed: 0.5,
                delayBetweenStrokes: 200,
                onMistake: function(strokeData) {
                    console.log('❌ 笔画错误: ' + strokeData.strokeNum);
                },
                onCorrectStroke: function(strokeData) {
                    console.log('✅ 正确笔画: ' + strokeData.strokeNum);
                },
                onComplete: function(summaryData) {
                    console.log('📊 练习完成！');
                    console.log('   总笔画: ' + summaryData.totalStrokes);
                    console.log('   错误次数: ' + summaryData.mistakes);
                    
                    if (summaryData.mistakes === 0) {
                        alert('🎉 太棒了！你完美写出了这个字！');
                    } else if (summaryData.mistakes < 3) {
                        alert('👍 不错！继续加油！错误 ' + summaryData.mistakes + ' 次');
                    } else {
                        alert('💪 多练习几次，你会越来越好的！');
                    }
                }
            });
        }

        // 重置
        function reset() {
            writer.setCharacter('${char}');
            console.log('🔄 已重置');
        }

        // 页面加载后自动演示
        setTimeout(function() {
            animateStroke();
        }, 800);
    </script>
</body>
</html>`;
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('\n🔤 汉字拼音和笔顺工具 v2.0\n');
    console.log('使用方法:');
    console.log('  node hanzi.js "汉字"          - 获取拼音');
    console.log('  node hanzi.js "汉字" --html   - 生成笔顺动画 HTML 页面');
    console.log('  node hanzi.js "汉字" --all    - 获取拼音+生成动画页面\n');
    console.log('示例:');
    console.log('  node hanzi.js "爱"');
    console.log('  node hanzi.js "中国" --all\n');
    process.exit(0);
  }
  
  const char = args[0];
  const pinyinChar = getPinyin(char);
  
  console.log(`\n🔤 汉字: ${char}`);
  console.log(`📝 拼音: ${pinyinChar}`);
  
  if (args.includes('--html') || args.includes('--all')) {
    const html = generateHTML(char, pinyinChar);
    const filename = `${char}.html`;
    fs.writeFileSync(filename, html, 'utf8');
    
    console.log(`\n✅ 已生成笔顺动画页面: ${filename}`);
    console.log('   用浏览器打开即可查看动画和练习书写！\n');
    
    const filepath = path.resolve(filename);
    console.log(`📂 文件路径: ${filepath}`);
  }
  
  console.log('');
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = { getPinyin, generateHTML };
