// eslint-disable-next-line no-unused-vars
import React, {useEffect, useRef, useState} from 'react';
import MainLayout from '../../layout/main';
import styles from './styles.module.css';
import {Button, message} from 'antd';
import {ArrowLeftOutlined} from '@ant-design/icons';
import {formatMoney} from '../../../utils/common';
import CardComponent from '../common/card/CardComponent';

const idApp = kintone.app.getId();

const fetchFileKey = (fileKey, setFileList) => {
  let url = `${window.location.origin}/k/v1/file.json?fileKey=` + fileKey;
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.responseType = 'blob';
  xhr.onload = function() {
    if (xhr.status === 200) {
      // success

      let reader = new FileReader();

      reader.readAsDataURL(xhr.response);
      reader.onloadend = function() {
        let base64data = reader.result;
        setFileList(base64data);
        return;
      };
    } else {
      // error
      console.log(xhr.responseText);
    }
  };
  xhr.send();
};

export default function Detail({record, isAdmin}) {

  const [imgBill, setImgBill] = useState();
  const [imgReceipt, setImgReceipt] = useState();
  const refCopy = useRef();

  const onPreview = (file) => {
    let pdfWindow = window.open("")
    pdfWindow.document.write("<iframe width='100%' height='100%' src='" + encodeURI(file) + "'></iframe>")
  }

  const data = [
    {
      id: 1,
      text: '日付',
      value: record.date.value
    },
    {
      id: 2,
      text: '総売上',
      value: formatMoney(record.total_revenue.value)
    },
    {
      id: 3,
      text: '経費',
      value: formatMoney(record.expenses.value)
    },
    {
      id: 4,
      text: '人件費',
      value: formatMoney(record.revenue_staff.value)
    }
  ];

  const dataAfter = [
    {
      id: 1,
      text: '今日のコメント',
      value: record.comment.value
    },
    {
      id: 2,
      text: '担当者',
      value: record.user_charge.value
    },
  ];

  useEffect(() => {
    if (record?.bill?.value?.length) {
      fetchFileKey(record?.bill?.value[0].fileKey, setImgBill);
    }

    if (record?.receipt?.value?.length) {
      fetchFileKey(record?.receipt?.value[0].fileKey, setImgReceipt);
    }
  }, [record]);

  return (
    <MainLayout isAdmin={isAdmin}>
      <CardComponent
        title={'日報詳細'}
        btnLeft={'戻る'}
        onClickLeft={() => window.location.href = `${window.location.origin}/k/${idApp}`}
      >
        <div className={'mainAppCustom'}>
          <div className={styles.detail} ref={refCopy}>
            {
              data.map((val) => {
                return (
                  <div className={styles.item} key={val.id}>
                  <span>
                    {val.text}
                  </span>
                    <span>
                    {val.value}
                  </span>
                  </div>
                );
              })
            }
            {
              imgBill &&
              <div className={styles.item}>
              <span>
                伝票
              </span>
                <span>
                <img src={imgBill} alt="" width={150} onClick={() => onPreview(imgBill)}/>
              </span>
              </div>
            }
            {
              imgReceipt &&
              <div className={styles.item}>
              <span>
                レシート
              </span>
                <span>
                <img src={imgReceipt} alt="" width={150} onClick={() => onPreview(imgReceipt)}/>
              </span>
              </div>
            }

            {
              dataAfter.map((val) => {
                return (
                  <div className={styles.item} key={val.id}>
                  <span>
                    {val.text}
                  </span>
                    <span>
                    {val.value}
                  </span>
                  </div>
                );
              })
            }
          </div >

          <div className={styles.btnCopy}>
            <Button type={'primary'} onClick={() => {
              let text = `日付: ${record.date.value}\n総売上: ${formatMoney(record.total_revenue.value)}\n経費: ${formatMoney(record.expenses.value)}\n人件費: ${formatMoney(record.revenue_staff.value)}\n今日のコメント: ${record.comment.value}\n担当者: ${record.user_charge.value}`
              navigator.clipboard.writeText(text);
              message.success('コピーできました。!')
            }}>
              クリップボードにコピー
            </Button>
          </div>
        </div>
      </CardComponent>
    </MainLayout>
  );
}