[Web Uploader for Yii2](http://fex.baidu.com/webuploader/)
==================
WebUploader是由Baidu WebFE(FEX)团队开发的一个简单的以HTML5为主，FLASH为辅的现代文件上传组件。
在现代的浏览器里面能充分发挥HTML5的优势，同时又不摒弃主流IE浏览器，沿用原来的FLASH运行时，兼容IE6+，iOS 6+, android 4+。
两套运行时，同样的调用方式，可供用户任意选用。
采用大文件分片并发上传，极大的提高了文件上传效率。

> 提示: 一个页面中只能调用一次该插件, 否则会冲突!

安装:
------------
使用 [composer](http://getcomposer.org/download/) 下载:
```
# 2.2.x(yii >= 2.0.24):
composer require moxuandi/yii2-webuploader:"~2.2.0"

# 2.x(yii >= 2.0.16):
composer require moxuandi/yii2-webuploader:"~2.1.0"

# 1.x(非重要Bug, 不再更新):
composer require moxuandi/yii2-webuploader:"~1.0"

# 旧版归档(不再更新):
composer require moxuandi/yii2-webuploader:"~0.1"

# 开发版:
composer require moxuandi/yii2-webuploader:"dev-master"
```


使用:
-----
在`Controller`中添加:
```php
public function actions()
{
    return [
        'WebUpload' => [
            'class' => 'moxuandi\webuploader\UploaderAction',
            // 可选参数, 参考 UploaderAction::$_config
            'config' => [
                'maxSize' => 1*1024*1024,  // 上传大小限制, 单位B, 默认1MB, 注意修改服务器的大小限制
                'allowFiles' => ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],  // 上传图片格式显示
                'pathFormat' => '/uploads/image/{yyyy}{mm}{dd}/{hh}{ii}{ss}_{rand:6}',  // 上传保存路径, 可以自定义保存路径和文件名格式

                // 如果`uploads`目录与当前应用的入口文件不在同一个目录, 必须做如下配置:
                'rootPath' => dirname(dirname(Yii::$app->request->scriptFile)),
                'rootUrl' => 'http://image.advanced.ccc',
            ],
        ],
    ];
}
```

在`View`中添加:
```php
1. 简单调用:
$form->field($model, 'images')->widget('moxuandi\webuploader\MultiImage');

2. 带参数调用:
$form->field($model, 'images')->widget('moxuandi\webuploader\MultiImage', [
    'config'=>[
        'fileNumLimit' => 2,
        'fileSizeLimit' => 30*1024*1024,
        'fileSingleSizeLimit' => 2*1024*1024
    ]
]);

3. 不带 $model 调用:
\moxuandi\webuploader\MultiImage::widget([
    'name' => 'images',
    'value' => $model->images,
    'config'=>[
        'fileNumLimit' => 2,
        'fileSizeLimit' => 30*1024*1024,
        'fileSingleSizeLimit' => 2*1024*1024
    ]
]);
```
编辑器相关配置，请在`view`中配置，参数为`config`，比如限制上传类型、文件大小等等，具体参数请查看[WebUploader官网API](http://fex.baidu.com/webuploader/doc/index.html)

文件上传相关配置，请在`controller`中配置，参数为`config`,例如文件保存路径等；更多参数请参照 [yii2-helpers 中的 Uploader::$config](https://github.com/moxuandi/yii2-helpers/blob/master/Uploader.php)
