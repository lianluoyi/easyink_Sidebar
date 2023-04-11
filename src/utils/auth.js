/*
 * @Description: 授权token
 * @Author: broccoli
 * @LastEditors: wJiaaa
 */

import Cookies from 'js-cookie';
import { isLock } from '@/utils/index';
const TokenKey = 'Admin-Token';

export function getToken() {
  return Cookies.get(TokenKey) || sessionStorage.getItem(TokenKey);
}

export function setToken(token) {
  if (isLock()) {
    sessionStorage.setItem(TokenKey, token);
  }
  return Cookies.set(TokenKey, token);
}

export function removeToken() {
  return Cookies.remove(TokenKey);
}
