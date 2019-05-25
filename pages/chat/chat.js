// pages/chat/chat.js

const app = getApp()
const msgs = require('./chat-mock-data.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: [],      //聊天记录
    msg: '',          //当前输入
    scrollTop: 0,     //页面的滚动值
    socketOpen: false,//websocket是否打开
    lastId: '',       //最后一条消息的ID
    isFristSend: true //是否第一次发送消息（区分历史和新加）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //设置标题
    this.setNickName(options);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //连接websocket服务器
    //this.connect();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    /*const socketOpen = thi.data.socketOpen;
    if (socketOpen) {
      wx.closeSocket({ });
      wx.onSocketClose(function(res){
        console.log('WebSocket 已关闭！')
      });
    }*/
  },

  //连接WebSocket
  connect() {
    //连接
    wx.connectSocket({
      url: '',
      header: {},
      method: '',
      protocols: [],
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    });

    //监听连接打开  
    wx.onSocketOpen(function(res){
      this.setData({ socketOpen: true });
      wx.sendSocketMessage({
        data: JSON.stringify(msgs),
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      });

      //监听WebSocket接受到服务器的消息事件
      wx.onSocketMessage(function(res){
        const isFirstSend = this.data.isFirstSend;
        const data = JSON.parse(res.data);
        let messages = this.data.messages;
        let lastId = '';

        if (isFirstSend) {
          messages = messages.concat(data);
          lastId = messages[0].id;
          this.setData({ messages, lastId, isFirstSend: false });
          // 延迟页面向顶部滑动
          this.delayPageScroll();
        } else {
          messages.push(data);
          const length = messages.length;
          lastId = messages[length - 1].id;
          this.setData({ messages, lastId });
        }
      })

      //监听socket错误
      wx.onSocketError(function(res){
        console.log('WebSocket连接打开失败，请检查！')  
      })
    })
  },

  //设置昵称
  setNickName(options) {
    const nickname = options.nickname;
    wx.setNavigationBarTitle({
      title: nickname,
    });
  },

  //延迟页面向顶部滑动
  delayPageScroll() {
    const messages = this.data.messages;
    const length = messages.length;
    const lastId = messages[length - 1].id;
    setTimeout(() => {
      this.setData({ lastId });
    }, 300);
  },

  // 输入
  onInput(event) {
    const value = event.detail.value;
    this.setData({ msg: value });
  },

  // 聚焦
  onFocus() {
    this.setData({ scrollTop: 9999999 });
  },

  // 发送消息
  send() {
    const socketOpen = this.data.socketOpen;
    let messages = this.data.messages;
    let nums = messages.length;
    let msg = this.data.msg;

    if (msg === '') {
      wx.showToast({
        title: '请输入内容',
        icon: 'loading',
        duration: 1000
      })
      return false;
    }

    const data = {
      id: `msg${++nums}`,
      message: msg,
      messageType: 0,
      url: '../../images/5.png'
    };
    this.setData({ msg: '' });

    if (socketOpen) {
      wx.sendSocketMessage({
        data: JSON.stringify(data)
      })
    }
  }
})