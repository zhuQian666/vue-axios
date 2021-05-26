/*jshint esversion: 6 */
import axios from "axios";
import router from "../router/index";
import {
  configs
} from "./const";

function fetch(options) {
  return new Promise((resolve, reject) => {
    //创建axios实例   
    const instance = axios.create({
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    //请求拦截
    instance.interceptors.request.use(config => {
      //是否登录
      const tokenVal = localStorage.getItem('Token');
      if (!!tokenVal) {
        config.headers['Authorization'] = 'Bearer ' + tokenVal;
      }
      return config;
    }, error => {
      // 请求错误时
      console.log('request:', error);
      // 1. 判断请求超时
      if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
        console.log('timeout请求超时');
      }
      return Promise.reject(error);
    });
    //相应拦截
    instance.interceptors.response.use((response) => {
      //请求成功
      if (response.status === 200) {
        if (response.data.code === configs.ExpiredToken) {
          localStorage.removeItem('Token');
          router.replace({
            path: '/Login',
            query: {
              redirect: router.currentRoute.fullPath
            }
          });
        } else {
          return response.data;
        }

      } else {
        //token过期
        //  if(response.data.code === configs.ExpiredToken){
        //     localStorage.removeItem('Token');
        //     router.replace({
        //       path: '/Login',
        //       query: {
        //         redirect: router.currentRoute.fullPath
        //       }
        //     });
        //  }else{
        reject(response.message);
      }
      // }
    }, err => {
      if (err && err.response) {
        switch (err.response.status) {
          case 400:
            err.message = '请求错误'
            break;
          case 401:
            err.message = '未授权，请登录'
            break;
          case 403:
            err.message = '拒绝访问'
            break;
          case 404:
            err.message = `请求地址出错: ${err.response.config.url}`
            break;
          case 408:
            err.message = '请求超时'
            break;
          case 500:
            err.message = '服务器内部错误'
            break;
          case 501:
            err.message = '服务未实现'
            break;
          case 502:
            err.message = '网关错误'
            break;
          case 503:
            err.message = '服务不可用'
            break;
          case 504:
            err.message = '网关超时'
            break;
          case 505:
            err.message = 'HTTP版本不受支持'
            break;
          default:
        }
      }
      console.log(err.message)
      return Promise.reject(err) // 返回接口返回的错误信息
    });
    instance(options).then(res => {
      resolve(res);
    }).catch(error => {
      reject(error);
    });
  });
}

export default fetch;
