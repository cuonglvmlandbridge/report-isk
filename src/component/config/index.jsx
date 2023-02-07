import React from 'react';
import { Button, Form, Input } from 'antd';

import styles from './styles.module.css'

export default function ConfigApp(props) {

  const [form] = Form.useForm();

  const onFinish = (payload) => {
    kintone.plugin.app.setConfig({
      data: JSON.stringify(payload)
    });
  }

  React.useEffect(() => {
    const data = JSON.parse(props.dataConfig);
    form.setFieldsValue({
      client_id: data.client_id,
      client_secret: data.client_secret
    })
  }, [props.dataConfig, form])

  return (
      <div className={styles.formConfig}>
        <h3>
          Config BI
        </h3>
        <Form
            name="wrap"
            labelCol={{ flex: '110px' }}
            labelAlign="left"
            labelWrap
            form={form}
            wrapperCol={{ flex: 2 }}
            colon={false}
            onFinish={onFinish}
        >
          <div className={styles.block}>
            <Form.Item label="Client ID" name="client_id" rules={[{ required: true }]}>
              <Input/>
            </Form.Item>

            <Form.Item label="Client Secret" name="client_secret" rules={[{ required: true }]}>
              <Input/>
            </Form.Item>
          </div>

          <Form.Item label=" ">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
  )
}