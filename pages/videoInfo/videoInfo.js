var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cover: "cover",
    videoId: "",
    src: "",
    videoInfo: {},
    userLikeVideo: false
  },

  //video上下文对象
  videoCtx: {},
  onLoad: function(params) {
    var me = this;
    me.videoCtx = wx.createVideoContext("myVideo", me);

    //获取上一个页面传入的参数
    var videoInfo = JSON.parse(params.videoInfo);
    var height = videoInfo.videoHeight;
    var width = videoInfo.videoWidth;
    var cover = "cover";

    //横向视频不需要拉伸
    if (width >= height) {
      cover = "";
    }

    me.setData({
      videoId: videoInfo.id,
      src: app.serverUrl + videoInfo.videoPath,
      videoInfo: videoInfo,
      cover: cover
    })
  },

  onShow: function() {
    var me = this;
    me.videoCtx.play();
  },

  onHide: function() {
    var me = this;
    me.videoCtx.pause();
  },

  showSearch: function() {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },

  upload: function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    //需要回调的地址，以字符串形式传入到登录页面，从而登录成功进行跳转到该页面
    var realUrl = '../videoInfo/videoInfo#videoInfo@' +videoInfo;
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      videoUtil.uploadVideo()
    }
  },

  showIndex: function() {
    wx.redirectTo({
      url: '../index/index',
    })
  },

  showMine: function() {
    var user = app.getGlobalUserInfo();
    //if (user == null || user == undefined || user == '') {
     // wx.navigateTo({
     //   url: '../userLogin/login',
    //  })
   // } else {
      wx.navigateTo({
        url: '../mine/mine',
      })
  },

  likeVideoOrNot: function() {
    var me = this;
    var videoInfo = me.data.videoInfo;
    var user = app.getGlobalUserInfo();
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
      var userLikeVideo = me.data.userLikeVideo;
      //点赞的url
      var url = '/video/userLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      //取消点赞的url
      if (userLikeVideo) {
        url = '/video/userUnlike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      } 
      wx.showLoading({
        title: '...',
      })
      var serverUrl = app.serverUrl;
      wx.request({
        url: serverUrl + url,
        method: "POST",
        header: {
          'content-type': 'application/json', // 默认值
          'userId': user.id,
          'userToken': user.userToken
        },
        success: function(res) {
          wx.hideLoading();
          me.setData({
            userLikeVideo: !userLikeVideo
          });
        }
      })
    }
  }
})