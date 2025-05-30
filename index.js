const fs = require('fs');
const path = require('path');
const { md2htmltag } = require('./dist/md2html');

// 注册 chat 标签
hexo.extend.tag.register('chat',   function (args, content) {
    const md = hexo.render.renderSync({ text: content, engine: 'markdown'});
    return `${md2htmltag(args)}\n${md}\n</div>`;
  },
  { ends: true }
);

// 确保 styles.css 被引入
hexo.extend.filter.register('after_render:html', function(str) {
    const cssLink = '<link rel="stylesheet" href="/css/styles.css">';
    if (str.includes('</head>')) {
        return str.replace('</head>', `${cssLink}\n</head>`);
    }
    return str;
});


// 在生成前将 styles.css 复制到 source/css/
hexo.extend.generator.register('chat_styles', function() {
    const sourceCssPath = path.join(__dirname, 'assets', 'css', 'styles.css');
    const targetCssDir = path.join(hexo.source_dir, 'css');
    const targetCssPath = path.join(targetCssDir, 'styles.css');

    // 确保目标目录存在
    if (!fs.existsSync(targetCssDir)) {
        fs.mkdirSync(targetCssDir, { recursive: true });
    }

    // 复制 styles.css
    fs.copyFileSync(sourceCssPath, targetCssPath);
});