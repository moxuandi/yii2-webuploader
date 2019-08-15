<?php
namespace moxuandi\webuploader;

use moxuandi\helpers\Helper;
use moxuandi\helpers\Uploader;
use Yii;
use yii\base\Action;
use yii\base\ErrorException;
use yii\base\Exception;
use yii\helpers\ArrayHelper;
use yii\helpers\FileHelper;
use yii\imagine\Image;
use yii\web\Response;

/**
 * WebUploader 接收上传图片控制器
 *
 * @author zhangmoxuan <1104984259@qq.com>
 * @link http://www.zhangmoxuan.com
 * @QQ 1104984259
 * @Date 2019-8-15
 * @see http://fex.baidu.com/webuploader/
 */
class UploaderAction extends Action
{
    public $config = [];  // 配置接口, 参考 init() 中的 $_config


    public function init()
    {
        parent::init();
        Yii::$app->request->enableCsrfValidation = false;  // 关闭csrf
        $_config = [  // 默认的上传配置信息
            'maxSize' => 1*1024*1024,  // 上传大小限制, 单位B, 默认1MB, 注意修改服务器的大小限制
            'allowFiles' => ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],  // 上传图片格式显示
            'pathFormat' => '/uploads/image/{yyyy}{mm}{dd}/{hh}{ii}{ss}_{rand:6}',  // 上传保存路径, 可以自定义保存路径和文件名格式
            /* {filename} 会替换成原文件名[要注意中文文件乱码问题] */
            /* {rand:6} 会替换成随机数, 后面的数字是随机数的位数 */
            /* {time} 会替换成时间戳 */
            /* {yyyy} 会替换成四位年份 */
            /* {yy} 会替换成两位年份 */
            /* {mm} 会替换成两位月份 */
            /* {dd} 会替换成两位日期 */
            /* {hh} 会替换成两位小时 */
            /* {ii} 会替换成两位分钟 */
            /* {ss} 会替换成两位秒 */
            /* 非法字符 \ : * ? " < > | */
            /* 具请体看线上文档: http://fex.baidu.com/ueditor/#server-path 3.1 */
        ];
        $this->config = array_merge($_config, $this->config);
    }

    /**
     * @throws ErrorException
     * @throws Exception
     */
    public function run()
    {
        switch(Yii::$app->request->get('action')){
            case 'initFile': $result = self::initFile(); break;
            //case 'uploadJson': self::uploadJson(); break;
            default: $result = self::uploadJson(); break;
        }

        // 输出响应结果
        $response = Yii::$app->response;
        $response->format = Response::FORMAT_JSON;
        $response->data = $result;
        $response->send();
    }

    /**
     * 执行上传操作, 返回上传结果
     * @return array
     * @throws ErrorException
     * @throws Exception
     */
    public function uploadJson()
    {
        $upload = new Uploader('file', $this->config, 'upload');
        if($upload->stateInfo === 'SUCCESS'){
            return ['code' => 1, 'url' => $upload->fullName];
        }else{
            return ['code' => 0, 'msg' => $upload->stateInfo];
        }
    }

    // 初始化时显示已上传图片, 返回已上传图片的信息
    public function initFile()
    {
        $request = Yii::$app->request;
        $rootPath = ArrayHelper::getValue($this->config, 'rootPath', dirname($request->scriptFile));
        $urls = explode(',', $request->post('urls'));
        $result = [];
        foreach($urls as $k => $url){
            $filePath = FileHelper::normalizePath($rootPath . DIRECTORY_SEPARATOR . $url);  // 绝对路径
            $imgInfo = Helper::getImageInfo($filePath, true);  // 获取图片信息

            $result[$k] = [
                'name' => substr($url, strrpos($url, '/') + 1),
                'size' => filesize($filePath),
                'type' => $imgInfo['mime'],
                //'lastModifiedDate' => filemtime($filePath),
                'ext' => strtolower($imgInfo['type']),
                'url' => $url,
                'path' => self::makeThumb2($filePath, $request->post('width'), $request->post('height'), $imgInfo['mime']),
            ];
        }
        return $result;
    }

    /**
     * 渲染缩略图, 返回缩略图的 Data URL 值
     * @param string $filePath 原始图片的路径
     * @param int $width 缩略图的宽度
     * @param int $height 缩略图的高度
     * @param string $mime 原始图片的 MIME 类型
     * @return string 缩略图的 Data URL 值
     */
    private function makeThumb2($filePath, $width, $height, $mime = 'image/jpeg')
    {
        $thumbnail = Image::thumbnail($filePath, $width, $height);
        return 'data:' . $mime . ';base64,' . chunk_split(base64_encode($thumbnail->__toString()));
    }
}
