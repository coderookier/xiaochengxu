const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
  },

  //第一次打开此页面时调用
  onLoad: function() {
    var me = this;

    var user = app.getGlobalUserInfo();
    console.log(user);
    wx.showLoading({
      title: '加载中...',
    });
    var serverUrl = app.serverUrl;
    // 调用后端
    wx.request({
      url: serverUrl + '/user/query?userId=' + user.id,
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        'userId': user.id,
        'userToken': user.userToken
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
            nickname: userInfo.nickname
          })
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
            'content-type': 'application/json' // 默认值
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
  }
})
