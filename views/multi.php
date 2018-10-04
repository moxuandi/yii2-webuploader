<div id="multiUpload" class="multiUpload">
    <div id="queueList" class="queueList">
        <div id="dndArea" class="placeholder">
            <div class="filePickerContainer">
                <div id="filePickerReady"></div>
            </div>
        </div>
        <ul class="filelist element-invisible">
            <li id="filePickerBlock" class="filePickerBlock"></li>
        </ul>
        <div class="statusBar element-invisible">
            <div class="progress">
                <span class="text">0%</span>
                <span class="percentage"></span>
            </div><div class="info"></div>
            <div class="btns">
                <div id="filePickerBtn"></div>
                <div class="uploadBtn"></div>
            </div>
        </div>
    </div>
</div>
<?php $this->registerJs("window.webuploader = {$config}", \yii\web\View::POS_END); ?>
