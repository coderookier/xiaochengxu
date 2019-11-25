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

    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var loginUserId = "";
    if (user != null && user != undefined && user != '') {
      loginUserId = user.id;
    }
    wx.request({
      url: serverUrl + '/user/queryPublisher?loginUserId=' + loginUserId + "&videoId=" + videoInfo.id + "&publishUserId=" + videoInfo.userId,
      method: 'POST',
      success: function(res) {
        console.log(res.data);
        var publisher = res.data.data.publisher;
        var userLikeVideo = res.data.data.userLikeVideo;
        me.setData({
          serverUrl: serverUrl,
          publisher: publisher,
          userLikeVideo: userLikeVideo,
        });
      }
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

  showPublisher: function () {
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = me.data.videoInfo;
    //需要回调的地址，以字符串形式传入到登录页面，从而登录成功进行跳转到该页面
    var realUrl = '../videoInfo/#publisherId@' + videoInfo.userId;
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + videoInfo.userId,
      })
    }
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
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        success: function(res) {
          wx.hideLoading();
          me.setData({
            userLikeVideo: !userLikeVideo
          });
        }
      })
    }
  },

  shareMe: function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    
    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到微博'],
      success: function(res) {
        if (res.tapIndex == 0) {
          //下载
        } else if (res.tapIndex == 1) {
          //举报
          var videoInfo = JSON.stringify(me.data.videoInfo);
          var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;
          if (user == null || user == undefined || user == '') {
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl=' + realUrl,
            })
          } else {
            var publishUserId = me.data.videoInfo.userId;
            var videoId = me.data.videoInfo.id;
            var currentUserId = user.id;
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + "&publishUserId=" + publishUserId
            })
          }
        } else {
          wx.showToast({
            title: '微信暂未开放此功能',
            icon: 'none',
            duration: 1000
          })
        }
      }
    })
  },
  
  onShareAppMessage: function (res) {
    var me = this;
    var videoInfo = me.data.videoInfo;
    return {
      title: '分享短视频内容',
      path: 'pages/videoInfo/videoInfo?videoInfo=' + JSON.stringify(videoInfo)
    }
  }

})