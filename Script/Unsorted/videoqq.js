const cookieName = '腾讯视频'
const cookieKey = 'chavy_cookie_videoqq'
const chavy = init()
const cookieVal = chavy.getdata(cookieKey)

sign()

function sign() {
  const timestamp = Date.parse(new Date())
  let url = { url: `https://vip.video.qq.com/fcgi-bin/comm_cgi?name=hierarchical_task_system&cmd=2&_=${timestamp}`, headers: { Cookie: cookieVal } }
  url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'

  chavy.get(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    let result = JSON.parse(data.match(/QZOutputJson=\(([^\)]*)\)/)[1])
    const title = `${cookieName}`
    let subTitle = ''
    let detail = ''
    if (result.ret == 0) {
      getexp()
    } else if (result.ret == -10006) {
      subTitle = '签到结果: 失败'
      detail = `原因: 未登录, 说明: ${result.msg}`
      chavy.msg(title, subTitle, detail)
    } else if (result.ret == -10019) {
      subTitle = '签到结果: 失败'
      detail = `原因: 非VIP会员, 说明: ${result.msg}`
      chavy.msg(title, subTitle, detail)
    } else {
      subTitle = '签到结果: 未知'
      detail = `编码: ${result.ret}, 说明: ${result.msg}`
      chavy.msg(title, subTitle, detail)
    }
  })
  chavy.done()
}

function getexp() {
  const timestamp = Date.parse(new Date())
  let url = { url: `https://vip.video.qq.com/fcgi-bin/comm_cgi?name=spp_PropertyNum&cmd=1&growth_value=1&otype=json&_=${timestamp}`, headers: { Cookie: cookieVal } }
  url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
  chavy.get(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    let result = JSON.parse(data.match(/QZOutputJson=\(([^\)]*)\)/)[1])
    const title = `${cookieName}`
    let subTitle = '签到结果: 成功'
    let detail = `V力值: ${result.GrowthValue.num}, 观影券: ${result.MovieTicket.num}, 赠片资格: ${result.GiveMovie.num}`
    chavy.msg(title, subTitle, detail)
  })
}

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
