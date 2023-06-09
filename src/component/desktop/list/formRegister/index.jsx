// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from 'react';
import {Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Upload} from 'antd';
import {ArrowLeftOutlined, SaveOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
import {fetchAllRecordsCustomer} from '../../../../utils/common';
import {addRecord, updateRecord} from '../../../../api/list';
import MainLayout from '../../../layout/main';
import {ID_APP_CUSTOMER_COME, ID_APP_REGISTER, ID_APP_STAFF} from '../../../common/const';

import styles from './styles.module.css';
import CardComponent from '../../common/card/CardComponent';

const {TextArea} = Input;

const idStaffApp = '6';

const FORMAT_DATE_TIME = 'YYYY/MM/DD';

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
        setFileList([
          {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: base64data,
          },
        ]);
        return;
      };
    } else {
      // error
      console.log(xhr.responseText);
    }
  };
  xhr.send();
};

function fetchAllRecordsByDate(appId, time_start, opt_offset, opt_limit, opt_records) {
  let offset = opt_offset || 0;
  let limit = opt_limit || 100;
  let allRecords = opt_records || [];
  let params = {
    app: appId,
    query: `time_start like "${time_start}" limit ${limit} offset ${offset}`,
  };
  return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
    allRecords = allRecords.concat(resp.records);
    if (resp.records.length === limit) {
      return fetchAllRecordsByDate(appId, offset + limit, limit, allRecords);
    }
    return allRecords;
  });
}

function fetchAllStaffByDate(appId, date, opt_offset, opt_limit, opt_records) {
  let offset = opt_offset || 0;
  let limit = opt_limit || 100;
  let allRecords = opt_records || [];
  let params = {
    app: appId,
    query: `date = "${date}" limit ${limit} offset ${offset}`,
    fields: ['id_staff', 'time_in', 'time_out']
  };
  return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
    allRecords = allRecords.concat(resp.records);
    if (resp.records.length === limit) {
      return fetchAllStaffByDate(appId, offset + limit, limit, allRecords);
    }
    return allRecords;
  });
}

function fetchAllRecordsStaff(idsString, opt_offset, opt_limit, opt_records) {
  let offset = opt_offset || 0;
  let limit = opt_limit || 100;
  let allRecords = opt_records || [];
  let params = {
    'app': ID_APP_STAFF,
    'query': `$id in (${idsString}) limit ${limit} offset ${offset}`,
    'fields': ['salary', '$id', 'name']
  };
  return idsString?.length && kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
    allRecords = allRecords.concat(resp.records);
    if (resp.records.length === limit) {
      return fetchAllRecordsStaff(idsString, offset + limit, limit, allRecords);
    }
    return allRecords;
  });
}

