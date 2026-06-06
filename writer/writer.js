/**
 * 会读会写 Read & Write — Web 笔顺测试页 writer.js
 *
 * 关键点：
 * 1. 完全本地化：不依赖任何 CDN，所有资源走 ../vendor/
 * 2. 自定义 charDataLoader：从本地 vendor/hanzi-writer-data/data/{char}.json 加载
 * 3. 拼音方案：先用本地 pinyin-dict.json 简化字典查表（开发期方案），
 *    iOS 端最终用 Swift 单一拼音源（详见 PRD §6.5）
 * 4. 多字词组：每个字独立 canvas，按顺序依次播放
 *
 * 日期: 2026-06-06 (M0 重构)
 */

(function () {
  'use strict';

  // ============================================================
  // 拼音查询：用本地词典 + 单字 fallback
  // ============================================================
  let pinyinDict = null;       // 词组词典：{ "中国": "zhōngguó", ... }
  let pinyinSingle = null;     // 单字：{ "中": "zhōng" }
  let dataReady = false;

  async function loadPinyinData() {
    try {
      const [dictRes, singleRes] = await Promise.all([
        fetch('../pinyin/pinyin-dict.json'),
        fetch('../pinyin/pinyin-single.json'),
      ]);
      pinyinDict = await dictRes.json();
      pinyinSingle = await singleRes.json();
      dataReady = true;
      setStatus('拼音词典加载成功（' + Object.keys(pinyinDict).length + ' 词组 + '
                + Object.keys(pinyinSingle).length + ' 单字）', 'ok');
    } catch (e) {
      setStatus('拼音词典加载失败: ' + e.message + '（开发期可降级，iOS 端不受影响）', 'error');
    }
  }

  function getPinyin(word) {
    if (!dataReady) return '?';
    // 多字词组优先
    if (word.length > 1 && pinyinDict[word]) return pinyinDict[word];
    // 逐字查表
    return word
      .split('')
      .map(c => pinyinSingle[c] || '?')
      .join(' ');
  }

  // ============================================================
  // hanzi-writer：自定义 charDataLoader 走本地 vendor/
  // ============================================================
  function createWriter(el, char) {
    el.innerHTML = '';
    const size = el.clientWidth || 200;

    return HanziWriter.create(el, char, {
      width: size,
      height: size,
      padding: 14,
      showOutline: true,
      outlineColor: '#C8C0B6',          /* --stroke-grid */
      strokeColor: '#141414',           /* 墨黑 */
      radicalColor: '#D93A2E',          /* 朱砂红 */
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 280,

      // ★ 完全离线：从本地 vendor 加载字形数据
      charDataLoader: function (char, onComplete) {
        fetch('../vendor/hanzi-writer-data/data/' + char + '.json')
          .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .then(data => onComplete(data))
          .catch(err => {
            console.error('字形数据加载失败 [' + char + ']:', err);
            el.innerHTML = '<div class="error">字形未收录：' + char + '</div>';
          });
      },

      onLoadCharDataError: function (reason) {
        console.error('Writer 加载错误:', reason);
      },
    });
  }

  // ============================================================
  // UI 状态
  // ============================================================
  let writers = []; // 当前活跃的 writer 实例数组（按字符顺序）

  function setStatus(msg, kind) {
    const el = document.getElementById('status');
    el.textContent = msg;
    el.className = 'status' + (kind ? ' ' + kind : '');
  }

  function search() {
    const input = document.getElementById('charInput');
    const word = input.value.trim();
    if (!word) return;
    if (!/^[\u4e00-\u9fa5]+$/.test(word)) {
      setStatus('请只输入汉字（不要标点 / 字母 / 数字）', 'error');
      return;
    }
    if (word.length > 4) {
      setStatus('最多 4 个字符', 'error');
      return;
    }

    document.getElementById('result').classList.add('active');
    document.getElementById('pinyin').textContent = getPinyin(word);

    const canvasArea = document.getElementById('canvases');
    canvasArea.innerHTML = '';
    writers = [];
    for (const ch of word) {
      const cell = document.createElement('div');
      cell.className = 'char-cell';
      canvasArea.appendChild(cell);
      const w = createWriter(cell, ch);
      writers.push(w);
      w.animateCharacter();
    }
    document.getElementById('controls').classList.add('active');
    setStatus('已渲染 ' + word.length + ' 个字（完全离线）', 'ok');
  }

  function animate() { writers.forEach(w => w && w.animateCharacter()); }
  function slow()    {
    // 慢速重播：临时调整 strokeAnimationSpeed
    // hanzi-writer 不支持运行时改速度，重建 writer
    const word = document.getElementById('charInput').value.trim();
    const canvasArea = document.getElementById('canvases');
    const cells = Array.from(canvasArea.children);
    writers = [];
    word.split('').forEach((ch, i) => {
      const cell = cells[i];
      if (!cell) return;
      cell.innerHTML = '';
      const size = cell.clientWidth || 200;
      const w = HanziWriter.create(cell, ch, {
        width: size, height: size, padding: 14,
        showOutline: true,
        outlineColor: '#C8C0B6',
        strokeColor: '#141414',
        radicalColor: '#D93A2E',
        strokeAnimationSpeed: 0.4,     // 慢速
        delayBetweenStrokes: 600,
        charDataLoader: function (c, onComplete) {
          fetch('../vendor/hanzi-writer-data/data/' + c + '.json')
            .then(r => r.json()).then(d => onComplete(d));
        }
      });
      writers.push(w);
      w.animateCharacter();
    });
  }
  function quiz()    { writers.forEach(w => w && w.quiz()); }

  // ============================================================
  // 初始化
  // ============================================================
  document.addEventListener('DOMContentLoaded', function () {
    loadPinyinData();
    document.getElementById('searchBtn').addEventListener('click', search);
    document.getElementById('animateBtn').addEventListener('click', animate);
    document.getElementById('slowBtn').addEventListener('click', slow);
    document.getElementById('quizBtn').addEventListener('click', quiz);
    document.getElementById('charInput').addEventListener('keypress', function (e) {
      if (e.key === 'Enter') search();
    });
    // 启动时若输入框已有值（默认"学习"），自动查询一次
    setTimeout(function () {
      const v = document.getElementById('charInput').value.trim();
      if (v) search();
    }, 800);  // 等 800ms 让拼音字典加载完
  });
})();
