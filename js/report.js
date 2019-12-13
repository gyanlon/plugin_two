document.cookie = 'cross-site-cookie=bar; SameSite=Strict';
dataArray = [{
    flowName: "1",
    flowCreateTime: "2",
    taskOwner: "3",
    taskType: "4",
    taskId: "5",
    taskName: "6",
    taskUpdateTime: "7"
}]
//创建xhr对象 
var xhr = new XMLHttpRequest();
//设置xhr请求的超时时间
xhr.timeout = 3000;
//设置响应返回的数据格式
xhr.responseType = "text";
//创建一个 post 请求，采用异步
xhr.open("GET", "https://ide2-cn-beijing.data.aliyun.com/rest/folder/module/list?projectId=58695&tenantId=289796650594818&useType=0&labelLevels=2&pageNum=1&pageSize=100000");
//注册相关事件回调处理函数
xhr.onload = function(e) { 
  if(this.status == 200 || this.status == 304){
    var flowData = processResponse(this.responseText);
    // flowData = dataArray;
	showReport(flowData);
  }
};

xhr.send();


showReport = function ( flows ) {
  $("#jqGrid").jqGrid({

    datatype: "local",
    data: flows,
    //   url: 'mock_data.js',
    //   datatype: "json",
      colModel: [
          {label: '流程', name: 'flowName', index: "flowName", sortable: false, width: 40, key: true},
          {label: '流程创建时间', name: 'flowCreateTime', index: "flowCreateTime", sortable: false, width: 20},
          {label: '节点Owner', name: 'taskOwner', width: 15},
          {
              label: '节点类型', name: 'taskType', width: 15, sortable: false, formatter: function (value, options, row) {
                  if (value === -1) {
                      result = '<span class="label label-init">初始状态</span>';
                  } else if (value === 0) {
                      result = '<span class="label label-downloadfail">爬取失败</span>';
                  } else if (value === 1) {
                      result = '<span class="label label-downloadsuccess">爬取成功</span>';
                  } else if (value === 2) {
                      result = '<span class="label label-parsefail">解析失败</span>';
                  } else if (value === 3) {
                      result = '<span class="label label-parsesuccess">解析成功</span>';
                  } else {
                      console.error("Unkown status : "  + value);
                      result = '<span class="label label-unkown">未知状态</span>';
                  }

                  return result;
              }
          },
          {label: '节点ID', name: 'taskId', sortable: false, width: 15},
          {label: '节点名称', name: 'taskName', sortable: false, width: 30},
          {label: '节点更新时间', name: 'taskUpdateTime', sortable: false, width: 20}
      ],
      viewrecords: true,
      height: 385,
      rowNum: 500,
      rowList: [500, 600, 800],
      rownumbers: true,
      rownumWidth: 25,
      autowidth: true,
    //   multiselect: true,
      pager: "#jqGridPager",
      jsonReader: {
          root: "list", //数据列表模型
          page: "data.currPage", //数据页码
          total: "totalPage", //数据总页码
          records: "totalCount" //数据总记录数
      },
      prmNames: {
          page: "page",
          rows: "limit",
          order: "order"
      },
      gridComplete: function () {
          //隐藏grid底部滚动条
          $("#jqGrid").closest(".ui-jqgrid-bdiv").css({"overflow-x": "hidden"});
      },
      beforeRequest: function () {
      }
  });

  vm.resize();
  $(window).resize(function () {
      vm.resize();
  });
};


