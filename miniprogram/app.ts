// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 开启「发送给朋友」与「分享到朋友圈」菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })
  },
})
