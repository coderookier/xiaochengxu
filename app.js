//app.js
App({
  serverUrl: "http://121.248.51.103:6310",
  userInfo: null,

  //数据缓存保存用户全局信息
  setGlobalUserInfo: function(user) {
    wx.setStorageSync("userInfo", user);
  },

  getGlobalUserInfo: function () {
    return wx.getStorageSync("userInfo");
  }

})