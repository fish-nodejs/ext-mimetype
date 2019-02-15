# [mime-type](https://github.com/jshttp/mime-types)
我本来想看看它的源代码，结果异常晦涩难懂，本来我是怀疑自己的水平，后来我觉得这是作者的问题

1. JS语法上没有类型系统，导致根本不知道他的这个函数想接受什么参数，有什么返回值类型。（赶紧上ts的车）

2. 使用函数作用域链查找的规则。
  这个真的蠢。你这样写这个函数怎么复用？都不知道它使用了哪些变量。如果不打算复用它，又为什么要写成一个函数?

- 一个函数可以使用宿主环境自带的变量
- 不应该使用作用域链查找规则引用上层作用域的变量
- 需要用到闭包的时候，可以例外

3. 滥用函数变量提升的规则，这样写根本不符合人类顺序阅读的方式。

4. 滥用exports。 

- 必须使用module.exports，禁止使用exports
- 必须把module.exports 放在代码的最下方

5. 函数定位不清楚
一般函数和对象的交互有两种
``` js
// 函数的返回值赋值给对象的属性或方法
obj.a = foo()

// mixin的方式，就像vue或者delegates一样
// 把对象当做参数，利用引用类型的机制，加工对象
mixinState(obj)
```

但是，你这种写法。。。
``` js
exports.extensions = Object.create(null)
exports.types = Object.create(null)

populateMaps(exports.extensions, exports.types)
``` 
真的是把我搞蒙蔽了。

## extension --> mimetype
开发web服务非常重要的一点：根据extension 推断出mimetype，写在response headers里面。

方法很简单：
- 就是读取mime-db
- 遍历 extension, 反转
- 只是有一个问题，extesion 可能冲突，这种情况他有一个判断，我没怎么看懂，以后再说吧


我之前想要不要更具结果生成一个缓存的json文件，后来想想没有必要。上面的函数只会执行一次就行了。


