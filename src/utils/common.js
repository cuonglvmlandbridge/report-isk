import Cookie from 'js-cookie';

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


