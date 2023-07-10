// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from 'react';
import {Button, message, Table} from 'antd';
import {getRecords} from '../../../api/list';
import Pagination from '../../common/Pagination';
import FilterList from './filter';
import dayjs from 'dayjs';
import styles from './styles.module.css';
import MainLayout from '../../layout/main';
import CardComponent from '../common/card/CardComponent';
import {formatMoney, getDatesInRange, getFirstAndLastDateOfCurrentMonth, FORMAT_DATE_TIME} from '../../../utils/common';
import ModalAction from '../common/ModalAction';
import { eachDayOfInterval, getDay, format } from 'date-fns';
import _ from 'lodash';

const DEFAULT_PAGE_SIZE = 10;

const idApp = kintone.app.getId();

export default function TableList({isAdmin}) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [record, setRecord] = useState();
  const [dayActive, setDayActive] = useState('');
  const [params, setParams] = useState({
    app: kintone.app.getId(),
    query: ``,
    fields: ['$id', 'date', 'total_revenue', 'user_update', 'Created_by', 'Updated_datetime', 'profit', 'revenue_staff'],
    totalCount: true
  });
  const [queryNolimit, setQueryNolimit] = useState('');
  const [fields, setFields] = useState({});

  const fetchRecords = async (payload) => {
    setLoading(true);
    let totalRevenue = 0;
    const payloadNolimit = {...payload};
    payloadNolimit.query = queryNolimit;
    const recordsNotPagination = await getRecords(payloadNolimit);
    const records = await getRecords(payload);
    const result = records.records.map((val) => {
      let objItem = {};
      for (const item in val) {
        objItem = Object.assign(objItem, {[item]: val[item]['value']});
      }
      return objItem;
    });
    recordsNotPagination.records.forEach((val) => {
      totalRevenue += parseInt(val['total_revenue']['value']);
    });

    setTotalRevenue(totalRevenue)
    setData(result);
    setTotal(records.totalCount);
    setLoading(false);
  };

  useEffect(() => {
    params.query && fetchRecords(params);
  }, [params]);

  useEffect(() => {
    const { firstDate, lastDate } = getFirstAndLastDateOfCurrentMonth();
    const groupRangeDate = makeGroupDateInQuery(firstDate, lastDate);

    setParams({
      ...params,
      query: `date in ${groupRangeDate} limit ${page * DEFAULT_PAGE_SIZE} offset 0`
    });
  }, []);

  const columns = [
    {
      title: '日付',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      align: 'center',
    },
    {
      title: '総売上',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      align: 'center',
      width: 100,
      render: (item) => formatMoney(item)
    },
    {
      title: '人件費',
      dataIndex: 'revenue_staff',
      key: 'revenue_staff',
      align: 'center',
      width: 100,
      render: (item) => formatMoney(item)
    },
    {
      title: '利益',
      dataIndex: 'profit',
      key: 'profit',
      align: 'center',
      width: 100,
      render: (item) => formatMoney(item)
    },
    {
      title: '更新者',
      key: 'user_update',
      width: 100,
      align: 'center',
      render: (item) => {return item.user_update ? item.user_update : item.Created_by.name}
    },
    {
      title: '更新日時',
      dataIndex: 'Updated_datetime',
      key: 'Updated_datetime',
      width: 100,
      align: 'center',
      render: (item) => dayjs(item).format(FORMAT_DATE_TIME)
    },
    {
      title: '',
      width: 220,
      key: 'action',
      fixed: 'right',
      render: (record) => (
        <div className={styles.btnGroup}>
          <div className={styles.btnTop}>
            <Button type={'text'} onClick={() => window.location.href = `${window.location.origin}/k/${idApp}/show#record=${record.$id}`}>
              詳細
            </Button>
            <Button type={'text'}
                    onClick={() => window.location.href = `${window.location.origin}/k/${idApp}/show#record=${record.$id}&mode=edit`}>
              編集
            </Button>
            <Button type={'text'} onClick={() => {
              setShowModal(true);
              setRecord(record)
            }
            }>
              削除
            </Button>
          </div>
        </div>
      )
    },
  ];

  const handleChangePage = (val) => {
    let queryIndex = params.query.indexOf('limit');
    let newQuery = params.query.substring(0, queryIndex);
    setPage(val);
    setParams({
      ...params,
      query: `${newQuery} limit ${DEFAULT_PAGE_SIZE} offset ${(val - 1) * DEFAULT_PAGE_SIZE}`
    });
  };

  const handleDelete = (record) => {
    let body = {
      'app': idApp,
      'ids': [record.$id]
    };

    kintone.api(kintone.api.url('/k/v1/records', true), 'DELETE', body, function(resp) {
      fetchRecords(params);
      message.success('削除しました!')
      setShowModal(false)
    }, function(error) {
      // error
      console.log(error);
    });
  }

  const makeGroupDateInQuery = (firstDate, lastDate) => {
    const datesInRange = getDatesInRange(firstDate, lastDate);
    let groupRangeDate = '(';
    datesInRange.forEach((date, index) => {
      if (index === datesInRange.length - 1) {
        groupRangeDate += `"${date}")`
      } else {
        groupRangeDate += `"${date}",`
      }
    })

    return groupRangeDate;
  }

  const onFinish = (payload) => {
    let queryString = '';
    let arrFilter = [];

    if (payload.date) {
      const firstDate = dayjs(payload.date[0]).format(FORMAT_DATE_TIME);
      const lastDate = dayjs(payload.date[1]).format(FORMAT_DATE_TIME)
      const groupRangeDate = makeGroupDateInQuery(firstDate, lastDate);
      arrFilter.push(`date in ${groupRangeDate}`);
    }
    if (payload.month) {
      arrFilter.push(`month = "${+dayjs(payload.month).format('MM')}" and year = "${dayjs(payload.month).format('YYYY')}" `);
    }
    if (payload.year) {
      arrFilter.push(`year = "${dayjs(payload.year).format('YYYY')}" `);
    }

    if (arrFilter?.length > 1) {
      queryString = arrFilter.join('and ');
    } else {
      queryString = arrFilter.join(' ');
    }

    setDayActive('');
    setQueryNolimit(queryString);
    setParams({
      ...params,
      query: queryString + `limit ${page * DEFAULT_PAGE_SIZE} offset 0`
    });
  };

  const getCurrentMonthDays = (daysToFilter) => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const allDates = eachDayOfInterval({ start: startDate, end: endDate });

    return _.filter(allDates, (date) => {
      return parseInt(daysToFilter) === getDay(date);
    }).map((date) => format(date, 'yyyy/MM/dd'));
  };

  const getSelectedDay = (value) => {
    if (value === dayActive) {
      setDayActive('');
      setQueryNolimit('');
      setParams({
        ...params,
        query: ''
      });
    } else {
      let queryString = '';

      let arrFilter = [];
      const daysArr = getCurrentMonthDays(value);
      queryString = `date`
      daysArr.forEach((date) => {
        arrFilter.push(`date like "${date}" `);
      })
      queryString = arrFilter.join('or ');
      setQueryNolimit(queryString);
      setParams({
        ...params,
        query: queryString
      });
      setDayActive(value);
    }
  }
  
  return (
    <MainLayout isAdmin={isAdmin}>
      <CardComponent title={'日報一覧'} btnRight={'新規登録'} onClickRight={() => window.location.href = `${window.location.origin}/k/${idApp}/edit` }>
        <FilterList onFinish={onFinish} getSelectedDay={getSelectedDay} dayActive={dayActive} fields={fields} totalRevenue={totalRevenue} />
        <Table dataSource={data} columns={columns} pagination={false} loading={loading}/>
        <Pagination total={total} page={page} onChangePage={handleChangePage} defaultPageSize={DEFAULT_PAGE_SIZE}/>
      </CardComponent>
      {
        showModal &&
        <ModalAction
          title={'レポートの削除'}
          visible={showModal}
          setVisible={setShowModal}
          width={450}
          handleClickOk={() => handleDelete(record)}
        >
          削除してもよろしいでしょうか。
        </ModalAction>
      }
    </MainLayout>
  );
}