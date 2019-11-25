const app = getApp()

Page({
  data: {

  },

  onLoad: function(params) {
    var me = this;
    var redirectUrl = params.redirectUrl;
    if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
      redirectUrl = redirectUrl.replace(/#/g, "?");
      redirectUrl = redirectUrl.replace(/@/g, "=");
    }
    me.redirectUrl = redirectUrl;
  },

  // 登录  
  doLogin: function (e) {
    var me = this;
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;
    // 简单验证
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: 'none',
        duration: 3000
      });
    } else {
      //与后端交互时在前端加入loading框
      wx.showLoading({
        title: '加载中...',
      });
      var serverUrl = app.serverUrl;
      // 调用后端
      wx.request({
        url: serverUrl + '/login',
        method: "POST",
        //将username和password传入后端
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res.data);

          //隐藏loading框
          wx.hideLoading();

          if (res.data.status == 200) {
            // 登录成功跳转 
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            });

            //保存全局用户信息，注销时就需要此信息
            //app.userInfo = res.data.data;
            app.setGlobalUserInfo(res.data.data);

            var redirectUrl = me.redirectUrl;
            if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
              wx.redirectTo({
                url: redirectUrl,
              })
            } else {
              wx.redirectTo({
                url: '../mine/mine',
              })
            }
          } else if (res.data.status == 500) {
            // 失败弹出框
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            });
          }
        }
      })
    }
  },

  //跳转到注册页面
  goRegistPage: function() {
    wx.navigateTo({
      url: '../userRegist/regist',
    })
  }
})