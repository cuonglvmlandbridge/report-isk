// eslint-disable-next-line no-unused-vars
import React from "react";
import { Form, Input, InputNumber, Space } from "antd";
import { MinusCircleTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import styles from "./../styles.module.css";

export default function BrokenGlass() {
  return (
    <Form.List name="brokenGlass">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Space key={key} align="center" style={{ position: "relative" }}>
              <Form.Item
                {...restField}
                name={[name, "name"]}
                rules={[
                  {
                    required: true,
                    message: "割れたグラス入力してください！",
                  },
                ]}
              >
                <Input style={{ width: 250 }} placeholder="ボトルネーム・保管場所 " />
              </Form.Item>
              <Form.Item {...restField} name={[name, "quantity"]}>
                <InputNumber
                  style={{ width: 150 }}
                  addonAfter="個"
                  placeholder="個"
                  min="1"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
              <MinusCircleTwoTone
                className={styles.iconStyle}
                style={{ position: "absolute", top: "-24px" }}
                onClick={() => remove(name)}
              />
            </Space>
          ))}
          <Form.Item>
            <PlusCircleTwoTone
              onClick={() => add()}
              className={styles.iconStyle}
            />
          </Form.Item>
        </>
      )}
    </Form.List>
  );
}
