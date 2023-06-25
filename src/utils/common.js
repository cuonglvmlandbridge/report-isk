import Cookie from 'js-cookie';
import dayjs from 'dayjs';
const idAuth = '32'

export function fetchAllRecordsCustomer(appId, opt_offset, opt_limit, opt_records) {
  let offset = opt_offset || 0;
  let limit = opt_limit || 100;
  let allRecords = opt_records || [];
  let params = {app: appId, query: 'limit ' + limit + ' offset ' + offset, fields: ['$id', 'fullname', 'name']};
  return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
    allRecords = allRecords.concat(resp.records);
    if (resp.records.length === limit) {
      return fetchAllRecordsCustomer(appId, offset + limit, limit, allRecords);
    }
    return allRecords;
  });
}

export function formatMoney(value) {
  if (!value) return '';
  const format = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${ format }円`;
}

export const logout = () => {
  Cookie.remove('staffIdLoginTest');
  Cookie.remove('userISKTest');
  Cookie.remove('passISKTest');
  Cookie.remove('userLoginTest');
  window.location.href = `${window.location.origin}/k/${idAuth}`
}

export const convertHour = (ss) => {
  let hh = Math.floor(ss / 3600);
  let mm = Math.floor(ss % 3600 / 60);
  return {
    time: `${hh}:${mm > 9 ? mm : `0${mm}`}`,
    hh,
    mm
  }
}

export function getFirstAndLastDateOfCurrentMonth() {
  const currentDate = new Date();
  const firstDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const firstDateConvert = dayjs(firstDate).format(FORMAT_DATE_TIME);
  const lastDateConvert = dayjs(lastDate).format(FORMAT_DATE_TIME);
  
  return { firstDate: firstDateConvert, lastDate: lastDateConvert };
}

export function getDatesInRange(startDate, endDate) {
  const formattedStartDate = new Date(startDate);
  const formattedEndDate = new Date(endDate);
  
  const dates = [];
  const currentDate = new Date(formattedStartDate);

  while (currentDate <= formattedEndDate) {
    dates.push(dayjs(new Date(currentDate)).format(FORMAT_DATE_TIME));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}


export const FORMAT_DATE_TIME = 'YYYY/MM/DD';

export function convertTimeDiff(time1, time2) {
  if (time1 && time2) {
    const dateExp1 = dayjs(`2000-01-01 ${time1}`);
    let dateExp2 = dayjs(`2000-01-01 ${time2}`);
    dateExp2 = dateExp1.diff(dateExp2) > 0 ? dayjs(dayjs(dateExp2).add(1, 'day')) : dateExp2;
    const timeDiff = dateExp2.diff(dateExp1);
    return timeDiff / 1000;
  } 
  return 0;
}



