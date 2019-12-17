document.cookie = 'cross-site-cookie=bar; SameSite=Strict';
currentFlows = [];
showReport();

function queryTasks(projectId, tenantId) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 3000;
    xhr.responseType = "text";
    var url = `https://ide2-cn-beijing.data.aliyun.com/rest/folder/module/list?projectId=${projectId}&tenantId=${tenantId}&useType=0&labelLevels=2&pageNum=1&pageSize=10000`;
    xhr.open("GET", url);

    xhr.onload = function(e) { 
        if(this.status == 200 || this.status == 304){
            currentFlows = processResponse(this.responseText);
            refreshReport(currentFlows);
        }
    };

    xhr.send();
}

function init() {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 3000;
    xhr.responseType = "text";
    xhr.open("GET", "https://ide2-cn-beijing.data.aliyun.com/header/user/history?appId=&projectSelect=true&currentUrl=https%3A%2F%2Fide2-cn-beijing.data.aliyun.com%2F&");
    xhr.onload = function(e) { 
        if(this.status == 200 || this.status == 304){
            var projectData = JSON.parse(this.responseText);
            initProjectOptions(projectData.data.projectList);
        }
    };

    xhr.send();
}
init();


function initProjectOptions( projects) {
    
    $('#projectId').append("<option value=\"\">请选择项目空间</option>");
    for(var project of projects) {
        var optionText = project.projectName; 
        var optionValue = project.projectId + "_" + project.tenantId;

        $('#projectId').append("<option value=\"" + optionValue + "\">"  + optionText + "</option>");
    }

    $("select#projectId").change(function(){
        var selectedProject = $(this).children("option:selected").val();

        if(selectedProject !== "") {
            var ids = selectedProject.split("_");
            queryTasks(ids[0], ids[1]);
        } else {
            refreshReport([]);
        }
    });
}

