import {message} from 'antd';

export const getRecords = async (params) => {
  const res = await kintone.api(
    kintone.api.url("/k/v1/records", true),
    "GET", params);
  return res;
};

export const addRecord = async (body, onSuccess, onFail) => {
  kintone.api(kintone.api.url('/k/v1/record', true), 'POST', body, function(resp) {
    // success
    onSuccess && onSuccess(resp)
  }, function(error) {
    // error
    onFail && onFail(error)
  });
};

export const updateRecord = async (body, onSuccess) => {
  kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body, function(resp) {
    // success
    onSuccess && onSuccess()
  }, function(error) {
    // error
    console.log(error);
  });
};