const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe: true,
    isFollow: false,


    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",

    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    myWorkFlag: false,
    myLikeFlag: true,
    myFollowFlag: true

  },

  //第一次打开此页面时调用
  onLoad: function(params) {
    var me = this;
    var user = app.getGlobalUserInfo();
    var userId = user.id;
    var publisherId = params.publisherId;


    if (publisherId != null && publisherId != undefined && publisherId != '') {
      if (publisherId != userId) {
        me.setData({
          isMe: false
        });
      } else {
        isMe: true
      }
      userId = publisherId;
      me.setData({
        publisherId: publisherId,
        serverUrl: app.serverUrl
      });
    }

    me.setData({
      userId: userId
    })

    wx.showLoading({
      title: '加载中...',
    });
    var serverUrl = app.serverUrl;
    // 调用后端
    wx.request({
      url: serverUrl + '/user/query?userId=' + userId + "&fanId=" + user.id,
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function (res) {
        console.log(res.data);
        //隐藏loading框
        wx.hideLoading();

        if (res.data.status == 200) {
          var userInfo = res.data.data;
          //默认值，用户还未更改的初始头像
          var faceUrl = "../resource/images/noneface.png";
          if (userInfo.faceImage != null && userInfo.faceImage != '' && userInfo.faceImage != undefined) {
            var faceUrl = serverUrl + userInfo.faceImage;
          }
          me.setData({
            faceUrl: faceUrl,
            fansCounts: userInfo.fansCounts,
            followCounts: userInfo.followCounts,
            receiveLikeCounts: userInfo.receiveLikeCounts,
            nickname: userInfo.nickname,
            isFollow: userInfo.follow
          })
          me.doSelectWork();
        } else if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 3000,
            icon: 'none',
            success: function() {
              setTimeout(function() {
                wx.redirectTo({
                  url: '../userLogin/login',
                })
              }, 2000);
            }
          });
        }
      }
    })
  },


  followMe: function(e) {
    var me = this;
    var user = app.getGlobalUserInfo();
    var userId = user.id;
    var publisherId = me.data.publisherId;

    var followType = e.currentTarget.dataset.followtype;

    //1关注0取关
    var url = '';
    if(followType == '1') {
      url = '/user/beyourfans?userId=' + publisherId + "&fanId=" + userId;
    } else {
      url = '/user/dontbeyourfans?userId=' + publisherId + "&fanId=" + userId;
    }

    wx.showLoading({
      title: '...',
    });
    wx.request({
      url: app.serverUrl + url,
      method: 'POST',
      header: {
        'content-type': 'application/json', // 默认值
        'headerUserId': userId,
        'headerUserToken': user.userToken
      },
      success: function() {
        wx.hideLoading();
        if (followType == '1') {
          me.setData({
            isFollow: true,
            fansCounts: ++me.data.fansCounts
          });
        } else {
          me.setData({
            isFollow: false,
            fansCounts: --me.data.fansCounts
          });
        }
      }
    })

  },

  //注销
  logout: function () {
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var userId = user.id;
    // 调用后端
    wx.request({
      url: serverUrl + '/logout?userId=' + userId,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);

        if (res.data.status == 200) {
          // 注销成功跳转 
          wx.showToast({
            title: '注销成功',
            icon: 'success',
            duration: 2000
          });
          //全局的user信息清空
          //app.userInfo = null;
          //註銷以後清空緩存
          wx.removeStorageSync("userInfo");
          
          //重新跳转到登录页面
          wx.navigateTo({
            url: '../userLogin/login',
          })
        }
      }
    });
  },

  //上传头像
  changeFace: function() {
    var me = this;
    //找相册
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        const tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths);
        wx.showLoading({
          title: '上传中...',
        });
        var serverUrl = app.serverUrl;
        var userInfo = app.getGlobalUserInfo();
        wx.uploadFile({
          url: serverUrl + '/user/uploadFace?userId=' + userInfo.id,
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'content-type': 'application/json', // 默认值
            'headerUserId': userInfo.id,
            'headerUserToken': userInfo.userToken
          },
          success: function(res) {
            //转为JSON对象
            var data = JSON.parse(res.data);
            console.log(data);
            wx.hideLoading();
            if (data.status == 200) {
              wx.showToast({
                title: '上传成功',
                icon: "success"
              });

              //显示头像
              var imageUrl = data.data;
              me.setData({
                faceUrl: serverUrl + imageUrl
              });

            } else if (res.data.status == 500) {
              wx.showToast({
                title: data.msg,
              })
            }
          }
        });
      }
    });
  },

  uploadVideo: function() {
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
            url: '../chooseBgm/chooseBgm?duration=' + duration
              + "&tmpHeight=" + tmpHeight
              + "&tmpWidth=" + tmpWidth
              + "&tmpVideoUrl=" + tmpVideoUrl
              + "&tmpCoverUrl=" + tmpCoverUrl
          })
        }
      }
    })
  },

  doSelectWork: function () {
    this.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",

      myWorkFlag: false,
      myLikeFlag: true,
      myFollowflag: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });
    this.getMyVideoList(1);
  },

  doSelectLike: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myWorkFlag: true,
      myLikeFlag: false,
      myFollowFlag: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });
    this.getMyLikesList(1);
  },

  doSelectFollow: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myWorkFlag: true,
      myLikeFlag: true,
      myFollowFlag: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });
    this.getMyFollowList(1);
  },

  getMyVideoList: function(page) {

    var me = this;
    var serverUrl = app.serverUrl;

    wx.showLoading({
      title: '请等待，加载中...',
    });

    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + "&pageSize=6",
      method: 'POST',
      data: {
        userId: me.data.userId
      },
      header: {
        'content-type': 'application/json'
      },

      success: function (res) {
        wx.hideLoading();
        console.log(res.data);
        var myVideoList = res.data.data.rows;
        var newVideoList = me.data.myVideoList;
        me.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },


  getMyLikesList: function (page) {
    var me = this;
    var userId = me.data.userId;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyLike?userId=' + userId + '&page=' + page + '&pageSize=6',
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var likeVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.likeVideoList;
        me.setData({
          likeVideoPage: page,
          likeVideoList: newVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  getMyFollowList: function (page) {
    var me = this;
    var userId = me.data.userId;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/ShowMyFollow?userId=' + userId + '&page=' + page + '&pageSize=6',
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var followVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.followVideoList;
        me.setData({
          followVideoPage: page,
          followVideoList: newVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  //到底后触发加载
  onReachBottom: function() {
    var myWorkFlag = this.data.myWorkFlag;
    var myLikeFlag = this.data.myLikeFlag;
    var myFollowFlag = this.data.myFollowFlag;
    //对当前显示部分进行分页加载
    if (!myWorkFlag) {
      var currentPage = this.data.myVideoPage;
      var totalPage = this.data.myVideoTotal;
      //获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage == totalPage) {
        wx.showToast({
          title: '视频到底啦...',
          icon: 'none'
        })
        return;
      }
      var page = currentPage + 1;
      this.getMyVideoList(page);
    } else if (!myLikeFlag) {
      var currentPage = this.data.likeVideoPage;
      var totalPage = this.data.likeVideoTotal;
      if (currentPage == totalPage) {
        wx.showToast({
          title: '视频到底啦...',
          icon: 'none'
        })
        return;
      }
      var page = currentPage + 1;
      this.getMyLikesList(page);
    } else if (!myFollowFlag) {
      var currentPage = this.data.followVideoPage;
      var totalPage = this.data.followVideoList;
      if (currentPage == totalPage) {
        wx.showToast({
          title: '视频到底啦...',
          icon: 'none'
        })
        return;
      }
      var page = currentPage + 1;
      this.getMyFollowList(page);
    }
  },

  //点击跳转到视频详情页
  showVideo: function(e) {
    var myWorkFlag = this.data.myWorkFlag;
    var myLikeFlag = this.data.myLikeFlag;
    var myFollowFlag = this.data.myFollowFlag;
    if (!myWorkFlag) {
      var videoList = this.data.myVideoList;
    } else if (!myLikeFlag) {
      var videoList = this.data.likeVideoList;
    } else if (!myFollowFlag) {
      var videoList = this.data.followVideoList;
    }
    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);
    wx.redirectTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo,
    })
  }

})
