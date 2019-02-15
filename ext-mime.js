const db = require('mime-db')
// console.log(db)

let extToMimeMap = {}
for(let mimetype of Object.keys(db)) {
  // console.log(mimetype)
  // console.log( db[mimetype].extensions ) // 

  // it is undifined or array
  if (db[mimetype].extensions) {
    for (let ext of db[mimetype].extensions) {
      extToMimeMap[ext] = mimetype
    }
  }
}

module.exports = extToMimeMap
// console.log(extToMimeMap)
/* 
{
  m4v: 'video/x-m4v',
  mkv: 'video/x-matroska',
  mk3d: 'video/x-matroska',
  mks: 'video/x-matroska',
  mng: 'video/x-mng',
  asf: 'video/x-ms-asf',
  asx: 'video/x-ms-asf',
  vob: 'video/x-ms-vob',
  ...
}
*/

// 这不是很简单吗？然后把它放在单独的模块，不知道为什么他们搞的那么复制