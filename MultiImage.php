<?php
namespace moxuandi\webuploader;

use yii\base\InvalidConfigException;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\helpers\Url;
use yii\widgets\InputWidget;

/**
 * Class MultiImage 多图上传
 *
 * @author zhangmoxuan <1104984259@qq.com>
 * @link http://www.zhangmoxuan.com
 * @QQ 1104984259
 * @Date 2019-8-15
 * @see http://fex.baidu.com/webuploader/
 */
class MultiImage extends InputWidget
{
    /**
     * 配置接口, 参考 init() 中的 $_config
     * @see http://fex.baidu.com/webuploader/doc/index.html WebUploader 官方API文档
     */
    public $config = [];


    /**
     * @throws InvalidConfigException
     */
    public function init()
    {
        parent::init();
        if($this->hasModel()){
            $this->id = $this->options['id'];
            echo Html::activeHiddenInput($this->model, $this->attribute);
        }else{
            $this->id = $this->options['id'] = $this->id . '_' . $this->name;
            echo Html::hiddenInput($this->name, $this->value, $this->options);
        }

        // 配置项, 参考'assets/webupload_parameter.js'
        $_config = [
            'wrapId' => $this->id . '_multiUpload',
            'inputId' => $this->id,
            'swf' => '../dist/Uploader.swf',  // 固定值
            'pick' => [
                'id' => "#{$this->id}_filePickerReady",
                'label' => '点击选择图片'
            ],
            'server' => Url::to(['WebUpload', 'action' => 'uploadJson']),
            'initUrl' => Url::to(['WebUpload', 'action' => 'initFile']),
            //'dnd' => "#{$this->id}_dndArea",  // [默认值：undefined] 指定Drag And Drop拖拽的容器，如果不指定，则不启动
            //'disableGlobalDnd' => true,  // [默认值：false]  是否禁掉整个页面的拖拽功能，如果不禁用，图片拖进来的时候会默认被浏览器打开
            //'paste' => '',  // [默认值：undefined] 指定监听paste事件的容器，如果不指定，不启用此功能。此功能为通过粘贴来添加截屏的图片。建议设置为document.body.
            'accept' => [  // [默认值：null] 指定接受哪些类型的文件
                'title' => 'Images',  // 文字描述
                'extensions' => 'gif,jpg,jpeg,bmp,png',  // 允许的文件后缀，不带点，多个用逗号分割
                'mimeTypes' => 'image/*'  // 多个用逗号分割
            ],
            'thumb' => [  // 配置生成缩略图的选项
                'width' => 113,
                'height' => 113,
                'quality' => 100  // 图片质量
            ],
            'compress' => false,  // 配置压缩的图片的选项。如果此选项为false, 则图片在上传前不进行压缩
            //'auto' => false,  // [默认值：false]  设置为 true 后，不需要手动调用上传，有文件选择即开始上传
            //'runtimeOrder' => 'html5,flash',  // [默认值：html5,flash] 指定运行时启动顺序。默认会想尝试 html5 是否支持，如果支持则使用 html5, 否则则使用 flash. 可以将此值设置成 flash，来强制使用 flash 运行时。
            'prepareNextFile' => true,  // [默认值：false] 是否允许在文件传输时提前把下一个文件准备好。 对于一个文件的准备工作比较耗时，比如图片压缩，md5序列化。 如果能提前在当前文件传输期处理，可以节省总体耗时。
            //'chunked' => false,  // [默认值：false] 是否要分片处理大文件上传
            //'chunkSize' => 5242880,  // [默认值：5242880] 如果要分片，分多大一片, 默认大小为5M
            //'chunkRetry' => 2,  // [默认值：2] 如果某个分片由于网络问题出错，允许自动重传多少次
            //'threads' => 3,  // [默认值：3] 上传并发数。允许同时最大上传进程数
            //'formData' => [],  // [默认值：{}] 文件上传请求的参数表，每次发送都会发送此对象中的参数
            //'fileVal' => 'file',  // [默认值：'file'] 设置文件上传域的name
            //'method' => 'POST',  // [默认值：'POST'] 文件上传方式，POST或者GET
            //'sendAsBinary' => false,  // [默认值：false] 是否已二进制的流的方式发送文件，这样整个上传内容php://input都为文件内容， 其他参数在$_GET数组中
            'fileNumLimit' => 30,  // [默认值：undefined] 验证文件总数量, 超出则不允许加入队列
            'fileSizeLimit' => 30*1024*1024,  // [默认值：undefined] 验证文件总大小是否超出限制, 超出则不允许加入队列
            'fileSingleSizeLimit' => 2*1024*1024,  // [默认值：undefined] 验证单个文件大小是否超出限制, 超出则不允许加入队列
            //'duplicate' => true,  // [默认值：undefined] 去重， 根据文件名字、文件大小和最后修改时间来生成hash Key.
            //'duplicate' 失效, 在 uploader.on('error', function(code){}) 中 type='F_DUPLICATE'
            //'disableWidgets' => '',  // [默认值：undefined] 默认所有 Uploader.register 了的 widget 都会被加载，如果禁用某一部分，请通过此 option 指定黑名单
        ];
        $this->config = array_merge($_config, $this->config);
    }

    /**
     * @return string
     */
    public function run()
    {
        MultiImageAsset::register($this->view);
        return $this->render('multi-image', [
            'id' => $this->id,
            'config' => Json::encode($this->config),
        ]);
    }
}
