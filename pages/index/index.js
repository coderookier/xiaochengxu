const app = getApp()

Page({
  data: {
    //用于分页的属性
    totalPage : 1,
    page: 1,
    videoList: [],

    screenWidth: 350,
    serverUrl: "",

    searchContent: ""
  },

  onLoad: function (params) {
    var me = this;
    //wx.getSystemInfoSync()用于获取系统信息，用于页面渲染等
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth: screenWidth,
    });

    var searchContent = params.searchContent;
    var isSaveRecord = params.isSaveRecord;

    if(isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
      isSaveRecord = 0;
    }

    me.setData({
      searchContent: searchContent,
    });

    //获取当前的分页数
    var page = me.data.page;
    me.getAllVideoList(page, isSaveRecord);
  },

  getAllVideoList: function(page, isSaveRecord) {
    var me = this;
    var serverUrl = app.serverUrl;

    wx.showLoading({
      title: '请等待，加载中...',
    });

    var searchContent = me.data.searchContent;

    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + "&isSaveRecord=" + isSaveRecord,
      method: 'POST',
      data: {
        videoDesc: searchContent
      },
      header: {
        'content-type': 'application/json'
      },

      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        console.log(res.data);
        //判断当前页page是否是第一页，如果是第一页，那么设置videoList为空
        if (page == 1) {
          me.setData({
            videoList: []
          });
        }

        var videoList = res.data.data.rows;
        var newVideoList = me.data.videoList;

        me.setData({
          videoList: newVideoList.concat(videoList),
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        });

      }

    })
  },

  //下拉刷新
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    this.getAllVideoList(1, 0);
  },

  //上拉刷新
  onReachBottom: function() {
    var me = this;
    var currentPage = me.data.page;
    var totalPage = me.data.totalPage;

    //判断当前页和总页数是否相等，如果相等则无需进行查询
    if (currentPage == totalPage) {
      wx.showToast({
        title: '已经到底啦...',
        icon: 'none'
      })
      return;
    }

    var page = currentPage + 1;
    me.getAllVideoList(page, 0);

  },

  showVideoInfo: function(e) {
    var me =this;
    var videoList = me.data.videoList;
    var arrindex = e.target.dataset.arrindex;
    //json对象转为String传到下一个页面
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo,
    })
  }

})
