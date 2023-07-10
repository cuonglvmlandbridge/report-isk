// eslint-disable-next-line no-unused-vars
import React from 'react';
import Cookie from 'js-cookie';
import {Button} from 'antd';
import styles from './styles.module.css';
import {
  ID_APP_CUSTOMER,
  ID_APP_CUSTOMER_COME,
  URL_WEB,
  ID_APP_STAFF,
  ID_APP_REPORT,
  ID_APP_REGISTER,
  ID_APP_AUTH,
  ID_APP_TIPS, ID_APP_SEAT,
   ID_APP_SALARY, 
  ID_APP_SETTING,
  ID_APP_CONFIG_SETTING,
  ID_WAREHOUSE,
  ID_APP_RANK
} from '../../common/const';
import {logout} from '../../../utils/common';

export default function MainLayout({children, isAdmin}) {

  const buttonMenu = [
    {
      id: 1,
      text: '来店登録',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_CUSTOMER_COME}/edit`
    },
    {
      id: 3,
      text: '来店登録一覧',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_CUSTOMER_COME}/`
    },
    {
      id: 4,
      text: '顧客一覧',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_CUSTOMER}/`
    },
    {
      id: 5,
      text: '勤怠一覧',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_REGISTER}/`
    },
    {
      id: 6,
      text: '日報一覧',
      active: true,
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_REPORT}/`
    },
    {
      id: 7,
      text: 'インセンティブ集計一覧',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_TIPS}/`
    },
    {
      id: 8,
      text: '従業員マスタ',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_STAFF}/`
    },
    {
      id: 11,
      text: '給与計算',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_SALARY}/`
    },
    {
      id: 9,
      text: 'ログアウト',
      onclick: () => logout()
    },
  ];
  const buttonMenuAdmin = [
    {
      id: 1,
      text: '来店登録',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_CUSTOMER_COME}/edit`
    },
    {
      id: 3,
      text: '来店登録一覧',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_CUSTOMER_COME}/`
    },
    {
      id: 4,
      text: '顧客一覧',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_CUSTOMER}/`
    },
    {
      id: 10,
      text: '座席マスタ',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_SEAT}/`
    },
    {
      id: 5,
      text: '勤怠一覧',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_REGISTER}/`
    },
    {
      id: 6,
      text: '日報一覧',
      active: true,
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_REPORT}/`
    },
    {
      id: 7,
      text: 'インセンティブ集計一覧',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_TIPS}/`
    },
    {
      id: 8,
      text: '従業員マスタ',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_STAFF}/`
    },
    {
      id: 11,
      text: '給与計算',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_SALARY}/`
    },
    {
      id: 12,
      text: '大入り・小入り',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_SETTING}/`
    },
    {
      id: 13,
      text: 'ランク設定',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_RANK}/`
    },
    {
      id: 14,
      text: '損益目標設定',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_CONFIG_SETTING}/`
    },
    {
      id: 15,
      text: '在庫管理',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_WAREHOUSE}/`
    },
    {
      id: 9,
      text: 'ログアウト',
      onclick: () => logout()
    },
  ];

  return (
    <div className={styles.mainApp}>
      <div className={styles.menu}>
        {
          (isAdmin ? buttonMenuAdmin : buttonMenu).map((val) => (
            <div className={`${styles.menuItem} ${val?.active && styles.active}`} key={val.id}>
              <Button
                type="primary"
                onClick={val.onclick}
              >
                {val.text}
              </Button>
            </div>
          ))
        }
      </div>

      {children}
    </div>
  );
}