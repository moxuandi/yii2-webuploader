<?php
namespace moxuandi\webuploader;

use yii\web\AssetBundle;

class SingleImageAsset extends AssetBundle
{
    public $sourcePath = '@vendor/moxuandi/yii2-webuploader/assets';

    public $css = [
        'dist/webuploader.css',
        'single/single.css'
    ];

    public $js = [
        'dist/webuploader.min.js',
		'single/single.js'
    ];

    public $depends = [
        'yii\web\JqueryAsset',
    ];
}
