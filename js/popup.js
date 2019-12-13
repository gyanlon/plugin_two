document.cookie = 'cross-site-cookie=bar; SameSite=Strict';

//创建xhr对象 
var xhr = new XMLHttpRequest();
//设置xhr请求的超时时间
xhr.timeout = 3000;
//设置响应返回的数据格式
xhr.responseType = "text";
//创建一个 post 请求，采用异步
//xhr.open("GET", "https://ide2-cn-beijing.data.aliyun.com/rest/folder/module/list?projectId=58695&tenantId=289796650594818&useType=0&labelLevels=2&pageNum=1&pageSize=100000");
//注册相关事件回调处理函数
xhr.onload = function(e) { 
  if(this.status == 200||this.status == 304){
	 showReport(JSON.parse(this.responseText));
  }
};

//xhr.send();


function showReport(data) {

	document.getElementById("report").innerHTML = this.responseText;
}