function showReport() {
  $("#jqGrid").jqGrid({

    datatype: "local",
    data: currentFlows,
    //   url: 'mock_data.js',
    //   datatype: "json",
      colModel: [
          {label: '流程', name: 'flowName', index: "flowName", sortable: true, width: 40, key: true},
          {label: '流程创建时间', name: 'flowCreateTime', index: "flowCreateTime", sortable: true, width: 20},
          {label: '节点Owner', name: 'taskOwner', width: 12},
          {label: '节点类型', name: 'taskType', width: 12, sortable: true, formatter: getTaskTypeName},
          {label: '节点ID', name: 'taskId',    width: 18, sortable: true, formatter: getTaskId},
          {label: '节点名称', name: 'taskName', sortable: false, width: 33},
          {label: '节点更新时间', name: 'taskUpdateTime', sortable: true, width: 20}
      ],
      viewrecords: true,
      height: 385,
      rowNum: 500,
      rowList: [500, 600, 800],
      rownumbers: true,
      rownumWidth: 25,
      autowidth: true,
      //multiselect: true,
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
}

function refreshReport(data) {
  currentFlows = data;
  $("#jqGrid").jqGrid('clearGridData')
  .jqGrid('setGridParam', { data: currentFlows, datatype:'local' })
  .trigger('reloadGrid', [{ page: 1}]);
}

// var vm = new Vue({
//   el: '#rrapp',
//   data: {
//       q: {
//           projectId: null
//       },
//       showList: true,
//       title: null,
//       projectOptions: {
//           "test": 1
//       },
//       projects:[],
//       error: false,
//       errorMsg: null,
//       alerts: []
//   },
//   methods: {
//       query: function () {
//           console.info("query " + JSON.stringify(vm.q));
//           if (this.validate(vm.q, searchValidator)) {
//               this.reload();
//           }
//       },
//       add: function () {
//           vm.showList = false;
//           vm.title = "新增";

//           this.resetSearchForm();
//       },
//       saveOrUpdate: function () {
//           if (!this.validate(vm.task, createValidator)) {
//               return;
//           }
//           var url = "crawler/task/create";
//           $.ajax({
//               type: "POST",
//               url: baseURL + url,
//               contentType: "application/json",
//               data: JSON.stringify(vm.task),
//               success: function (r) {
//                   if (r.code === '200') {
//                       alert('操作成功', function () {
//                           vm.reload();
//                       });
//                   } else {
//                       alert(r.message);
//                   }
//               },
//               error: function (r) {
//                   console.error(r);
//                   alert(r.message);
//               }
//           });
//       },
//       resetSearchForm : function () {

//           vm.errorMsg = null;
//           vm.error = false;
//           for (const [key, value] of Object.entries(vm.q)) {
//               vm.q[key] = "";
//           }

//           return this.validate(vm.q, searchValidator) ;
//       },
//       resetSearch : function () {
//           if (this.resetSearchForm()) {
//               this.reload();
//           }
//       },
//       validate: function (data, checker) {
//           vm.error = false;
//           vm.alerts = [];

//           for (const [key, value] of Object.entries(data)) {
//               checker.setValue(key, value);
//           }

//           checker.validateAll();

//           if(checker.errors.length > 0) {
//               vm.error = true;
//               for(var i=0; i<checker.errors.length; i++) {
//                   var err = checker.errors[i];
//                   vm.alerts.push({name: err.name, message: err.message});
//               }
//           }
//           return !vm.error;
//       },
//       gencmd: function () {

//           var idList = "";
//           var grid = $("#jqGrid");
//           var selIds = $("#jqGrid").jqGrid('getGridParam', 'selarrrow');   // selected ids
//           console.debug(selIds);

//           var strIdList = JSON.stringify(selIds).replace(/\"/g,"");

//           $.ajax({
//               type: "post",
//               url: baseURL + 'crawler/task/gen',
//               contentType: "application/json",
//               data: strIdList,
//               success: function (r) {
//                   if (r.code === '200') {
//                       alert("发送成功! 任务ID列表为：" + strIdList);
//                       console.info('操作成功');
//                   } else {
//                       alert("发送出错:" + r.message);
//                       console.error(r.message);
//                   }
//               },
//               error: function (d) {
//                   alert('error');
//               }
//           });
//       },
//       reload: function () {
//           vm.showList = true;
//           var page = $("#jqGrid").jqGrid('getGridParam', 'page');
//           $("#jqGrid").jqGrid('setGridParam', {
//               postData: vm.q,
//               page: page
//           }).trigger("reloadGrid");
//           this.resize();
//       },
//       resize: function () {
//         $('.ui-jqgrid-bdiv').height($(window).height() - $(".grid-btn").height() - 100);
//       },
//       cancel: function () {

//           vm.error = false;
//           vm.errorMsg = "";
//           this.reload();
//       },
//       checkSearch(event) {
//           this.check(event, searchValidator);
//       },
//       checkCreation(event) {
//           this.check(event, createValidator);
//       },
//       check(event, checker) {
//           checker.setValue(event.target.name, event.target.value);
//           checker.validate(event.target.name, event.target.value);

//           vm.error = false;
//           vm.alerts = [];
//           if(checker.errors.length > 0) {
//               vm.error = true;
//               for(var i=0; i<checker.errors.length; i++) {
//                   var err = checker.errors[i];
//                   vm.alerts.push({name: err.name, message: err.message});
//               }
//           }
//       }
//   }
// });

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

function getTaskTypeName(value, options, row) {

    var enumTaskType = {
        "99":"虚拟节点",
        "10":"ODPSSQL",
        "23":"集成节点",
        "1000015":"ADBSQL",
        "6":"Shell",
        "221":"Python",
        "1010":"SQL组件节点",
        "24":"ODPSscript",
        "1101":"分支节点",
        "1100":"赋值节点",
        "1000017":"ADBPostgreSQL",
        "1002":"机器学习PAI",
        "1089":"跨租户节点",
        "225":"ODPSSpark"
    };
    var result = '<span class="label label-unkown">未知状态</span>';

    for (var key in enumTaskType) {
        if (parseInt(value) === parseInt(key)) {
            result = '<span class="label label-init">' + enumTaskType[key] + '</span>';
            break;
        } 
    }
    return result;
}

function getTaskId(value, options, row) {
    var result = '<span style="color:yellow">未提交</span>';
    if (value !== undefined && value !== "") {   
        result = '<span class="label label-init">' + value + '</span>';
    }
    return result;
}