export default function FormRegister({
  type,
  event,
  isAdmin
}) {

  const [form] = Form.useForm();
  const [staff, setStaff] = useState([]);

  const [fileKeyBill, setFileKeyBill] = useState();
  const [fileKeyReceipt, setFileKeyReceipt] = useState();
  const [fileListBill, setFileListBill] = useState([]);
  const [fileListReceipt, setFileListReceipt] = useState([]);

  const renderModalContentDetail = (data) => {
    return (
      <Row gutter={50} className={styles.formItem}>
        {data.map((el, index2) => (
          <Col className="gutter-row" span={24} key={`${el?.formItemProps?.name}-${index2}`}>
            <Form.Item {...el.formItemProps}>
              {el.renderInput()}
            </Form.Item>
          </Col>
        ))}
      </Row>
    );
  };

  function dataURLToBlob(dataURL) {
    let BASE64_MARKER = ';base64,';

    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      let parts = dataURL.split(',');
      let contentType = parts[0].split(':')[1];
      let raw = decodeURIComponent(parts[1]);

      return new Blob([raw], {type: contentType});
    }

    let parts = dataURL.split(BASE64_MARKER);
    let contentType = parts[0].split(':')[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;

    let uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
  }

  const handleChange = (value, type) => {
    if (type === 'bill') {
      setFileListBill(value.fileList);
    } else {
      setFileListReceipt(value.fileList);
    }

    fetch(value?.file?.thumbUrl)
      .then(res => {
        console.log(value?.file?.thumbUrl);
        return dataURLToBlob(value?.file?.thumbUrl);
      })
      .then(blob => {
        let formDataPayload = new FormData();
        formDataPayload.append('__REQUEST_TOKEN__', kintone.getRequestToken());
        formDataPayload.append('file', blob, 'preview.png');

        let url = `${window.location.origin}/k/v1/file.json`;
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onload = function() {
          if (xhr.status === 200) {
            // success
            const res = JSON.parse(xhr.responseText);
            if (type === 'bill') {
              setFileKeyBill(res?.fileKey);
            } else {
              setFileKeyReceipt(res?.fileKey);
            }
          } else {
            // error
            console.log(JSON.parse(xhr.responseText));
          }
        };
        xhr.send(formDataPayload);
      });
  };

  const dummyRequest = ({
    file,
    onSuccess
  }) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
  };

  const onFinish = (payload) => {

    let body = {
      'app': idApp,
      // 'id': event.record.$id.value,
      'record': {
        'date': {
          'value': dayjs(payload.date).format(FORMAT_DATE_TIME)
        },
        'month': {
          'value': dayjs(payload.date).month() + 1
        },
        'year': {
          'value': dayjs(payload.date).year()
        },
        'total_revenue': {
          'value': payload.total_revenue
        },
        'expenses': {
          'value': payload.expenses
        },
        'revenue_staff': {
          'value': payload.revenue_staff
        },
        'comment': {
          'value': payload.comment
        }
      }
    };

    if (payload.user_charge) {
      const staffInfo = JSON.parse(payload.user_charge);
      let newRecord = {
        ...body.record,
        'user_charge': {
          'value': staffInfo.name
        },
        'id_user_charge': {
          'value': staffInfo.id
        },
      };
      body.record = newRecord;
    }

    if (fileKeyBill) {
      let newRecord = {
        ...body.record,
        'bill': {
          'value': [
            {
              'fileKey': fileKeyBill
            }
          ]
        }
      };

      body.record = newRecord;
    }

    if (fileKeyReceipt) {
      let newRecord = {
        ...body.record,
        'receipt': {
          'value': [
            {
              'fileKey': fileKeyReceipt
            }
          ]
        }
      };

      body.record = newRecord;
    }

    if(type === 'edit') {
      body.id = event.record.$id.value;
      updateRecord(body, () => window.location.href = window.location.origin + `/k/${idApp}` )
    }
    else {
      addRecord(body, () => window.location.href = window.location.origin + `/k/${idApp}`);
    }
  };

  const onPreview = (file) => {
    let pdfWindow = window.open('');
    pdfWindow.document.write('<iframe width=\'100%\' height=\'100%\' src=\'' + encodeURI(file?.url) + '\'></iframe>');
  };

  const convertTimeDiff =  (time1, time2) => {
    if (time1 && time2) {
      const dateExp1 = dayjs(`2000-01-01 ${time1}`);
      let dateExp2 = dayjs(`2000-01-01 ${time2}`);
      dateExp2 = dateExp1.diff(dateExp2) > 0 ? dayjs(dayjs(dateExp2).add(1, 'day')) : dateExp2;
      const timeDiff = dateExp2.diff(dateExp1);
      return timeDiff / 1000;
    } 
    return 0;
  }

  const onValuesChange = async (payload, data) => {
    if (payload.date) {
      let date = dayjs(payload.date).format(FORMAT_DATE_TIME);
      const [customerComes, staffs] = await Promise.all([
        await fetchAllRecordsByDate(ID_APP_CUSTOMER_COME, date),
        await fetchAllStaffByDate(ID_APP_REGISTER, date)
      ])
      const total = customerComes.map(val => +val.revenue.value).reduce((a, b) => a + b, 0);
      const staffIds = staffs.map(val => val.id_staff.value)
      const infoStaffs = await fetchAllRecordsStaff(staffIds.join(', '))
      let fee = 0;
      if(infoStaffs) {
        const salarys = {};
        infoStaffs.forEach((val) => {
          Object.assign(salarys, {
            [val.$id.value]: val.salary.value
          })
        })
        staffs.forEach((val) => fee += salarys[val.id_staff.value] * convertTimeDiff(val.time_in.value, val.time_out.value) / 3600);
      }

      form.setFieldValue('revenue_staff', isNaN(fee) ? 0 : +fee.toFixed(0));
      form.setFieldValue('revenue_staff', isNaN(fee) ? 0 : fee.toFixed(0));
    }
  };

  const renderModalContent = () => {
    const registerEdit = [
      {
        formItemProps: {
          label: '来店日時',
          name: 'date',
          labelAlign: 'left',
          rules: [{
            required: true,
            message: 'Required'
          }]
        },
        renderInput: () =>
          <DatePicker
            format="YYYY/MM/DD"
            placeholder={''}
            disabledDate={(current) => {
              return current && current > dayjs().endOf('day');
            }}
          />,
      },
      {
        formItemProps: {
          label: '総売上',
          name: 'total_revenue',
          labelAlign: 'left',
          rules: [{
            required: true,
            message: 'Required'
          }]
        },
        renderInput: () => <InputNumber disabled min={1} addonAfter="円" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>,
      },
      {
        formItemProps: {
          label: '経費',
          name: 'expenses',
          labelAlign: 'left',
          rules: [{
            required: true,
            message: 'Required'
          }]
        },
        renderInput: () => <InputNumber min={1} addonAfter="円" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>,
      },
      {
        formItemProps: {
          label: '人件費',
          name: 'revenue_staff',
          labelAlign: 'left',
          rules: [{
            required: true,
            message: 'Required'
          }]
        },
        renderInput: () => <InputNumber min={1} disabled addonAfter="円" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>,
      },
      {
        formItemProps: {
          label: '伝票',
          name: 'bill',
          labelAlign: 'left',
        },
        renderInput: () => <Upload
          listType="picture-card"
          maxCount={1}
          onChange={(file) => handleChange(file, 'bill')}
          customRequest={dummyRequest}
          fileList={fileListBill}
          onPreview={(file) => onPreview(file)}
        >
          画像を選択
        </Upload>,
      },
      {
        formItemProps: {
          label: 'レシート',
          name: 'receipt',
          labelAlign: 'left',
        },
        renderInput: () => <Upload
          listType="picture-card"
          maxCount={1}
          onChange={(file) => handleChange(file, 'reicept')}
          customRequest={dummyRequest}
          fileList={fileListReceipt}
          onPreview={(file) => onPreview(file)}
        >
          画像を選択
        </Upload>
      },
      {
        formItemProps: {
          label: '今日のコメント',
          name: 'comment',
          labelAlign: 'left',
        },
        renderInput: () => <TextArea rows={4} style={{width: '400px'}}/>,
      },
      {
        formItemProps: {
          label: '担当者',
          name: 'user_charge',
          labelAlign: 'left',
        },
        renderInput: () => <Select
          style={{width: 250}}
          options={staff}
        />,
      },
    ];

    return (
      <div className={styles.formRegister}>
        <Form form={form} autoComplete="off" onFinish={onFinish} onValuesChange={onValuesChange}>
          {renderModalContentDetail(registerEdit)}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {type === 'edit' ? '保存' : '登録'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  useEffect(() => {
    fetchAllRecordsCustomer(idStaffApp).then(function(records) {
      const data = records.map((val) => ({
        value: JSON.stringify({
          name: val.name.value,
          id: val.$id.value
        }),
        label: val.name.value
      }));
      setStaff(data);
    });
  }, []);

  useEffect(() => {
    if (type === 'edit') {
      const data = event.record;
      form.setFieldsValue({
        date: data?.date.value && dayjs(data?.date?.value),
        total_revenue: data?.total_revenue?.value,
        expenses: data?.expenses.value,
        comment: data?.comment.value,
        revenue_staff: data?.revenue_staff?.value,
        user_charge: data.user_charge.value && JSON.stringify({
          name: data.user_charge.value,
          id: data.id_user_charge.value
        })
      });

      data?.bill?.value?.length && fetchFileKey(data?.bill?.value[0].fileKey, setFileListBill);
      data?.receipt?.value?.length && fetchFileKey(data?.receipt?.value[0].fileKey, setFileListReceipt);
    }
  }, [event, type]);

  return (
    <MainLayout isAdmin={isAdmin}>
      <CardComponent
        title={type === 'edit' ? '日報編集' : '日報新規登録'}
        btnLeft={'戻る'}
        onClickLeft={() => window.location.href = `${window.location.origin}/k/${idApp}`}
      >
        <div className={'mainAppCustom'}>
          {renderModalContent()}
        </div>
      </CardComponent>
    </MainLayout>
  );
}