// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, useState } from "react";
import MainLayout from "../../layout/main";
import styles from "./styles.module.css";
import { Button, message } from "antd";
import {
  formatMoney,
  convertTimeDiff,
  getDatesInRange,
  getMonthRange,
  sumPropertyValues,
  calculateDaysFromStartOfMonth,
  getValueByKey,
} from "../../../utils/common";
import CardComponent from "../common/card/CardComponent";
import {
  ID_APP_CUSTOMER_COME,
  ID_APP_REGISTER,
  ID_APP_STAFF,
  ID_APP_CONFIG_SETTING,
  ID_CUSTOMER_WINE,
} from "../../common/const";
import dayjs from "dayjs";

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
  const [total, setTotal] = useState({
    totalRevenue: 0,
    totalCardSales: 0,
    totalCashSales: 0,
    totalTransferSales: 0,
    totalCashAdvance: 0,
    totalCardAdvance: 0,
    totalTransferAdvance: 0,
    totalRevenueByMonth: 0,
    totalCardSalesByMonth: 0,
    totalCashSalesByMonth: 0,
    totalTransferSalesByMonth: 0,
    totalCashAdvanceByMonth: 0,
    totalCardAdvanceByMonth: 0,
    totalTransferAdvanceByMonth: 0,
  });
  const [customersComment, setCustomersComment] = useState("");
  const [revenueStaff, setRevenueStaff] = useState(0);
  const [revenueStaffByMonth, setRevenueStaffByMonth] = useState(0);
  const [totalTimeStaff, setTotalTimeStaff] = useState(0);
  const [flrCost, setFlrCost] = useState(0);
  const [profit, setProfit] = useState(0);
  const [flrCostByMonth, setFlrCostByMonth] = useState(0);
  const [profitByMonth, setProfitByMonth] = useState(0);
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
  const [dayFromStartOfMonth, setDayFromStartOfMonth] = useState(0);
  const [commodities, setCommodities] = useState([]);

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
      isShow: true,
    },
    {
      key: 2,
      label: "日付",
      value: record.date.value,
      className: styles.itemLargest,
      isShow: true,
    },
    {
      key: 3,
      label: "総売上(立替あり)",
      value: formatMoney(
        parseFloat(total.totalCashSales) +
          parseFloat(total.totalCardSales) +
          parseFloat(total.totalTransferSales) +
          parseFloat(total.totalCashAdvance) +
          parseFloat(total.totalCardAdvance) +
          parseFloat(total.totalTransferAdvance)
      ),
      className: styles.itemLarge,
      isShow: true,
    },
    {
      key: 4,
      label: "総売上",
      value: formatMoney(
        parseFloat(total.totalCashSales) +
          parseFloat(total.totalCardSales) +
          parseFloat(total.totalTransferSales)
      ),
      className: styles.itemLarge,
      isShow: true,
    },
    {
      key: 5,
      label: "現金売上",
      value: formatMoney(total.totalCashSales),
      childDataKey: "cash_sales",
      className: styles.itemMedium,
      isShow: total.totalCashSales > 0 ? true : false,
    },
    {
      key: 6,
      label: "クレカ売上",
      value: formatMoney(total.totalCardSales),
      childDataKey: "card_sales",
      className: styles.itemMedium,
      isShow: total.totalCardSales > 0 ? true : false,
    },
    {
      key: 7,
      label: "振込売上",
      value: formatMoney(total.totalTransferSales),
      childDataKey: "transfer_sales",
      className: styles.itemMedium,
      isShow: total.totalTransferSales > 0 ? true : false,
    },
    {
      key: 8,
      label: "立替精算合計",
      value: formatMoney(
        parseFloat(total.totalCashAdvance) +
          parseFloat(total.totalCardAdvance) +
          parseFloat(total.totalTransferAdvance)
      ),
      className: `${styles.mt10} ${styles.itemLarge}`,
      isShow: true,
    },
    {
      key: 9,
      label: "現金立替",
      value: formatMoney(total.totalCashAdvance),
      childDataKey: "cash_advance",
      className: styles.itemMedium,
      isShow: total.totalCashAdvance > 0 ? true : false,
    },
    {
      key: 10,
      label: "クレカ立替",
      value: formatMoney(total.totalCardAdvance),
      childDataKey: "card_advance",
      className: styles.itemMedium,
      isShow: total.totalCardAdvance > 0 ? true : false,
    },
    {
      key: 11,
      label: "振込立替",
      value: formatMoney(total.totalTransferAdvance),
      childDataKey: "transfer_advance",
      className: styles.itemMedium,
      isShow: total.totalTransferAdvance > 0 ? true : false,
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
        fetchCustomersComeByDate(ID_APP_CUSTOMER_COME, record.date.value),
        fetchRegisterStaffsByDate(ID_APP_REGISTER, record.date.value),
        fetchConfigSetting(),
        fetchCustomersComeByMonth(ID_APP_CUSTOMER_COME, record.date.value),
        fetchRegisterStaffsByMonth(ID_APP_REGISTER, record.date.value),
        fetchReportByMonth(record.date.value),
      ];

      try {
        const [
          customersCome,
          staffsByDay,
          configSetting,
          customersComeByMonth,
          staffsByMonth,
          reportByMonth,
        ] = await Promise.all(promises);
        // const listCustomerIds = getValueByKey(customersCome, 'customer_id');
        handleCommodities(customersCome);
        const totalByDay =
          customersCome.length > 0 ? calculateByDay(customersCome) : {};
        const totalByMonth =
          customersComeByMonth.length > 0
            ? calculateByMonth(customersComeByMonth)
            : {};
        setTotal({ ...totalByDay, ...totalByMonth });
        setCustomersCome(customersCome);

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
        calculateStaffFeeByDay(
          staffsByDay,
          totalByDay.totalRevenue,
          configSetting,
          customersCome
        );
        calculateStaffFeeByMonth(
          staffsByMonth,
          totalByMonth.totalRevenueByMonth,
          reportByMonth,
          configSetting,
          customersComeByMonth
        );
      } catch (error) {}
    };
    fetchDataCustomer();
  }, [record]);

  function calculateByDay(customersCome) {
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
    setCustomersComment(customerComment);

    return {
      totalRevenue,
      totalCardSales,
      totalCashSales,
      totalTransferSales,
      totalCashAdvance,
      totalCardAdvance,
      totalTransferAdvance,
    };
  }

  function calculateByMonth(customersComeByMonth) {
    const totalCashSalesByMonth = sumPropertyValues(
      customersComeByMonth,
      "cash_sales"
    );
    const totalCardSalesByMonth = sumPropertyValues(
      customersComeByMonth,
      "card_sales"
    );
    const totalTransferSalesByMonth = sumPropertyValues(
      customersComeByMonth,
      "transfer_sales"
    );
    const totalCashAdvanceByMonth = sumPropertyValues(
      customersComeByMonth,
      "cash_advance"
    );
    const totalCardAdvanceByMonth = sumPropertyValues(
      customersComeByMonth,
      "card_advance"
    );
    const totalTransferAdvanceByMonth = sumPropertyValues(
      customersComeByMonth,
      "transfer_advance"
    );
    const totalRevenueByMonth =
      parseInt(totalCashSalesByMonth) +
      parseInt(totalCardSalesByMonth) +
      parseInt(totalTransferSalesByMonth);

    return {
      totalRevenueByMonth,
      totalCashSalesByMonth,
      totalCardSalesByMonth,
      totalTransferSalesByMonth,
      totalCashAdvanceByMonth,
      totalCardAdvanceByMonth,
      totalTransferAdvanceByMonth,
    };
  }

  function handleCommodities(customerCome) {
    const commodities = [];
    customerCome.forEach(({ wineInfomation }) => {
      if (wineInfomation.value) {
        commodities.push(JSON.parse(wineInfomation.value));
      }
    });
    setCommodities(commodities.flat());
  }

  async function calculateStaffFeeByDay(
    staffs,
    totalRevenue,
    configSetting,
    customerCome
  ) {
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
    const staffIds = staffs.map((val) => val.id_staff.value);
    const infoStaffs = await fetchStaff(staffIds.join(", "));
    let revenueStaff = 0;
    let totalTimeStaff = 0;
    let totalTips = 0;
    let totalFeeTrip = 0;
    const arrayStaff = [];
    if (infoStaffs) {
      const salarys = {};
      infoStaffs.forEach((val) => {
        Object.assign(salarys, {
          [val.$id.value]: val.salary.value,
        });
        const customerSelected = customerCome.find(
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
    revenueStaff = revenueStaff + totalTips + totalFeeTrip;

    const flrCost =
      parseFloat(totalRevenue) -
      parseFloat(revenueStaff) -
      parseFloat(purchaseAmount) -
      parseFloat(rent);
    const profit =
      parseFloat(flrCost) - parseFloat(variableCost) - parseFloat(fixedCost);
    flrCost && setFlrCost(flrCost.toFixed(1));
    profit && setProfit(profit.toFixed(1));
    setArrayStaff(arrayStaff);
    revenueStaff && setRevenueStaff(revenueStaff.toFixed(1));
    setTotalTimeStaff(totalTimeStaff);
    return revenueStaff;
  }

  async function calculateStaffFeeByMonth(
    staffs,
    totalRevenue,
    reportByMonth,
    configSetting,
    customerCome
  ) {
    const dayFromStartOfMonth = calculateDaysFromStartOfMonth(
      record.date.value
    );
    let staffIds = staffs.map((val) => val.id_staff.value);
    const uniqueSet = new Set(staffIds);
    const uniqueStaffIds = Array.from(uniqueSet);
    const infoStaffs = await fetchStaff(uniqueStaffIds.join(", "));
    let revenueStaff = 0;
    let totalTips = 0;
    let totalFeeTrip = 0;
    if (infoStaffs) {
      const salarys = {};
      infoStaffs.forEach((val) => {
        Object.assign(salarys, {
          [val.$id.value]: val.salary.value,
        });
        const customerSelected = customerCome.find(
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
      staffs.forEach((val) => {
        revenueStaff +=
          parseFloat(salarys[val.id_staff.value]) *
          (convertTimeDiff(val.time_in.value, val.time_out.value) / 3600);
      });
    }

    if (reportByMonth.length > 0) {
      let totalPurchaseAmount = 0;
      let totalRent = 0;
      let totalFixedCost = 0;
      let totalVariableCost = 0;
      if (configSetting.records.length > 0) {
        const firstConfigSetting = configSetting.records[0];
        totalPurchaseAmount =
          totalRevenue *
          (firstConfigSetting.sales_estimated_percent_by_day.value / 100);
        totalRent =
          firstConfigSetting.rent_per_day_by_day.value * dayFromStartOfMonth;
        totalVariableCost =
          totalRevenue *
          (firstConfigSetting.variable_cost_percent_by_day.value / 100);
        totalFixedCost =
          firstConfigSetting.fixed_cost_estimated_by_day.value *
          dayFromStartOfMonth;
      }
      revenueStaff = revenueStaff + totalTips + totalFeeTrip;
      const flrCost =
        parseFloat(totalRevenue) -
        parseFloat(revenueStaff) -
        parseFloat(totalPurchaseAmount) -
        parseFloat(totalRent);

      const profit =
        parseFloat(flrCost) -
        parseFloat(totalFixedCost) -
        parseFloat(totalVariableCost);

      flrCost && setFlrCostByMonth(flrCost.toFixed(1));
      profit && setProfitByMonth(profit.toFixed(1));
    }
    setDayFromStartOfMonth(dayFromStartOfMonth);
    setRevenueStaffByMonth(revenueStaff.toFixed(1));
    return revenueStaff;
  }

  async function fetchCustomersComeByDate(appId, time_start) {
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

  async function fetchCustomersComeByMonth(appId, time_start) {
    const { startDate, endDate } = getMonthRange(time_start);
    const datesInRange = getDatesInRange(startDate, endDate);
    const promiseCustomerCome = [];
    datesInRange.forEach((value) => {
      let params = {
        app: appId,
        query: `time_start like "${value}"`,
      };
      promiseCustomerCome.push(kintone.api("/k/v1/records", "GET", params));
    });

    return Promise.all(promiseCustomerCome).then((res) => {
      return Promise.resolve(res.flatMap((obj) => obj.records));
    });
  }

  function fetchRegisterStaffsByDate(appId, date) {
    let allRecords = [];
    let params = {
      app: appId,
      query: `date = "${date}"`,
      fields: ["id_staff", "time_in", "time_out", "staff"],
    };
    return kintone.api("/k/v1/records", "GET", params).then(function (resp) {
      allRecords = allRecords.concat(resp.records);
      return allRecords;
    });
  }

  function fetchRegisterStaffsByMonth(appId, date) {
    const { startDate, endDate } = getMonthRange(date);
    const datesInRange = getDatesInRange(startDate, endDate);
    let groupRangeDate = "(";
    datesInRange.forEach((date, index) => {
      if (index === datesInRange.length - 1) {
        groupRangeDate += `"${date}")`;
      } else {
        groupRangeDate += `"${date}",`;
      }
    });

    let allRecords = [];
    let params = {
      app: appId,
      query: `date in ${groupRangeDate}`,
      fields: ["id_staff", "time_in", "time_out", "staff", "date"],
    };
    return kintone.api("/k/v1/records", "GET", params).then(function (resp) {
      allRecords = allRecords.concat(resp.records);
      return allRecords;
    });
  }

  function fetchStaff(idsString, opt_records) {
    let allRecords = opt_records || [];
    let params = {
      app: ID_APP_STAFF,
      query: `$id in (${idsString})`,
    };
    return (
      idsString?.length &&
      kintone.api("/k/v1/records", "GET", params).then(function (resp) {
        allRecords = allRecords.concat(resp.records);
        return allRecords;
      })
    );
  }

  function fetchConfigSetting() {
    const params = { app: ID_APP_CONFIG_SETTING };
    return kintone.api("/k/v1/records", "GET", params).then(function (resp) {
      return resp;
    });
  }

  function fetchReportByMonth(date) {
    const { startDate, endDate } = getMonthRange(date);
    const datesInRange = getDatesInRange(startDate, endDate);
    let groupRangeDate = "(";
    datesInRange.forEach((date, index) => {
      if (index === datesInRange.length - 1) {
        groupRangeDate += `"${date}")`;
      } else {
        groupRangeDate += `"${date}",`;
      }
    });

    let allRecords = [];
    let params = {
      app: idApp,
      query: `date in ${groupRangeDate}`,
    };
    return kintone.api("/k/v1/records", "GET", params).then(function (resp) {
      allRecords = allRecords.concat(resp.records);
      return allRecords;
    });
  }

  // function fetchCommodities(date) {
  //   const formatDate = dayjs(date).format("YYYY-MM-DD");
  //   let allRecords = [];
  //   let params = {
  //     app: 47,
  //     query: `createDate = "${formatDate}"`,
  //   };
  //   return kintone.api("/k/v1/records", "GET", params).then(function (resp) {
  //     allRecords = allRecords.concat(resp.records);
  //     return allRecords;
  //   });
  // }

  const renderChildTotal = (field) => {
    return customersCome.map((customer) => {
      return (
        (customer[field].value || customer[field].value === 0) && (
          <div
            className={styles.itemSmall}
            key={`${customer.$id.value}_${customer[field].value}`}
          >
            <p>{customer.customer.value}</p>
            <p>{formatMoney(customer[field].value)}</p>
          </div>
        )
      );
    });
  };

  const handleCopyText = () => {
    let textCopy = "";
    const childNodesArray = Array.from(refCopy.current.childNodes);
    childNodesArray.map((node) => {
      const childArr = Array.from(node.childNodes);
      console.log(childArr);
      childArr.map((child) => {
        const textArr = child.innerText.split("\n\n");

        const firstText = textArr?.[0];
        const secondText = textArr?.[1];
        const thirdText = textArr?.[2];
        const text = `${firstText}${secondText ? `: ${secondText}` : ""}${
          thirdText ? ` ${thirdText}` : ""
        }\n`;
        textCopy += text;
      });
    });
    message.success("コピーできました。!");
    navigator.clipboard.writeText(textCopy);
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
                charge.isShow && (
                  <div
                    className={charge.className}
                    key={`parent_${charge.key}`}
                  >
                    <div className={styles.parentItem}>
                      <p>{charge.label}</p>
                      <p>{charge.value}</p>
                    </div>
                    {charge.childDataKey &&
                      renderChildTotal(charge.childDataKey)}
                  </div>
                )
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
                  <span className={styles.ml20}>{`${totalTimeStaff.toFixed(
                    1
                  )}h`}</span>
                  <span className={styles.ml40}>人件費合計</span>
                  <span className={styles.ml20}>
                    {formatMoney(revenueStaff)}
                  </span>
                  <span
                    className={`${
                      (revenueStaff / total.totalRevenue) * 100 >
                      settingConfig?.staff_revenue_percent_by_day
                        ? styles.arrowDown
                        : styles.arrowUp
                    } ${styles.ml20}`}
                  >
                    {`${
                      total.totalRevenue > 0
                        ? ((revenueStaff / total.totalRevenue) * 100).toFixed(1)
                        : 0
                    }`}
                    %
                  </span>
                </p>
              </div>
              <div className={styles.parentItem}>
                {arrayStaff.map((staff) => {
                  return (
                    <>
                      <p className={styles.w30}>{staff.name}</p>
                      <p className={styles.w70}>
                        {staff.timeStaff.toFixed(1)}h
                      </p>
                    </>
                  );
                })}
              </div>
            </div>

            {/* commodities */}
            {commodities.length > 0 && (
              <div>
                <div className={styles.itemLarge}>
                  <p className={styles.mb20}>【空いたボトル】</p>
                </div>

                {commodities.map((commodity) => {
                  return (
                    <div className={styles.parentItem}>
                      <p className={styles.w30}>{commodity.trademark}</p>
                      <p className={styles.w70}>{commodity.emptyBottle}本</p>
                    </div>
                  );
                })}
              </div>
            )}
            {/* commodities */}
            {/* broken glass */}
            {record?.brokenGlass?.value && (
              <div>
                <div className={styles.itemLarge}>
                  <p className={styles.mb20}>【割れたグラス】</p>
                </div>

                {JSON.parse(record.brokenGlass.value).map(
                  ({ name, quantity }) => {
                    return (
                      <div className={styles.parentItem}>
                        <p className={styles.w30}>{name}</p>
                        <p className={styles.w70}>{quantity}個</p>
                      </div>
                    );
                  }
                )}
              </div>
            )}
            {/* broken glass  */}
            {/* purchase */}
            {record?.purchaseList?.value && (
              <div>
                <div className={styles.itemLarge}>
                  <p className={styles.mb20}>【買い出し】</p>
                </div>

                {JSON.parse(record.purchaseList.value).map(
                  ({ name, quantity, amount }) => {
                    return (
                      <div className={styles.parentItem}>
                        <p className={styles.w30}>{name}個</p>
                        <p className={styles.w30}>{quantity}個</p>
                        <p className={styles.w40}>{amount}円</p>
                      </div>
                    );
                  }
                )}
              </div>
            )}
            {/* purchase */}
            <div>
              <div className={styles.itemLarge}>
                <p className={styles.mb20}>概算損益（日別）</p>
              </div>
              <div className={`${styles.parentItem}`}>
                <p className={styles.w30}>売上高</p>
                <p className={styles.w70}>{formatMoney(total.totalRevenue)}</p>
              </div>
              <div className={`${styles.parentItem}`}>
                <p className={styles.w30}>人件費</p>
                <p className={styles.w30}>{formatMoney(revenueStaff)}</p>
                <p className={styles.w40}>
                  <span>
                    （
                    {`${
                      total.totalRevenue > 0
                        ? ((revenueStaff / total.totalRevenue) * 100).toFixed(1)
                        : 0
                    }`}
                    % ）
                  </span>
                  <span className={styles.ml20}>
                    目標{settingConfig?.staff_revenue_percent_by_day}%以下
                  </span>
                </p>
              </div>
              <div className={`${styles.parentItem}`}>
                <p className={styles.w30}>仕入高</p>
                <p className={styles.w30}>
                  {formatMoney(
                    (
                      parseFloat(total.totalRevenue) *
                      parseFloat(
                        settingConfig.sales_estimated_percent_by_day / 100
                      )
                    ).toFixed(1)
                  )}
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
                    （
                    {`${
                      total.totalRevenue > 0
                        ? ((flrCost / total.totalRevenue) * 100).toFixed(1)
                        : 0
                    }`}
                    % ）
                  </span>
                  <span className={styles.ml20}>
                    目標{settingConfig?.flr_percent_by_day}%以上
                  </span>
                </p>
              </div>
              <div className={styles.parentItem}>
                <p className={styles.w30}>変動費</p>
                <p className={styles.w30}>
                  {formatMoney(
                    (
                      parseFloat(total.totalRevenue) *
                      parseFloat(
                        settingConfig.variable_cost_percent_by_day / 100
                      )
                    ).toFixed(1)
                  )}
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
              <div className={styles.flex}>
                <p className={styles.w30}>利益</p>
                <p
                  className={`${styles.w30} ${
                    profit < settingConfig?.profit_estimated_by_day
                      ? styles.arrowDown
                      : styles.arrowUp
                  }`}
                >
                  <span>{formatMoney(profit)}</span>
                </p>
                <p className={styles.w40}>
                  目標1日{formatMoney(settingConfig?.profit_estimated_by_day)}
                </p>
              </div>
            </div>

            {/* total by month */}
            <div>
              <div className={styles.itemLarge}>
                <p className={styles.mb20}>概算損益（月別）</p>
              </div>
              <div className={`${styles.parentItem}`}>
                <p className={styles.w30}>売上高</p>
                <p className={styles.w70}>
                  {formatMoney(total.totalRevenueByMonth)}
                </p>
              </div>
              <div className={`${styles.parentItem}`}>
                <p className={styles.w30}>人件費</p>
                <p className={styles.w30}>{formatMoney(revenueStaffByMonth)}</p>
                <p className={styles.w40}>
                  <span>
                    （
                    {`${
                      total.totalRevenueByMonth > 0
                        ? (
                            (revenueStaffByMonth / total.totalRevenueByMonth) *
                            100
                          ).toFixed(1)
                        : 0
                    }`}
                    % ）
                  </span>
                  <span className={styles.ml20}>
                    目標{settingConfig?.staff_revenue_percent_by_day}%以下
                  </span>
                </p>
              </div>
              <div className={`${styles.parentItem}`}>
                <p className={styles.w30}>仕入高</p>
                <p className={styles.w30}>
                  {formatMoney(
                    (
                      parseFloat(total.totalRevenueByMonth) *
                      parseFloat(
                        settingConfig.sales_estimated_percent_by_day / 100
                      )
                    ).toFixed(1)
                  )}
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
                <p className={styles.w30}>
                  {formatMoney(record.rent.value * dayFromStartOfMonth)}
                </p>
                <p className={styles.w40}>
                  <span>
                    （概算{dayFromStartOfMonth}日
                    {formatMoney(settingConfig?.rent_per_day_by_day)}）
                  </span>
                </p>
              </div>
              <div className={styles.parentItem}>
                <p className={styles.w30}>FLR利益</p>
                <p className={styles.w30}>{formatMoney(flrCostByMonth)}</p>
                <p className={styles.w40}>
                  <span>
                    （
                    {`${
                      total.totalRevenueByMonth > 0
                        ? (
                            (flrCostByMonth / total.totalRevenueByMonth) *
                            100
                          ).toFixed(1)
                        : 0
                    }`}
                    % ）
                  </span>
                  <span className={styles.ml20}>
                    目標{settingConfig?.flr_percent_by_day}%以上
                  </span>
                </p>
              </div>
              <div className={styles.parentItem}>
                <p className={styles.w30}>変動費</p>
                <p className={styles.w30}>
                  {formatMoney(
                    (
                      parseFloat(total.totalRevenueByMonth) *
                      parseFloat(
                        settingConfig.variable_cost_percent_by_day / 100
                      )
                    ).toFixed(1)
                  )}
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
                  {formatMoney(record.fixed_cost.value * dayFromStartOfMonth)}
                </p>
                <p className={styles.w40}>
                  <span>
                    （概算{dayFromStartOfMonth}日
                    {formatMoney(settingConfig?.fixed_cost_estimated_by_day)}）
                  </span>
                </p>
              </div>
            </div>

            <div className={`${styles.itemSmall} ${styles.ml0}`}>
              <div className={styles.flex}>
                <p className={styles.w30}>利益</p>
                <p
                  className={`${styles.w30} ${
                    profitByMonth < settingConfig?.profit_estimated_by_day
                      ? styles.arrowDown
                      : styles.arrowUp
                  }`}
                >
                  <span>{formatMoney(profitByMonth)}</span>
                </p>
                <p className={styles.w40}>
                  目標{dayFromStartOfMonth}日
                  {formatMoney(settingConfig?.profit_estimated_by_day)}
                </p>
              </div>
            </div>

            {/* comment section */}
            {dataAfter.map((val) => {
              return (
                <div className={styles.parentItem} key={val.id}>
                  <div className={styles.flex}>
                    <p>{val.text}</p>
                    <p className={styles.comment}>{val.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.btnCopy}>
            <Button type={"primary"} onClick={handleCopyText}>
              クリップボードにコピー
            </Button>
          </div>
        </div>
      </CardComponent>
    </MainLayout>
  );
}
