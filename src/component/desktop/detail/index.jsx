// eslint-disable-next-line no-unused-vars
import React, {useEffect, useRef, useState} from 'react';
import MainLayout from '../../layout/main';
import styles from './styles.module.css';
import {Button, message} from 'antd';
import {ArrowLeftOutlined} from '@ant-design/icons';
import {formatMoney} from '../../../utils/common';
import CardComponent from '../common/card/CardComponent';

const idApp = kintone.app.getId() || kintone.mobile.app.getId();

const fetchFileKey = (data, setFileList, fileList, index) => {
  let url = `${window.location.origin}/k/v1/file.json?fileKey=` + data[index].fileKey;
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
        let newFileList = [...fileList, base64data]

        setFileList(newFileList);

        if(data.length > index + 1) {
          fetchFileKey(data, setFileList, newFileList, index + 1)
        }
        return;
      };
    } else {
      // error
    }
  };
  xhr.send();
};

export default function Detail({record, isAdmin, isMobile}) {

  const [imgBill, setImgBill] = useState([]);
  const [imgReceipt, setImgReceipt] = useState([]);
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
      id: 4,
      text: '人件費',
      value: formatMoney(record.revenue_staff.value)
    },
    {
      id: 3,
      text: '経費',
      value: formatMoney(record.expenses.value)
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
      fetchFileKey(record?.bill?.value, setImgBill, imgBill, 0)
    }

    if (record?.receipt?.value?.length) {
      fetchFileKey(record?.receipt?.value, setImgReceipt, imgReceipt, 0)
    }
  }, [record]);

  return (
    <MainLayout isAdmin={isAdmin} isMobile={isMobile}>
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
              imgBill.length > 0 &&
              <div className={`${styles.item} ${styles.itemImg}`}>
              <span>
                伝票:
              </span>
                <div>
                  {
                    imgBill.map((val, ind) => (
                      <span key={ind}>
                      <img src={val} alt="" width={150} onClick={() => onPreview(val)}/>
                    </span>
                    ))
                  }
                </div>
              </div>
            }
            {
              imgReceipt.length > 0 &&
              <div className={`${styles.item} ${styles.itemImg}`}>
              <span>
                レシート:
              </span>
                <div>
                  {
                    imgReceipt.map((val, ind) => (
                      <span key={ind}>
                      <img src={val} alt="" width={150} onClick={() => onPreview(val)}/>
                    </span>
                    ))
                  }
                </div>
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