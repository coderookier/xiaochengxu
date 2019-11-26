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
    userLikeVideo: false,

    commentsPage: 1,
    commentsTotalPage: 1,
    commentsList: [],

    placeholder: "说点什么..."
  },

  //video上下文对象
  videoCtx: {},

  //加载视频详情页时触发的查询
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

    //查询视频发布者的头像，昵称，以及当前登录者是否点赞过该视频
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

    me.getCommentsList(1);

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

  //点击视频详情页面中的发布者头像，跳转到发布者个人主页显示个人信息
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

  //视频详情页面的分享按钮，具有下载，举报等功能
  shareMe: function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    
    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到微博'],
      success: function(res) {
        if (res.tapIndex == 0) {
          //下载
          wx.showLoading({
            title: '下载中...',
          })
          wx.downloadFile({
            url: app.serverUrl + me.data.videoInfo.videoPath,
            success: function (res) {
              if (res.statusCode == 200) {
                console.log(res.tempFilePath);
                //保存视频到相册
                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function(res) {
                    console.log(res.errMsg)
                    wx.hideLoading();
                    wx.showToast({
                      title: '下载成功',
                      icon: 'success',
                      duration: 2000
                    })
                  }
                })
              }
            }
          })


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
  },

  leaveComment: function() {
    this.setData({
      commentFocus: true,
      placeholder: "说点什么吧...",
      replyFatherCommentId: '',
      replyToUserId: '',
    });
  },

  saveComment: function(e) {
    var me = this;
    var content = e.detail.value;

    //获取评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid; 

    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.showLoading({
        title: '...',
      })
      wx.request({
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + "&toUserId=" + toUserId,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        data: {
          fromUserId: user.id,
          videoId: me.data.videoInfo.id,
          comment: content
        },
        success: function(res) {
          wx.hideLoading();
          console.log(res.data);
          me.setData({
            contentValue: '',
            commentsList: [],
            commentFocus: false
          });

          me.getCommentsList(1);
        }
      })
    }
  },

  getCommentsList: function(page) {
    var me = this;
    var videoId = me.data.videoInfo.id;
    wx.request({
      url: app.serverUrl + '/video/getVideoComments?videoId=' + videoId + "&page=" + page + "&pageSize=3",
      method: 'POST',
      success: function(res) {
        console.log(res.data);
        if (page == 1) {
          me.setData({
            commentsList: []
          })
        }
        var newCommentsList = res.data.data.rows;
        var commentsList = me.data.commentsList;

        me.setData({
          commentsList: commentsList.concat(newCommentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total
        });
      }
    })
  },

  onReachBottom: function () {
    var me = this;
    var currentPage = me.data.commentsPage;
    var totalPage = me.data.commentsTotalPage;
    if (currentPage === totalPage) {
      return;
    }
    var page = currentPage + 1;
    me.getCommentsList(page);
  },

  //回复评论
  replyFocus: function(e) {
    var me = this;
    var fatherCommentId = e.currentTarget.dataset.fathercommentid; 
    var userId = app.getGlobalUserInfo().id;
    var toUserId = e.currentTarget.dataset.touserid; 
    //不能回复自身
    if (userId == toUserId) {
      return;
    }
    var toNickname = e.currentTarget.dataset.tonickname; 
    me.setData({
      placeholder: "回复" + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus: true
    });
  }

})