const app = getApp()

Page({
  data: {
    bgmList: [],
    serverUrl: "",
    videoParams: {}
  },

  //params接收上一个页面传入的值
  onLoad: function(params) {
    var me = this;
    console.log(params);
    //将接收到的参数保存到页面数据videoParams对象中
    me.setData({
      videoParams: params
    })

    wx.showLoading({
      title: '加载中...',
    });

    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    wx.request({
      url: serverUrl + '/bgm/list',
      method: "POST",

      header: {
        'content-type': 'application/json', // 默认值
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 200) {
          var bgmList = res.data.data;
          me.setData({
            bgmList: bgmList,
            serverUrl: serverUrl
          });
        }
      }
    })
  },

  upload: function(e) {
    var me = this;
    var bgmId = e.detail.value.bgmId;
    var desc = e.detail.value.desc;
    console.log("bgmId:" + bgmId);
    console.log("desc:" + desc);

    var duration = me.data.videoParams.duration;
    console.log("duration" + duration);
    var tmpHeight = me.data.videoParams.tmpHeight;
    console.log("tmpHeight" + tmpHeight);
    var tmpWidth = me.data.videoParams.tmpWidth;
    var tmpVideoUrl = me.data.videoParams.tmpVideoUrl;
    var tmpCoverUrl = me.data.videoParams.tmpCoverUrl;
    console.log("tmpCoverUrl:" + tmpCoverUrl);

    //上传短视频
    wx.showLoading({
      title: '上传中...',
    });
    var serverUrl = app.serverUrl;
    var userInfo = app.getGlobalUserInfo();
    wx.uploadFile({
      url: serverUrl + '/video/upload',
      formData: {
        userId: userInfo.id,
        bgmId: bgmId,
        desc: desc,
        videoSeconds: duration,
        videoHeight: tmpHeight,
        videoWidth: tmpWidth
      },
      filePath: tmpVideoUrl,
      name: 'file',
      header: {
        'content-type': 'application/json',
        'headerUserId': userInfo.id,
        'headerUserToken': userInfo.userToken
      },
      success: function (res) {
        //转为JSON对象
        var data = JSON.parse(res.data);
        console.log(data);
        wx.hideLoading();
        if (data.status == 200) {
          wx.showToast({
            title: '上传成功',
            icon: 'success',
            duration: 2000
          });
        }
        //上传成功后跳回之前的页面
        wx.navigateBack({
          delta: 1
        })
      }
    })
  }
})
    


