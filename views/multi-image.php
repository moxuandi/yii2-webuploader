<?php
/* @var $this yii\web\View */
/* @var $id string 输入域ID */
/* @var $config json 配置数组 */

use yii\helpers\Json;
$this->registerJs("window.webuploader={$config}", $this::POS_END);
?>
<div id="<?= $id ?>_multiUpload" class="multiUpload">
    <div class="queueList">
        <div id="<?= $id ?>_dndArea" class="placeholder">
            <div class="filePickerContainer">
                <div id="<?= $id ?>_filePickerReady"></div>
            </div>
        </div>
        <ul class="filelist element-invisible">
            <li id="<?= $id ?>_filePickerBlock" class="filePickerBlock"></li>
        </ul>
        <div class="statusBar element-invisible">
            <div class="progress">
                <span class="text">0%</span>
                <span class="percentage"></span>
            </div>
            <div class="info"></div>
            <div class="btns">
                <div id="<?= $id ?>_filePickerBtn"></div>
                <div class="uploadBtn"></div>
            </div>
        </div>
    </div>
</div>