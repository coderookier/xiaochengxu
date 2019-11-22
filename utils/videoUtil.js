//可以复用的方法
function uploadVideo() {
  wx.chooseVideo({
    sourceType: ['album', 'camera'],
    camera: 'back',

    //选择视频成功后的回调函数，包含视频的信息
    success(res) {
      console.log(res);
      var duration = res.duration;
      var tmpHeight = res.height;
      var tmpWidth = res.width;
      var tmpVideoUrl = res.tempFilePath;
      var tmpCoverUrl = res.thumbTempFilePath;

      if (duration >= 15) {
        wx.showToast({
          title: '视频长度不能超过15秒...',
          icon: "none",
          duration: 2500
        })
      } else if (duration < 1) {
        wx.showToast({
          title: '视频长度过短，请重新上传...',
          icon: "none",
          duration: 2500
        })
      } else {
        //视频选择没有问题，进行bgm选择
        wx.navigateTo({
          //参数值一起传到下个页面
          //下一页面接收的参数值必须与"&tmpHeight="一致，否则遇到想不到的错误改半天，气死人
          url: '../chooseBgm/chooseBgm?duration=' + duration +
            "&tmpHeight=" + tmpHeight +
            "&tmpWidth=" + tmpWidth +
            "&tmpVideoUrl=" + tmpVideoUrl +
            "&tmpCoverUrl=" + tmpCoverUrl
        })
      }
    }
  })
}

module.exports = {
  uploadVideo: uploadVideo
}
