//app.js
App({
  serverUrl: "http://121.248.53.230:6310",
  userInfo: null,

  //数据缓存保存用户全局信息
  setGlobalUserInfo: function(user) {
    wx.setStorageSync("userInfo", user);
  },

  getGlobalUserInfo: function () {
    return wx.getStorageSync("userInfo");
  },

  reportReasonArray: [
    "色情低俗",
    "政治敏感",
    "涉嫌诈骗",
    "辱骂谩骂",
    "广告垃圾",
    "暴力行为",
    "违法违纪",
    "诱导分享",
    "其他原因"
  ]

})