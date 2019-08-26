<?php
namespace moxuandi\webuploader;

use yii\web\AssetBundle;

/**
 * Class MultiImageAsset 多图上传的资源包
 *
 * @author zhangmoxuan <1104984259@qq.com>
 * @link http://www.zhangmoxuan.com
 * @QQ 1104984259
 * @Date 2019-8-15
 * @see http://fex.baidu.com/webuploader/
 */
class MultiImageAsset extends AssetBundle
{
    public $sourcePath = '@vendor/moxuandi/yii2-webuploader/assets';
    public $css = [
        'dist/webuploader.css',
        'image/multi.css'
    ];
    public $js = [
        'dist/webuploader.nolog.min.js',
        'image/multi.js'
    ];
    public $depends = [
        'yii\web\JqueryAsset',
    ];
}
