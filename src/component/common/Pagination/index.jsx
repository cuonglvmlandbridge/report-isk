
import React from 'react';
import {Pagination} from 'antd';

import styles from './style.module.css';

// eslint-disable-next-line react/prop-types
const PaginationCustom = ({page, total, onChangePage, defaultPageSize}) => {

  const onChange = (val) => {
    onChangePage && onChangePage(val);
  };

  return (<Pagination
    className={styles.pagination}
    current={page}
    defaultPageSize={defaultPageSize || 10}
    total={total}
    onChange={onChange}
          />);
};

export default PaginationCustom;