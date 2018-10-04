<div id="singleUpload" class="singleUpload">
    <div id="queueList" class="queueList">
        <div id="dndArea" class="placeholder">
            <div class="filePickerContainer">
                <div id="filePickerReady"></div>
            </div>
        </div>
        <div class="clearfix">
            <ul class="filelist element-invisible"></ul>
            <div class="statusBar element-invisible">
                <div class="btns">
                    <div id="filePickerBtn"></div>
                    <div class="uploadBtn"></div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php $this->registerJs("window.webuploader = {$config}", \yii\web\View::POS_END); ?>
