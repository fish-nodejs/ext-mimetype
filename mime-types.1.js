'use strict'

/**
 * Module dependencies.
 * @private
 */

var db = require('mime-db')
var extname = require('path').extname

/**
 * Module variables.
 * @private
 */

var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/
var TEXT_TYPE_REGEXP = /^text\//i

/**
 * Module exports.
 * @public
 */

// 滥用函变量提升，函数职责不明确

exports.charset = charset
exports.charsets = { lookup: charset }
exports.contentType = contentType
exports.extension = extension
exports.extensions = Object.create(null)
exports.lookup = lookup
exports.types = Object.create(null)

// 怎么说呢，你这种写法可读性约为-79，
// Populate the extensions/types maps
populateMaps(exports.extensions, exports.types)
// 最终结果： types -> {'html': 'text/html', 'exe': 'application/stream'}

/**
 * Get the default charset for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */

function charset (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type)
  var mime = match && db[match[1].toLowerCase()]

  if (mime && mime.charset) {
    return mime.charset
  }

  // default text/* to utf-8
  if (match && TEXT_TYPE_REGEXP.test(match[1])) {
    return 'UTF-8'
  }

  return false
}

/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param {string} str
 * @return {boolean|string}
 */

function contentType (str) {
  // TODO: should this even be in this module?
  if (!str || typeof str !== 'string') {
    return false
  }

  var mime = str.indexOf('/') === -1
    ? exports.lookup(str)
    : str

  if (!mime) {
    return false
  }

  // TODO: use content-type or other module
  if (mime.indexOf('charset') === -1) {
    var charset = exports.charset(mime)
    if (charset) mime += '; charset=' + charset.toLowerCase()
  }

  return mime
}

/**
 * Get the default extension for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */

// 参数都是 'html' 'js' 类型的
function extension (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type)

  // get extensions
  var exts = match && exports.extensions[match[1].toLowerCase()]

  if (!exts || !exts.length) {
    return false
  }

  return exts[0]
}

/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */

function lookup (path) {
  if (!path || typeof path !== 'string') {
    return false
  }

  // get the extension ("ext" or ".ext" or full path)
  var extension = extname('x.' + path)
    .toLowerCase()
    .substr(1)

  if (!extension) {
    return false
  }
  // 就是参数校验，到这步就是转化成 'html' 'js' 这样的字符串
  // 可以看到，动态类型语言在工程化的问题上太难受
  // 每个函数都有大量的参数校验以及参数标准化
  
  return exports.types[extension] || false
}

/**
 * Populate the extensions and types maps.
 * @private
 */


function populateMaps (extensions, types) {
  // source preference (least -> most)
  var preference = ['nginx', 'apache', undefined, 'iana']
                                               
  // 既然你要使用外部变量，为甚么要写这种函数呢？ 冷不防的应用了db
  // js 编程实践： 除了一些ES以及宿主环境的全局变量，函数不应该通过动态变量查找
  // 来使用外部变量。
  // 看多了js的糟粕，才体会到java之类的好                 
  Object.keys(db).forEach(function forEachMimeType (type) {
    // type: application/stream  text/plain

    var mime = db[type]
    /* mime: 
    {
      "source": "iana",
      "charset": "UTF-8",
      "compressible": true,
      "extensions": ["js","mjs"]
    }
    */

    var exts = mime.extensions
    // ["js","mjs"]

    if (!exts || !exts.length) {
      return
    }

    // 这一步修改了传递近来的参数extension
    // ["js","mjs"]
    extensions[type] = exts


    // extension -> mime
    for (var i = 0; i < exts.length; i++) {
      var extension = exts[i]

      // 这段判断没搞懂
      if (types[extension]) {
        var from = preference.indexOf(db[types[extension]].source)
        var to = preference.indexOf(mime.source)

        if (types[extension] !== 'application/octet-stream' &&
          (from > to || (from === to && types[extension].substr(0, 12) === 'application/'))) {
          // skip the remapping
          continue
        }
      }

      // set the extension -> mime
      types[extension] = type
    }
  })
}