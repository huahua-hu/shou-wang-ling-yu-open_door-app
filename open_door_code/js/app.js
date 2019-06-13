/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	owner.requestUrl = function(success, user, pwd){
		var url = "https://api.lookdoor.cn/func/hjapp/user/v1/login.json"
		var stateInfo = owner.getState()
		var userA = stateInfo.account || user || "";
		var pwdA = stateInfo.pwd || pwd || "";
		var params = {
			"pNn": userA,
			"newDeviceId": "863127037562409",
			"equipmentFlag":   "2",
			"pWd": pwdA,
			"deviceId": "863127037562409",
			"userNum": userA,
		}
		var error = function(xhr,type,errorThrown){
			//异常处理；
			// console.log(type);
			if (type=="timeout"){
				plus.nativeUI.toast("连接超时,请保证网络通畅");
			}else{
				plus.nativeUI.toast("请检查网络连接");
			};
		}
		var mask=mui.createMask();//遮罩层
		mui.ajax(url,{
			data:params,
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:5000,//超时时间设置为5秒；
			success:success,
			error: error,
			beforeSend: function() {
				plus.nativeUI.showWaiting("正在登陆..","div")
				mask.show();//显示遮罩层
			},
			complete: function() {
				plus.nativeUI.closeWaiting();
				mask.close();//关闭遮罩层
			},
		});
		// console.log(JSON.stringify(data))
		// $.post(url, data, success, "json");
		
	}
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if (loginInfo.account.length < 5) {
			return callback('账号最短为 5 个字符');
		}
		if (loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}
		var user = loginInfo.account;
		if (loginInfo.password.length < 32){
			var pwd = md5(loginInfo.password);
		}else{
			var pwd = loginInfo.password;
		}
		var users = JSON.parse(localStorage.getItem('$users') || '[]');
		var authed = users.some(function(user) {
			return loginInfo.account == user.account && loginInfo.password == user.password;
		});
		
		var success = function(response) {
			var result = JSON.stringify(response)
			if (response.code.toString() == "200"){
				return owner.createState(user, pwd,response.data.id, callback);
			}else{
				return callback(response.message);
			}
		};
		owner.requestUrl(success,user, pwd)
		// $.post(url, data, success, "json");
// 		var loginStatus = owner.requestUrl(user, pwd);
// 		console.log(loginStatus);
// 		if (loginStatus){
// 			return owner.createState(user, callback);
// 		}else{
// 			return callback('服务器连接异常请重试');
// 		}
		// return owner.createState(user, callback);
// 		if (authed) {
// 			return owner.createState(loginInfo.account, callback);
// 		} else {
// 			return owner.createState(loginInfo.account, callback);
// 			// return callback('用户名或密码错误');
// 		}
	};

	owner.createState = function(name,pwd, id, callback) {
		var state = owner.getState();
		state.account = name;
		state.pwd = pwd;
		state.token = id;
		owner.setState(state);
		return callback();
	};


	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		// console.log(stateText)
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		var settings = owner.getSettings();
		settings.gestures = '';
		owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
		
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
			var settingsText = localStorage.getItem('$settings') || "{}";
			return JSON.parse(settingsText);
		}
}(mui, window.app = {
}));