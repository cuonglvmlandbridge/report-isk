// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo, useState } from 'react';
import {Form, Input, Row, Col, Button, Select, DatePicker, Tabs} from 'antd';
import {fetchAllRecordsCustomer} from '../../../../utils/common'

import styles from './styles.module.css';
import {ID_APP_CUSTOMER} from '../../../common/const';

export default function FilterList({onFinish, fields}) {

  const [form] = Form.useForm();

  const [tabActive, setTabActive] = useState('1');

  const tabs = [
    {
      id: '1',
      label: '日別'
    },
    {
      id: '2',
      label: '月別'
    },
    {
      id: '3',
      label: '年別'
    }
  ];

  const onChange = (key) => {
    form.resetFields()
    setTabActive(key)
  };

  const renderModalContentDetail = (data) => {
    return (
      <Row gutter={50} className={styles.formItem}>
        {data.map((el, index2) => (
          <Col className="gutter-row" span={8} key={`${el?.formItemProps?.name}-${index2}`}>
            <Form.Item {...el.formItemProps}>
              {el.renderInput()}
            </Form.Item>
          </Col>
        ))}
        <Col className="gutter-row" span={6}>
          <Button htmlType={'submit'} type={'primary'}>
            検索
          </Button>
        </Col>
      </Row>
    );
  };

  const renderModalContent = () => {
    const generalInformationInput = [
      {
        formItemProps: {
          label: '日付検索',
          name: 'date',
          labelAlign: 'left',
        },
        renderInput: () => <DatePicker allowClear placeholder={''} />,
      },
    ];
    const generalInformationInputMonth = [
      {
        formItemProps: {
          label: '月付検索',
          name: 'month',
          labelAlign: 'left',
        },
        renderInput: () => <Select
          style={{width: 250}}
          options={Array.from({ length: 12 }, (v, i) => ({
            label: `${i + 1}月`,
            value: i + 1
          }))}
        />
      },
    ];
    const generalInformationInputYear = [
      {
        formItemProps: {
          label: '年付検索',
          name: 'year',
          labelAlign: 'left',
        },
        renderInput: () => <DatePicker picker="year" allowClear placeholder={''} />,
      },
    ];
    return (
      <div className={styles.formFilter}>
        <Form form={form}  autoComplete="off" onFinish={onSubmitForm}>
          {renderModalContentDetail(tabActive === '1' ? generalInformationInput : tabActive === '2' ? generalInformationInputMonth : generalInformationInputYear)}
        </Form>
      </div>
    );
  };

  const onSubmitForm = (payload) => {
    onFinish && onFinish(payload)
  }

  return (
    <div>
      <div>
        <Tabs
          type="card"
          activeKey={tabActive}
          onChange={onChange}
          items={tabs.map((val, i) => {
            return {
              label: val.label,
              key: val.id,
            };
          })}
        />
      </div>
      {renderModalContent()}
    </div>
  )
}