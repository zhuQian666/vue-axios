/*jshint esversion: 6 */
import fetch from "../fetch";
import {
  configs
} from '../const'
export const login = (data) => {
  return fetch({
    url: configs.baseUrl + '/admin/do_login',
    method: 'POST',
    data: data
  });
};
