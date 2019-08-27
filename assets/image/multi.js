jQuery(function(){
    var $ = jQuery;
    var $wrap = $('#' + window.webuploader.wrapId);
    var $queue = $wrap.find('.filelist');  // 图片容器
    var $statusBar = $wrap.find('.statusBar');  // 状态栏, 包括进度和控制按钮
    var $info = $statusBar.find('.info');  // 文件总体选择信息
    var $upload = $wrap.find('.uploadBtn');  // 上传按钮
    var $filePickerBtn = $wrap.find('.filePickerBtn');  // 上传按钮
    var $filePickerBlock = $wrap.find('.filePickerBlock');  // 上传按钮
    var $placeHolder = $wrap.find('.placeholder');  // 没选择文件之前的内容
    var $progress = $statusBar.find('.progress').hide();  // 进度条
    var $inputId = $('#' + window.webuploader.inputId);  // 上传信息保存的输入域对象
    var fileCount = 0;  // 添加的文件数量
    var fileSize = 0;  // 添加的文件总大小
    var fileHashList = {};  // 文件hash值列表
    var state = 'pedding';  // 值: pedding, ready, uploading, confirm, done.
    var percentages = {};  // 所有文件的进度信息, key为file id
    // 检测浏览器是否支持 css-transition 属性
    var supportTransition = (function(){
        var s = document.createElement('p').style,
            r = 'transition' in s || 'WebkitTransition' in s || 'MozTransition' in s || 'msTransition' in s || 'OTransition' in s;
        s = null;
        return r;
    })();
    // 优化retina, 在 retina 下这个值是2
    var ratio = window.devicePixelRatio || 1;
    // 缩略图大小
    var thumbnailWidth = window.webuploader.thumb.width || 110;
    thumbnailWidth *= ratio;
    var thumbnailHeight = window.webuploader.thumb.height || 110;
    thumbnailHeight *= ratio;
    
    // 实例化
    var uploader = WebUploader.create(window.webuploader);
    
    uploader.addButton({id:'#' + window.webuploader.inputId + '_filePickerBlock'});
    uploader.addButton({id:'#' + window.webuploader.inputId + '_filePickerBtn', label:'继续添加'});

    // 初始化时显示已上传图片
    function initServerFile(){
        if(window.webuploader.initUrl && $inputId.val()){
            $.ajax({
                type: "post",
                url: window.webuploader.initUrl,
                async: false,
                dataType: 'json',
                data: {urls:$inputId.val(), width:thumbnailWidth, height:thumbnailHeight},
                success: function(data){
                    for(var i=0; i<data.length; i++){
                        var file = new WebUploader.File(data[i]);
                        file.src = "server";
                        uploader.addFile(file);
                        uploader.getFiles()[i].setStatus('complete');  // 设置状态:上传完成
                        fileHashList[hashString(file.name + file.size)] = true;  // hash列表
                        percentages[file.id] = [file.size, 100];
                    }
                },
                error: function(xhr, status, error){
                    alert("初始化失败, 原因: " + error);
                }
            });
        }
    }

    // 添加文件到 webuploader 队列中
    function fileQueue(file){
        file.src = file.src || 'client';
        fileCount++;
        fileSize += file.size;
        if(fileCount == 1){
            $placeHolder.addClass('element-invisible');
            $queue.removeClass('element-invisible');
            $statusBar.removeClass('element-invisible');
        }
        addFile(file);
        setState('ready');
        updateTotalProgress();
    }
    
    // 添加文件到 webuploader 队列中, 负责 view 的创建
    function addFile(file){
        var $li = $('<li id="' + file.id + '">' + '<p class="title">' + file.name + '</p>' + '<p class="imgWrap"></p>' + '<p class="progress"><span></span></p>' + '</li>'),
            $btns = $('<div class="file-panel">' + '<span class="cancel">删除</span>' + '<span class="rotateRight">向右旋转</span>' + '<span class="rotateLeft">向左旋转</span></div>').appendTo($li),
            $prgress = $li.find('p.progress span'),
            $wrap = $li.find('p.imgWrap'),
            $info = $('<p class="error"></p>').hide().appendTo($li),
            showError = function(code){
                switch(code){
                    case 'exceed_size': text = '文件大小超出'; break;
                    case 'interrupt': text = '文件传输中断'; break;  // text = '上传暂停';
                    case 'http': text = 'http请求错误'; break;
                    case 'not_allow_type': text = '文件格式不允许'; break;
                    //default: text = '上传失败, 请重试'; break;
                    default: text = code; break;
                }
                $info.text(text).show().appendTo($li);
            };

        if(file.src == 'client'){  // 本地选择的文件
            if(file.getStatus() == 'invalid'){  // 文件不合格, 不能重试上传. 会自动从队列中移除
                showError(file.statusText);
            }else{
                $wrap.text('预览中');
                uploader.makeThumb(file, function(error, src){
                    if(error){
                        $wrap.text('不能预览'); return;
                    }
                    var img = $('<img src="' + src + '">');
                    $wrap.empty().append(img);
                }, thumbnailWidth, thumbnailHeight);
                percentages[file.id] = [fileSize, 0];
                file.rotation = 0;
            }
            // 文件状态变化
            file.on('statuschange', function(cur, prev){
                if(prev == 'progress'){
                    $progress.hide();
                }else if(prev == 'queued'){
                    //$li.off('mouseenter mouseleave');
                    //$btns.remove();  // 移除图片上的按钮
                }
                if(cur == 'error' || cur == 'invalid'){
                    $li.find('span.success').remove();
                    showError(file.statusText);
                    percentages[file.id][1] = 1;
                }else if(cur == 'interrupt'){
                    showError('interrupt');
                }else if(cur == 'queued'){
                    percentages[file.id ][1] = 0;
                }else if(cur == 'progress'){
                    $info.remove();
                    //$info.hide();
                    $progress.css('display', 'block');
                }else if(cur == 'complete'){
                    $li.append('<span class="success"></span>');
                }
                $li.removeClass('state-' + prev).addClass('state-' + cur);
            });
        }else{  // 服务器端图片
            var img = $('<img src="' + file.source.path + '">');
            $wrap.empty().append(img).parent().append('<span class="success"></span>');
        }

        // 当鼠标指针进入(穿过)元素时, 显示控制按钮
        $li.on('mouseenter', function(){$btns.stop().animate({height:30})});
        // 当鼠标指针离开元素时, 隐藏控制按钮
        $li.on('mouseleave', function(){$btns.stop().animate({height:0})});
        // 控制按钮被点击时
        $btns.on('click', 'span', function(){
            var index = $(this).index(), deg;
            switch(index){
                case 0:
                    if(file.src == 'client'){
                        uploader.removeFile(file);
                    }else{
                        // 初始化之前上传的图片，无法调用 fileDequeued 事件，手动删除
                        fileCount--;
                        fileSize -= file.size;
                        if(!fileCount){
                            setState('pedding');
                        }
                        delete percentages[file.id];  // 删除进度信息
                        delete fileHashList[hashString(file.name + file.size)]  // 删除hash列表值
                        // 删除input框中的值
                        $inputId.val(function(index, oldvalue){
                            var inputVal = oldvalue ? JSON.parse(oldvalue) : [];
                            for(var i=0; i<inputVal.length; i++){
                                if(inputVal[i].name == file.name && inputVal[i].size == file.size){
                                    inputVal.splice(i, 1);
                                }
                            }
                            return JSON.stringify(inputVal);
                        });
                        $('#' + file.id).remove();  // 删除视图
                        updateTotalProgress();
                    }
                    return;
                case 1: file.rotation += 90; break;
                case 2: file.rotation -= 90; break;
            }
            if(supportTransition){
                deg = 'rotate(' + file.rotation + 'deg)';
                $wrap.css({'-webkit-transform':deg, '-mos-transform':deg, '-o-transform':deg, 'transform':deg});
            }else{
                $wrap.css('filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (~~((file.rotation/90)%4 + 4)%4) +')');
            }
        });
        
        $li.insertBefore($filePickerBlock);
    }
    
    // 删除 webupload 队列中的文件, 负责 view 的销毁
    function removeFile(file){
        fileCount--;
        fileSize -= file.size;
        if(!fileCount){
            setState('pedding');
        }
        delete percentages[file.id];  // 删除进度信息
        delete fileHashList[hashString(file.name + file.size)]  // 删除hash列表值
        // 删除input框中的值
        $inputId.val(function(index, oldvalue){
            var inputVal = oldvalue ? JSON.parse(oldvalue) : [];
            for(var i=0; i<inputVal.length; i++){
                if(inputVal[i].name == file.name && inputVal[i].size == file.size){
                    inputVal.splice(i, 1);
                }
            }
            return JSON.stringify(inputVal);
        });
        $('#' + file.id).remove();  // 删除视图
        updateTotalProgress();
    }
    
    // 设置 webuploader 的状态
    function setState(val){
        var file, stats;
        if(val == state){
            return;
        }
        $upload.removeClass('state-' + state);
        $upload.addClass('state-' + val);
        state = val;
        switch(state){
            case 'pedding':  // 未选择文件
                $placeHolder.removeClass('element-invisible');
                $queue.addClass('element-invisible');
                $statusBar.addClass('element-invisible');
                $progress.hide(); $info.hide();
                uploader.refresh();
                break;
            case 'ready':  // 可以开始上传
                $placeHolder.addClass('element-invisible');
                $queue.removeClass('element-invisible');
                $statusBar.removeClass('element-invisible');
                $progress.hide(); $info.show();
                $upload.text('开始上传').removeClass('disabled');
                uploader.refresh();
                break;
            case 'uploading':  // 上传中
                $progress.show(); $info.hide();
                $upload.text('暂停上传');
                break;
            case 'paused':  // 暂停上传
                $progress.show(); $info.hide();
                $upload.text('继续上传');
                break;
            case 'confirm':  //
                $progress.show(); $info.hide();
                $upload.text('开始上传');
                //$upload.text('开始上传').addClass('disabled');
                stats = uploader.getStats();
                if(stats.successNum && !stats.uploadFailNum){
                    setState('finish'); return;
                }
                break;
            case 'finish':
                $progress.hide(); $info.show();
                stats = uploader.getStats();
                if(stats.uploadFailNum){
                    $upload.text('重试上传').removeClass('disabled');
                    setState('retry');
                }else{
                    $upload.text('开始上传').addClass('disabled');
                }
                break;
            case 'retry':  // 重试上传
                $progress.hide(); $info.show();
                break;
        }
        updateStatus();
    }
    
    // 更新 webuploader 中图片上传的进度条
    function updateTotalProgress(){
        var loaded = 0, total = 0, spans = $progress.children(), percent;
        $.each(percentages, function(k, v){
            total += v[0];
            loaded += v[0] * v[1];
        });
        percent = total ? loaded / total : 0;
        spans.eq(0).text(Math.round(percent * 100) + '%');
        spans.eq(1).css('width', Math.round(percent * 100) + '%');
        updateStatus();
    }
    
    // 更新 webuploader 中的状态信息
    function updateStatus(){
        var text = '', stats = uploader.getStats();
        if(state === 'ready'){
            text = '选中' + fileCount + '个文件, 共' + WebUploader.formatSize(fileSize) +'.';
            if(stats.successNum){
                text += ' 已成功上传' + stats.successNum + '个.';
            }
        }else if(state === 'confirm'){
            if(stats.uploadFailNum){
                text = '已成功上传' + stats.successNum + '个文件' + stats.uploadFailNum + '个上传失败, <a class="retry" href="javascript:void()">重试上传</a>失败图片或<a class="ignore" href="javascript:void()">忽略</a>';
            }
        }else if(state === 'finish' || state === 'retry'){
            text = '共' + fileCount +'个文件(' + WebUploader.formatSize(fileSize) + '), 已成功上传' + (fileCount - stats.uploadFailNum) + '个. ';
            if(stats.uploadFailNum){
                text += stats.uploadFailNum + '个文件上传失败, <a class="retry" href="javascript:void()">重试上传</a>失败图片或<a class="ignore" href="javascript:void()">忽略</a>';
            }
        }
        $info.html(text);
    }
    
    // 对字符串进行hash运算
    function hashString(str){
        var hash = 0, len = str.length, _char;
        for(var i=0; i<len; i++){
            _char = str.charCodeAt(i);
            hash = _char + (hash << 6) + (hash << 16) - hash;
        }
        return hash;
    }
    
    // 当文件被加入队列之前触发(`initServerFile()`方法中加入的文件不走该方法)
    uploader.on('beforeFileQueued', function(file){
        var _hash = hashString(file.name + file.size);
        if(fileHashList[_hash]){ // 已经重复了
            uploader.trigger('error', 'F_DUPLICATE', file);
            return false;
        }else{
            fileHashList[_hash] = true;
        }
    });
    
    // 当有文件被添加进队列的时候
    uploader.on('fileQueued', fileQueue);
    
    // 当文件被移除队列后触发 fileDequeued 事件
    uploader.on('fileDequeued', removeFile);
    
    // 特殊事件all, 所有的事件触发都会响应到
    uploader.on('all', function(type, files){
        switch(type){
            //case 'uploadFinished': setState('confirm'); break;
            case 'uploadFinished': setState('finish'); break;
            case 'startUpload': setState('uploading');break;
            case 'stopUpload': setState('paused'); break;
        }
    });
    
    // 当 validate 不通过时, 会以派送错误事件的形式通知调用者
    uploader.on('error', function(type){
        switch(type){
            case 'Q_EXCEED_NUM_LIMIT': alert('文件总数超出 fileNumLimit 限制, 超出部分将不添加到上传队列中'); break;
            case 'Q_EXCEED_SIZE_LIMIT': alert('文件总大小超出 fileSizeLimit 限制, 超出部分将不添加到上传队列中'); break;
            case 'Q_TYPE_DENIED': alert('文件类型不符合上传要求, 将不添加到上传队列中'); break;
            case 'F_EXCEED_SIZE': alert('文件大小超出 fileSingleSizeLimit 限制, 将不添加到上传队列中'); break;
            case 'F_DUPLICATE': alert('文件重复(文件名和文件大小完全一致), 已忽略'); break;
            default: alert('Eroor: ' + type); break;
        }
    });
    
    // 上传过程中触发 uploadProgress 事件, 携带上传进度
    uploader.on('uploadProgress', function(file, percentage){
        var $li = $('#' + file.id), $percent = $li.find('.progress span');
        $percent.css("width", percentage * 100 + '%');
        percentages[file.id][1] = percentage;
        updateTotalProgress();
    });
    
    // 当文件上传成功时触发 uploadSuccess 事件
    uploader.on('uploadSuccess', function(file, response){
        if(response.code == 0){
            $inputId.val(function(index, oldvalue){
                var inputVal = oldvalue ? JSON.parse(oldvalue) : [];
                var res = response;
                delete res.code;
                delete res._raw;
                inputVal.push(res);
                return JSON.stringify(inputVal);
            });
        }else{
            file.setStatus('error', response.msg);
        }
    });
    
    // 当上传按钮被点击时
    $upload.on('click', function(){
        if($(this).hasClass('disabled')){
            return false;
        }
        if(state == 'ready'){
            uploader.upload();  // 开始上传
        }else if(state == 'paused'){
            uploader.upload();  // 开始上传
        }else if(state == 'uploading'){
            uploader.stop();  // 暂停上传
        }else if(state == 'retry'){
            uploader.retry();  // 重试上传
        }
    });
    
    // 当"重试上传"被点击时, 重试上传文件
    $info.on('click', '.retry', function(){
        uploader.retry();
    });

    // 当"忽略"被点击时, 获取所有上传失败的文件, 然后删除
    $info.on('click', '.ignore', function(){
        var errorFile = uploader.getFiles('error');
        for(var i=0; i<errorFile.length; i++){
            uploader.removeFile(errorFile[i]);
        }
        setState('finish');
    });
    
    $upload.addClass('state-' + state);
    updateTotalProgress();

    initServerFile();  // 初始化时显示已上传图片
});
/**
 * 一个文件从添加到队列中到上传结束, 所有的事件顺序:
 * ready
 * beforeFileQueued
 * fileQueued
 * filesQueued
 * startUpload
 * uploadStart
 * uploadBeforeSend
 * uploadProgress
 * uploadProgress
 * uploadProgress
 * uploadAccept
 * uploadSuccess
 * uploadComplete
 * uploadFinished
 ** 
dndAccept
fileDequeued
reset
stopUpload
uploadError
error
 */
