import React, {useState} from 'react';
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
  ID_APP_TIPS, ID_APP_SEAT, ID_APP_SALARY, ID_APP_SETTING, ID_APP_RANK
} from '../../common/const';
import { MenuOutlined } from '@ant-design/icons';
import {logout} from '../../../utils/common';

const userISK = Cookie.get('userISK');
const nameUserLogin = Cookie.get('nameUserLogin');

export default function MainLayout({children, isAdmin, isMobile}) {

  const [showNavbar, setShowNavbar] = useState(false)

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
      id: 10,
      text: '座席マスタ',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_SEAT}/`
    },
    {
      id: 13,
      text: 'ランク設定',
      onclick: () => window.location.href = `${URL_WEB}/k/${ID_APP_RANK}/`
    },
    {
      id: 9,
      text: 'ログアウト',
      onclick: () => logout()
    },
  ];

  const handleClickNavbar = () => {
    setShowNavbar(!showNavbar)
    document.body.style.overflow = !showNavbar ? 'hidden' : ''
    document.body.style.height = !showNavbar ? 'auto' : '100%'
  }

  return (
    <div className={styles.mainApp}>
      <div className={`${isMobile ? styles.menuMobile : styles.menu}`}>
        {
          !isMobile && (isAdmin ? buttonMenuAdmin : buttonMenu).map((val) => (
            <div className={`${styles.menuItem} ${val.active && styles.active}`} key={val.id}>
              <Button
                onClick={val.onclick}
              >
                {val.text}
              </Button>
            </div>
          ))
        }
        {
          isMobile && (
            <div className={styles.menu}>
              <div className={styles.hamburgerMenu}>
                <MenuOutlined style={{ fontSize: '25px', color: '#fff', marginBottom: '15px' }} onClick={handleClickNavbar} />
                <div className={`${styles.overlay} ${showNavbar ? styles.active : ''}`} onClick={handleClickNavbar}> </div>
                <div className={`${styles.menus} ${showNavbar ? styles.active : ''}`}>
                  {
                    (isAdmin ? buttonMenuAdmin : buttonMenu).map(val => (
                      <div
                        className={`${styles.menuItem}
                       ${val.active && styles.active}`}
                        key={val.id}
                        onClick={val.onclick}
                      >
                        {val.text}
                      </div>
                    ))
                  }
                </div>
              </div>

              <div>
                {nameUserLogin} ({userISK})
              </div>
            </div>
          )
        }
      </div>

      {!showNavbar && children}
    </div>
  );
}