var vm = new Vue({
  el: '#rrapp',
  data: {
      q: {
          loginName: null,
          startTime: null,
          endTime: null,
          taskType: "",
          taskStatus: "",
          hotelId: null,
          platform: "",
          id: null
      },
      showList: true,
      title: null,
      task: {
          id: null,
          hotelId: null,
          loginName: null,
          platform: null,
          taskType: null,
          batchNumber: null
      },
      taskTypeOptions: {
          HOS_SCORE : "HOS分数",
          COMMENTS_INFO : "好评和差评",
          CONTRAST_SCORE : "评分",
          ROOM_TYPE_PRICE : "房型和房价",
          ROOM_STATUS : "房态",
          TRADING : "公明收益"
      },
      platformOptions: {
          meituan : "美团",
          ctrip : "携程",
          fliggy : "飞猪",
          qunar : "去哪儿",
          elong : "艺龙"
      },
      error: false,
      errorMsg: null,
      alerts: []
  },
  methods: {
      query: function () {
          console.info("query " + JSON.stringify(vm.q));
          if (this.validate(vm.q, searchValidator)) {
              this.reload();
          }
      },
      add: function () {
          vm.showList = false;
          vm.title = "新增";

          this.resetSearchForm();
      },
      saveOrUpdate: function () {
          if (!this.validate(vm.task, createValidator)) {
              return;
          }
          var url = "crawler/task/create";
          $.ajax({
              type: "POST",
              url: baseURL + url,
              contentType: "application/json",
              data: JSON.stringify(vm.task),
              success: function (r) {
                  if (r.code === '200') {
                      alert('操作成功', function () {
                          vm.reload();
                      });
                  } else {
                      alert(r.message);
                  }
              },
              error: function (r) {
                  console.error(r);
                  alert(r.message);
              }
          });
      },
      resetSearchForm : function () {

          vm.errorMsg = null;
          vm.error = false;
          for (const [key, value] of Object.entries(vm.q)) {
              vm.q[key] = "";
          }

          return this.validate(vm.q, searchValidator) ;
      },
      resetSearch : function () {
          if (this.resetSearchForm()) {
              this.reload();
          }
      },
      validate: function (data, checker) {
          vm.error = false;
          vm.alerts = [];

          for (const [key, value] of Object.entries(data)) {
              checker.setValue(key, value);
          }

          checker.validateAll();

          if(checker.errors.length > 0) {
              vm.error = true;
              for(var i=0; i<checker.errors.length; i++) {
                  var err = checker.errors[i];
                  vm.alerts.push({name: err.name, message: err.message});
              }
          }
          return !vm.error;
      },
      gencmd: function () {

          var idList = "";
          var grid = $("#jqGrid");
          var selIds = $("#jqGrid").jqGrid('getGridParam', 'selarrrow');   // selected ids
          console.debug(selIds);

          var strIdList = JSON.stringify(selIds).replace(/\"/g,"");

          $.ajax({
              type: "post",
              url: baseURL + 'crawler/task/gen',
              contentType: "application/json",
              data: strIdList,
              success: function (r) {
                  if (r.code === '200') {
                      alert("发送成功! 任务ID列表为：" + strIdList);
                      console.info('操作成功');
                  } else {
                      alert("发送出错:" + r.message);
                      console.error(r.message);
                  }
              },
              error: function (d) {
                  alert('error');
              }
          });
      },
      reload: function () {
          vm.showList = true;
          var page = $("#jqGrid").jqGrid('getGridParam', 'page');
          $("#jqGrid").jqGrid('setGridParam', {
              postData: vm.q,
              page: page
          }).trigger("reloadGrid");
          this.resize();
      },
      resize: function () {
        $('.ui-jqgrid-bdiv').height($(window).height() - $(".grid-btn").height() - 100);
      },
      cancel: function () {

          vm.error = false;
          vm.errorMsg = "";
          this.reload();
      },
      checkSearch(event) {
          this.check(event, searchValidator);
      },
      checkCreation(event) {
          this.check(event, createValidator);
      },
      check(event, checker) {
          checker.setValue(event.target.name, event.target.value);
          checker.validate(event.target.name, event.target.value);

          vm.error = false;
          vm.alerts = [];
          if(checker.errors.length > 0) {
              vm.error = true;
              for(var i=0; i<checker.errors.length; i++) {
                  var err = checker.errors[i];
                  vm.alerts.push({name: err.name, message: err.message});
              }
          }
      }
  }
});

var mock_data = `{
    "errCode": 0,
    "requestId": "0a98a74215759692837534498e5ab4",
    "data": {
      "folderList": [
      {
        "index": 0,
        "version": 0,
        "locked": 0,
        "subType": 0,
        "bizId": 10011633,
        "type": 0,
        "fileCnt": 0,
        "id": 1184748,
        "folderItemType": 2,
        "parentFolderItemId": "bizroot",
        "folderItemName": "account_hotel_wide_table_uat",
        "folderItemCreator": "200133248230535291",
        "folderItemCreatetime": "2019-08-13 10:51:13",
        "folderItemUpdater": "200133248230535291",
        "folderItemUpdatetime": "2019-08-13 10:51:13",
        "folderId": "00erpfkgiu3m4auqr5nw52yo",
        "appId": 58695,
        "start": 0,
        "limit": 2147483647
      },
      {
        "engineType": "MaxCompute",
        "index": 1,
        "displayName": "MaxCompute",
        "version": 1,
        "locked": 0,
        "subType": 0,
        "bizId": 10016888,
        "type": 10,
        "fileCnt": 0,
        "id": 1234125,
        "folderItemType": 2,
        "parentFolderItemId": "50ubnkudhr9kfmf0pdj0sr59",
        "folderItemName": "folderMaxCompute",
        "folderItemCreator": "217292257727314460",
        "folderItemCreatetime": "2019-12-06 21:12:24",
        "folderItemUpdater": "217292257727314460",
        "folderItemUpdatetime": "2019-12-06 21:12:24",
        "folderId": "0c6f5gmlnrl86prrk8siq3bv",
        "appId": 58695,
        "start": 0,
        "limit": 2147483647
      }
      ],
      "fileList": [
      {
        "labelId": -1,
        "parentId": -1,
        "isOdps": true,
        "createUser": "217292257727314460",
        "tenantId": 289796650594818,
        "locked": 0,
        "isProtected": 1,
        "bizId": 10016888,
        "appId": 58695,
        "fileFolderId": "yk95wlgz0sp8gf9cb5huc9pk",
        "fileId": 500380333,
        "fileName": "vt_search_poi_end",
        "fileType": 99,
        "useType": 0,
        "nodeId": 100239734,
        "currentVersion": 0,
        "owner": "217292257727314460",
        "lastEditUser": "217292257727314460",
        "lastEditTime": "2019-12-08 21:51:12",
        "fileLockUser": "217292257727314460",
        "fileLockUserName": "lihno.zeng",
        "fileLockStatus": 1,
        "fileDelete": 0,
        "commitStatus": 0,
        "isAutoParse": 1,
        "filePublish": 0,
        "start": 0,
        "limit": 2147483647
      }
      ]},
    "success": true
  }`;


function processResponse(response) {
    var res = JSON.parse(response);
    // alert(res.data);
    var taskNodes = [];
    var flowNodes = res.data.folderList.filter(node => "bizroot" === node.parentFolderItemId);
    flowNodes.filter(node => {
        node["taskNodes"] = res.data.fileList.filter(task => node.bizId === task.bizId);
    });

    taskNodes = flowNodes.flatMap( flow=> {
        if(flow["taskNodes"] !== undefined && flow["taskNodes"].length > 0) {
          return flow["taskNodes"].map( task => {
            var taskDetail = {};
            taskDetail["flowName"]=flow.folderItemName;
            taskDetail["flowCreateTime"]=flow.folderItemCreatetime;
            taskDetail["taskOwner"]=task.fileLockUserName;
            taskDetail["taskType"]=task.fileType;
            taskDetail["taskId"]=task.cloudUuid;
            taskDetail["taskName"]=task.fileName;
            taskDetail["taskUpdateTime"]=task.lastEditTime;
            return taskDetail;
          });
        } else {
            var taskDetail = {};
            taskDetail["flowName"]=flow.folderItemName;
            taskDetail["flowCreateTime"]=flow.folderItemCreatetime;
            return taskDetail;
        }
    })
    return taskNodes;
}

console.log(processResponse(JSON.parse(mock_data)));
