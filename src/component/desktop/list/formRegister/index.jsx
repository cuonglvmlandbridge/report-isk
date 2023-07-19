// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Upload,
} from "antd";
import dayjs from "dayjs";
import {
  fetchAllRecordsCustomer,
  FORMAT_DATE_TIME,
  convertTimeDiff,
  sumPropertyValues,
} from "../../../../utils/common";
import { addRecord, updateRecord } from "../../../../api/list";
import MainLayout from "../../../layout/main";
import {
  ID_APP_CUSTOMER_COME,
  ID_APP_REGISTER,
  ID_APP_STAFF,
  ID_APP_CONFIG_SETTING,
} from "../../../common/const";
import styles from "./styles.module.css";
import CardComponent from "../../common/card/CardComponent";
import BrokenGlass from "./borkenGlass";
import Purchase from "./purchase";

const { TextArea } = Input;

const idApp = kintone.app.getId();

const fetchFileKey = (fileKey, setFileList) => {
  let url = `${window.location.origin}/k/v1/file.json?fileKey=` + fileKey;
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.responseType = "blob";
  xhr.onload = function () {
    if (xhr.status === 200) {
      // success

      let reader = new FileReader();

      reader.readAsDataURL(xhr.response);
      reader.onloadend = function () {
        let base64data = reader.result;
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
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

async function fetchAllRecordsByDate(appId, time_start) {
  const startDate = new Date(time_start);
  let nextDate = new Date();
  nextDate.setDate(startDate.getDate() + 1);
  const nextDateFormat = nextDate.toISOString().slice(0, 10);
  let params = {
    app: appId,
    query: `time_start like "${time_start}"`,
  };
  let paramsNextDate = {
    app: appId,
    query: `time_start like "${nextDateFormat}"`,
  };
  let customeStartDate = await kintone.api("/k/v1/records", "GET", params);
  let customeNextDate = await kintone.api(
    "/k/v1/records",
    "GET",
    paramsNextDate
  );
  const filterStartDateCustomer = customeStartDate.records.filter(
    ({ time_start: time_start_customer }) => {
      return (
        new Date(time_start_customer.value) >= new Date(`${time_start} 06:00`)
      );
    }
  );
  const filterNextDateCustomer = customeNextDate.records.filter(
    ({ time_start: time_start_customer }) => {
      return (
        new Date(time_start_customer.value) <=
        new Date(`${nextDateFormat} 06:00`)
      );
    }
  );
  return [...filterStartDateCustomer, ...filterNextDateCustomer];
}

function fetchAllStaffByDate(appId, date, opt_offset, opt_limit, opt_records) {
  let offset = opt_offset || 0;
  let limit = opt_limit || 100;
  let allRecords = opt_records || [];
  let params = {
    app: appId,
    query: `date = "${date}" limit ${limit} offset ${offset}`,
    fields: ["id_staff", "time_in", "time_out"],
  };
  return kintone.api("/k/v1/records", "GET", params).then(function (resp) {
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
    app: ID_APP_STAFF,
    query: `$id in (${idsString}) limit ${limit} offset ${offset}`,
  };
  return (
    idsString?.length &&
    kintone.api("/k/v1/records", "GET", params).then(function (resp) {
      allRecords = allRecords.concat(resp.records);
      if (resp.records.length === limit) {
        return fetchAllRecordsStaff(
          idsString,
          offset + limit,
          limit,
          allRecords
        );
      }
      return allRecords;
    })
  );
}

function fetchReportByDate(appId, date) {
  let params = {
    app: appId,
    query: `date = "${date}"`,
  };
  return kintone.api("/k/v1/records", "GET", params).then(function (resp) {
    return resp.records.length > 0 ? resp.records[0] : {};
  });
}

function fetchConfigSetting() {
  const params = { app: ID_APP_CONFIG_SETTING };
  return kintone.api("/k/v1/records", "GET", params).then(function (resp) {
    return resp;
  });
}

export default function FormRegister({ type, event, isAdmin }) {
  const [form] = Form.useForm();
  // const [formBrokenGlass] = Form.useForm();
  // const [formPurchase] = Form.useForm();
  const [staff, setStaff] = useState([]);
  const [fileKeyBill, setFileKeyBill] = useState();
  const [fileKeyReceipt, setFileKeyReceipt] = useState();
  const [fileListBill, setFileListBill] = useState([]);
  const [fileListReceipt, setFileListReceipt] = useState([]);
  const [idReport, setIdReport] = useState(0);
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [variableCost, setVariableCost] = useState(0);

  const renderModalContentDetail = (data) => {
    return (
      <Row gutter={50} className={styles.formItem}>
        {data.map((el, index2) => (
          <Col
            className="gutter-row"
            span={24}
            key={`${el?.formItemProps?.name}-${index2}`}
          >
            <Form.Item {...el.formItemProps}>{el.renderInput()}</Form.Item>
          </Col>
        ))}
      </Row>
    );
  };

  function dataURLToBlob(dataURL) {
    let BASE64_MARKER = ";base64,";

    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      let parts = dataURL.split(",");
      let contentType = parts[0].split(":")[1];
      let raw = decodeURIComponent(parts[1]);

      return new Blob([raw], { type: contentType });
    }

    let parts = dataURL.split(BASE64_MARKER);
    let contentType = parts[0].split(":")[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;

    let uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }

  const handleChange = (value, type) => {
    if (type === "bill") {
      setFileListBill(value.fileList);
    } else {
      setFileListReceipt(value.fileList);
    }

    fetch(value?.file?.thumbUrl)
      .then((res) => {
        console.log(value?.file?.thumbUrl);
        return dataURLToBlob(value?.file?.thumbUrl);
      })
      .then((blob) => {
        let formDataPayload = new FormData();
        formDataPayload.append("__REQUEST_TOKEN__", kintone.getRequestToken());
        formDataPayload.append("file", blob, "preview.png");

        let url = `${window.location.origin}/k/v1/file.json`;
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.onload = function () {
          if (xhr.status === 200) {
            // success
            const res = JSON.parse(xhr.responseText);
            if (type === "bill") {
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

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const onFinish = async (payload) => {
    const rent = payload.rent || 0;
    const fixedCost = payload.fixed_cost || 0;
    const profit =
      parseFloat(payload.total_revenue) -
      parseFloat(payload.revenue_staff) -
      parseFloat(purchaseAmount) -
      parseFloat(rent) -
      parseFloat(fixedCost) -
      parseFloat(variableCost);

    let body = {
      app: idApp,
      record: {
        date: {
          value: dayjs(payload.date).format(FORMAT_DATE_TIME),
        },
        month: {
          value: dayjs(payload.date).month() + 1,
        },
        year: {
          value: dayjs(payload.date).year(),
        },
        total_revenue: {
          value: payload.total_revenue,
        },
        revenue_staff: {
          value: payload.revenue_staff,
        },
        purchase_amount: {
          value: purchaseAmount,
        },
        rent: {
          value: rent,
        },
        variable_cost: {
          value: variableCost,
        },
        fixed_cost: {
          value: fixedCost,
        },
        profit: {
          value: profit,
        },
        brokenGlass: {
          value: JSON.stringify(payload.brokenGlass),
        },
        purchaseList: {
          value: JSON.stringify(payload.purchaseList),
        },
      },
    };

    if (payload.user_charge) {
      const staffInfo = JSON.parse(payload.user_charge);
      let newRecord = {
        ...body.record,
        user_charge: {
          value: staffInfo.name,
        },
        id_user_charge: {
          value: staffInfo.id,
        },
      };
      body.record = newRecord;
    }

    if (fileKeyBill) {
      let newRecord = {
        ...body.record,
        bill: {
          value: [
            {
              fileKey: fileKeyBill,
            },
          ],
        },
      };

      body.record = newRecord;
    }

    if (fileKeyReceipt) {
      let newRecord = {
        ...body.record,
        receipt: {
          value: [
            {
              fileKey: fileKeyReceipt,
            },
          ],
        },
      };

      body.record = newRecord;
    }

    if (type === "edit" || idReport > 0) {
      const id = idReport > 0 ? idReport : event.record.$id.value;
      body.id = id;
      updateRecord(
        body,
        () => (window.location.href = window.location.origin + `/k/${idApp}`)
      );
    } else {
      addRecord(
        body,
        () => (window.location.href = window.location.origin + `/k/${idApp}`)
      );
    }
  };

  const onPreview = (file) => {
    let pdfWindow = window.open("");
    pdfWindow.document.write(
      "<iframe width='100%' height='100%' src='" +
        encodeURI(file?.url) +
        "'></iframe>"
    );
  };

  const onValuesChange = async (payload) => {
    if (payload.date) {
      let date = dayjs(payload.date).format(FORMAT_DATE_TIME);
      setTotalFormValue(date);
    }
  };

  const setTotalFormValue = async (date) => {
    const [customersCome, staffs, reports, configSetting] = await Promise.all([
      fetchAllRecordsByDate(ID_APP_CUSTOMER_COME, date),
      fetchAllStaffByDate(ID_APP_REGISTER, date),
      fetchReportByDate(idApp, date),
      fetchConfigSetting(),
    ]);

    const staffIds = staffs.map((val) => val.id_staff.value);
    const infoStaffs = await fetchAllRecordsStaff(staffIds.join(", "));
    let staffRevenue = 0;
    let totalTips = 0;
    let totalFeeTrip = 0;
    if (infoStaffs) {
      const salarys = {};
      infoStaffs.forEach((val) => {
        Object.assign(salarys, {
          [val.$id.value]: val.salary.value,
        });
        const customerSelected = customersCome.find(
          ({ id_staff_tip, check_tip }) => {
            return check_tip.value[0] && id_staff_tip.value === val.$id.value;
          }
        );
        const totalSales =
          parseInt(customerSelected?.cash_sales.value || 0) +
          parseInt(customerSelected?.card_sales.value || 0) +
          parseInt(customerSelected?.transfer_sales.value || 0);
        totalTips += totalSales * parseFloat(val.rate_tips.value / 100);
        totalFeeTrip += parseFloat(val.fee_trip.value);
      });

      staffs.forEach(
        (val) =>
          (staffRevenue +=
            (salarys[val.id_staff.value] *
              convertTimeDiff(val.time_in.value, val.time_out.value)) /
            3600)
      );
    }
    if (customersCome) {
      let customerComment = "";
      customersCome.forEach(({ comment, customer }) => {
        customerComment +=
          comment.value && `${customer.value} - ${comment.value}\n`;
      });
      const totalCashSales = sumPropertyValues(customersCome, "cash_sales");
      const totalCardSales = sumPropertyValues(customersCome, "card_sales");
      const totalTransferSales = sumPropertyValues(
        customersCome,
        "transfer_sales"
      );
      const totalCashAdvance = sumPropertyValues(customersCome, "cash_advance");
      const totalCardAdvance = sumPropertyValues(customersCome, "card_advance");
      const totalTransferAdvance = sumPropertyValues(
        customersCome,
        "transfer_advance"
      );
      const totalRevenue =
        parseInt(totalCardSales) +
        parseInt(totalCashSales) +
        parseInt(totalTransferSales);

      form.setFieldValue("comment", customerComment);
      form.setFieldValue("total_cash_sales", totalCashSales);
      form.setFieldValue("total_card_sales", totalCardSales);
      form.setFieldValue("total_transfer_sales", totalTransferSales);
      form.setFieldValue("total_cash_advance", totalCashAdvance);
      form.setFieldValue("total_card_advance", totalCardAdvance);
      form.setFieldValue("total_transfer_advance", totalTransferAdvance);
      form.setFieldValue("total_revenue", totalRevenue);

      let purchaseAmount = 0;
      let rent = 0;
      let fixedCost = 0;
      let variableCost = 0;
      if (configSetting.records.length > 0) {
        const firstConfigSetting = configSetting.records[0];
        purchaseAmount =
          totalRevenue *
          (firstConfigSetting.sales_estimated_percent_by_day.value / 100);
        rent = firstConfigSetting.rent_per_day_by_day.value;
        variableCost =
          totalRevenue *
          (firstConfigSetting.variable_cost_percent_by_day.value / 100);
        fixedCost = firstConfigSetting.fixed_cost_estimated_by_day.value;
      }
      form.setFieldValue("rent", rent);
      form.setFieldValue("fixed_cost", fixedCost);
      setPurchaseAmount(purchaseAmount);
      setVariableCost(variableCost);

      if (Object.keys(reports).length !== 0) {
        setIdReport(reports.$id.value);
        reports.brokenGlass.value &&
          form.setFieldValue(
            "brokenGlass",
            JSON.parse(reports.brokenGlass.value)
          );
        reports.purchaseList.value &&
          form.setFieldValue(
            "purchaseList",
            JSON.parse(reports.purchaseList.value)
          );
      } else {
        setIdReport(0);
      }
    }

    const revenueStaff = isNaN(staffRevenue) ? 0 : staffRevenue + totalFeeTrip + totalTips;
    form.setFieldValue("revenue_staff", revenueStaff.toFixed(1));
  };

  const renderModalContent = () => {
    const registerEdit = [
      {
        formItemProps: {
          label: "来店日時",
          name: "date",
          labelAlign: "left",
          rules: [
            {
              required: true,
              message: "Required",
            },
          ],
        },
        renderInput: () => (
          <DatePicker
            format="YYYY/MM/DD"
            placeholder={""}
            disabledDate={(current) => {
              return current && current > dayjs().endOf("day");
            }}
          />
        ),
      },
      {
        formItemProps: {
          label: "総売上",
          name: "total_revenue",
          labelAlign: "left",
          rules: [
            {
              required: true,
              message: "Required",
            },
          ],
        },
        renderInput: () => (
          <InputNumber
            disabled
            min={1}
            addonAfter="円"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        ),
      },
      {
        formItemProps: {
          label: "人件費",
          name: "revenue_staff",
          labelAlign: "left",
          rules: [
            {
              required: true,
              message: "Required",
            },
          ],
        },
        renderInput: () => (
          <InputNumber
            min={1}
            disabled
            addonAfter="円"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        ),
      },
      {
        formItemProps: {
          label: "家賃",
          name: "rent",
          labelAlign: "left",
          rules: [
            {
              required: true,
              message: "Required",
            },
          ],
        },
        renderInput: () => (
          <InputNumber
            min={1}
            disabled
            addonAfter="円"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        ),
      },
      {
        formItemProps: {
          label: "固定費",
          name: "fixed_cost",
          labelAlign: "left",
          rules: [
            {
              required: true,
              message: "Required",
            },
          ],
        },
        renderInput: () => (
          <InputNumber
            min={1}
            disabled
            addonAfter="円"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        ),
      },
      {
        formItemProps: {
          label: "現金売上",
          name: "total_cash_sales",
          labelAlign: "left",
        },
        renderInput: () => (
          <InputNumber
            min={1}
            disabled
            addonAfter="円"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        ),
      },
      {
        formItemProps: {
          label: "クレカ売上",
          name: "total_card_sales",
          labelAlign: "left",
        },
        renderInput: () => (
          <InputNumber
            min={1}
            disabled
            addonAfter="円"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        ),
      },
      {
        formItemProps: {
          label: "振込売上",
          name: "total_transfer_sales",
          labelAlign: "left",
        },
        renderInput: () => (
          <InputNumber
            min={1}
            disabled
            addonAfter="円"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        ),
      },
      {
        formItemProps: {
          label: "現金立替",
          name: "total_cash_advance",
          labelAlign: "left",
        },
        renderInput: () => (
          <InputNumber
            min={1}
            disabled
            addonAfter="円"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        ),
      },
      {
        formItemProps: {
          label: "クレカ立替",
          name: "total_card_advance",
          labelAlign: "left",
        },
        renderInput: () => (
          <InputNumber
            min={1}
            disabled
            addonAfter="円"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        ),
      },
      {
        formItemProps: {
          label: "振込立替",
          name: "total_transfer_advance",
          labelAlign: "left",
        },
        renderInput: () => (
          <InputNumber
            min={1}
            disabled
            addonAfter="円"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        ),
      },
      {
        formItemProps: {
          label: "伝票",
          name: "bill",
          labelAlign: "left",
        },
        renderInput: () => (
          <Upload
            listType="picture-card"
            maxCount={1}
            onChange={(file) => handleChange(file, "bill")}
            customRequest={dummyRequest}
            fileList={fileListBill}
            onPreview={(file) => onPreview(file)}
          >
            画像を選択
          </Upload>
        ),
      },
      {
        formItemProps: {
          label: "レシート",
          name: "receipt",
          labelAlign: "left",
        },
        renderInput: () => (
          <Upload
            listType="picture-card"
            maxCount={1}
            onChange={(file) => handleChange(file, "reicept")}
            customRequest={dummyRequest}
            fileList={fileListReceipt}
            onPreview={(file) => onPreview(file)}
          >
            画像を選択
          </Upload>
        ),
      },
      {
        formItemProps: {
          label: "割れたグラス",
          labelAlign: "left",
        },
        renderInput: () => <BrokenGlass form={form} />,
      },
      {
        formItemProps: {
          label: "買い出し",
          labelAlign: "left",
        },
        renderInput: () => <Purchase form={form} />,
      },
      {
        formItemProps: {
          label: "今日のコメント",
          name: "comment",
          labelAlign: "left",
        },
        renderInput: () => <TextArea rows={4} style={{ width: "400px" }} />,
      },
      {
        formItemProps: {
          label: "担当者",
          name: "user_charge",
          labelAlign: "left",
        },
        renderInput: () => <Select style={{ width: 250 }} options={staff} />,
      },
    ];

    return (
      <div className={styles.formRegister}>
        <Form
          form={form}
          autoComplete="off"
          onFinish={onFinish}
          onValuesChange={onValuesChange}
        >
          {renderModalContentDetail(registerEdit)}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {type === "edit" ? "保存" : "登録"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  useEffect(() => {
    fetchAllRecordsCustomer(ID_APP_STAFF).then(function (records) {
      const data = records.map((val) => ({
        value: JSON.stringify({
          name: val.name.value,
          id: val.$id.value,
        }),
        label: val.name.value,
      }));
      setStaff(data);
    });
  }, []);

  useEffect(() => {
    if (type === "edit") {
      const data = event.record;

      let date = data?.date.value && dayjs(data?.date?.value);
      setTotalFormValue(date.format(FORMAT_DATE_TIME));

      form.setFieldsValue({
        date,
        user_charge:
          data.user_charge.value &&
          JSON.stringify({
            name: data.user_charge.value,
            id: data.id_user_charge.value,
          }),
      });
      data.brokenGlass.value &&
        form.setFieldValue("brokenGlass", JSON.parse(data.brokenGlass.value));
      data.purchaseList.value &&
        form.setFieldValue("purchaseList", JSON.parse(data.purchaseList.value));
      data?.bill?.value?.length &&
        fetchFileKey(data?.bill?.value[0].fileKey, setFileListBill);
      data?.receipt?.value?.length &&
        fetchFileKey(data?.receipt?.value[0].fileKey, setFileListReceipt);
    }
  }, [event, type]);

  return (
    <MainLayout isAdmin={isAdmin}>
      <CardComponent
        title={type === "edit" ? "日報編集" : "日報新規登録"}
        btnLeft={"戻る"}
        onClickLeft={() =>
          (window.location.href = `${window.location.origin}/k/${idApp}`)
        }
      >
        <div className={"mainAppCustom"}>{renderModalContent()}</div>
      </CardComponent>
    </MainLayout>
  );
}
