// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from 'react';
import {Button, message, Table} from 'antd';
import {getRecords} from '../../../api/list';
import Pagination from '../../common/Pagination';
import FilterList from './filter';
import dayjs from 'dayjs';
import styles from './styles.module.css';
import FormRegister from './formRegister';
import {ID_APP_CUSTOMER} from '../../common/const';
import MainLayout from '../../layout/main';
import CardComponent from '../common/card/CardComponent';
import {formatMoney} from '../../../utils/common';
import ModalAction from '../common/ModalAction';

const DEFAULT_PAGE_SIZE = 10;

const FORMAT_DATE = 'YYYY/MM/DD';

const idApp = kintone.app.getId();

export default function TableList({isAdmin}) {

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [record, setRecord] = useState();
  const [params, setParams] = useState({
    app: kintone.app.getId(),
    query: `limit ${page * DEFAULT_PAGE_SIZE} offset 0`,
    fields: ['$id', 'date', 'total_revenue'],
    totalCount: true
  });
  const [fields, setFields] = useState({});

  const fetchRecords = async (payload) => {
    setLoading(true);
    const records = await getRecords(payload);
    const result = records.records.map((val) => {
      let objItem = {};
      for (const item in val) {
        objItem = Object.assign(objItem, {[item]: val[item]['value']});
      }
      return objItem;
    });
    setData(result);
    setTotal(records.totalCount);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords(params);
  }, [params]);

  useEffect(() => {
    kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app': idApp}, function(resp) {
      // success
      setFields(resp.properties);
    }, function(error) {
      // error
    });
  }, []);

  const columns = [
    {
      title: '日付',
      dataIndex: 'date',
      key: '日付',
      align: 'center',
    },
    {
      title: '総売上',
      dataIndex: 'total_revenue',
      key: '総売上',
      align: 'center',
      render: (item) => formatMoney(item)
    },
    {
      title: '',
      width: 220,
      key: 'action',
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
    setPage(val);
    setParams({
      ...params,
      query: `limit ${DEFAULT_PAGE_SIZE} offset ${(val - 1) * DEFAULT_PAGE_SIZE}`
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

  const onFinish = (payload) => {
    let queryString = '';

    let arrFilter = [];

    if (payload.date) {
      arrFilter.push(`date like "${dayjs(payload.date).format(FORMAT_DATE)}" `);
    }
    if (payload.month) {
      arrFilter.push(`month = "${+payload.month}" `);
    }
    if (payload.year) {
      arrFilter.push(`year = "${dayjs(payload.year).format('YYYY')}" `);
    }

    if (arrFilter?.length > 1) {
      queryString = arrFilter.join('and ');
    } else {
      queryString = arrFilter.join(' ');
    }

    setParams({
      ...params,
      query: queryString + `limit ${page * DEFAULT_PAGE_SIZE} offset 0`
    });
  };

  return (
    <MainLayout isAdmin={isAdmin}>
      <CardComponent title={'日報一覧'} btnRight={'新規登録'} onClickRight={() => window.location.href = `${window.location.origin}/k/${idApp}/edit` }>
        <FilterList onFinish={onFinish} fields={fields}/>
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