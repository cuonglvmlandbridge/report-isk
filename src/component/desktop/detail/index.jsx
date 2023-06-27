// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, useState } from "react";
import MainLayout from "../../layout/main";
import dayjs from "dayjs";
import styles from "./styles.module.css";
import { Button, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  formatMoney,
  convertTimeDiff,
  FORMAT_DATE_TIME,
} from "../../../utils/common";
import CardComponent from "../common/card/CardComponent";
import {
  ID_APP_CUSTOMER_COME,
  ID_APP_REGISTER,
  ID_APP_STAFF,
  ID_APP_CONFIG_SETTING,
} from "../../common/const";

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

export default function Detail({ record, isAdmin }) {
  const [imgBill, setImgBill] = useState();
  const [imgReceipt, setImgReceipt] = useState();
  const [customersCome, setCustomersCome] = useState([]);
  const [totalCardSales, setTotalCardSales] = useState(0);
  const [totalCashSales, setTotalCashSales] = useState(0);
  const [totalTransferSales, setTotalTransferSales] = useState(0);
  const [totalCashAdvance, setTotalCashAdvance] = useState(0);
  const [totalCardAdvance, setTotalCardAdvance] = useState(0);
  const [totalTransferAdvance, setTotalTransferAdvance] = useState(0);
  const [customersComment, setCustomersComment] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalFeeSerivce, setTotalFeeSerivce] = useState(0);
  const [revenueStaff, setRevenueStaff] = useState(0);
  const [totalTimeStaff, setTotalTimeStaff] = useState(0);
  const [flrCost, setFlrCost] = useState(0);
  const [profit, setProfit] = useState(0);
  const [arrayStaff, setArrayStaff] = useState([]);
  const [settingConfig, setSettingConfig] = useState({
    fixed_cost_estimated_by_day: 0,
    rent_per_day_by_day: 0,
    sales_estimated_percent_by_day: 0,
    variable_cost_percent_by_day: 0,
    staff_revenue_percent_by_day: 0,
    flr_percent_by_day: 0,
    profit_estimated_by_day: 0,
  });

  const refCopy = useRef();

  const onPreview = (file) => {
    let pdfWindow = window.open("");
    pdfWindow.document.write(
      "<iframe width='100%' height='100%' src='" +
        encodeURI(file) +
        "'></iframe>"
    );
  };

  const dataCharge = [
    {
      key: 1,
      label: "報告者",
      value: record.user_update.value
        ? record.user_update.value
        : record.Created_by.value.name,
      className: styles.itemLargest,
    },
    {
      key: 2,
      label: "日付",
      value: record.date.value,
      className: styles.itemLargest,
    },
    {
      key: 3,
      label: "総売上(立替あり)",
      value: formatMoney(totalRevenue),
      className: styles.itemLarge,
    },
    {
      key: 4,
      label: "総売上",
      value: formatMoney(
        parseFloat(totalCashSales) +
          parseFloat(totalCardSales) +
          parseFloat(totalTransferSales)
      ),
      className: styles.itemLarge,
    },
    {
      key: 5,
      label: "現金売上",
      value: formatMoney(totalCashSales),
      childDataKey: "cash_sales",
      className: styles.itemMedium,
    },
    {
      key: 6,
      label: "クレカ売上",
      value: formatMoney(totalCardSales),
      childDataKey: "card_sales",
      className: styles.itemMedium,
    },
    {
      key: 7,
      label: "サン共同売上",
      value: formatMoney(totalTransferSales),
      childDataKey: "transfer_sales",
      className: styles.itemMedium,
    },
    {
      key: 8,
      label: "立替精算合計",
      value: formatMoney(
        parseFloat(totalCashAdvance) +
          parseFloat(totalCardAdvance) +
          parseFloat(totalTransferAdvance)
      ),
      className: `${styles.mt10} ${styles.itemLarge}`,
    },
    {
      key: 9,
      label: "現金立替",
      value: formatMoney(totalCashAdvance),
      childDataKey: "cash_advance",
      className: styles.itemMedium,
    },
    {
      key: 10,
      label: "クレカ立替",
      value: formatMoney(totalCardAdvance),
      childDataKey: "card_advance",
      className: styles.itemMedium,
    },
    {
      key: 11,
      label: "振込立替",
      value: formatMoney(totalTransferAdvance),
      childDataKey: "transfer_advance",
      className: styles.itemMedium,
    },
  ];

  const dataAfter = [
    {
      id: 1,
      text: "今日のコメント",
      value: customersComment,
    },
    {
      id: 2,
      text: "担当者",
      value: record.user_charge.value,
    },
  ];

  useEffect(() => {
    if (record?.bill?.value?.length) {
      fetchFileKey(record?.bill?.value[0].fileKey, setImgBill);
    }

    if (record?.receipt?.value?.length) {
      fetchFileKey(record?.receipt?.value[0].fileKey, setImgReceipt);
    }
    const fetchDataCustomer = async () => {
      const promises = [
        fetchAllRecordsByDate(ID_APP_CUSTOMER_COME, record.date.value),
        fetchAllStaffByDate(ID_APP_REGISTER, record.date.value),
        fetchAllRecordConfigSetting(),
      ];

      try {
        const [customersCome, staffs, configSetting] = await Promise.all(
          promises
        );

        if (configSetting.records.length > 0) {
          const firstConfigSetting = configSetting.records[0];
          setSettingConfig({
            fixed_cost_estimated_by_day:
              firstConfigSetting.fixed_cost_estimated_by_day.value,
            rent_per_day_by_day: firstConfigSetting.rent_per_day_by_day.value,
            sales_estimated_percent_by_day:
              firstConfigSetting.sales_estimated_percent_by_day.value,
            variable_cost_percent_by_day:
              firstConfigSetting.variable_cost_percent_by_day.value,
            staff_revenue_percent_by_day:
              firstConfigSetting.staff_revenue_percent_by_day.value,
            flr_percent_by_day: firstConfigSetting.flr_percent_by_day.value,
            profit_estimated_by_day:
              firstConfigSetting?.profit_estimated_by_day?.value,
          });
        }
        let totalRevenue = 0;
        let totalCashSales = 0;
        let totalCardSales = 0;
        let totalTransferSales = 0;
        let totalCashAdvance = 0;
        let totalCardAdvance = 0;
        let totalTransferAdvance = 0;
        let customerComment = "";
        if (customersCome) {
          customersCome.forEach(
            ({
              cash_sales,
              card_sales,
              transfer_sales,
              card_advance,
              cash_advance,
              transfer_advance,
              revenue,
              comment,
              customer,
            }) => {
              totalRevenue += revenue.value && parseInt(revenue.value);
              totalCashSales += cash_sales.value && parseInt(cash_sales.value);
              totalCardSales += card_sales.value && parseInt(card_sales.value);
              totalTransferSales +=
                transfer_sales.value && parseInt(transfer_sales.value);
              totalCashAdvance +=
                cash_advance.value && parseInt(cash_advance.value);
              totalCardAdvance +=
                card_advance.value && parseInt(card_advance.value);
              totalTransferAdvance +=
                transfer_advance.value && parseInt(transfer_advance.value);
              customerComment +=
                comment.value && `${customer.value} - ${comment.value}\n`;
            }
          );
        }
        calculateStaffFee(staffs);
        setTotalCardSales(totalCardSales);
        setTotalCashSales(totalCashSales);
        setTotalTransferSales(totalTransferSales);
        setTotalCashAdvance(totalCashAdvance);
        setTotalCardAdvance(totalCardAdvance);
        setTotalTransferAdvance(totalTransferAdvance);
        setTotalRevenue(
          parseInt(totalCardSales) +
            parseInt(totalCashSales) +
            parseInt(totalTransferSales) +
            parseInt(totalCashAdvance) +
            parseInt(totalCardAdvance) +
            parseInt(totalTransferAdvance)
        );
        setTotalFeeSerivce(totalFeeSerivce);
        setCustomersCome(customersCome);
        setCustomersComment(customerComment);
      } catch (error) {}
    };

    fetchDataCustomer();
  }, [record]);

  async function calculateStaffFee(staffs) {
    const staffIds = staffs.map((val) => val.id_staff.value);
    const infoStaffs = await fetchAllRecordsStaff(staffIds.join(", "));
    let revenueStaff = 0;
    let totalTimeStaff = 0;
    const arrayStaff = [];
    if (infoStaffs) {
      const salarys = {};
      infoStaffs.forEach((val) => {
        Object.assign(salarys, {
          [val.$id.value]: val.salary.value,
        });
      });

      staffs.forEach((val) => {
        const timeStaff =
          convertTimeDiff(val.time_in.value, val.time_out.value) / 3600;
        revenueStaff +=
          salarys[val.id_staff.value] *
          (convertTimeDiff(val.time_in.value, val.time_out.value) / 3600);
        totalTimeStaff += timeStaff;
        arrayStaff.push({
          name: val.staff.value,
          timeStaff,
        });
      });
    }
    const flrCost =
      parseFloat(totalRevenue) -
      (parseFloat(revenueStaff) +
        parseFloat(record.purchase_amount.value) +
        parseFloat(record.rent.value));

    const profit =
      parseFloat(totalRevenue) -
      (parseFloat(revenueStaff) +
        parseFloat(record.purchase_amount.value) +
        parseFloat(record.rent.value) +
        parseFloat(record.variable_cost.value) +
        parseFloat(record.fixed_cost.value));
    setFlrCost(flrCost);
    setProfit(profit);
    setArrayStaff(arrayStaff);
    setRevenueStaff(revenueStaff);
    setTotalTimeStaff(totalTimeStaff);
    return revenueStaff;
  }

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
    return [
      ...filterStartDateCustomer,
      ...filterNextDateCustomer,
    ];
  }

  function fetchAllStaffByDate(
    appId,
    date,
    opt_offset,
    opt_limit,
    opt_records
  ) {
    let offset = opt_offset || 0;
    let limit = opt_limit || 100;
    let allRecords = opt_records || [];
    let params = {
      app: appId,
      query: `date = "${date}" limit ${limit} offset ${offset}`,
      fields: ["id_staff", "time_in", "time_out", "staff"],
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
      fields: ["salary", "$id", "name"],
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

  function fetchAllRecordConfigSetting() {
    const params = { app: ID_APP_CONFIG_SETTING };
    return kintone.api("/k/v1/records", "GET", params).then(function (resp) {
      return resp;
    });
  }

  const renderChildTotal = (field) => {
    return customersCome.map((customer) => {
      return (
        customer.card_sales.value > 0 && (
          <div
            className={styles.itemSmall}
            key={`${customer.user_charge.value}_${customer[field].value}`}
          >
            <p>{customer.customer.value}</p>
            <p>{formatMoney(customer[field].value)}</p>
          </div>
        )
      );
    });
  };

  return (
    <MainLayout isAdmin={isAdmin}>
      <CardComponent
        title={"日報詳細"}
        btnLeft={"戻る"}
        onClickLeft={() =>
          (window.location.href = `${window.location.origin}/k/${idApp}`)
        }
      >
        <div className={"mainAppCustom"}>
          <div className={styles.detail} ref={refCopy}>
            {dataCharge.map((charge) => {
              return (
                <div className={charge.className} key={`parent_${charge.key}`}>
                  <div className={styles.parentItem}>
                    <p>{charge.label}</p>
                    <p>{charge.value}</p>
                  </div>
                  {charge.childDataKey && renderChildTotal(charge.childDataKey)}
                </div>
              );
            })}
            {imgBill && (
              <div className={styles.parentItem}>
                <p className={styles.fs18}>伝票</p>
                <p>
                  <img
                    src={imgBill}
                    alt=""
                    onClick={() => onPreview(imgBill)}
                  />
                </p>
              </div>
            )}
            {imgReceipt && (
              <div className={styles.parentItem}>
                <p className={styles.fs18}>レシート</p>
                <p>
                  <img
                    src={imgReceipt}
                    alt=""
                    onClick={() => onPreview(imgReceipt)}
                  />
                </p>
              </div>
            )}
            {/* staff */}
            <div>
              <div className={styles.itemLarge}>
                <p className={styles.mb20}>
                  出勤時間合計
                  <span className={styles.ml20}>{`${totalTimeStaff}h`}</span>
                  <span className={styles.ml40}>人件費合計</span>
                  <span className={styles.ml20}>
                    {formatMoney(revenueStaff)}
                  </span>
                  <span
                    className={`${
                      (revenueStaff / totalRevenue) * 100 >
                      settingConfig?.staff_revenue_percent_by_day
                        ? styles.arrowDown
                        : styles.arrowUp
                    } ${styles.ml20}`}
                  >
                    {`${((revenueStaff / totalRevenue) * 100).toFixed(1)}%`}
                  </span>
                </p>
              </div>
              <div className={styles.parentItem}>
                {arrayStaff.map((staff) => {
                  return (
                    <>
                      <p className={styles.w30}>{staff.name}</p>
                      <p className={styles.w70}>{staff.timeStaff}h</p>
                    </>
                  );
                })}
              </div>
            </div>

            <div>
              <div className={styles.itemLarge}>
                <p className={styles.mb20}>概算損益（日別）</p>
              </div>
              <div className={`${styles.parentItem}`}>
                <p className={styles.w30}>売上高</p>
                <p className={styles.w70}>{formatMoney(totalRevenue)}</p>
              </div>
              <div className={`${styles.parentItem}`}>
                <p className={styles.w30}>人件費</p>
                <p className={styles.w30}>{formatMoney(revenueStaff)}</p>
                <p className={styles.w40}>
                  <span>
                    （{`${((revenueStaff / totalRevenue) * 100).toFixed(1)}%`}）
                  </span>
                  <span className={styles.ml20}>
                    目標{settingConfig?.staff_revenue_percent_by_day}%以下
                  </span>
                </p>
              </div>
              <div className={`${styles.parentItem}`}>
                <p className={styles.w30}>仕入高</p>
                <p className={styles.w30}>
                  {formatMoney(record.purchase_amount.value)}
                </p>
                <p className={styles.w40}>
                  <span>
                    （売上×概算{settingConfig.sales_estimated_percent_by_day}%）
                  </span>
                </p>
              </div>
              <div
                className={`${styles.parentItem} ${styles.mb20} ${styles.pb20} ${styles.btDashed}`}
              >
                <p className={styles.w30}>家賃</p>
                <p className={styles.w30}>{formatMoney(record.rent.value)}</p>
                <p className={styles.w40}>
                  <span>
                    （概算1日{formatMoney(settingConfig?.rent_per_day_by_day)}）
                  </span>
                </p>
              </div>
              <div className={styles.parentItem}>
                <p className={styles.w30}>FLR利益</p>
                <p className={styles.w30}>{formatMoney(flrCost)}</p>
                <p className={styles.w40}>
                  <span>
                    （{`${((flrCost / totalRevenue) * 100).toFixed(1)}%`}）
                  </span>
                  <span className={styles.ml20}>
                    目標{settingConfig?.flr_percent_by_day}%以上
                  </span>
                </p>
              </div>
              <div className={styles.parentItem}>
                <p className={styles.w30}>変動費</p>
                <p className={styles.w30}>
                  {formatMoney(record.variable_cost.value)}
                </p>
                <p className={styles.w40}>
                  <span>
                    （売上×概算{settingConfig?.variable_cost_percent_by_day}%）
                  </span>
                </p>
              </div>
              <div
                className={`${styles.parentItem} ${styles.mb20} ${styles.pb20} ${styles.btDashed}`}
              >
                <p className={styles.w30}>固定費</p>
                <p className={styles.w30}>
                  {formatMoney(record.fixed_cost.value)}
                </p>
                <p className={styles.w40}>
                  <span>
                    （概算1日
                    {formatMoney(settingConfig?.fixed_cost_estimated_by_day)}）
                  </span>
                </p>
              </div>
            </div>

            <div className={`${styles.itemSmall} ${styles.ml0}`}>
              <p className={styles.w30}>利益</p>
              <p className={styles.w30}>
                <span
                  className={`${
                    profit < settingConfig?.profit_estimated_by_day
                      ? styles.arrowDown
                      : styles.arrowUp
                  }`}
                >
                  {formatMoney(profit)}
                </span>
              </p>
              <p className={styles.w40}>
                目標1日{formatMoney(settingConfig?.profit_estimated_by_day)}
              </p>
            </div>

            {/* comment section */}
            {dataAfter.map((val) => {
              return (
                <div className={styles.parentItem} key={val.id}>
                  <p>{val.text}</p>
                  <p>{val.value}</p>
                </div>
              );
            })}
          </div>

          <div className={styles.btnCopy}>
            <Button
              type={"primary"}
              onClick={() => {
                let text = `日付: ${record.date.value}\n総売上: ${formatMoney(
                  record.total_revenue.value
                )}\n経費: ${formatMoney(
                  record.expenses.value
                )}\n人件費: ${formatMoney(
                  record.revenue_staff.value
                )}\n今日のコメント: ${customersComment}\n担当者: ${
                  record.user_charge.value
                }`;
                navigator.clipboard.writeText(text);
                message.success("コピーできました。!");
              }}
            >
              クリップボードにコピー
            </Button>
          </div>
        </div>
      </CardComponent>
    </MainLayout>
  );
}
